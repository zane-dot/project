import { describe, expect, it } from 'vitest';
import { csvEscape, parseTransactionsCsv, transactionsToCsv } from '../utils/csv';

const HEADER = 'date,type,amount,category,description';

describe('csvEscape', () => {
  it('returns the value unchanged when no special chars', () => {
    expect(csvEscape('餐饮')).toBe('餐饮');
  });
  it('quotes values containing commas', () => {
    expect(csvEscape('a,b')).toBe('"a,b"');
  });
  it('quotes values containing newlines', () => {
    expect(csvEscape('a\nb')).toBe('"a\nb"');
  });
  it('doubles internal quotes', () => {
    expect(csvEscape('say "hi"')).toBe('"say ""hi"""');
  });
});

describe('parseTransactionsCsv', () => {
  it('parses a valid CSV with header in any case / whitespace', () => {
    const csv = ` Date , Type , Amount , Category , Description \n2025-01-15,EXPENSE,38.50,餐饮,午餐`;
    const result = parseTransactionsCsv(csv);
    expect(result.totalRows).toBe(1);
    expect(result.errors).toEqual([]);
    expect(result.valid).toHaveLength(1);
    expect(result.valid[0]).toMatchObject({
      type: 'EXPENSE',
      amount: 38.5,
      category: '餐饮',
      description: '午餐',
    });
    expect(result.valid[0].date.toISOString().slice(0, 10)).toBe('2025-01-15');
  });

  it('rejects invalid type / amount / date / category with row-level errors', () => {
    const csv = [
      HEADER,
      ',EXPENSE,10,餐饮,', // bad date
      '2025-01-01,GIFT,10,餐饮,', // bad type
      '2025-01-01,EXPENSE,-5,餐饮,', // bad amount
      '2025-01-01,EXPENSE,10,,', // bad category
      '2025-01-01,EXPENSE,10,餐饮,ok', // valid
    ].join('\n');

    const result = parseTransactionsCsv(csv);
    expect(result.totalRows).toBe(5);
    expect(result.valid).toHaveLength(1);
    expect(result.errors.map((e) => e.row)).toEqual([2, 3, 4, 5]);
    expect(result.errors[0].reason).toMatch(/invalid date/);
    expect(result.errors[1].reason).toMatch(/INCOME or EXPENSE/);
    expect(result.errors[2].reason).toMatch(/positive number/);
    expect(result.errors[3].reason).toMatch(/category/);
  });

  it('coerces type to upper case and truncates long fields', () => {
    const longCat = 'x'.repeat(100);
    const longDesc = 'd'.repeat(300);
    const csv = `${HEADER}\n2025-01-01,income,1,${longCat},${longDesc}`;
    const { valid } = parseTransactionsCsv(csv);
    expect(valid[0].type).toBe('INCOME');
    expect(valid[0].category).toHaveLength(40);
    expect(valid[0].description).toHaveLength(200);
  });

  it('treats missing description as null', () => {
    const csv = `${HEADER}\n2025-01-01,EXPENSE,10,餐饮,`;
    const { valid } = parseTransactionsCsv(csv);
    expect(valid[0].description).toBeNull();
  });
});

describe('transactionsToCsv', () => {
  it('produces a header + escaped rows that round-trip through the parser', () => {
    const csv = transactionsToCsv([
      {
        date: new Date('2025-01-15T12:00:00Z'),
        type: 'EXPENSE',
        amount: 12.5,
        category: '餐饮',
        description: 'with, comma',
      },
    ]);
    expect(csv.split('\n')[0]).toBe(HEADER);
    expect(csv).toContain('"with, comma"');

    const back = parseTransactionsCsv(csv);
    expect(back.valid).toHaveLength(1);
    expect(back.valid[0].description).toBe('with, comma');
    expect(back.valid[0].amount).toBe(12.5);
  });
});
