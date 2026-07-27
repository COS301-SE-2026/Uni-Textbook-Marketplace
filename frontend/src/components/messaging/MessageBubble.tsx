import type { Message } from '@/types/messaging';

interface Props {
    message: Message;
    own: boolean;
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
                    max-w-xs
                    rounded-lg
                    px-4
                    py-2
                    ${
                        own
                            ? 'bg-blue-500 text-white'
                            : 'border bg-white'
                    }
                `}
            >
                {message.text}
            </div>
        </div>
    );
}