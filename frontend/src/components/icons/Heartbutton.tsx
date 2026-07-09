"use client";

import { useState } from "react";
import { Heart } from "lucide-react";

export default function Heartbutton (){

    const [isliked, setIsliked] = useState(false);

    const handleClick = () => {
        setIsliked(true);
    }

    return(
        <button
            onClick={handleClick}
            className="p-3 rounded-full transition duration-200 ease-in-out hover:bg-gray-100 focus:outline-none"
            aria-label="Like"
        >
            <Heart
                className={`transition colors duration-300 ${isliked ? 'fill-[00B4D8]' : 'text-gray-400'}`}
            />
        </button>
    )
}