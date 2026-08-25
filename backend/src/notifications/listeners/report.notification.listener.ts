import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationsService } from '../notifications.service';
import { ReportEvent } from '../../reports/events/report.events';

@Injectable()
export class ReportNotificationListener {
    constructor(
        private readonly notificationsService: NotificationsService,
    ) {}

    @OnEvent('report.created')
    async notifyAdminOfReport(event: ReportEvent) {
        await this.notificationsService.emit(event);
    }

    @OnEvent('report.reviewed')
    async notifyReporterOfReview(event: ReportEvent) {
        await this.notificationsService.emit(event);
    }
}