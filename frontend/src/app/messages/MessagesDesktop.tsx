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

    return (
        <main className="min-h-screen bg-gray-50 p-8">
            <div className="mx-auto flex h-[85vh] max-w-7xl overflow-hidden rounded-2xl border bg-white shadow">
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
                                title={`Conversation ${selectedConversation.conversationId}`}
                                subtitle={selectedConversation.listingId}
                            />
                            {loadingMessages ? (
                                <div className="flex flex-1 items-center justify-center">
                                    Loading messages...
                                </div>
                            ) : (
                                <>
                                    {messages.length > 0 ? (
                                        <ChatWindow
                                            messages={messages}
                                            currentUserId={user?.id ?? ''}
                                        />
                                    ) : (
                                        <div className="flex flex-1 items-center justify-center text-gray-500">
                                            No messages yet.
                                        </div>
                                    )}

                                    
                                </>
                            )}
                            <MessageInput onSend={send} />
                        </>
                    ) : (
                        <div className="flex flex-1 items-center justify-center">
                            {loadingConversations ? (
                                <p>Loading conversations...</p>
                            ) : (
                                <div className="text-center">
                                    <h2 className="text-2xl font-semibold">
                                        Select a conversation
                                    </h2>
                                    <p className="mt-2 text-gray-500">
                                        Choose a conversation from the left.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}