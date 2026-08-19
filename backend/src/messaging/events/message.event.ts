export class MessageEvent {

    userId: string;
    notificationfrom: string;
    entityType: 'message';
    messageInfo: string;
    new: boolean = false;
} 