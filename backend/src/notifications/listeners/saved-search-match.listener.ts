import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationsService } from '../notifications.service';
import { SavedSearchMatchEvent } from '../../saved_search/events/saved-search-match.event';

@Injectable()
export class SavedSearchMatchListener {
  constructor(private readonly notificationsService: NotificationsService) {}

  @OnEvent('saved-search.match')
  async handleSavedSearchMatch(event: SavedSearchMatchEvent) {
    await this.notificationsService.createFromSavedSearch(event);
  }
}
