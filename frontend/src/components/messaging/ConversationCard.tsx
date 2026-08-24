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

    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    };

    const initials = getInitials(
        conversation.otherUser.firstName,
        conversation.otherUser.lastName
    );

    return (
        <button
            type="button"
            onClick={onClick}
            className={`
                w-full px-5 py-4 text-left transition-all border-b border-gray-200 dark:border-gray-700
                ${selected
                    ? 'bg-cyan-50 dark:bg-cyan-950/30 border-l-4 border-l-cyan-500'
                    : 'hover:bg-gray-50 dark:hover:bg-[#1e293b]'
                }
            `}
        >
            <div className="flex items-center gap-3">
                {/* Avatar with initials */}
                <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0
                    ${selected 
                        ? 'bg-[#00B4D8] text-white' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                    }
                `}>
                    {initials}
                </div>
                
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                        <h3 className={`font-semibold text-sm truncate ${selected ? 'text-[#00B4D8]' : 'text-[#000f2b] dark:text-white'}`}>
                            {conversation.otherUser.firstName} {conversation.otherUser.lastName}
                        </h3>
                    </div>

                    <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                        {conversation.listing.title}
                    </p>

                    <p className={`mt-1 truncate text-sm ${selected ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500 dark:text-gray-400'}`}>
                        {conversation.lastMessage ?? 'Start the conversation'}
                    </p>
                </div>
            </div>
        </button>
    );
}