'use client';

export default function MessagesDesktop() {
    return (
        <main className="min-h-screen bg-gray-50 p-8">
            <div className="mx-auto max-w-7xl h-[85vh] rounded-2xl bg-white shadow border flex">

                <div className="w-1/3 border-r p-4">
                    <h2 className="text-xl font-semibold mb-4">
                        Messages
                    </h2>

                    <p>No conversations yet.</p>
                </div>

                <div className="flex-1 flex items-center justify-center">

                    <div className="text-center">

                        <h2 className="text-2xl font-semibold">
                            Select a conversation
                        </h2>

                        <p className="text-gray-500 mt-2">
                            Choose a conversation from the left.
                        </p>

                    </div>

                </div>

            </div>
        </main>
    );
}