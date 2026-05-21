import { FormEvent, useEffect, useState } from 'react';
import { Plus, Trash2, AlertTriangle, PiggyBank } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import { budgetService } from '../services/budgets';
import type { Budget } from '../types';
import { formatCurrency } from '../utils/format';
import { EXPENSE_CATEGORIES } from '../utils/categories';

interface FormState {
  category: string;
  limit: number;
}

const now = new Date();

export default function BudgetsPage() {
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<FormState>({ category: EXPENSE_CATEGORIES[0], limit: 1000 });
  const [saving, setSaving] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await budgetService.list(month, year);
      setBudgets(data);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, year]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.category || form.limit <= 0) {
      toast.error('请填写有效的分类与上限');
      return;
    }
    setSaving(true);
    try {
      await budgetService.upsert({ ...form, month, year });
      toast.success('预算已保存');
      setModalOpen(false);
      await refresh();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (b: Budget) => {
    if (!confirm(`确定删除"${b.category}"的预算吗？`)) return;
    try {
      await budgetService.remove(b.id);
      toast.success('已删除');
      setBudgets((prev) => prev.filter((x) => x.id !== b.id));
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">预算管理</h1>
          <p className="text-sm text-slate-500">为每个分类设定月度上限，超支时立即提醒</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            className="input w-28"
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value, 10))}
          >
            {Array.from({ length: 5 }).map((_, i) => {
              const y = now.getFullYear() - 2 + i;
              return (
                <option key={y} value={y}>
                  {y} 年
                </option>
              );
            })}
          </select>
          <select
            className="input w-24"
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value, 10))}
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1} 月
              </option>
            ))}
          </select>
          <button className="btn-primary" onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" /> 新增预算
          </button>
        </div>
      </header>

      {loading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner label="加载中…" />
        </div>
      ) : budgets.length === 0 ? (
        <EmptyState
          title="本月还没有预算"
          description="点击右上角『新增预算』为你常花钱的分类设置一个月度上限。"
          action={
            <button className="btn-primary" onClick={() => setModalOpen(true)}>
              <Plus className="h-4 w-4" /> 新增预算
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {budgets.map((b) => {
            const pct = Math.min(b.percent, 100);
            const danger = b.overBudget;
            const warn = !danger && pct >= 80;
            return (
              <div key={b.id} className="card-padded">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-primary-50 p-2 text-primary-600">
                      <PiggyBank className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-base font-semibold text-slate-900">{b.category}</div>
                      <div className="text-xs text-slate-500">
                        上限 {formatCurrency(b.limit)}
                      </div>
                    </div>
                  </div>
                  <button
                    className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                    onClick={() => handleDelete(b)}
                    aria-label="删除"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-4 flex items-baseline justify-between text-sm">
                  <span className="font-medium text-slate-900">已花费 {formatCurrency(b.spent)}</span>
                  <span
                    className={clsx(
                      'text-xs font-semibold',
                      danger ? 'text-red-600' : warn ? 'text-amber-600' : 'text-emerald-600',
                    )}
                  >
                    {b.percent.toFixed(0)}%
                  </span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={clsx(
                      'h-full rounded-full transition-all',
                      danger ? 'bg-red-500' : warn ? 'bg-amber-500' : 'bg-emerald-500',
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className={clsx(danger ? 'text-red-600' : 'text-slate-500')}>
                    剩余 {formatCurrency(b.remaining)}
                  </span>
                  {danger && (
                    <span className="flex items-center gap-1 text-red-600">
                      <AlertTriangle className="h-3 w-3" />
                      已超支
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="新增 / 更新预算"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setModalOpen(false)}>
              取消
            </button>
            <button form="bg-form" type="submit" className="btn-primary" disabled={saving}>
              {saving ? '保存中…' : '保存'}
            </button>
          </>
        }
      >
        <form id="bg-form" className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="label">分类</label>
            <select
              className="input"
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            >
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <div className="mt-1 text-xs text-slate-500">
              已存在的分类预算会被自动覆盖（按月份唯一）
            </div>
          </div>
          <div>
            <label className="label">月度上限 (¥)</label>
            <input
              type="number"
              min="1"
              step="0.01"
              className="input"
              value={form.limit || ''}
              onChange={(e) => setForm((f) => ({ ...f, limit: parseFloat(e.target.value) || 0 }))}
              required
            />
          </div>
          <div className="text-xs text-slate-500">
            应用月份：{year} 年 {month} 月
          </div>
        </form>
      </Modal>
    </div>
  );
}
