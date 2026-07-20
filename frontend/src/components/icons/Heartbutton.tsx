"use client";

import type { MouseEvent } from "react";
import { Heart } from "lucide-react";

type HeartButtonProps = {
    onClick?: (liked: boolean) => void;
    liked?: boolean;
};

export default function Heartbutton({ onClick, liked = false }: HeartButtonProps) {
    const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        onClick?.(!liked);
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            className="p-3 rounded-full transition duration-200 ease-in-out hover:bg-gray-100 focus:outline-none"
            aria-label={liked ? "Unlike" : "Like"}
            aria-pressed={liked}
        >
            <Heart
                className={`transition-colors duration-300 ${liked ? "fill-[#00B4D8] text-[#00B4D8]" : "text-gray-400"}`}
            />
        </button>
    );
}