import ConversationCard from "./ConversationCard";


export default function ConversationList() {
    return (

        <aside className="
            w-80 
            border-2px
            borderColor-black
            bg-white 
            overflow-y-auto
        ">

            <div className="
                border-b 
                p-4 
                font-bold 
                text-black
            ">
                Conversations
            </div>
            <ConversationCard />
            <ConversationCard />
            <ConversationCard />


        </aside>

    );
}