import api from './api';

import type {
    Conversation,
    Message,
    CreateConversationResponse,
    SendMessageResponse,
} from '@/types/messaging';

/**Create (or retrieve) a conversation for a listing.*/
export async function createConversation(
    listingId: string,
): Promise<CreateConversationResponse> {
    return api.post<CreateConversationResponse>(
        '/conversations',
        { listingId },
    );
}

/**Fetch all conversations for the logged-in user.*/
export async function getMyConversations(): Promise<Conversation[]> {
    return api.get<Conversation[]>(
        '/conversations/mine',
    );
}

/**Fetch all messages in a conversation.*/
export async function getMessages(
    conversationId: string,
): Promise<Message[]> {
    return api.get<Message[]>(
        `/conversations/${conversationId}/messages`,
    );
}

/**Send a message.*/
export async function sendMessage(
    conversationId: string,
    text: string,
): Promise<SendMessageResponse> {
    return api.post<SendMessageResponse>(
        `/conversations/${conversationId}/messages`,
        { text },
    );
}