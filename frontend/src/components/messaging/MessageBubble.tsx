interface Props {
    own?: boolean;
    text: string;
}

export default function MessageBubble({
    own = false,
    text
}: Props) {
    return (
        <div
            className={`
                mb-4 
                flex
                ${own ? "justify-end" : "justify-start"}
            `}
        >
            <div
                className={`
                    max-w-xs 
                    rounded-lg 
                    px-4 
                    py-2
                    ${
                        own
                        ? "bg-blue-500 text-white"
                        : "bg-white border"
                    }
                `}
            >
                {text}
            </div>
        </div>
    );
}