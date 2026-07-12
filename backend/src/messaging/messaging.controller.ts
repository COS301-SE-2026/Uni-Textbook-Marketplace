import {
  Body,
  Controller,
  Get,
  Param,
  Post,
} from '@nestjs/common';

import { MessagingService } from './messaging.service';

@Controller('conversations')
export class MessagingController {

    constructor(
        private readonly messagingService: MessagingService,
    ) {}

    @Post()
    createConversation(@Body() body: any) {
        return this.messagingService.createConversation(body);
    }

    @Get('mine')
    getMyConversations() {
        // JWT user comes here later
        return this.messagingService.getConversations('');
    }

    @Get(':id/messages')
    getMessages(
        @Param('id') id: string,
    ) {
        return this.messagingService.getMessages(id);
    }

    @Post(':id/messages')
    sendMessage(
        @Param('id') id: string,
        @Body() body: any,
    ) {
        return this.messagingService.sendMessage(
        id,
        '',
        body.text,
        );
    }
}