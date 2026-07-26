export default function ConversationCard() {
    return (
        <div className="cursor-pointer p-3 hover:bg-blue-100 border-black">

            <h2 className="font-semibold
                            text-black">
                John Smith
            </h2>

            <p className="text-sm text-gray-500 truncate">
                Hey, is the textbook still available?
            </p>

        </div>
    );
}