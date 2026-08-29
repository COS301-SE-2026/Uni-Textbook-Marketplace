import type { Message } from '@/types/messaging';

import MessageBubble from './MessageBubble';

interface Props {
    messages: Message[];
    currentUserId: string;
}

export default function ChatWindow({
    messages,
    currentUserId,
}: Readonly<Props>) {

    return (
        <main className="flex-1 overflow-y-auto px-8 py-6 bg-slate-50 dark:bg-[#0a0f1a]">
            { (
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