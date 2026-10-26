export class ReportEvent {
  reportId: string;
  reporterId: string;
  listingId: string;
  action: 'REPORT_CREATED' | 'REPORT_REVIEWED';
  message: string;
}
