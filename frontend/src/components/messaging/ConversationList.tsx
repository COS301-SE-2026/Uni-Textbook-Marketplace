import ConversationCard from "./ConversationCard";


export default function ConversationList() {
    return (

        <aside className="
            w-80 
            border-r 
            bg-white 
            overflow-y-auto
        ">

            <div className="
                border-b 
                p-4 
                font-bold 
                text-lg
            ">
                Conversations
            </div>
            <ConversationCard />
            <ConversationCard />
            <ConversationCard />


        </aside>

    );
}