import Image from "next/image";

interface Props {
    title: string;
    subtitle: string;
    avatar?: string;
    online?: boolean;
}

export default function ChatHeader({
    title,
    subtitle,
    avatar,
    online,
}: Readonly<Props>) {

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2);
    };

    return (
        <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f172a] px-8 py-4 flex items-center gap-4 min-h-[73px]">
            {/* Avatar */}
            {avatar ? (
                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 relative">
                    <Image
                        src={avatar}
                        alt={title}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                    />
                </div>
            ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00B4D8] to-[#0096B4] flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                    {getInitials(title)}
                </div>
            )}
            
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-[#000f2b] dark:text-white truncate">
                        {title}
                    </h2>
                    {online && (
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500 flex-shrink-0" />
                    )}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {subtitle}
                </p>
            </div>
        </header>
    );
}