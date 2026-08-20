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
                    max-w-md
                    rounded-2xl
                    px-5
                    py-3
                    shadow-sm
                    ${
                        own
                            ? 'bg-cyan-500 text-white'
                            : 'bg-white border'
                    }
                `}
            >
                <p>{message.text}</p>
            </div>
        </div>
    );
}