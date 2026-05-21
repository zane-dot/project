import { Response } from 'express';
import OpenAI from 'openai';
import { TransactionType } from '@prisma/client';
import { prisma } from '../utils/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { logger } from '../utils/logger';
import { buildFallbackInsights, type CategorySummary } from '../utils/insights';
import type { AuthRequest } from '../middleware/auth';

const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

let openaiClient: OpenAI | null = null;
function getOpenAI(): OpenAI | null {
  if (!process.env.OPENAI_API_KEY) return null;
  if (!openaiClient) openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return openaiClient;
}

export const getInsights = asyncHandler(async (req: AuthRequest, res: Response) => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 2, 1);

  const transactions = await prisma.transaction.findMany({
    where: { userId: req.userId, date: { gte: start } },
    orderBy: { date: 'desc' },
  });

  if (transactions.length === 0) {
    res.json({
      insights: '📭 暂无足够的数据。请先添加几条账单记录，再回来获取 AI 智能洞察吧。',
      generatedAt: new Date().toISOString(),
      source: 'fallback',
    });
    return;
  }

  const summary: Record<string, CategorySummary> = {};
  let totalIncome = 0;
  let totalExpense = 0;
  for (const t of transactions) {
    summary[t.category] ??= { expense: 0, income: 0, count: 0 };
    summary[t.category].count += 1;
    if (t.type === TransactionType.INCOME) {
      summary[t.category].income += t.amount;
      totalIncome += t.amount;
    } else {
      summary[t.category].expense += t.amount;
      totalExpense += t.amount;
    }
  }

  const topExpenseCategories = Object.entries(summary)
    .filter(([, v]) => v.expense > 0)
    .sort((a, b) => b[1].expense - a[1].expense)
    .slice(0, 5);

  const client = getOpenAI();
  if (!client) {
    res.json({
      insights: buildFallbackInsights(totalIncome, totalExpense, topExpenseCategories),
      generatedAt: new Date().toISOString(),
      source: 'fallback',
    });
    return;
  }

  const prompt = [
    'You are a personal finance advisor. Analyse the following 3-month spending data and respond in Chinese (zh-CN).',
    'Provide 3-5 concise, numbered, actionable insights. Be encouraging but specific. Use ¥ for amounts.',
    '',
    `Total income: ¥${totalIncome.toFixed(2)}`,
    `Total expense: ¥${totalExpense.toFixed(2)}`,
    `Net savings: ¥${(totalIncome - totalExpense).toFixed(2)}`,
    `Savings rate: ${totalIncome > 0 ? ((1 - totalExpense / totalIncome) * 100).toFixed(1) : '0'}%`,
    '',
    'Top expense categories:',
    ...topExpenseCategories.map(
      ([cat, v]) => `- ${cat}: ¥${v.expense.toFixed(2)} (${v.count} 笔)`,
    ),
  ].join('\n');

  try {
    const completion = await client.chat.completions.create({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 600,
      temperature: 0.7,
    });
    res.json({
      insights: completion.choices[0]?.message?.content ?? '',
      generatedAt: new Date().toISOString(),
      source: 'openai',
      model: MODEL,
    });
  } catch (err) {
    logger.warn('OpenAI call failed, returning fallback insights', { err: String(err) });
    res.json({
      insights: buildFallbackInsights(totalIncome, totalExpense, topExpenseCategories),
      generatedAt: new Date().toISOString(),
      source: 'fallback',
    });
  }
});
