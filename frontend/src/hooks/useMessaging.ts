'use client';

import { useEffect, useState } from 'react';

import {
    createConversation,
    getMyConversations,
    getMessages,
    sendMessage,
} from '@/lib/messaging.api';

import type {
    Conversation,
    Message,
} from '@/types/messaging'; 

import {
    collection,
    onSnapshot,
    orderBy,
    query,
} from 'firebase/firestore';

import { db } from '@/lib/firebase';

export function useMessaging() {

    const [conversations, setConversations] = useState<Conversation[]>([]);

    const [selectedConversation, setSelectedConversation] =
        useState<Conversation | null>(null);

    const [messages, setMessages] = useState<Message[]>([]);

    const [loadingConversations, setLoadingConversations] =
        useState(true);

    const [loadingMessages, setLoadingMessages] =
        useState(false);

    /**Start a new conversation */
    const startConversation = async (
        listingId: string,
        text: string,
    ) => {
        const conversation =
            await createConversation(listingId);

        await sendMessage(
            conversation.conversationId,
            text,
        );

        await loadConversations();

        const createdConversation = (
            await getMyConversations()
        ).find(
            (c) =>
                c.conversationId ===
                conversation.conversationId,
        );

        if (createdConversation) {
            await selectConversation(createdConversation);
        }
    };

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

    useEffect(() => {
        if (!selectedConversation) {
            return;
        }

        const messagesRef = collection(
            db,
            'conversations',
            selectedConversation.conversationId,
            'messages',
        );

        const messagesQuery = query(
            messagesRef,
            orderBy('sentAt', 'asc'),
        );

        const unsubscribe = onSnapshot(
            messagesQuery,
            (snapshot) => {
                const updatedMessages: Message[] = snapshot.docs.map(
                    (doc) => ({
                        id: doc.id,
                        ...doc.data(),
                    } as Message),
                );

                setMessages(updatedMessages);
            },
            (error) => {
                console.error(
                    'Error listening for messages:',
                    error,
                );
            },
        );

        return () => unsubscribe();
    }, [selectedConversation]);

    return {
        conversations,
        selectedConversation,
        startConversation,
        messages,
        loadingConversations,
        loadingMessages,
        loadConversations,
        selectConversation,
        send,
    };
}