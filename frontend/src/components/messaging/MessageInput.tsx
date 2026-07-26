export default function MessageInput() {
    return (
        <div className="border-t bg-white p-4 bg-lg">

            <div className="flex gap-3 bg-white">

                <input
                    className="flex-1 rounded-lg border p-3 outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                    placeholder="Type a message..."
                />

                <button
                    className="rounded-lg bg-blue-500 px-6 text-white hover:bg-blue-600"
                >
                    Send
                </button>

            </div>

        </div>
    );
}