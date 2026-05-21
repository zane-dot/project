import { parse } from 'csv-parse/sync';

export type TransactionType = 'INCOME' | 'EXPENSE';

export interface ParsedCsvRow {
  type: TransactionType;
  amount: number;
  category: string;
  description: string | null;
  date: Date;
}

export interface CsvParseResult {
  valid: ParsedCsvRow[];
  errors: Array<{ row: number; reason: string }>;
  totalRows: number;
}

export const MAX_CSV_ROWS = 5000;

/**
 * Parse a CSV buffer of transactions and return validated rows + per-row
 * error descriptions. Pure — no I/O — so it's trivially unit-testable.
 */
export function parseTransactionsCsv(buffer: Buffer | string): CsvParseResult {
  type RawRow = Record<string, string | undefined>;

  let rows: RawRow[];
  try {
    rows = parse(buffer, {
      columns: (header: string[]) => header.map((h) => h.trim().toLowerCase()),
      skip_empty_lines: true,
      trim: true,
    }) as RawRow[];
  } catch (err) {
    throw new Error(`CSV parse error: ${(err as Error).message}`);
  }

  if (rows.length > MAX_CSV_ROWS) {
    throw new Error(`CSV row limit is ${MAX_CSV_ROWS}`);
  }

  const valid: ParsedCsvRow[] = [];
  const errors: Array<{ row: number; reason: string }> = [];

  rows.forEach((row, idx) => {
    const lineNo = idx + 2; // +1 header, +1 1-indexed

    const rawType = (row.type || '').toUpperCase();
    if (rawType !== 'INCOME' && rawType !== 'EXPENSE') {
      errors.push({ row: lineNo, reason: `type must be INCOME or EXPENSE, got "${row.type ?? ''}"` });
      return;
    }

    const amount = Number(row.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      errors.push({ row: lineNo, reason: `amount must be positive number, got "${row.amount ?? ''}"` });
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
      errors.push({ row: lineNo, reason: `invalid date "${row.date ?? ''}"` });
      return;
    }

    valid.push({
      type: rawType as TransactionType,
      amount,
      category: category.slice(0, 40),
      description: row.description ? row.description.slice(0, 200) : null,
      date,
    });
  });

  return { valid, errors, totalRows: rows.length };
}

/**
 * Escape a single CSV field per RFC 4180 (wraps in quotes when needed,
 * doubles internal quotes).
 */
export function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export interface TransactionLike {
  date: Date;
  type: TransactionType;
  amount: number;
  category: string;
  description: string | null;
}

/**
 * Serialize transactions to a CSV string (without the UTF-8 BOM).
 */
export function transactionsToCsv(transactions: TransactionLike[]): string {
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
  return lines.join('\n');
}
