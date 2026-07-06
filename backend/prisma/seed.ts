import { Plan, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_PREMIUM_EMAIL;

  if (!email) {
    console.log('Set SEED_PREMIUM_EMAIL to upgrade an existing user to PREMIUM.');
    return;
  }

  const user = await prisma.user.update({
    where: { email },
    data: { plan: Plan.PREMIUM },
  });

  console.log(`Upgraded ${user.email} to PREMIUM`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
