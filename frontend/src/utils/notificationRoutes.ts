import type { LucideIcon } from "lucide-react";
import { CheckCircle2, XCircle, MessageSquare,SquarePen, Bell as BellIcon } from "lucide-react";
import type { Notification } from "@/types/notification";



const ENTITY_TYPE_ICON: Record<string, LucideIcon> = {
    APPROVED_LISTING: CheckCircle2,
    REJECTED_LISTING: XCircle,
    message: MessageSquare,
    "Edited listing": SquarePen,
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