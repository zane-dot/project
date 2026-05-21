import { describe, expect, it } from 'vitest';
import { bucketTrends, summarizeTransactions, type TxLike } from '../utils/summary';

const tx = (overrides: Partial<TxLike>): TxLike => ({
  type: 'EXPENSE',
  amount: 0,
  category: '餐饮',
  date: new Date('2025-05-15'),
  ...overrides,
});

describe('summarizeTransactions', () => {
  it('returns zeros for an empty list', () => {
    expect(summarizeTransactions([])).toEqual({
      income: 0,
      expense: 0,
      balance: 0,
      byCategory: {},
      transactionCount: 0,
    });
  });

  it('aggregates income, expense, and per-category spend', () => {
    const result = summarizeTransactions([
      tx({ type: 'INCOME', amount: 10000, category: '工资' }),
      tx({ type: 'EXPENSE', amount: 38.5, category: '餐饮' }),
      tx({ type: 'EXPENSE', amount: 61.5, category: '餐饮' }),
      tx({ type: 'EXPENSE', amount: 200, category: '交通' }),
    ]);
    expect(result.income).toBe(10000);
    expect(result.expense).toBe(300);
    expect(result.balance).toBe(9700);
    expect(result.byCategory).toEqual({ 餐饮: 100, 交通: 200 });
    expect(result.transactionCount).toBe(4);
  });

  it('does not include income amounts in byCategory', () => {
    const result = summarizeTransactions([
      tx({ type: 'INCOME', amount: 5000, category: '工资' }),
    ]);
    expect(result.byCategory).toEqual({});
  });

  it('rounds floating-point sums to 2 decimals', () => {
    const result = summarizeTransactions([
      tx({ amount: 0.1 }),
      tx({ amount: 0.2 }),
    ]);
    expect(result.expense).toBe(0.3); // 0.1 + 0.2 === 0.30000000000000004 unrounded
  });
});

describe('bucketTrends', () => {
  it('returns exactly N consecutive months, oldest first, zero-filled', () => {
    const now = new Date(2025, 4, 15); // May 2025
    const out = bucketTrends([], now, 3);
    expect(out.map((b) => b.month)).toEqual(['2025-03', '2025-04', '2025-05']);
    expect(out.every((b) => b.income === 0 && b.expense === 0 && b.net === 0)).toBe(true);
  });

  it('places transactions in the correct bucket and computes net', () => {
    const now = new Date(2025, 4, 31);
    const out = bucketTrends(
      [
        tx({ type: 'INCOME', amount: 10000, date: new Date(2025, 4, 5) }),
        tx({ type: 'EXPENSE', amount: 1500, date: new Date(2025, 4, 20) }),
        tx({ type: 'EXPENSE', amount: 300, date: new Date(2025, 3, 10) }),
      ],
      now,
      3,
    );
    const may = out.find((b) => b.month === '2025-05')!;
    const apr = out.find((b) => b.month === '2025-04')!;
    expect(may.income).toBe(10000);
    expect(may.expense).toBe(1500);
    expect(may.net).toBe(8500);
    expect(apr.expense).toBe(300);
    expect(apr.net).toBe(-300);
  });

  it('ignores transactions outside the window', () => {
    const now = new Date(2025, 4, 31);
    const out = bucketTrends(
      [tx({ type: 'EXPENSE', amount: 999, date: new Date(2020, 0, 1) })],
      now,
      3,
    );
    expect(out.every((b) => b.expense === 0)).toBe(true);
  });

  it('clamps months parameter into the [1, 24] range', () => {
    const now = new Date(2025, 4, 31);
    expect(bucketTrends([], now, 0)).toHaveLength(1);
    expect(bucketTrends([], now, 999)).toHaveLength(24);
  });
});
