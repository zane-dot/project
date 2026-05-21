import { useEffect, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ArrowDownCircle, ArrowUpCircle, Wallet, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { transactionService } from '../services/transactions';
import type { Summary, TrendPoint } from '../types';
import { formatCurrency } from '../utils/format';
import { colorForIndex } from '../utils/categories';

export default function DashboardPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [trends, setTrends] = useState<TrendPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([transactionService.summary(), transactionService.trends(6)])
      .then(([s, t]) => {
        if (!active) return;
        setSummary(s);
        setTrends(t);
      })
      .catch((err) => toast.error((err as Error).message))
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner label="加载中…" />
      </div>
    );
  }

  if (!summary) return null;

  const savingsRate =
    summary.income > 0 ? Math.max(0, ((summary.income - summary.expense) / summary.income) * 100) : 0;

  const pieData = Object.entries(summary.byCategory)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">仪表盘</h1>
        <p className="text-sm text-slate-500">
          {summary.year} 年 {summary.month} 月 · 共 {summary.transactionCount} 笔记录
        </p>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="本月收入"
          value={formatCurrency(summary.income)}
          icon={<ArrowDownCircle className="h-5 w-5" />}
          accent="green"
        />
        <StatCard
          label="本月支出"
          value={formatCurrency(summary.expense)}
          icon={<ArrowUpCircle className="h-5 w-5" />}
          accent="red"
        />
        <StatCard
          label="本月结余"
          value={formatCurrency(summary.balance)}
          icon={<Wallet className="h-5 w-5" />}
          accent={summary.balance >= 0 ? 'blue' : 'red'}
        />
        <StatCard
          label="储蓄率"
          value={`${savingsRate.toFixed(1)}%`}
          icon={<TrendingUp className="h-5 w-5" />}
          accent={savingsRate >= 20 ? 'green' : savingsRate >= 10 ? 'amber' : 'red'}
        />
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="card-padded lg:col-span-2">
          <h2 className="mb-4 text-base font-semibold">最近 6 个月趋势</h2>
          {trends.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-500">暂无数据</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={trends}>
                <defs>
                  <linearGradient id="inc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="exp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  formatter={(v: number) => formatCurrency(v)}
                  contentStyle={{ borderRadius: 8, fontSize: 12 }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="income"
                  name="收入"
                  stroke="#10b981"
                  fill="url(#inc)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  name="支出"
                  stroke="#ef4444"
                  fill="url(#exp)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card-padded">
          <h2 className="mb-4 text-base font-semibold">本月分类占比</h2>
          {pieData.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-500">本月暂无支出</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={90} label>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={colorForIndex(i)} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      <section className="card-padded">
        <h2 className="mb-4 text-base font-semibold">月度收支对比</h2>
        {trends.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-500">暂无数据</div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Legend />
              <Bar dataKey="income" name="收入" fill="#10b981" radius={[6, 6, 0, 0]} />
              <Bar dataKey="expense" name="支出" fill="#ef4444" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </section>
    </div>
  );
}
