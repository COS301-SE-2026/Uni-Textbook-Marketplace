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

    const data = await res.json();

    if (Array.isArray(data)) {
        return data;
    }

    if (data && typeof data === 'object' && Array.isArray(data.items)) {
        return data.items;
    }

    if (data && typeof data === 'object') {


        for (const key of ['notifications', 'data', 'results']) {
            if (Array.isArray(data[key])) {
                return data[key];
            }
        }
    }
    
    console.warn('Unexpected notification response shape:', data);
    return [];
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
            setNotifications(Array.isArray(items) ? items : []);
            setError(null);

        } catch (err) {
            setError(err instanceof Error ? err.message : "Something wrong occurred");

            setNotifications([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
    let isMounted = true;

    const loadInitial = async () => {
      try {
        const items = await fetchNotifications();
        if (isMounted) {
          setNotifications(items);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Something wrong occurred");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadInitial();

    return () => {
      isMounted = false;
    };
  }, []);


    useEffect(() => {
        const interval = setInterval(() => {
        refresh();
        }, POLL_INTERVAL_MS);

        return () => clearInterval(interval);
    }, [refresh]);

    const unreadCount = Array.isArray(notifications) 
    ? notifications.filter((n) => !n.is_read).length 
    : 0;

    const markRead = useCallback(
    async (id: string) => {

      setNotifications((prev) => {
        if (!Array.isArray(prev)) return [];

        return prev.map((n) => (n.id === id ? { ...n, is_read: true } : n));
      });

      try {
        await markReadRequest(id);
      } catch {

        refresh();
      }
    },
    
    [refresh]
  );


    const markAllRead = useCallback(async () => {
        setNotifications((prev) => {
            if (!Array.isArray(prev)) return [];
            return prev.map((n) => ({ ...n, is_read: true }));
        });

        try {
            await markAllReadRequest();
        } catch {
            refresh();
        }
    }, [refresh]);

    return { notifications: Array.isArray(notifications) ? notifications : [],
        unreadCount, 
        isLoading, 
        error, 
        markRead, 
        markAllRead, 
        refresh,
    };
}