'use client';

import { useState } from 'react';

import ConversationList from '../../components/messaging/ConversationList';
import ChatHeader from '../../components/messaging/ChatHeader';
import ChatWindow from '../../components/messaging//ChatWindow';
import MessageInput from '../../components/messaging//MessageInput';


export default function MessagesDesktop() {

    const [selectedConversation, setSelectedConversation] = useState(true);


    return (
        <main className="min-h-screen bg-gray-50 p-8">

            <div className="
                mx-auto 
                max-w-7xl 
                h-[85vh] 
                rounded-2xl 
                bg-white 
                shadow 
                border 
                flex
                overflow-hidden
            ">
                {/* Conversation list */}
                <ConversationList />
                {/* Chat section */}
                <section className="flex-1 flex flex-col">
                    {selectedConversation ? (

                        <>
                            <ChatHeader />

                            <ChatWindow />

                            <MessageInput />
                        </>
                    ) : (
                        <div className="
                            flex-1 
                            flex 
                            items-center 
                            justify-center
                        ">
                            <div className="text-center">
                                <h2 className="text-2xl font-semibold">
                                    Select a conversation
                                </h2>
                                <p className="text-gray-500 mt-2">
                                    Choose a conversation from the left.
                                </p>
                            </div>
                        </div>
                    )}
                </section>
            </div>

        </main>
    );
}