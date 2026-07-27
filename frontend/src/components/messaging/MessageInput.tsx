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
        <div className="border-t bg-white p-4">
            <div className="flex gap-3">
                <input
                    value={text}
                    onChange={(e) =>
                        setText(e.target.value)
                    }
                    className="flex-1 rounded-lg border p-3 outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Type a message..."
                />
                <button
                type = "button"
                    onClick={send}
                    className="rounded-lg bg-blue-500 px-6 text-white hover:bg-blue-600"
                >
                    Send
                </button>
            </div>
        </div>
    );
}