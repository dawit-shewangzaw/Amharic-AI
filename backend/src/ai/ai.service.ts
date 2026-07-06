import { ForbiddenException, Injectable } from '@nestjs/common';
import { MessageRole } from '@prisma/client';
import { ChatsService } from '../chats/chats.service';
import { MessagesService } from '../messages/messages.service';
import { UsersService } from '../users/users.service';
import { ChatAiDto } from './dto/chat-ai.dto';
import { AMHARIC_SYSTEM_PROMPT } from './prompts/system.prompt';
import { GroqProvider } from './providers/groq.provider';
import { NllbTranslatorService } from './providers/nllb-translator.service';
import {
  createTextMasker,
  normalizeUserText,
} from './utils/text-protection';

@Injectable()
export class AiService {
  constructor(
    private readonly groqProvider: GroqProvider,
    private readonly nllbTranslatorService: NllbTranslatorService,
    private readonly chatsService: ChatsService,
    private readonly messagesService: MessagesService,
    private readonly usersService: UsersService,
  ) {}

  async chat(userId: string, dto: ChatAiDto) {
    const { allowed } = await this.usersService.checkUsageLimit(userId);
    if (!allowed) {
      throw new ForbiddenException(
        'Daily message limit reached. Upgrade to Premium for unlimited messages.',
      );
    }

    await this.chatsService.ensureOwnership(userId, dto.chatId);

    const normalizedContent = normalizeUserText(dto.content);
    const userMessage = await this.messagesService.create(
      dto.chatId,
      MessageRole.USER,
      normalizedContent,
    );

    const history = await this.messagesService.getRecentForAi(dto.chatId, 8);
    const orderedHistory = [...history].reverse();

    const assistantContent = await this.generateAmharicReply({
      currentMessage: normalizedContent,
      history: orderedHistory,
    });

    const assistantMessage = await this.messagesService.create(
      dto.chatId,
      MessageRole.ASSISTANT,
      assistantContent,
    );

    await this.chatsService.touchChat(dto.chatId);
    const updatedUser = await this.usersService.incrementMessageCount(userId);
    const usage = this.usersService.getUsageStats(updatedUser);

    return {
      userMessage,
      assistantMessage,
      usage,
    };
  }

  private async generateAmharicReply(params: {
    currentMessage: string;
    history: Array<{ role: MessageRole; content: string }>;
  }): Promise<string> {
    const masker = createTextMasker();

    const maskedHistory = params.history.map((message) => ({
      role: message.role,
      content: masker.mask(message.content),
    }));

    const translatedHistory = await Promise.all(
      maskedHistory.map(async (message) => ({
        role: message.role,
        content: await this.nllbTranslatorService.translateToEnglish(
          message.content,
        ),
      })),
    );

    const translatedCurrent = await this.nllbTranslatorService.translateToEnglish(
      masker.mask(params.currentMessage),
    );

    const englishMessages = [
      { role: 'system' as const, content: AMHARIC_SYSTEM_PROMPT },
      ...translatedHistory.map((message) => ({
        role: (message.role === MessageRole.USER ? 'user' : 'assistant') as
          | 'user'
          | 'assistant',
        content: message.content,
      })),
      { role: 'user' as const, content: translatedCurrent },
    ];

    const englishAnswer = await this.groqProvider.chat(englishMessages);
    const amharicAnswer = await this.nllbTranslatorService.translateToAmharic(
      englishAnswer,
    );

    return masker.unmask(amharicAnswer);
  }
}
