import { Module } from '@nestjs/common';
import { ChatsModule } from '../chats/chats.module';
import { MessagesModule } from '../messages/messages.module';
import { UsersModule } from '../users/users.module';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { GroqProvider } from './providers/groq.provider';
import { NllbTranslatorService } from './providers/nllb-translator.service';

@Module({
  imports: [ChatsModule, MessagesModule, UsersModule],
  controllers: [AiController],
  providers: [GroqProvider, NllbTranslatorService, AiService],
})
export class AiModule {}
