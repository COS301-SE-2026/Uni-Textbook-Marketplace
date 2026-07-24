'use client';

import { useState } from 'react';

import ConversationList from '../../components/messaging//ConversationList';
import ChatHeader from '../../components/messaging//ChatHeader';
import ChatWindow from '../../components/messaging//ChatWindow';
import MessageInput from '../../components/messaging//MessageInput';


export default function MessagesMobile() {
    const [openChat, setOpenChat] = useState(false);

    return (
        <main className="min-h-screen bg-gray-50">

            {!openChat ? (
                <>
                    <header className="
                        bg-white 
                        border-b 
                        px-4 
                        py-4
                    ">
                        <h1 className="text-xl font-semibold">
                            Messages
                        </h1>
                    </header>

                    <ConversationList />
                </>
            ) : (
                <div className="h-screen flex flex-col">

                    <ChatHeader />

                    <ChatWindow />

                    <MessageInput />

                </div>
            )}
        </main>
    );
}