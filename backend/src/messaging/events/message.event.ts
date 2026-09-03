export class MessageEvent {
  userId: string;
  notificationfrom: string;
  entityType: 'message';
  messageInfo: string;
  new: boolean = false;
  studentEmail: string;
  name: string;
  listingTitle: string;
  messageFrom?: string;
}
