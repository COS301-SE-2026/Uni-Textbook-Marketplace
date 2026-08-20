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

    const notificationType = notification.entity_type;

    switch(notificationType) {

        case "APPROVED_LISTING":
            return `/listings/${notification.entity_id?.id}`;

        case "REJECTED_LISTING":
            return `/listings/${notification.entity_id?.id}`;

        case "Edited listing":
            return `/listings/${notification.entity_id?.id}`;

        case "message":
            return "/listings";

        default:
            return "/notifications";
    }
    
}