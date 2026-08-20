import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MessagingService } from './messaging.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

@ApiTags('Conversations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('conversations')
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  @Post()
  @ApiOperation({
    summary: 'Create or retrieve a conversation for a listing',
  })
  async createConversation(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateConversationDto,
  ) {
    return this.messagingService.createConversation(req.user.id, dto.listingId);
  }

  @Get('mine')
  @ApiOperation({
    summary: 'Get all conversations for the logged-in user',
  })
  async getMyConversations(@Req() req: AuthenticatedRequest) {
    return this.messagingService.getMyConversations(req.user.id);
  }

  @Get(':id/messages')
  @ApiOperation({
    summary: 'Get all messages in a conversation',
  })
  @ApiParam({
    name: 'id',
    description: 'Conversation ID',
  })
  async getMessages(
    @Req() req: AuthenticatedRequest,
    @Param('id') conversationId: string,
  ) {
    return this.messagingService.getMessages(req.user.id, conversationId);
  }

  @Post(':id/messages')
  @ApiOperation({
    summary: 'Send a message in a conversation',
  })
  @ApiParam({
    name: 'id',
    description: 'Conversation ID',
  })
  async sendMessage(
    @Req() req: AuthenticatedRequest,
    @Param('id') conversationId: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.messagingService.sendMessage(
      req.user.id,
      conversationId,
      dto.text,
    );
  }
}
