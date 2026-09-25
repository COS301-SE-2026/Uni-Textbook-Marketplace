import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';

import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Server, Socket } from 'socket.io';

import { User } from '../database/entities/users.entity';
import { db } from '../firebase/firebase-admin';

interface JwtPayload {
    sub: string;
    email: string;
    role: string;
}

interface SocketWithUser extends Socket {
    userId?: string;
}

@WebSocketGateway({
    namespace: '/messaging',
    cors: {
        origin: [
            'http://localhost:3000',
            'https://localhost:3001',
            'https://nexusdev-frontend.whitesand-df72b78b.southafricanorth.azurecontainerapps.io',
            'https://nexusdev-frontend-staging.whitesand-df72b78b.southafricanorth.azurecontainerapps.io',
        ],
        credentials: true,
    },
    })
    export class MessagingGateway {
    @WebSocketServer()
    server: Server;

    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,

        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
    ) {}

    async handleConnection(socket: SocketWithUser) {
        try {
        const token = this.getAccessToken(socket);

        if (!token) {
            socket.disconnect();
            return;
        }

        const payload = this.jwtService.verify<JwtPayload>(token, {
            secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        });

        const user = await this.usersRepository.findOne({
            where: {
            id: payload.sub,
            },
        });

        if (!user) {
            socket.disconnect();
            return;
        }

        socket.userId = user.id;
        } catch {
        socket.disconnect();
        }
    }

    handleDisconnect(socket: SocketWithUser) {
        socket.userId = undefined;
    }

    @SubscribeMessage('joinConversation')
    async handleJoinConversation(
        @MessageBody() conversationId: string,
        @ConnectedSocket() socket: SocketWithUser,
    ) {
        if (!socket.userId) {
        throw new WsException('Not authenticated.');
        }

        const conversationSnapshot = await db
        .collection('conversations')
        .doc(conversationId)
        .get();

        if (!conversationSnapshot.exists) {
        throw new WsException('Conversation not found.');
        }

        const conversation = conversationSnapshot.data();

        if (
        conversation?.buyerId !== socket.userId &&
        conversation?.sellerId !== socket.userId
        ) {
        throw new WsException(
            'You are not a participant in this conversation.',
        );
        }

        await socket.join(`conversation:${conversationId}`);
    }

    sendMessageToConversation(
        conversationId: string,
        message: unknown,
    ) {
        this.server
        .to(`conversation:${conversationId}`)
        .emit('newMessage', message);
    }

    private getAccessToken(socket: Socket): string | null {
        const cookieHeader = socket.handshake.headers.cookie;

        if (!cookieHeader) {
        return null;
        }

        const cookies = cookieHeader.split(';').map((cookie) => cookie.trim());

        const accessTokenCookie = cookies.find((cookie) =>
        cookie.startsWith('access_token='),
        );

        if (!accessTokenCookie) {
        return null;
        }

        return decodeURIComponent(
        accessTokenCookie.substring('access_token='.length),
        );
    }
}