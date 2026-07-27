interface Props {
    title: string;
    subtitle: string;
}

export default function ChatHeader({
    title,
    subtitle,
}: Readonly<Props>) {

    return (
        <header className="border-b bg-white p-4">
            <h2 className="font-bold">
                {title}
            </h2>
            <p className="text-sm text-gray-500">
                {subtitle}
            </p>
        </header>
    );
}