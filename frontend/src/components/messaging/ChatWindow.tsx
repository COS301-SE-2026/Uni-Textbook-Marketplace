import MessageBubble from "./MessageBubble";


export default function ChatWindow() {
    
    return (
        <main className="
            flex-1 
            overflow-y-auto 
            bg-gray-50 
            p-6
        ">
            <MessageBubble
                text="Hi, is the COS214 textbook still available?"
            />
            <MessageBubble
                own
                text="Yes, it is. Are you interested?"
            />
            <MessageBubble
                text="Awesome. How much are you selling it for?"
            />
            <MessageBubble
                own
                text="R300. I can meet on campus."
            />
        </main>

    );
}