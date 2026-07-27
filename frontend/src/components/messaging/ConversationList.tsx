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
}: Props) {

    return (
        <aside className="w-80 overflow-y-auto border-r bg-white">
            <div className="border-b p-4 text-lg font-bold">
                Conversations
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