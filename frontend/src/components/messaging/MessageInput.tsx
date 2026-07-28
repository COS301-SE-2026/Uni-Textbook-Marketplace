'use client';

import { useState } from 'react';

interface Props {
    onSend: (text: string) => void;
}

export default function MessageInput({
    onSend,
}: Readonly<Props>) {
    const [text, setText] = useState('');
    const send = () => {
        if (!text.trim()) {
            return;
        }
        onSend(text);
        setText('');
    };

    return (
        <div className="border-t bg-white px-8 py-5">
            <div className="flex gap-3">
                <input
                    value={text}
                    onChange={(e) =>
                        setText(e.target.value)
                    }
                    className="
                        flex-1
                        rounded-full
                        border
                        border-gray-300
                        px-5
                        py-3
                        focus:border-cyan-500
                        focus:outline-none"
                    placeholder="Type a message..."
                />
                <button
                type = "button"
                    onClick={send}
                    className="
                        rounded-full
                        bg-cyan-500
                        px-8
                        font-medium
                        text-white
                        transition
                        hover:bg-cyan-600"
                >
                    Send
                </button>
            </div>
        </div>
    );
}