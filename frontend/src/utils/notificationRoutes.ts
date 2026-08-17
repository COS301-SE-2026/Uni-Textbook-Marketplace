import type { LucideIcon } from "lucide-react";
import { CheckCircle2, XCircle, Bell as BellIcon } from "lucide-react";
import type { Notification } from "@/types/notification";



const ENTITY_TYPE_ICON: Record<string, LucideIcon> = {
    APPROVED: CheckCircle2,
    REJECTED: XCircle,
};


export function getNotificationIcon(entityType: string): LucideIcon {
    return ENTITY_TYPE_ICON[entityType] ?? BellIcon;
}


export function getNotificationRoute(notification: Notification): string {
    if (notification.entity_id?.id) {

        return `/listings/${notification.entity_id.id}`;
    }

    return "/notifications";
}