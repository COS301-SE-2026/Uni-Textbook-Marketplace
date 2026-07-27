'use client';

import { useEffect, useState } from 'react';

import {
    getMyConversations,
    getMessages,
    sendMessage,
} from '@/lib/messaging.api';

import type {
    Conversation,
    Message,
} from '@/types/messaging';

export function useMessaging() {

    const [conversations, setConversations] = useState<Conversation[]>([]);

    const [selectedConversation, setSelectedConversation] =
        useState<Conversation | null>(null);

    const [messages, setMessages] = useState<Message[]>([]);

    const [loadingConversations, setLoadingConversations] =
        useState(true);

    const [loadingMessages, setLoadingMessages] =
        useState(false);

    /**Load all conversations*/
    const loadConversations = async () => {
        try {
            setLoadingConversations(true);
            const data = await getMyConversations();
            setConversations(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingConversations(false);
        }
    };

    /**
     * Load messages for a conversation
     */
    const selectConversation = async (
        conversation: Conversation,
    ) => {
        try {
            setSelectedConversation(conversation);
            setLoadingMessages(true);

            const data = await getMessages(
                conversation.conversationId,
            );
            setMessages(data);
        } catch (error: any) {
            console.error('Error loading messages');
            console.log(error);
            console.log('status:', error?.status);
            console.log('message:', error?.message);
        } finally {
            setLoadingMessages(false);
        }
    };

    /** Send a message*/
    const send = async (text: string) => {
        if (!selectedConversation) {
            return;
        }
        await sendMessage(
            selectedConversation.conversationId,
            text,
        );
        const updatedMessages = await getMessages(
            selectedConversation.conversationId,
        );
        setMessages(updatedMessages);
        await loadConversations();
    };

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                setLoadingConversations(true);
                const data = await getMyConversations();
                setConversations(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoadingConversations(false);
            }
        };
        void fetchConversations();
    }, []);

    return {
        conversations,
        selectedConversation,
        messages,
        loadingConversations,
        loadingMessages,
        loadConversations,
        selectConversation,
        send,
    };
}