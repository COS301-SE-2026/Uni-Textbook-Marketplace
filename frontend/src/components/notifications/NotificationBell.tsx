"use client";

import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";


export function NotificationBell() {

    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const { notifications, unread, isLoading, markRead, markAllRead } = useNotifications();

    useEffect(() => {
        if (!isOpen) return;


        function handleClickOutside(event: MouseEvent) {

            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)

            ) {
                setIsOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    return (
        <div ref={containerRef} className="relative">
            <button type="button"
                    aria-label={
                        unreadCount > 0
                        ? `Notifications, ${unreadCount} unread`
                        : "Notifications"
                    }

                    aria-expanded={isOpen}
                    onClick={() => setIsOpen((prev) => !prev)}
                    className="relative p-2 text-[var(--foreground)] hover:text-[#00B4D8] transition-colors duration-200 rounded-full hover:bg-[#F5F5F5] dark:hover:bg-gray-800"
            >
                
            </button>
        </div>
    )
}