import { Response } from 'express';
import { z } from 'zod';
import { TransactionType } from '@prisma/client';
import { prisma } from '../utils/prisma';
import { asyncHandler, HttpError } from '../utils/asyncHandler';
import type { AuthRequest } from '../middleware/auth';

const budgetSchema = z.object({
  category: z.string().min(1).max(40),
  limit: z.number().positive().max(1_000_000_000),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000).max(2100),
});

export const getBudgets = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { month, year } = req.query as Record<string, string>;
  const now = new Date();
  const m = month ? parseInt(month, 10) : now.getMonth() + 1;
  const y = year ? parseInt(year, 10) : now.getFullYear();
  if (!Number.isInteger(m) || m < 1 || m > 12 || !Number.isInteger(y)) {
    throw new HttpError(400, 'Invalid month/year');
  }

  const budgets = await prisma.budget.findMany({
    where: { userId: req.userId, month: m, year: y },
    orderBy: { category: 'asc' },
  });

  const start = new Date(y, m - 1, 1);
  const end = new Date(y, m, 0, 23, 59, 59, 999);
  const transactions = await prisma.transaction.findMany({
    where: { userId: req.userId, type: TransactionType.EXPENSE, date: { gte: start, lte: end } },
    select: { category: true, amount: true },
  });

  const spending: Record<string, number> = {};
  for (const t of transactions) {
    spending[t.category] = (spending[t.category] || 0) + t.amount;
  }

  const result = budgets.map((b) => {
    const spent = Math.round((spending[b.category] || 0) * 100) / 100;
    const remaining = Math.round((b.limit - spent) * 100) / 100;
    const percent = b.limit > 0 ? Math.round((spent / b.limit) * 10000) / 100 : 0;
    return {
      ...b,
      spent,
      remaining,
      percent,
      overBudget: spent > b.limit,
    };
  });

  res.json(result);
});

export const upsertBudget = asyncHandler(async (req: AuthRequest, res: Response) => {
  const parsed = budgetSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new HttpError(400, JSON.stringify(parsed.error.flatten()));
  }
  const { category, limit, month, year } = parsed.data;
  const budget = await prisma.budget.upsert({
    where: {
      userId_category_month_year: { userId: req.userId as string, category, month, year },
    },
    update: { limit },
    create: { userId: req.userId as string, category, limit, month, year },
  });
  res.json(budget);
});

export const deleteBudget = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const existing = await prisma.budget.findFirst({ where: { id, userId: req.userId } });
  if (!existing) {
    throw new HttpError(404, 'Budget not found');
  }
  await prisma.budget.delete({ where: { id } });
  res.status(204).send();
});
