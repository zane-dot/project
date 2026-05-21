import { PrismaClient, TransactionType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const CATEGORIES = ['餐饮', '交通', '购物', '娱乐', '居家', '医疗', '教育', '其他'] as const;

function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

async function main(): Promise<void> {
  const email = 'demo@finance.app';
  const password = 'demo1234';

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, name: '演示账号' },
    create: { email, name: '演示账号', passwordHash },
  });

  // Wipe existing demo data for idempotence
  await prisma.transaction.deleteMany({ where: { userId: user.id } });
  await prisma.budget.deleteMany({ where: { userId: user.id } });

  const now = new Date();
  const transactions = [] as Array<{
    userId: string;
    type: TransactionType;
    amount: number;
    category: string;
    description: string;
    date: Date;
  }>;

  // 3 months of synthetic data
  for (let monthOffset = 0; monthOffset < 3; monthOffset++) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);

    // Salary
    transactions.push({
      userId: user.id,
      type: TransactionType.INCOME,
      amount: 12000,
      category: '工资',
      description: '月度工资',
      date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 5),
    });

    // ~25 expenses per month
    for (let i = 0; i < 25; i++) {
      const day = Math.floor(Math.random() * 27) + 1;
      const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
      transactions.push({
        userId: user.id,
        type: TransactionType.EXPENSE,
        amount: Math.round(randomBetween(15, 450) * 100) / 100,
        category,
        description: `${category}消费`,
        date: new Date(monthDate.getFullYear(), monthDate.getMonth(), day),
      });
    }
  }

  await prisma.transaction.createMany({ data: transactions });

  // Budgets for current month
  await prisma.budget.createMany({
    data: [
      { userId: user.id, category: '餐饮', limit: 2000, month: now.getMonth() + 1, year: now.getFullYear() },
      { userId: user.id, category: '交通', limit: 800, month: now.getMonth() + 1, year: now.getFullYear() },
      { userId: user.id, category: '购物', limit: 1500, month: now.getMonth() + 1, year: now.getFullYear() },
      { userId: user.id, category: '娱乐', limit: 600, month: now.getMonth() + 1, year: now.getFullYear() },
    ],
  });

  // eslint-disable-next-line no-console
  console.log(`✅ Seeded demo user: ${email} / ${password}`);
  // eslint-disable-next-line no-console
  console.log(`   ${transactions.length} transactions, 4 budgets`);
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
