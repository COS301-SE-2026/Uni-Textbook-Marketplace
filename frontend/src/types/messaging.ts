export interface Conversation {
    conversationId: string;
    buyerId: string;
    sellerId: string;
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
    createdAt: {
        _seconds: number;
        _nanoseconds: number;
    };
    updatedAt: {
        _seconds: number;
        _nanoseconds: number;
    };
}

export interface Message {
    id: string;
    senderId: string;
    text: string;
    sentAt: {
        _seconds: number;
        _nanoseconds: number;
    };
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