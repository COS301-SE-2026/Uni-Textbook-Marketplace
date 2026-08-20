interface Props {
    title: string;
    subtitle: string;
}

export default function ChatHeader({
    title,
    subtitle,
}: Readonly<Props>) {

    return (
        <header className="border-b bg-white px-8 py-5">
            <h2 className="text-2xl font-bold text-slate-900">
                {title}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
                {subtitle}
            </p>
        </header>
    );
}