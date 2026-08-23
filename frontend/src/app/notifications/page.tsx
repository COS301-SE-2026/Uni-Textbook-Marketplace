"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCheck } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { getNotificationIcon, getNotificationRoute } from "@/utils/notificationRoutes";

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

                {!isLoading && !error && visible.length > 0 && (
                    <ul>
                        
                        {visible.map((notification) => {
                            const Icon = getNotificationIcon(notification.entity_type);
                            const href = getNotificationRoute(notification);


                            return (
                                <li key={notification.id}
                                    className="border-b border-[var(--card-border)] last:border-b-0"
                                >
                                    <Link href={href}
                                        onClick={() => {
                                            if(!notification.is_read) markRead(notification.id);
                                        }}

                                        className={`flex items-start gap-4 px-6 py-4 transition-colors hover:bg-[#F5F5F5] dark:hover:bg-gray-800 ${
                                            notification.is_read ? "" : "bg-[#00B4D8] / [0.06]"
                                            
                                        }`}
                                    >

                                        <Icon
                                            className="mt-0.5 h-5 w-5 shrink-0 text-[#00B4D8]"
                                            aria-hidden="true"
                                            />
                                            <span className="flex-1">



                                            <span className="block text-sm text-[var(--foreground)]">
                                                {notification.message_info}
                                            </span>
                                            <span className="mt-1 block text-xs text-[#4B4F58] dark:text-gray-400">
                                                {timeAgo(notification.created_at)}
                                            </span>

                                            </span>
                                            {!notification.is_read && (
                                            <span
                                                className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#00B4D8]"
                                                aria-hidden="true"
                                            />

                                            )}
                                    </Link>


                                </li>
                            );
                        })}
                    </ul>
                )}

            </div>
            {hasMore && (
                <div className="mt-6 flex justify-center">
                <button
                    type="button"
                    onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                    className="rounded-md border border-[#dddddd] px-5 py-2 text-sm font-medium text-[var(--foreground)] transition-colors hover:border-[#00B4D8] hover:text-[#00B4D8] dark:border-gray-700"
                >
                    Load more
                </button>

                </div>
            )}
            </div>
        
    );
}