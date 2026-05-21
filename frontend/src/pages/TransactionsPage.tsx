import { FormEvent, useEffect, useRef, useState } from 'react';
import { Plus, Pencil, Trash2, Upload, Download, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import { transactionService, TransactionInput, TransactionQuery } from '../services/transactions';
import type { Transaction } from '../types';
import { formatCurrency, formatDate, todayIso } from '../utils/format';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../utils/categories';

const PAGE_SIZE = 20;

type FormState = TransactionInput;

const emptyForm: FormState = {
  type: 'EXPENSE',
  amount: 0,
  category: EXPENSE_CATEGORIES[0],
  description: '',
  date: todayIso(),
};

export default function TransactionsPage() {
  const [list, setList] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const [filterType, setFilterType] = useState<'' | 'INCOME' | 'EXPENSE'>('');
  const [search, setSearch] = useState('');
  const [searchDebounced, setSearchDebounced] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  // load
  useEffect(() => {
    let active = true;
    const query: TransactionQuery = { page, limit: PAGE_SIZE };
    if (filterType) query.type = filterType;
    if (searchDebounced) query.search = searchDebounced;
    setLoading(true);
    transactionService
      .list(query)
      .then((res) => {
        if (!active) return;
        setList(res.transactions);
        setTotal(res.total);
      })
      .catch((err) => toast.error((err as Error).message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [page, filterType, searchDebounced]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (t: Transaction) => {
    setEditing(t);
    setForm({
      type: t.type,
      amount: t.amount,
      category: t.category,
      description: t.description ?? '',
      date: t.date.slice(0, 10),
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.category || form.amount <= 0) {
      toast.error('请填写有效的金额与分类');
      return;
    }
    setSaving(true);
    try {
      const payload: TransactionInput = {
        ...form,
        date: new Date(form.date).toISOString(),
        description: form.description?.trim() || undefined,
      };
      if (editing) {
        await transactionService.update(editing.id, payload);
        toast.success('已更新');
      } else {
        await transactionService.create(payload);
        toast.success('已添加');
      }
      setModalOpen(false);
      // refresh
      setPage(1);
      const res = await transactionService.list({ page: 1, limit: PAGE_SIZE });
      setList(res.transactions);
      setTotal(res.total);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (t: Transaction) => {
    if (!confirm(`确定删除这笔 ${formatCurrency(t.amount)} 的记录吗？`)) return;
    try {
      await transactionService.remove(t.id);
      toast.success('已删除');
      setList((prev) => prev.filter((x) => x.id !== t.id));
      setTotal((n) => Math.max(0, n - 1));
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await transactionService.exportCsv();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions-${todayIso()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('导出完成');
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = await transactionService.importCsv(file);
      toast.success(`成功导入 ${result.imported} 条 (跳过 ${result.skipped})`);
      if (result.errors.length) {
        // eslint-disable-next-line no-console
        console.warn('CSV 导入错误:', result.errors);
      }
      setPage(1);
      const res = await transactionService.list({ page: 1, limit: PAGE_SIZE });
      setList(res.transactions);
      setTotal(res.total);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const categories = form.type === 'INCOME' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">账单管理</h1>
          <p className="text-sm text-slate-500">共 {total} 条记录</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={handleImport}
          />
          <button className="btn-secondary" onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4" /> 导入 CSV
          </button>
          <button className="btn-secondary" onClick={handleExport}>
            <Download className="h-4 w-4" /> 导出 CSV
          </button>
          <button className="btn-primary" onClick={openCreate}>
            <Plus className="h-4 w-4" /> 新增账单
          </button>
        </div>
      </header>

      <div className="card flex flex-wrap items-center gap-3 px-4 py-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            placeholder="搜索描述或分类"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="input pl-8"
          />
        </div>
        <select
          className="input w-32"
          value={filterType}
          onChange={(e) => {
            setFilterType(e.target.value as '' | 'INCOME' | 'EXPENSE');
            setPage(1);
          }}
        >
          <option value="">全部类型</option>
          <option value="INCOME">收入</option>
          <option value="EXPENSE">支出</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner label="加载中…" />
          </div>
        ) : list.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="还没有任何记录"
              description="点击右上角『新增账单』开始记录你的收支吧。"
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">日期</th>
                  <th className="px-4 py-3">类型</th>
                  <th className="px-4 py-3">分类</th>
                  <th className="px-4 py-3">描述</th>
                  <th className="px-4 py-3 text-right">金额</th>
                  <th className="px-4 py-3 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {list.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-700">{formatDate(t.date)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`badge ${
                          t.type === 'INCOME'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {t.type === 'INCOME' ? '收入' : '支出'}
                      </span>
                    </td>
                    <td className="px-4 py-3">{t.category}</td>
                    <td className="px-4 py-3 text-slate-500">{t.description || '—'}</td>
                    <td
                      className={`px-4 py-3 text-right font-medium tabular-nums ${
                        t.type === 'INCOME' ? 'text-emerald-600' : 'text-red-600'
                      }`}
                    >
                      {t.type === 'INCOME' ? '+' : '-'}
                      {formatCurrency(t.amount)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-primary-600"
                          onClick={() => openEdit(t)}
                          aria-label="编辑"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          className="rounded p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600"
                          onClick={() => handleDelete(t)}
                          aria-label="删除"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-sm">
            <div className="text-slate-500">
              第 {page} / {totalPages} 页
            </div>
            <div className="flex gap-2">
              <button
                className="btn-secondary"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                上一页
              </button>
              <button
                className="btn-secondary"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                下一页
              </button>
            </div>
          </div>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? '编辑账单' : '新增账单'}
        footer={
          <>
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>
              取消
            </button>
            <button type="submit" form="tx-form" className="btn-primary" disabled={saving}>
              {saving ? '保存中…' : '保存'}
            </button>
          </>
        }
      >
        <form id="tx-form" className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">类型</label>
              <select
                className="input"
                value={form.type}
                onChange={(e) => {
                  const type = e.target.value as 'INCOME' | 'EXPENSE';
                  const fallback = type === 'INCOME' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0];
                  setForm((f) => ({ ...f, type, category: fallback }));
                }}
              >
                <option value="EXPENSE">支出</option>
                <option value="INCOME">收入</option>
              </select>
            </div>
            <div>
              <label className="label">金额</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                className="input"
                value={form.amount || ''}
                onChange={(e) => setForm((f) => ({ ...f, amount: parseFloat(e.target.value) || 0 }))}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">分类</label>
              <select
                className="input"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">日期</label>
              <input
                type="date"
                className="input"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                required
              />
            </div>
          </div>
          <div>
            <label className="label">描述（可选）</label>
            <input
              className="input"
              value={form.description ?? ''}
              maxLength={200}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
