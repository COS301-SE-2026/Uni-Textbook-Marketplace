import type { Message } from '@/types/messaging';
import { Check, CheckCheck } from 'lucide-react';

interface Props {
    message: Message;
    own: boolean;
}

function formatTime(sentAt: Message['sentAt']){

    const date = new Date(sentAt._seconds * 1000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

}

export default function MessageBubble({
    message,
    own,
}: Readonly<Props>) {

    return (
        <div
            className={`mb-4 flex ${
                own
                    ? 'justify-end'
                    : 'justify-start'
            }`}
        >
            <div
                className={`
                    max-w-md
                    rounded-2xl
                    px-5
                    py-3
                    shadow-sm
                    ${
                        own
                            ? 'rounded-2xl rounded-br-none bg-cyan-500 text-white'
                            : 'rounded-2xl rounded-bl-none bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-700 text-[#000f2b] dark:text-white'
                    }
                `}
            >
                <p>{message.text}</p>

                <div className={`mt-1 flex items-center gap-1 text-xs ${own ? 'justify-end text-cyan-100' : 'justify-start text-gray-400 dark:text-gray-500'}`}>
                    
                    <span>{formatTime(message.sentAt)}</span>
                    {own && (
                        message.read
                            ? <CheckCheck size={14} className="text-cyan-50"/>
                            : <Check size={14} className="text-cyan-100"/>
                    )}
                </div>

            </div>
        </div>
    );
}