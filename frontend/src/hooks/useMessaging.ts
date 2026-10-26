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

import { io, Socket } from 'socket.io-client';


export function useMessaging() {
    const socketRef = useRef<Socket | null>(null);
    const selectedConversationIdRef = useRef<string | null>(null);
    
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
        const activeConversation =
            urlConversation ?? conversation;

        if (!urlConversation) {
            setManuallySelectedConversation(conversation);
        }

        selectedConversationIdRef.current =
            activeConversation.conversationId;

        socketRef.current?.emit(
            'joinConversation',
            activeConversation.conversationId,
        );

        await loadMessagesForConversation(
            activeConversation.conversationId,
        );
    };

    /** Send a message*/
    const send = async (text: string) => {
        if (!selectedConversation) {
            return;
        }

        try {
            await sendMessage(
                selectedConversation.conversationId,
                text,
            );

            await loadConversations();
        } catch (error) {
            console.error('Error sending message');
            console.log(error);
        }
    };

    useEffect(() => {
        void loadConversations();
    }, []);

    useEffect(() => {
        if (!selectedConversation) {
            return;
        }

        selectedConversationIdRef.current =
            selectedConversation.conversationId;

        socketRef.current?.emit(
            'joinConversation',
            selectedConversation.conversationId,
        );
    }, [selectedConversation]);

    useEffect(() => {
        if (!urlConversation) {
            return;
        }

        const conversationId =
            urlConversation.conversationId;

        const timeoutId = window.setTimeout(() => {
            void loadMessagesForConversation(conversationId);
        }, 0);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [urlConversation]);

    useEffect(() => {
        const socketUrl =
            process.env.NEXT_PUBLIC_API_URL?.replace(
                /\/api\/?$/,
                '',
            ) || window.location.origin;

        const socket = io(
            `${socketUrl}/messaging`,
            {
                withCredentials: true,
                transports: ['websocket'],
            },
        );

        socketRef.current = socket;

        socket.on('connect', () => {
            console.log(
                'Connected to messaging socket',
            );

            const conversationId =
                selectedConversationIdRef.current;

            if (conversationId) {
                socket.emit(
                    'joinConversation',
                    conversationId,
                );
            }
        });

        socket.on(
            'connect_error',
            (error) => {
                console.error(
                    'Messaging socket connection error:',
                    error,
                );
            },
        );

        socket.on(
            'newMessage',
            (message: Message) => {
                setMessageState((current) => {
                    if (
                        current.messages.some(
                            (existingMessage) =>
                                existingMessage.id ===
                                message.id,
                        )
                    ) {
                        return current;
                    }

                    return {
                        conversationId:
                            current.conversationId,
                        messages: [
                            ...current.messages,
                            message,
                        ],
                        loaded: true,
                    };
                });

                void loadConversations();
            },
        );

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, []);

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