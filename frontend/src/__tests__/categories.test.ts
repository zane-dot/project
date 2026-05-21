import { describe, expect, it } from 'vitest';
import {
  CHART_COLORS,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  colorForIndex,
} from '../utils/categories';

describe('categories', () => {
  it('exposes non-empty, frozen-like constants', () => {
    expect(EXPENSE_CATEGORIES.length).toBeGreaterThan(0);
    expect(INCOME_CATEGORIES.length).toBeGreaterThan(0);
  });

  it('colorForIndex wraps around the palette', () => {
    expect(colorForIndex(0)).toBe(CHART_COLORS[0]);
    expect(colorForIndex(CHART_COLORS.length)).toBe(CHART_COLORS[0]);
    expect(colorForIndex(CHART_COLORS.length + 3)).toBe(CHART_COLORS[3]);
  });
});
