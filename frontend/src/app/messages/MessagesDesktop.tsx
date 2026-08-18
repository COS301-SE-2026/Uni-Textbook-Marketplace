'use client';

import { useAuth } from '@/context/AuthContext';
import { useMessaging } from '@/hooks/useMessaging';

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
        emptyState = <p>Loading conversations...</p>;
    } else if (conversations.length === 0) {
        emptyState = (
            <div className="text-center">
                <h2 className="text-2xl font-semibold">
                    No conversations yet
                </h2>
                <p className="mt-2 text-gray-500">
                    Start chatting from a listing.
                </p>
            </div>
        );
    } else {
        emptyState = (
            <div className="flex flex-1 flex-col items-center justify-center">
            <h2 className="text-3xl font-bold text-slate-900">
                Your Messages
            </h2>
            <p className="mt-3 max-w-sm text-center text-slate-500">
                Select a conversation to view messages and continue chatting with buyers and sellers.
            </p>
        </div>
        );
    }

    return (
        <main className="min-h-screen bg-slate-50 p-8">
            <div className="mx-auto flex h-[85vh] max-w-7xl overflow-hidden rounded-3xl border bg-white shadow-xl">
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
                            {loadingMessages ? (
                                <div className="flex flex-1 items-center justify-center">
                                    Loading messages...
                                </div>
                            ) : selectedConversation?.lastMessage ? (
                                <ChatWindow
                                    messages={messages}
                                    currentUserId={user?.id ?? ''}
                                />
                            ) : (
                                <div className="flex flex-1 items-center justify-center text-gray-500">
                                    No messages yet.
                                </div>
                            )}
                            <MessageInput onSend={send} />
                        </>
                    ) : (
                        <div className="flex flex-1 items-center justify-center">
                            {emptyState}
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}