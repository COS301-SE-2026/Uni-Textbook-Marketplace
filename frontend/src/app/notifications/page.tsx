"use client";

import { Suspense, useMemo } from "react";
import Link from "next/link";
import { CheckCheck, Trash2, Eye, Check, BellOff } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { NotificationPagination } from "@/components/pagination/pagination";
import { getNotificationHeading, getNotificationIcon, getNotificationRoute } from "@/utils/notificationRoutes";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const PAGE_SIZE = 5;

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

function NotificationSkeletonRow() {

    return (

        <li className="flex items-start gap-4 border-b border-[var(--card-border)] px-6 py-4 last:border-b-0">
            <div className="mt-0.5 h-9 w-9 shrink-0 animate-pulse rounded-full bg-[var(--muted)]" />
            <div className="flex-1 space-y-2">
                <div className="h-3 w-3/4 animate-pulse rounded bg-[var(--muted)]" />
                <div className="h-3 w-3/4 animate-pulse rounded bg-[var(--muted)]" />
            </div>
            <div className="mt-1 h-3 w-10 shrink-0 animate-pulse rounded bg-[var(--muted)]" />
        </li>
    );
}

function EmptyState({ filter }: { filter: 'all' | 'unread' }) {

    return (

        <div className="flex flex-col items-center px-6 py-16 text-center">

            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-md bg-[#00B4D8]/10">
                <BellOff className="h-6 w-6 text-[#00B4D8]" aria-hidden="true" />
            </div>

            <h3 className="text-lg font-semibold text-[var(--foreground)]">
                {filter === "unread" ? "No unread notifications" : "You're all caught up"}
            </h3>

            <p className="mt-1 max-w-xs text-sm text-[#4B4F58] dark:text-gray-400">
                Check back later for updates.
            </p>

            <Link href="/listings" className="btn-primary mt-5">
                Browse Listings
            </Link>
        </div>
    );
}

function NotificationsContent() {

    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const page = Number(searchParams.get("page") || 1);
    const filter = (searchParams.get("filter") as "all" | "unread") || "all";

    const { notifications, meta, unreadCount, isLoading, error, markRead, markAllRead, deleteNotif } =
        useNotifications(page, PAGE_SIZE);

    const filtered = useMemo(
        () => (filter === "unread" ? notifications.filter((n) => !n.is_read) : notifications),
        [notifications, filter]
    );

    const setFilter = (tab: "all" | "unread") => {
        const params = new URLSearchParams(searchParams);
        params.set("filter", tab);
        params.set("page", "1");
        router.push(`${pathname}?${params.toString()}`);
    };


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

                <div className="flex items-center gap-3">

                    <div className="flex rounded-md border border-[var(--card-border)] bg-[var(--card-bg)] p-1 text-sm">
                        {(["all", "unread"] as const).map((tab) => (
                            <button
                                key={tab}
                                type="button"
                                onClick={() => {
                                    setFilter(tab);
                                }}
                                className={`rounded px-3 py-1.5 font-medium capitalize transition-colors ${filter === tab
                                    ? "bg-[var(--muted)] text-[var(--foreground)]"
                                    : "text-[#4B4F58] hover:text-[var(--foreground)] dark:text-gray-400"
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
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
            </div>

            <div className="rounded-md border border-[var(--card-border)] bg-[var(--card-bg)] shadow-sm">
                {isLoading && (

                    <ul>
                        {Array.from({ length: 5 }).map((_, i) => (
                            <NotificationSkeletonRow key={i} />
                        ))}
                    </ul>
                )}

                {!isLoading && error && (

                    <p className="px-6 py-16 text-center text-sm text-[#b91c1c] dark:text-[#ef4444]">
                        {error}
                    </p>
                )}

                {!isLoading && !error && filtered.length === 0 && <EmptyState filter={filter} />}

                {!isLoading && !error && filtered.length > 0 && (
                    <ul>

                        {filtered.map((notification) => {
                            const Icon = getNotificationIcon(notification.entity_type);
                            const href = getNotificationRoute(notification);
                            const heading = getNotificationHeading(notification.entity_type);


                            return (
                                <li key={notification.id}
                                    className={`flex items-start border-b border-[var(--card-border)] px-6 py-4 last:border-b-0 ${notification.is_read ? "" : "bg-[#00B4D8]/[0.06]"}`}
                                >


                                    <Icon
                                        className="mt-0.5 h-5 w-5 shrink-0 text-[#00B4D8] m-2"
                                        aria-hidden="true"
                                    />

                                    <div className="min-w-0 flex-1">

                                        <p className="text-sm font-semibold text-[var(--foreground)]">
                                            {heading}
                                        </p>

                                        <p className="line-clamp-2 break-words text-sm text-[var(--foreground)]">
                                            {notification.message_info}
                                        </p>

                                        <span className="mt-1 block text-xs text-[#4B4F58] dark:text-gray-400">
                                            {timeAgo(notification.created_at)}
                                        </span>
                                    </div>

                                    {!notification.is_read && (
                                        <span
                                            className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#00B4D8]"
                                            aria-hidden="true"
                                        />
                                    )}


                                    <div className="flex shrink-0 items-center gap-1">
                                        <Link
                                            href={href}
                                            aria-label="View notification"
                                            title="View"
                                            className="flex items-center gap-1 rounded-md px-2 py-2 text-xs font-medium text-[#4B4F58] transition-colors hover:text-[#00B4D8] dark:text-gray-400 dark:hover:bg-gray-800"
                                        >
                                            <Eye className="h-4 w-4" aria-hidden="true" />
                                            <span className="hidden sm:inline">View</span>
                                        </Link>

                                        {!notification.is_read && (
                                            <button
                                                type="button"
                                                onClick={() => markRead(notification.id)}
                                                aria-label="Mark as read"
                                                title="Mark as read"
                                                className="flex items-center gap-1 rounded-md px-2 py-2 text-xs font-medium text-[#4B4F58] transition-colors hover:bg-[#F5F5F5] hover:text-[#00B4D8] dark:text-gray-400 dark:hover:bg-gray-800"
                                            >
                                                <Check className="h-4 w-4" aria-hidden="true" />
                                                <span className="hidden sm:inline">Mark read</span>
                                            </button>
                                        )}

                                        <button
                                            type="button"
                                            onClick={() => deleteNotif(notification.id)}
                                            aria-label="Delete notification"
                                            title="Delete"
                                            className="flex items-center gap-1 rounded-md px-2 py-2 text-xs font-medium text-[#4B4F58] transition-colors hover:bg-[#F5F5F5] hover:text-[#b91c1c] dark:text-gray-400 dark:hover:text-[#ef4444]"
                                        >
                                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                                            <span className="hidden sm:inline">Delete</span>
                                        </button>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}

            </div>

            <div className="mt-6 flex justify-center">
                <NotificationPagination meta={meta} />
            </div>
        </div>

    );
}

export default function NotificationPage() {
    return (
        <Suspense fallback={null}>
            <NotificationsContent />
        </Suspense>
    )
}