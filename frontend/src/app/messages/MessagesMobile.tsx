'use client';

export default function MessagesMobile() {
    return (
        <main className="min-h-screen bg-gray-50">

            <header className="bg-white border-b px-4 py-4 sticky top-0 z-10">
                <h1 className="text-xl font-semibold">
                    Messages
                </h1>
            </header>

            <section className="p-4">

                <div className="rounded-xl border bg-white p-6 text-center">

                    <h2 className="text-lg font-semibold">
                        No conversations yet
                    </h2>

                    <p className="mt-2 text-sm text-gray-500">
                        Messages will show here when you start a conversation
                    </p>

                </div>

            </section>

        </main>
    );
}