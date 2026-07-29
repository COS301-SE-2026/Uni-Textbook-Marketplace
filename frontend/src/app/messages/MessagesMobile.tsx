'use client';

import { useState } from 'react';

import { useAuth } from '@/context/AuthContext';
import { useMessaging } from '@/hooks/useMessaging';

import ConversationList from '@/components/messaging/ConversationList';
import ChatHeader from '@/components/messaging/ChatHeader';
import ChatWindow from '@/components/messaging/ChatWindow';
import MessageInput from '@/components/messaging/MessageInput';

export default function MessagesMobile() {
    const { user } = useAuth();

    const {
        conversations,
        selectedConversation,
        messages,
        selectConversation,
        send,
    } = useMessaging();

    const [chatOpen, setChatOpen] = useState(false);

    if (!chatOpen) {
        return (
            <main className="min-h-screen bg-gray-50">
                <header className="border-b bg-white p-4">
                    <h1 className="text-xl font-semibold">
                        Messages
                    </h1>
                </header>
                <ConversationList
                    conversations={conversations}
                    selectedConversationId={
                        selectedConversation?.conversationId
                    }
                    onSelectConversation={(conversation) => {
                        selectConversation(conversation);
                        setChatOpen(true);
                    }}
                />
            </main>
        );
    }
    return (
        <main className="flex h-screen flex-col">
            <div className="border-b bg-white p-4">
                <button
                    type = "button"
                    onClick={() => setChatOpen(false)}
                    className="mb-2 text-sm text-blue-600"
                >
                    Back
                </button>
                <ChatHeader
                    title={`Conversation ${selectedConversation?.otherUser.firstName ?? selectedConversation?.otherUser.lastName}`}
                    subtitle={selectedConversation?.listing.title ?? ''}
                />
            </div>
            {selectedConversation?.lastMessage ? (
                <ChatWindow
                        messages={messages}
                        currentUserId={user?.id ?? ''}
                    />
                ) : (
                    <div className="flex flex-1 items-center justify-center bg-gray-50 text-gray-500">
                        No messages yet.
                    </div>
            )}


            <MessageInput onSend={send} />
        </main>
    );
}