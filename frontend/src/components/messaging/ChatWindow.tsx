import type { Message } from '@/types/messaging';

import MessageBubble from './MessageBubble';

interface Props {
    messages: Message[];
    currentUserId: string;
}

export default function ChatWindow({
    messages,
    currentUserId,
}: Props) {

    return (
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
            {messages.length === 0 ? (
                <div className="text-center text-gray-500">
                    No messages yet.
                </div>
            ) : (
                messages.map((message) => (
                    <MessageBubble
                        key={message.id}
                        message={message}
                        own={message.senderId === currentUserId}
                    />
                ))
            )}
        </main>
    );
}