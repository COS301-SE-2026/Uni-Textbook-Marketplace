"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCheck, Bell } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { getNotificationIcon } from "@/utils/notificationRoutes";

const PAGE_SIZE = 15;

function timeAgo(isoDate: string): string {

    const diffMs = Date.now() - new Date(isoDate).getTime();
    const minutes = Math.floor(diffMs / 60000);

    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);

    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);

    return `${days}d ago`;
}

export default function NotificationsPage() {

    const { notifications, unreadCount, isLoading, error, markRead, markAllRead } = useNotifications();
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

    // GET /notifications/mine has no server-side pagination yet no
    // page/limit params) - this pages through the already-fetched flat
    // array client-side. 
    // Gift, you may add them and swap for real query params,
    // rather than silently pretending this is server pagination.
    const visible = notifications.slice(0, visibleCount);
    const hasMore = visibleCount < notifications.length;

    return (
        <div className="container-content py-10">
            <div className="mb-6 flex items-center justify-between">
                <div>

                    <h1 className="text-3xl font-bold text-[var(--foreground)]">Notifications</h1>
                    {unreadCount > 0 && (
                        <p className="mt-1 text-sm text-[#4B4F58] dark:text-gray-400">
                            {unreadCount} unread
                        </p>
                    )}
                </div>

                {unreadCount > 0 && (
                    <button type="button"
                        onClick={markAllRead}
                        className="flex items-center gap-1.5 rounded-md border border-[#00B4D8] px-4 py-2 text-sm font-semibold text-[#00B4D8] transition-colors hover:bg-[#00B4D8] hover:text-white"
                    >

                        <CheckCheck className="h-4 w-4" aria-hidden="true" />
                        Mark all read
                    </button>
                )}
            </div>

            <div className="rounded-md border border-[var(--card-border)] bg-[var(--card-bg)] shadow-sm">
                {isLoading && (
                    <p className="px-6 py-16 text-center text-sm text-[#4B4F58] dark:text-gray-400">
                        Loading notifications...
                    </p>
                )}

                {!isLoading && error && (

                    <p className="px-6 py-16 text-center text-sm text-[#b91c1c] dark:text-[#ef4444]">
                        {error}
                    </p>
                )}

            </div>
        </div>
    )}