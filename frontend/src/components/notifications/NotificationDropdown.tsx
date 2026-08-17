import Link from "next/link";
import { CheckCheck } from "lucide-react";
import type { Notification } from "@/types/notification";
import { getNotificationIcon } from "@/utils/notificationRoutes";


interface NotificationDropdownProps {
    notifications: Notification[];
    isLoading: boolean;
    onMarkRead: (id: string) => void;
    onMarkAllRead: () => void;
    onNavigate: () => void;

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
        
    )
}