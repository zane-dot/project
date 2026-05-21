import type { TransactionType } from '@prisma/client';

export interface TxLike {
  type: TransactionType;
  amount: number;
  category: string;
  date: Date;
}

export interface MonthlySummary {
  income: number;
  expense: number;
  balance: number;
  byCategory: Record<string, number>;
  transactionCount: number;
}

/**
 * Pure aggregation used by both the summary endpoint and the AI insights
 * builder. Extracted to keep the controller thin and the math testable.
 */
export function summarizeTransactions(transactions: TxLike[]): MonthlySummary {
  let income = 0;
  let expense = 0;
  const byCategory: Record<string, number> = {};

  for (const t of transactions) {
    if (t.type === 'INCOME') {
      income += t.amount;
    } else {
      expense += t.amount;
      byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
    }
  }
  return {
    income: round2(income),
    expense: round2(expense),
    balance: round2(income - expense),
    byCategory,
    transactionCount: transactions.length,
  };
}

export interface TrendPoint {
  month: string;
  income: number;
  expense: number;
  net: number;
}

/**
 * Bucket transactions into N consecutive monthly buckets ending at `now`
 * (inclusive), oldest first. Always returns exactly `months` entries even
 * when some buckets are empty.
 */
export function bucketTrends(
  transactions: TxLike[],
  now: Date,
  months: number,
): TrendPoint[] {
  const safeMonths = Math.min(Math.max(months, 1), 24);
  const buckets: Record<string, TrendPoint> = {};
  const order: string[] = [];
  for (let i = 0; i < safeMonths; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - (safeMonths - 1 - i), 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    buckets[key] = { month: key, income: 0, expense: 0, net: 0 };
    order.push(key);
  }
  for (const t of transactions) {
    const key = `${t.date.getFullYear()}-${String(t.date.getMonth() + 1).padStart(2, '0')}`;
    if (!buckets[key]) continue;
    if (t.type === 'INCOME') buckets[key].income += t.amount;
    else buckets[key].expense += t.amount;
  }
  return order.map((k) => {
    const b = buckets[k];
    return {
      month: b.month,
      income: round2(b.income),
      expense: round2(b.expense),
      net: round2(b.income - b.expense),
    };
  });
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
