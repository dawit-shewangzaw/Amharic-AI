import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { Session } from '@thallesp/nestjs-better-auth';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import { ChatsService } from './chats.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { MessagesService } from '../messages/messages.service';

@Controller('chats')
export class ChatsController {
  constructor(
    private readonly chatsService: ChatsService,
    private readonly messagesService: MessagesService,
  ) {}

  @Get()
  findAll(@Session() session: UserSession) {
    return this.chatsService.findAllByUser(session.user.id);
  }

  @Post()
  create(@Session() session: UserSession, @Body() dto?: CreateChatDto) {
    return this.chatsService.create(session.user.id, dto);
  }

  @Patch(':id')
  update(
    @Session() session: UserSession,
    @Param('id') id: string,
    @Body() dto: UpdateChatDto,
  ) {
    return this.chatsService.update(session.user.id, id, dto);
  }

  @Delete(':id')
  remove(@Session() session: UserSession, @Param('id') id: string) {
    return this.chatsService.remove(session.user.id, id);
  }

  @Get(':id/messages')
  async getMessages(
    @Session() session: UserSession,
    @Param('id') id: string,
  ) {
    await this.chatsService.ensureOwnership(session.user.id, id);
    return this.messagesService.findByChat(id);
  }
}
