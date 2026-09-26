'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';

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

    const searchParams = useSearchParams();
    const listingId = searchParams.get('listingId');
    const contactId = searchParams.get('contactId');

    const [conversations, setConversations] = useState<Conversation[]>([]);

    const [manuallySelectedConversation, setManuallySelectedConversation] =
        useState<Conversation | null>(null);

    const [messageState, setMessageState] = useState<{
        conversationId: string | null;
        messages: Message[];
        loaded: boolean;
    }>({ conversationId: null, messages: [], loaded: false });

    const [loadingConversations, setLoadingConversations] =
        useState(true);

    const messageLoadRequest = useRef(0);

    const urlConversation = listingId && contactId
        ? conversations.find(
            (conversation) =>
                conversation.listing.id === listingId &&
                conversation.otherUser.id === contactId,
        ) ?? null
        : null;
    const selectedConversation = urlConversation ?? manuallySelectedConversation;
    const messages = messageState.messages;
    const loadingMessages = Boolean(
        selectedConversation &&
        (!messageState.loaded ||
            messageState.conversationId !== selectedConversation.conversationId),
    );

    const loadMessagesForConversation = async (conversationId: string) => {
        const requestId = ++messageLoadRequest.current;
        try {
            const data = await getMessages(conversationId);
            if (requestId === messageLoadRequest.current) {
                setMessageState({ conversationId, messages: data, loaded: true });
            }
        } catch (error: any) {
            console.error('Error loading messages');
            console.log(error);
            console.log('status:', error?.status);
            console.log('message:', error?.message);
            if (requestId === messageLoadRequest.current) {
                setMessageState((current) => ({
                    conversationId,
                    messages:
                        current.conversationId === conversationId
                            ? current.messages
                            : [],
                    loaded: true,
                }));
            }
        }
    };

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
        const activeConversation = urlConversation ?? conversation;
        if (!urlConversation) {
            setManuallySelectedConversation(conversation);
        }
        await loadMessagesForConversation(activeConversation.conversationId);
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

                setMessageState({
                    conversationId: selectedConversation.conversationId,
                    messages: updatedMessages,
                    loaded: true,
                });
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