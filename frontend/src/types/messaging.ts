export interface FirestoreTimestamp {
    _seconds: number;
    _nanoseconds: number;
}

export interface Conversation {
    conversationId: string;
    buyerId: string;
    sellerId: string;
    listingId: string;
    createdAt: FirestoreTimestamp;
    updatedAt: FirestoreTimestamp;
    lastMessage: string | null;
    lastSenderId: string | null;
}

export interface Message {
    id: string;
    senderId: string;
    text: string;
    sentAt: FirestoreTimestamp;
    read: boolean;
}

export interface CreateConversationResponse {
    conversationId: string;
    alreadyExists: boolean;
}

export interface SendMessageResponse {
    messageId: string;
    message: string;
}