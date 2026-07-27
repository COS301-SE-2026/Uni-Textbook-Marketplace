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
}: Props) {
    
    return (
        <div
            onClick={onClick}
            className={`
                cursor-pointer
                border-b
                p-4
                transition-colors
                hover:bg-gray-100
                ${selected ? 'bg-gray-100' : ''}
            `}
        >
            <h2 className="font-semibold">
                {conversation.otherUser.firstName} {conversation.otherUser.lastName}
            </h2>

            <p className="truncate text-sm text-gray-500">
                {conversation.lastMessage ?? conversation.listing.title}
            </p>
        </div>
    );
}