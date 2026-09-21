'use client';

import { useEffect, useState, useRef} from 'react';

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
        const socketUrl =
            process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, '') ||
            window.location.origin;

        const socket = io(`${socketUrl}/messaging`, {
            withCredentials: true,
            transports: ['websocket'],
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('Connected to messaging socket');
        });

        socket.on('connect_error', (error) => {
            console.error('Messaging socket connection error:', error);
        });

        socket.on('newMessage', (message: Message) => {
            setMessages((currentMessages) => {
                if (
                    currentMessages.some(
                        (existingMessage) => existingMessage.id === message.id,
                    )
                ) {
                    return currentMessages;
                }

                return [...currentMessages, message];
            });

            void loadConversations();
        });

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