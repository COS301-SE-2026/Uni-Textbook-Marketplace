import {
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AuthenticatedUser {
  id: string;
}

interface RequestWithUser extends Request {
  user: AuthenticatedUser;
}

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationService: NotificationsService) {}

  @Get('mine')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Returns user notifications' })
  mynotifications(
    @Req() req: RequestWithUser,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.notificationService.mynotifications(req.user.id, page, limit);
  }

  @Patch(':id/read')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Marks the notification read' })
  readNoti(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.notificationService.readNoti(req.user.id, id);
  }

  @Patch('read-all')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Marks all the notification read' })
  readAll(@Req() req: RequestWithUser) {
    return this.notificationService.readAll(req.user.id);
  }

  @Delete(':id/delete')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({summary: 'Delete a notification'})
  deleteNotification(@Req() req: RequestWithUser, @Param('id') id: string){

    return this.notificationService.deleteNotification(req.user.id,id);

  }
}
