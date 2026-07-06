import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';
import { AiModule } from './ai/ai.module';
import { ChatsModule } from './chats/chats.module';
import { HealthController } from './common/health.controller';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [PrismaModule, AuthModule, UsersModule, ChatsModule, AiModule],
  controllers: [AppController, HealthController],
})
export class AppModule {}
