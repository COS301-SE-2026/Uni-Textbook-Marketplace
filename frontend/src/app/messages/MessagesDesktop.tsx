'use client';

import { useAuth } from '@/context/AuthContext';
import { useMessaging } from '@/hooks/useMessaging';
import { MessageCircle, Loader2 } from 'lucide-react';

import ConversationList from '@/components/messaging/ConversationList';
import ChatHeader from '@/components/messaging/ChatHeader';
import ChatWindow from '@/components/messaging/ChatWindow';
import MessageInput from '@/components/messaging/MessageInput';

export default function MessagesDesktop() {
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

    let emptyState;

    if (loadingConversations) {
        emptyState = (
            <div className="flex flex-col items-center justify-center gap-3">

                
                <Loader2 size={32} className="animate-spin text-[#00B4D8]" />


                <p className="text-sm text-gray-500">Loading conversations...</p>
            </div>
        );
    } else if (conversations.length === 0) {
        emptyState = (
            <div className="flex flex-col items-center justify-center text-center px-6">


                <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                    <MessageCircle size={32} className="text-gray-400" />
                </div>


                <h2 className="text-2xl font-bold text-[#000f2b] dark:text-white">
                    No conversations yet
                </h2>
                <p className="mt-2 text-gray-500 dark:text-gray-400 max-w-sm">
                    Start chatting by finding a textbook you&apos;re interested in and messaging the seller.
                </p>
            </div>
        );
    } else {
        emptyState = (
            <div className="flex flex-1 flex-col items-center justify-center text-center px-6">



                <div className="w-20 h-20 rounded-full bg-[#00B4D8]/10 flex items-center justify-center mb-4">
                    <MessageCircle size={32} className="text-[#00B4D8]" />
                </div>


                <h2 className="text-2xl font-bold text-[#000f2b] dark:text-white">
                    Your Messages
                </h2>


                <p className="mt-3 max-w-sm text-center text-gray-500 dark:text-gray-400">
                    Select a conversation to view messages and continue chatting with buyers and sellers.
                </p>
            </div>


        );
    }

    let chatContent;

    if (loadingMessages) {
        chatContent = (
            <div className="flex flex-1 items-center justify-center gap-3">
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
            <div className="flex flex-1 items-center justify-center text-gray-500 dark:text-gray-400">
                <div className="text-center">


                    <p className="text-sm">No messages yet.</p>
                    <p className="text-xs text-gray-400 mt-1">Start the conversation!</p>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-[#0a0f1a] p-6 md:p-8">


            <div className="mx-auto flex h-[85vh] max-w-7xl overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f172a] shadow-xl">
                <ConversationList
                    conversations={conversations}
                    selectedConversationId={
                        selectedConversation?.conversationId
                    }
                    onSelectConversation={selectConversation}
                />

                
                <section className="flex flex-1 flex-col">
                    {selectedConversation ? (
                        <>
                            <ChatHeader
                                title={`${selectedConversation.otherUser.firstName} ${selectedConversation.otherUser.lastName}`}
                                subtitle={selectedConversation.listing.title}
                            />


                            {chatContent}
                            <MessageInput onSend={send} />
                        </>
                    ) : (
                        <div className="flex flex-1 items-center justify-center bg-gray-50 dark:bg-[#0a0f1a]">
                            {emptyState}
                        </div>
                    )}
                </section>



            </div>

        </main>
    );
}