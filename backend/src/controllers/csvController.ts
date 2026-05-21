import { Response } from 'express';
import multer from 'multer';
import { prisma } from '../utils/prisma';
import { asyncHandler, HttpError } from '../utils/asyncHandler';
import { parseTransactionsCsv, transactionsToCsv } from '../utils/csv';
import type { AuthRequest } from '../middleware/auth';

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

export const importCsv = asyncHandler(async (req: AuthRequest, res: Response) => {
  const file = (req as AuthRequest & { file?: Express.Multer.File }).file;
  if (!file) {
    throw new HttpError(400, 'No CSV file uploaded (form field "file")');
  }

  let parsed;
  try {
    parsed = parseTransactionsCsv(file.buffer);
  } catch (err) {
    throw new HttpError(400, (err as Error).message);
  }

  if (parsed.totalRows === 0) {
    throw new HttpError(400, 'CSV is empty');
  }

  let imported = 0;
  if (parsed.valid.length > 0) {
    const result = await prisma.transaction.createMany({
      data: parsed.valid.map((row) => ({
        ...row,
        userId: req.userId as string,
      })),
    });
    imported = result.count;
  }

  res.json({
    imported,
    skipped: parsed.errors.length,
    total: parsed.totalRows,
    errors: parsed.errors.slice(0, 50),
  });
});

export const exportCsv = asyncHandler(async (req: AuthRequest, res: Response) => {
  const transactions = await prisma.transaction.findMany({
    where: { userId: req.userId },
    orderBy: { date: 'desc' },
    take: 10000,
  });

  const csv = transactionsToCsv(
    transactions.map((t) => ({
      date: t.date,
      type: t.type,
      amount: t.amount,
      category: t.category,
      description: t.description,
    })),
  );

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="transactions-${Date.now()}.csv"`);
  // Prepend BOM so Excel opens UTF-8 Chinese correctly.
  res.send('\uFEFF' + csv);
});
