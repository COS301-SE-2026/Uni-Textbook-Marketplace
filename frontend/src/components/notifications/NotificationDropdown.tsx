import Link from "next/link";
import { CheckCheck } from "lucide-react";
import type { Notification } from "@/types/notification";
import { getNotificationIcon, getNotificationRoute } from "@/utils/notificationRoutes";


interface NotificationDropdownProps {
    readonly notifications: Notification[];
    readonly isLoading: boolean;
    readonly onMarkRead: (id: string) => void;
    readonly onMarkAllRead: () => void;
    readonly onNavigate: () => void;
}

const VISIBLE_COUNT = 6;

function timeAgo(isoDate: string): string {

    const diffMs = Date.now() - new Date(isoDate).getTime();
    const minutes = Math.floor(diffMs / 60000);
    
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);

    return `${days}d ago`
}

export function NotificationDropdown({
    notifications,
    isLoading,
    onMarkRead,
    onMarkAllRead,
    onNavigate,
}: NotificationDropdownProps) {

    const visible = notifications.slice(0, VISIBLE_COUNT);

    const hasUnread = notifications.some((n) => !n.is_read);

    return (
        <div role="menu"
            className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-2rem)] bg-[var(--card-bg)] border border-[var(--card-border)] rounded-md shadow-md overflow-hidden z-50"
        >
            <div className="flex items-center justify-between border-b border-[var(--card-border)] px-4 py-3">

                <h2 className="text-sm font-semibold text-[var(--foreground)]">Notifications</h2>
                {hasUnread && (
                    <button type="button"
                        onClick={onMarkAllRead}
                        className="flex items-center gap-1 text-xs font-medium text-[#00B4D8] hover:text-[#0096B4]"
                    >
                        <CheckCheck className="h-3.5 w-3.5" aria-hidden="true" />
                        Mark all read
                    </button>
                )}
            </div>

            <div className="max-h-96 overflow-y-auto">
                {isLoading && (
                    <p className="px-4 py-6 text-center text-sm text-[#4B4F58] dark:text-gray-400">
                        Loading notifications...
                    </p>
                )}

                {!isLoading && visible.length === 0 && (
                    <p className="px-4 py-6 text-center text-sm text-[#4B4F58] dark:text-gray-400">
                        You&apos;re all caught up.
                    </p>
                )}


                {!isLoading &&
                    visible.map((notification) => {
                        const Icon = getNotificationIcon(notification.entity_type);
                        const href = getNotificationRoute(notification);

                        return (
                            <Link key={notification.id}
                            href={href}
                            role="menuitem"
                            onClick={() => {
                                if (!notification.is_read) onMarkRead(notification.id);
                                onNavigate();
                            }}
                            className={`flex items-start gap-3 border-b border-[var(--card-border)] px-4 py-3 text-sm transition-colors last:border-b-0 hover:bg-[#F5F5F5] dark:hover:bg-gray-800 ${
                                notification.is_read ? "" : "bg-[#00B4D8]/[0.08]"
                            }`}
                            >

                                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#00B4D8]"
                                    aria-hidden="true"
                                />
                                <span className="flex-1">

                                    <span className="block text-[var(--foreground)]">
                                        {notification.message_info}
                                    </span>

                                    <span className="mt-0.5 block text-xs text-[#4B4F58] dark:text-gray-400">
                                        {timeAgo(notification.created_at)}
                                    </span>
                                </span>

                                {!notification.is_read && (
                                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#00B4D8]"
                                        aria-hidden="true"
                                    />
                                )}
                            </Link>
                        );
                    })}
            </div>

            <Link href="/notifications"
                onClick={onNavigate}
                className="block border-t border-[var(--card-border)]  px-4 py-2.5 text-center text-sm font-medium text-[#00B4D8] hover:bg-[#F5F5F5] dark:hover:bg-gray-800 hover:text-[#0096B4]"
            >
                View All
            </Link>
            
        </div>
    );
}