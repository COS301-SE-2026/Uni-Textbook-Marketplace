export interface NotificationListing {
    id: string;
    title? : string;
    [key: string]: unknown;
}


export interface Notification {
    id: string;
    is_read: boolean;
    entity_type: string;
    entity_id: NotificationListing | null;
    message_info: string;
    created_at: string;
}