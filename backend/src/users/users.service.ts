import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Plan } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const FREE_DAILY_LIMIT = 20;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async getProfile(userId: string) {
    const user = await this.findById(userId);
    const usage = this.getUsageStats(user);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      plan: user.plan,
      dailyMessageCount: user.dailyMessageCount,
      dailyMessageResetAt: user.dailyMessageResetAt,
      createdAt: user.createdAt,
      usage,
    };
  }

  getUsageStats(user: {
    plan: Plan;
    dailyMessageCount: number;
    dailyMessageResetAt: Date;
  }) {
    const limit = user.plan === Plan.PREMIUM ? null : FREE_DAILY_LIMIT;
    const remaining =
      limit === null ? null : Math.max(0, limit - user.dailyMessageCount);

    return {
      limit,
      remaining,
      isUnlimited: user.plan === Plan.PREMIUM,
    };
  }

  async ensureDailyReset(userId: string) {
    const user = await this.findById(userId);
    const now = new Date();

    if (now >= user.dailyMessageResetAt) {
      const nextReset = this.getNextUtcMidnight(now);
      return this.prisma.user.update({
        where: { id: userId },
        data: {
          dailyMessageCount: 0,
          dailyMessageResetAt: nextReset,
        },
      });
    }

    return user;
  }

  async incrementMessageCount(userId: string) {
    await this.ensureDailyReset(userId);
    return this.prisma.user.update({
      where: { id: userId },
      data: { dailyMessageCount: { increment: 1 } },
    });
  }

  async checkUsageLimit(userId: string) {
    const user = await this.ensureDailyReset(userId);

    if (user.plan === Plan.PREMIUM) {
      return { allowed: true, user };
    }

    if (user.dailyMessageCount >= FREE_DAILY_LIMIT) {
      return { allowed: false, user };
    }

    return { allowed: true, user };
  }

  private getNextUtcMidnight(from: Date) {
    const next = new Date(from);
    next.setUTCDate(next.getUTCDate() + 1);
    next.setUTCHours(0, 0, 0, 0);
    return next;
  }
}

export { FREE_DAILY_LIMIT };
