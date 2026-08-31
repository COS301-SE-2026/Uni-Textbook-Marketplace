"use client";

import { useCallback, useEffect, useState } from "react";
import type { Notification } from "@/types/notification";


const API_URL = process.env.NEXT_PUBLIC_API_URL;
const POLL_INTERVAL_MS = 15000;

export interface NotificationMeta {

    total: number;
    page: number;
    limit: number;
    pages: number;
}

interface fetchResult {

    items: Notification[];
    meta: NotificationMeta;

}


async function fetchNotifications(page: number, limit: number): Promise<fetchResult> {

    const res = await fetch(`${API_URL}/notifications/mine?page=${page}&limit=${limit}`, {
        credentials: "include",
    });


    if (res.status === 404) {
        return {
            items: [],
            meta: {
                total: 0,
                page,
                limit,
                pages: 1
            }
        };
    };

    if (!res.ok) {
        throw new Error("Failed to load notifications");
    }

    const data = await res.json();
    console.log(data);

    if (data && typeof data === "object" && data.pagination) {
        const list = Array.isArray(data.items)
            ? data.items
            : Array.isArray(data.data)
                ? data.data
                : [];
        return { items: list, meta: data.pagination };
    }

    let items: Notification[] = [];
    if (Array.isArray(data)) {
        items = data;
    } else if (data && typeof data === 'object') {

        for (const key of ["notifications", "data", "results"]) {

            if (Array.isArray(data[key])) {
                items = data[key];
                break;
            }
        }
    }

    console.warn('Unexpected notification response shape:', data);
    return {
        items,
        meta: {
            total: items.length,
            page: 1,
            limit,
            pages: 1
        },
    };
}

async function markReadRequest(id: string): Promise<void> {
    const res = await fetch(`${API_URL}/notifications/${id}/read`, {
        method: "PATCH",
        credentials: "include",
    });

    if (!res.ok) throw new Error("Failed to mark notification as read");

}


async function markAllReadRequest(): Promise<void> {

    const res = await fetch(`${API_URL}/notifications/read-all`, {
        method: "PATCH",
        credentials: "include",
    });

    if (!res.ok) throw new Error("Failed to mark all as read");
}

async function deleteNotification(id: string): Promise<void> {

    const res = await fetch(`${API_URL}/notifications/${id}/delete`, {
        method: "DELETE",
        credentials: "include",
    });

    if (!res.ok) throw new Error('failed to delete');

}


interface UseNotificationsResult {
    notifications: Notification[];
    unreadCount: number;
    meta: NotificationMeta;
    isLoading: boolean;
    error: string | null;
    markRead: (id: string) => Promise<void>;
    markAllRead: () => Promise<void>;
    refresh: () => Promise<void>;
    deleteNotif: (id: string) => Promise<void>;
}

export function useNotifications(page: number = 1, limit: number = 5): UseNotificationsResult {

    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [meta, setMeta] = useState<NotificationMeta>({ total: 0, page, limit, pages: 1 })
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);


    const load = useCallback(async () => {

        try {
            const { items, meta: m } = await fetchNotifications(page, limit);
            setNotifications(items);
            setMeta(m);
            setError(null);

        } catch (err) {
            setError(err instanceof Error ? err.message : "Something wrong occurred");

            setNotifications([]);
        } finally {
            setIsLoading(false);
        }
    }, [page, limit]);

    useEffect(() => {
        setIsLoading(true);
        load();
    }, [load]);


    useEffect(() => {
        const interval = setInterval(load, POLL_INTERVAL_MS);

        return () => clearInterval(interval);
    }, [load]);

    const unreadCount = notifications.filter((n) => !n.is_read).length;

    const markRead = useCallback(
        async (id: string) => {

            setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));

            try {
                await markReadRequest(id);
            } catch {

                load();
            }
        },

        [load]
    );


    const markAllRead = useCallback(async () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));

        try {
            await markAllReadRequest();
        } catch {
            load();
        }
    }, [load]);

    const deleteNotif = useCallback(async (id: string) => {

        const prevNotifications = notifications;
        const prevMeta = meta;

        setNotifications((prev) => prev.filter((n) => n.id !== id));
        setMeta((m) => ({ ...m, total: Math.max(0, m.total - 1) }));

        try {
            await deleteNotification(id);
        } catch {
            setNotifications(prevNotifications);
            setMeta(prevMeta)
            setError("failed to delete notification");
        }
    }, [notifications, meta]);

    return {
        notifications,
        meta,
        unreadCount,
        isLoading,
        error,
        markRead,
        markAllRead,
        refresh: load,
        deleteNotif,
    };
}