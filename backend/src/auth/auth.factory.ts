import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaService } from '../prisma/prisma.service';

export const createAuth = (prisma: PrismaService) =>
  betterAuth({
    baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:3000',
    basePath: '/api/auth',
    secret: process.env.BETTER_AUTH_SECRET,
    database: prismaAdapter(prisma, { provider: 'postgresql' }),
    trustedOrigins: [
      process.env.FRONTEND_URL ?? 'http://localhost:3000',
      'http://localhost:4000',
    ],
    emailAndPassword: {
      enabled: true,
    },
    user: {
      additionalFields: {
        plan: {
          type: 'string',
          required: false,
          defaultValue: 'FREE',
          input: false,
        },
        dailyMessageCount: {
          type: 'number',
          required: false,
          defaultValue: 0,
          input: false,
        },
        dailyMessageResetAt: {
          type: 'date',
          required: false,
          defaultValue: new Date(),
          input: false,
        },
      },
    },
  });

export type Auth = ReturnType<typeof createAuth>;
