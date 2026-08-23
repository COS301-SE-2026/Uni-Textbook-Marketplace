'use client';

import { useState, useRef } from 'react';
import Button from '@/components/ui/Button';
import { Send } from 'lucide-react';

interface Props {
    onSend: (text: string) => void;
}

export default function MessageInput({
    onSend,
}: Readonly<Props>) {
    const [text, setText] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const send = () => {
        if (!text.trim()) return;
        onSend(text);
        setText('');
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            send();
        }
    };

    return (
        <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f172a] px-8 py-5">
            <div className="flex gap-3 items-center">
                <input
                    ref={inputRef}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="
                        flex-1
                        rounded-full
                        border
                        border-gray-300 dark:border-gray-600
                        bg-gray-100 dark:bg-slate-700
                        text-slate-900 dark:text-white
                        placeholder-gray-400 dark:placeholder-gray-400
                        px-5
                        py-3
                        focus:border-cyan-500
                        focus:outline-none
                        focus:ring-2
                        focus:ring-cyan-500/20
                        transition-all
                    "
                    placeholder="Type a message..."
                />
                <Button
                    onClick={send}
                    disabled={!text.trim()}
                    className="rounded-full px-6 py-3 h-12 w-12 flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Send size={18} />
                </Button>
            </div>
        </div>
    );
}