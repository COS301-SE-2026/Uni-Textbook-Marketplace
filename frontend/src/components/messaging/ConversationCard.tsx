import type { Conversation } from '@/types/messaging';

interface Props {
    conversation: Conversation;
    selected: boolean;
    onClick: () => void;
}

export default function ConversationCard({
    conversation,
    selected,
    onClick,
}: Readonly<Props>) {
    
    return (
        <button
            type="button"
            onClick={onClick}
            className={`
                w-full
                px-5
                py-4
                text-left
                transition-all
                border-b
                border-gray-200 dark:border-gray-700

                ${
                    selected
                        ? 'bg-cyan-50 dark:bg-cyan-950/30 border-l-4 border-l-cyan-500'
                        : 'hover:bg-gray-50 dark:hover:bg-[#1e293b]'
                }
            `}
        >
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900 dark:text-white">
                    {conversation.otherUser.firstName}{' '}
                    {conversation.otherUser.lastName}
                </h3>
            </div>

            <p className="mt-1 text-sm text-slate-500">
                {conversation.listing.title}
            </p>

            <p className="mt-2 truncate text-sm text-slate-600">
                {conversation.lastMessage ?? 'Start the conversation'}
            </p>
        </button>
    );
}