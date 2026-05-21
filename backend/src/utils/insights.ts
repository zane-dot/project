export interface CategorySummary {
  expense: number;
  income: number;
  count: number;
}

/**
 * Generate a deterministic, rule-based finance insight summary in Chinese.
 *
 * Used as a graceful fallback when an OpenAI key is not configured, and as
 * the canonical implementation that's unit-tested for stability.
 */
export function buildFallbackInsights(
  income: number,
  expense: number,
  top: Array<[string, CategorySummary]>,
): string {
  const net = income - expense;
  const rate = income > 0 ? (1 - expense / income) * 100 : 0;
  const lines: string[] = [];

  lines.push(
    `💰 **近三个月概览**：收入 ¥${income.toFixed(2)}，支出 ¥${expense.toFixed(2)}，结余 ¥${net.toFixed(2)}。`,
  );

  if (income > 0) {
    if (rate >= 30) {
      lines.push(
        `✅ **储蓄率 ${rate.toFixed(1)}%** — 表现非常好，已超过 30% 的健康线，请继续保持。`,
      );
    } else if (rate >= 10) {
      lines.push(
        `⚠️ **储蓄率 ${rate.toFixed(1)}%** — 处于及格线，建议把目标提高到 20% 以上。`,
      );
    } else if (rate >= 0) {
      lines.push(
        `⚠️ **储蓄率仅 ${rate.toFixed(1)}%** — 收支接近平衡，缺乏抗风险能力，建议优先削减最大支出类别。`,
      );
    } else {
      lines.push(
        `🚨 **当前为净支出**（结余 ¥${net.toFixed(2)}），存在透支风险，请立即核查最大支出。`,
      );
    }
  }

  if (top.length > 0) {
    const [cat, v] = top[0];
    const pct = expense > 0 ? (v.expense / expense) * 100 : 0;
    lines.push(
      `📊 **最大支出类别**：${cat}，三个月共 ¥${v.expense.toFixed(2)}，占总支出 ${pct.toFixed(1)}%。如果能下降 10%，每月可多省 ¥${((v.expense / 3) * 0.1).toFixed(2)}。`,
    );
  }
  if (top.length >= 3) {
    const others = top
      .slice(1, 4)
      .map(([c, v]) => `${c}（¥${v.expense.toFixed(2)}）`)
      .join('、');
    lines.push(
      `🔍 **其他高频支出**：${others}。建议针对这些类别设定月度预算，并启用超支提醒。`,
    );
  }

  lines.push(
    '💡 **行动建议**：① 为前 3 类支出设定预算；② 每周固定一天复盘账单；③ 把每月结余的至少 50% 转入储蓄账户。',
  );

  return lines.map((l, i) => `${i + 1}. ${l}`).join('\n\n');
}
