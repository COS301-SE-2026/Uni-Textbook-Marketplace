import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

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

    @SubscribeMessage('joinConversation')
    handleJoinConversation(
        @MessageBody() conversationId: string,
        @ConnectedSocket() socket: Socket,
    ) {
        socket.join(`conversation:${conversationId}`);
    }

    sendMessageToConversation(
        conversationId: string,
        message: unknown,
    ) {
        this.server
        .to(`conversation:${conversationId}`)
        .emit('newMessage', message);
    }
}