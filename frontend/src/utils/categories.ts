export const EXPENSE_CATEGORIES = [
  '餐饮',
  '交通',
  '购物',
  '娱乐',
  '居家',
  '医疗',
  '教育',
  '通讯',
  '旅行',
  '其他',
] as const;

export const INCOME_CATEGORIES = ['工资', '奖金', '投资', '副业', '红包', '其他'] as const;

// Stable palette used by both pie & bar charts.
export const CHART_COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
  '#f97316',
  '#6366f1',
  '#64748b',
];

export function colorForIndex(i: number): string {
  return CHART_COLORS[i % CHART_COLORS.length];
}
