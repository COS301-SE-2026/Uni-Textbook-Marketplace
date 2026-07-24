import { Timestamp } from 'firebase-admin/firestore';

export class ConversationResponseDto {
    conversationId!: string;
    buyerId!: string;
    sellerId!: string;
    listingId!: string;
    createdAt!: Timestamp;
    updatedAt!: Timestamp;
    lastMessage!: string | null;
    lastSenderId!: string | null;
}