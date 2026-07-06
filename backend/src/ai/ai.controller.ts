import { Body, Controller, Post } from '@nestjs/common';
import { Session } from '@thallesp/nestjs-better-auth';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import { AiService } from './ai.service';
import { ChatAiDto } from './dto/chat-ai.dto';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  chat(@Session() session: UserSession, @Body() dto: ChatAiDto) {
    return this.aiService.chat(session.user.id, dto);
  }
}
