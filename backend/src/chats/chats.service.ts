import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';

@Injectable()
export class ChatsService {
  constructor(private readonly prisma: PrismaService) {}

  findAllByUser(userId: string) {
    return this.prisma.chat.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  create(userId: string, dto?: CreateChatDto) {
    return this.prisma.chat.create({
      data: {
        userId,
        title: dto?.title ?? 'New Chat',
      },
    });
  }

  async update(userId: string, chatId: string, dto: UpdateChatDto) {
    await this.ensureOwnership(userId, chatId);
    return this.prisma.chat.update({
      where: { id: chatId },
      data: { title: dto.title },
    });
  }

  async remove(userId: string, chatId: string) {
    await this.ensureOwnership(userId, chatId);
    return this.prisma.chat.delete({ where: { id: chatId } });
  }

  async findOne(userId: string, chatId: string) {
    const chat = await this.prisma.chat.findFirst({
      where: { id: chatId, userId },
    });
    if (!chat) {
      throw new NotFoundException('Chat not found');
    }
    return chat;
  }

  async ensureOwnership(userId: string, chatId: string) {
    const chat = await this.findOne(userId, chatId);
    return chat;
  }

  async touchChat(chatId: string) {
    return this.prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() },
    });
  }
}
