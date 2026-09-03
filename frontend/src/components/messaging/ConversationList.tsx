import type { Conversation } from '@/types/messaging';
import { MessageSquare } from 'lucide-react';
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
        <aside className="w-96 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f172a] flex flex-col h-full flex-shrink-0">
            


            <div className="border-b border-gray-200 dark:border-gray-700 px-5 py-4">


                <h2 className="text-xl font-bold text-[#000f2b] dark:text-white">
                    Messages
                </h2>
                <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                    Your conversations
                </p>
            </div>

           
            <div className="flex-1 overflow-y-auto">


                {conversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400 dark:text-gray-500">
                        <MessageSquare size={40} className="mb-3 opacity-50" />
                        <p className="text-sm font-medium">No conversations</p>


                        <p className="text-xs mt-1">Start messaging sellers</p>
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
            </div>
            
        </aside>
    );
}