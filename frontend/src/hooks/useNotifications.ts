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