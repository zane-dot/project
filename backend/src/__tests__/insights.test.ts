import { describe, expect, it } from 'vitest';
import { buildFallbackInsights } from '../utils/insights';

describe('buildFallbackInsights', () => {
  it('returns the empty/zero summary line when no data', () => {
    const out = buildFallbackInsights(0, 0, []);
    expect(out).toContain('近三个月概览');
    expect(out).toContain('¥0.00');
    expect(out).toContain('行动建议');
  });

  it('marks high savings rate as healthy', () => {
    const out = buildFallbackInsights(10000, 5000, []);
    expect(out).toMatch(/储蓄率 50\.0%/);
    expect(out).toContain('表现非常好');
  });

  it('marks low savings rate as risky', () => {
    const out = buildFallbackInsights(1000, 950, []);
    expect(out).toMatch(/储蓄率仅/);
  });

  it('warns when expenses exceed income (negative balance)', () => {
    const out = buildFallbackInsights(1000, 1500, []);
    expect(out).toContain('净支出');
    // Accept either "-¥500.00" or "¥-500.00" formatting depending on locale.
    expect(out).toMatch(/[-¥]+500/);
  });

  it('mentions the top expense category and its share', () => {
    const out = buildFallbackInsights(10000, 5000, [
      ['餐饮', { expense: 3000, income: 0, count: 30 }],
      ['交通', { expense: 1500, income: 0, count: 20 }],
    ]);
    expect(out).toContain('餐饮');
    expect(out).toMatch(/占总支出 60\.0%/);
  });

  it('lists additional high-frequency categories when 3+ provided', () => {
    const out = buildFallbackInsights(10000, 3000, [
      ['餐饮', { expense: 1000, income: 0, count: 10 }],
      ['交通', { expense: 800, income: 0, count: 5 }],
      ['购物', { expense: 700, income: 0, count: 3 }],
      ['娱乐', { expense: 500, income: 0, count: 2 }],
    ]);
    expect(out).toContain('其他高频支出');
    expect(out).toContain('交通');
    expect(out).toContain('购物');
    expect(out).toContain('娱乐');
  });

  it('numbers each insight line in order', () => {
    const out = buildFallbackInsights(1000, 500, [
      ['餐饮', { expense: 300, income: 0, count: 1 }],
    ]);
    const numbered = out.match(/^\d+\. /gm) ?? [];
    // overview + savings + top1 + advice = 4 entries (no "others" since only 1)
    expect(numbered.length).toBeGreaterThanOrEqual(3);
    expect(numbered[0]).toBe('1. ');
    expect(numbered[1]).toBe('2. ');
  });
});
