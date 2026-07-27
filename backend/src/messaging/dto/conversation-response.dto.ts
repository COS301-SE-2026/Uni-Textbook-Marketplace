import { Timestamp } from 'firebase-admin/firestore';

export class ConversationResponseDto {
    conversationId: string;
    buyerId: string;
    sellerId: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    lastMessage: string | null;
    lastSenderId: string | null;
    listing: {
        id: string;
        title: string;
        photoUrl: string | null;
    };
    otherUser: {
        id: string;
        firstName: string;
        lastName: string;
    };
}