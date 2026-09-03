'use client';

import { useState } from 'react';
import { ChevronLeft, MessageCircle, Loader2 } from 'lucide-react';

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
        loadingConversations,
        loadingMessages,
        selectConversation,
        send,
    } = useMessaging();

    const [chatOpen, setChatOpen] = useState(false);

    let conversationContent;

    if (loadingConversations) {
        conversationContent = (
            <div className="flex-1 flex items-center justify-center gap-3">
                <Loader2 size={28} className="animate-spin text-[#00B4D8]" />
                <p className="text-sm text-gray-500">Loading...</p>
            </div>
        );
    } else if (conversations.length === 0) {
        conversationContent = (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-6">


                <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                    <MessageCircle size={32} className="text-gray-400" />
                </div>


                <h2 className="text-lg font-semibold text-[#000f2b] dark:text-white">
                    No conversations yet
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                    Start chatting by finding a textbook you&apos;re interested in.
                </p>
            </div>
        );
    } else {
        conversationContent = (
            <ConversationList
                conversations={conversations}
                selectedConversationId={selectedConversation?.conversationId}
                onSelectConversation={(conversation) => {
                    selectConversation(conversation);
                    setChatOpen(true);
                }}
            />
        );
    }

    if (!chatOpen) {
        return (
            <main className="min-h-screen bg-gray-50 dark:bg-[#0a0f1a] flex flex-col">


                <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f172a] px-4 py-4">


                    <h1 className="text-xl font-bold text-[#000f2b] dark:text-white">
                        Messages
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        Your conversations
                    </p>
                </header>

                {conversationContent}
            </main>
        );
    }

    let chatContent;

    if (loadingMessages) {
        chatContent = (
            <div className="flex h-full items-center justify-center gap-3">

                <Loader2 size={28} className="animate-spin text-[#00B4D8]" />

                <p className="text-sm text-gray-500">Loading messages...</p>


            </div>
        );
    } else if (selectedConversation?.lastMessage) {
        chatContent = (
            <ChatWindow
                messages={messages}
                currentUserId={user?.id ?? ''}
            />

        );
    } else {
        chatContent = (
            <div className="flex h-full items-center justify-center text-gray-500 dark:text-gray-400">
                <div className="text-center">


                    <p className="text-sm">No messages yet.</p>


                    <p className="text-xs text-gray-400 mt-1">Start the conversation!</p>
                </div>
            </div>


        );
    }

    return (
        <main className="flex h-screen flex-col bg-gray-50 dark:bg-[#0a0f1a]">
            
            <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f172a] px-4 py-3 flex items-center gap-3 flex-shrink-0">

                <button
                    type="button"
                    onClick={() => setChatOpen(false)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1e293b] transition-colors cursor-pointer text-[#000f2b] dark:text-white"
                    aria-label="Back to conversations"
                >
                    <ChevronLeft size={22} />


                </button>

                <div className="flex-1 min-w-0">
                    <ChatHeader
                        title={`${selectedConversation?.otherUser.firstName ?? ''} ${selectedConversation?.otherUser.lastName ?? ''}`}
                        subtitle={selectedConversation?.listing.title ?? ''}
                    />
                </div>

                
            </div>

            
            <div className="flex-1 overflow-hidden dark:text-white">
                {chatContent}
            </div>

            <MessageInput onSend={send} />
            
        </main>
    );
}