import { Response } from 'express';
import multer from 'multer';
import { parse } from 'csv-parse/sync';
import { TransactionType } from '@prisma/client';
import { prisma } from '../utils/prisma';
import { asyncHandler, HttpError } from '../utils/asyncHandler';
import type { AuthRequest } from '../middleware/auth';

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

interface CsvRow {
  date?: string;
  type?: string;
  amount?: string;
  category?: string;
  description?: string;
}

export const importCsv = asyncHandler(async (req: AuthRequest, res: Response) => {
  const file = (req as AuthRequest & { file?: Express.Multer.File }).file;
  if (!file) {
    throw new HttpError(400, 'No CSV file uploaded (form field "file")');
  }

  let rows: CsvRow[];
  try {
    rows = parse(file.buffer, {
      columns: (header: string[]) => header.map((h) => h.trim().toLowerCase()),
      skip_empty_lines: true,
      trim: true,
    }) as CsvRow[];
  } catch (err) {
    throw new HttpError(400, `CSV parse error: ${(err as Error).message}`);
  }

  if (rows.length === 0) {
    throw new HttpError(400, 'CSV is empty');
  }
  if (rows.length > 5000) {
    throw new HttpError(400, 'CSV row limit is 5000');
  }

  const errors: Array<{ row: number; reason: string }> = [];
  const valid: Array<{
    userId: string;
    type: TransactionType;
    amount: number;
    category: string;
    description: string | null;
    date: Date;
  }> = [];

  rows.forEach((row, idx) => {
    const lineNo = idx + 2; // +1 for header, +1 for 1-indexed
    const rawType = (row.type || '').toUpperCase();
    if (rawType !== 'INCOME' && rawType !== 'EXPENSE') {
      errors.push({ row: lineNo, reason: `type must be INCOME or EXPENSE, got "${row.type}"` });
      return;
    }
    const amount = Number(row.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      errors.push({ row: lineNo, reason: `amount must be positive number, got "${row.amount}"` });
      return;
    }
    const category = (row.category || '').trim();
    if (!category) {
      errors.push({ row: lineNo, reason: 'category is required' });
      return;
    }
    const dateStr = (row.date || '').trim();
    const date = new Date(dateStr);
    if (!dateStr || Number.isNaN(date.getTime())) {
      errors.push({ row: lineNo, reason: `invalid date "${row.date}"` });
      return;
    }
    valid.push({
      userId: req.userId as string,
      type: rawType as TransactionType,
      amount,
      category: category.slice(0, 40),
      description: row.description ? row.description.slice(0, 200) : null,
      date,
    });
  });

  let imported = 0;
  if (valid.length > 0) {
    const result = await prisma.transaction.createMany({ data: valid });
    imported = result.count;
  }

  res.json({
    imported,
    skipped: errors.length,
    total: rows.length,
    errors: errors.slice(0, 50),
  });
});

export const exportCsv = asyncHandler(async (req: AuthRequest, res: Response) => {
  const transactions = await prisma.transaction.findMany({
    where: { userId: req.userId },
    orderBy: { date: 'desc' },
    take: 10000,
  });

  const header = ['date', 'type', 'amount', 'category', 'description'];
  const lines = [header.join(',')];
  for (const t of transactions) {
    lines.push(
      [
        t.date.toISOString().slice(0, 10),
        t.type,
        t.amount.toFixed(2),
        csvEscape(t.category),
        csvEscape(t.description ?? ''),
      ].join(','),
    );
  }

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="transactions-${Date.now()}.csv"`);
  // Prepend BOM so Excel opens UTF-8 Chinese correctly.
  res.send('\uFEFF' + lines.join('\n'));
});

function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
