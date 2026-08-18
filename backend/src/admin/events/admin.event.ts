export class AdminEvent {
  title: string;
  action: 'APPROVE_LISTING' | 'REJECT_LISTING';
  name: string;
  listingId: string;
  studentId: string;
  description: string;
}
