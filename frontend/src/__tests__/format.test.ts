import { describe, expect, it } from 'vitest';
import { formatCurrency, formatDate, formatDateTime, todayIso } from '../utils/format';

describe('formatCurrency', () => {
  it('uses ¥ with 2 decimals and thousands separators by default', () => {
    expect(formatCurrency(1234.5)).toBe('¥1,234.50');
  });
  it('renders zero', () => {
    expect(formatCurrency(0)).toBe('¥0.00');
  });
  it('prefixes negative values with a single minus before the symbol', () => {
    expect(formatCurrency(-12.3)).toBe('-¥12.30');
  });
  it('respects a custom currency symbol', () => {
    expect(formatCurrency(10, '$')).toBe('$10.00');
  });
});

describe('formatDate / formatDateTime', () => {
  it('formats ISO date input into YYYY-MM-DD by default', () => {
    expect(formatDate('2025-01-15T10:30:00Z')).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
  it('honours a custom format string', () => {
    expect(formatDate(new Date('2025-01-15'), 'YYYY/MM')).toBe('2025/01');
  });
  it('includes time in formatDateTime', () => {
    expect(formatDateTime('2025-01-15T10:30:00Z')).toMatch(
      /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/,
    );
  });
});

describe('todayIso', () => {
  it('returns an ISO date string for today', () => {
    expect(todayIso()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
