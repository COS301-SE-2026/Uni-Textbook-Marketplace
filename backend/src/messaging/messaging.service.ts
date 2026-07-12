import { Injectable } from '@nestjs/common';

@Injectable()
export class MessagingService {

    async createConversation(data: any) {
        
    }

    async getConversations(userId: string) {
        
    }

    async getMessages(conversationId: string) {
        
    }

    async sendMessage(
        conversationId: string,
        senderId: string,
        text: string,
    ) {
    }
}