import { Response } from 'express';
import { z } from 'zod';
import { Prisma, TransactionType } from '@prisma/client';
import { prisma } from '../utils/prisma';
import { asyncHandler, HttpError } from '../utils/asyncHandler';
import type { AuthRequest } from '../middleware/auth';

const transactionSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']),
  amount: z.number().positive().max(1_000_000_000),
  category: z.string().min(1).max(40),
  description: z.string().max(200).optional().nullable(),
  date: z.string().refine((s) => !Number.isNaN(Date.parse(s)), { message: 'Invalid date' }),
});

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  type: z.enum(['INCOME', 'EXPENSE']).optional(),
  category: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  search: z.string().optional(),
});

export const getTransactions = asyncHandler(async (req: AuthRequest, res: Response) => {
  const parsed = querySchema.safeParse(req.query);
  if (!parsed.success) {
    throw new HttpError(400, JSON.stringify(parsed.error.flatten()));
  }
  const { page, limit, type, category, startDate, endDate, search } = parsed.data;
  const skip = (page - 1) * limit;

  const where: Prisma.TransactionWhereInput = { userId: req.userId };
  if (type) where.type = type as TransactionType;
  if (category) where.category = category;
  if (startDate || endDate) {
    where.date = {};
    if (startDate) (where.date as Prisma.DateTimeFilter).gte = new Date(startDate);
    if (endDate) (where.date as Prisma.DateTimeFilter).lte = new Date(endDate);
  }
  if (search) {
    where.OR = [
      { description: { contains: search, mode: 'insensitive' } },
      { category: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({ where, skip, take: limit, orderBy: { date: 'desc' } }),
    prisma.transaction.count({ where }),
  ]);

  res.json({ transactions, total, page, limit, totalPages: Math.ceil(total / limit) });
});

export const createTransaction = asyncHandler(async (req: AuthRequest, res: Response) => {
  const parsed = transactionSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new HttpError(400, JSON.stringify(parsed.error.flatten()));
  }
  const tx = await prisma.transaction.create({
    data: {
      ...parsed.data,
      description: parsed.data.description ?? null,
      date: new Date(parsed.data.date),
      userId: req.userId as string,
    },
  });
  res.status(201).json(tx);
});

export const updateTransaction = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const existing = await prisma.transaction.findFirst({ where: { id, userId: req.userId } });
  if (!existing) {
    throw new HttpError(404, 'Transaction not found');
  }
  const parsed = transactionSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    throw new HttpError(400, JSON.stringify(parsed.error.flatten()));
  }
  const data: Prisma.TransactionUpdateInput = { ...parsed.data };
  if (parsed.data.date) data.date = new Date(parsed.data.date);

  const updated = await prisma.transaction.update({ where: { id }, data });
  res.json(updated);
});

export const deleteTransaction = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const existing = await prisma.transaction.findFirst({ where: { id, userId: req.userId } });
  if (!existing) {
    throw new HttpError(404, 'Transaction not found');
  }
  await prisma.transaction.delete({ where: { id } });
  res.status(204).send();
});

export const getSummary = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { month, year } = req.query as Record<string, string>;
  const now = new Date();
  const m = month ? parseInt(month, 10) : now.getMonth() + 1;
  const y = year ? parseInt(year, 10) : now.getFullYear();
  if (!Number.isInteger(m) || m < 1 || m > 12 || !Number.isInteger(y) || y < 1970) {
    throw new HttpError(400, 'Invalid month/year');
  }
  const start = new Date(y, m - 1, 1);
  const end = new Date(y, m, 0, 23, 59, 59, 999);

  const transactions = await prisma.transaction.findMany({
    where: { userId: req.userId, date: { gte: start, lte: end } },
  });
  const income = transactions
    .filter((t) => t.type === TransactionType.INCOME)
    .reduce((s, t) => s + t.amount, 0);
  const expense = transactions
    .filter((t) => t.type === TransactionType.EXPENSE)
    .reduce((s, t) => s + t.amount, 0);

  const byCategory: Record<string, number> = {};
  for (const t of transactions) {
    if (t.type === TransactionType.EXPENSE) {
      byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
    }
  }

  res.json({
    income: round2(income),
    expense: round2(expense),
    balance: round2(income - expense),
    byCategory,
    month: m,
    year: y,
    transactionCount: transactions.length,
  });
});

export const getTrends = asyncHandler(async (req: AuthRequest, res: Response) => {
  // Last 6 months of income vs expense.
  const monthsParam = parseInt((req.query.months as string) || '6', 10);
  const months = Math.min(Math.max(monthsParam, 1), 24);

  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);

  const transactions = await prisma.transaction.findMany({
    where: { userId: req.userId, date: { gte: start } },
    select: { type: true, amount: true, date: true, category: true },
  });

  const buckets: Record<string, { month: string; income: number; expense: number }> = {};
  for (let i = 0; i < months; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - (months - 1 - i), 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    buckets[key] = { month: key, income: 0, expense: 0 };
  }
  for (const t of transactions) {
    const key = `${t.date.getFullYear()}-${String(t.date.getMonth() + 1).padStart(2, '0')}`;
    if (!buckets[key]) continue;
    if (t.type === TransactionType.INCOME) buckets[key].income += t.amount;
    else buckets[key].expense += t.amount;
  }
  const trends = Object.values(buckets).map((b) => ({
    month: b.month,
    income: round2(b.income),
    expense: round2(b.expense),
    net: round2(b.income - b.expense),
  }));

  res.json({ trends });
});

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
