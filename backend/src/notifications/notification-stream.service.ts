import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MessageEvent } from '@nestjs/common';
import { interval, merge, Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';

interface NotificationCreatedEvent {
  userId: string;
  notificationId: string;
}

@Injectable()
export class NotificationStreamService {
  private readonly streams = new Map<string, Set<Subject<MessageEvent>>>();

  streamForUser(userId: string): Observable<MessageEvent> {
    const stream = new Subject<MessageEvent>();
    const userStreams = this.streams.get(userId) ?? new Set();

    userStreams.add(stream);
    this.streams.set(userId, userStreams);

    const heartbeats = interval(30000).pipe(
      map((): MessageEvent => ({
        type: 'heartbeat',
        data: {},
      })),
    );

    return new Observable<MessageEvent>((subscriber) => {
      const subscription = merge(stream, heartbeats).subscribe(subscriber);

      return () => {
        subscription.unsubscribe();
        stream.complete();
        userStreams.delete(stream);

        if (userStreams.size === 0) {
          this.streams.delete(userId);
        }
      };
    });
  }

  @OnEvent('notification.created')
  publish(event: NotificationCreatedEvent): void {
    const userStreams = this.streams.get(event.userId);

    if (!userStreams) {
      return;
    }

    const message: MessageEvent = {
      type: 'notification.created',
      id: event.notificationId,
      data: {
        notificationId: event.notificationId,
      },
    };

    for (const stream of userStreams) {
      stream.next(message);
    }
  }
}
