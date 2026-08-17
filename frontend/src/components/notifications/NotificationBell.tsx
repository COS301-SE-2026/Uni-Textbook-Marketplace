"use client";

import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { NotificationDropdown } from "./NotificationDropdown";


export function NotificationBell() {

    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const { notifications, unreadCount, isLoading, markRead, markAllRead } = useNotifications();

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
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#00B4D8] px-1 text-[10px] font semibold leading-none text-white"
                    aria-hidden="true"
                    >
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>

                )}
            </button>

            {isOpen && (
                <NotificationDropdown notifications={notifications}
                            isLoading={isLoading}
                            onMarkRead={markRead}
                            onMarkAllRead={markAllRead}
                            onNavigate={() => setIsOpen(false)}
                />
            )}

            
        </div>
    );
}