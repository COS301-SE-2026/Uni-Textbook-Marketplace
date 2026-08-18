"use client";

import { useCallback, useEffect, useState } from "react";
import type { Notification } from "@/types/notification";


const API_URL = process.env.NEXT_PUBLIC_API_URL;


async function fetchNotifications(): Promise<Notification[]> {

    const res = await fetch(`${API_URL}/notifications/mine`, {
        credentials: "include",
    });


    if (res.status === 404) return [];

    if (!res.ok) {
        throw new Error("Failed to load notifications");
    }
    return res.json();
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


const POLL_INTERVAL_MS = 15000;

interface UseNotificationsResult {
    notifications: Notification[];
    unreadCount: number;
    isLoading: boolean;
    error: string | null;
    markRead: (id: string) => Promise<void>;
    markAllRead: () => Promise<void>;
    refresh: () => Promise<void>;
}

export function useNotifications(): UseNotificationsResult {

    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);


    const refresh = useCallback(async () => {

        try {
            const items = await fetchNotifications();
            setNotifications(items);
            setError(null);

        } catch (err) {
            setError(err instanceof Error ? err.message : "Something wrong occurred");

        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {

        refresh();

        const interval = setInterval(refresh, POLL_INTERVAL_MS);
        return () => clearInterval(interval);
    }, [refresh]);

    const unreadCount = notifications.filter((n) => !n.is_read).length;

    const markRead = useCallback(
        async (id: string) => {
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
            );

            try {
                await markReadRequest(id);
            } catch {

                refresh();
            }
        },
        [refresh]
    );


    const markAllRead = useCallback(async () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));

        try {
            await markAllReadRequest();
        } catch {
            refresh();
        }
    }, [refresh]);

    return { notifications, unreadCount, isLoading, error, markRead, markAllRead, refresh };
}