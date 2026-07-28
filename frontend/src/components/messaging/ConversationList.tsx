import type { Conversation } from '@/types/messaging';

import ConversationCard from './ConversationCard';

interface Props {
    conversations: Conversation[];
    selectedConversationId?: string;
    onSelectConversation: (conversation: Conversation) => void;
}

export default function ConversationList({
    conversations,
    selectedConversationId,
    onSelectConversation,
}: Readonly<Props>) {

    return (
        <aside className="w-96 border-r bg-white flex flex-col">
            <div className="border-b px-6 py-5">
                <h2 className="text-2xl font-bold text-slate-900">
                    Messages
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                    Your conversations
                </p>
            </div>
            {conversations.length === 0 ? (
                <div className="p-4 text-sm text-gray-500">
                    No conversations yet.
                </div>
            ) : (
                conversations.map((conversation) => (
                    <ConversationCard
                        key={conversation.conversationId}
                        conversation={conversation}
                        selected={
                            selectedConversationId ===
                            conversation.conversationId
                        }
                        onClick={() =>
                            onSelectConversation(conversation)
                        }
                    />
                ))
            )}
        </aside>
    );
}