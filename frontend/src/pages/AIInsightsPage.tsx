import { useEffect, useState } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { aiService } from '../services/ai';
import type { Insights } from '../types';
import { formatDateTime } from '../utils/format';

export default function AIInsightsPage() {
  const [data, setData] = useState<Insights | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await aiService.insights();
      setData(res);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <Sparkles className="h-6 w-6 text-primary-600" /> AI 智能洞察
          </h1>
          <p className="text-sm text-slate-500">
            基于你最近三个月的消费数据，由 AI 生成个性化的财务建议
          </p>
        </div>
        <button className="btn-secondary" onClick={load} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          重新分析
        </button>
      </header>

      <div className="card-padded min-h-[280px]">
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <LoadingSpinner label="AI 思考中…" />
          </div>
        ) : data ? (
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span>生成于 {formatDateTime(data.generatedAt)}</span>
              <span
                className={`badge ${
                  data.source === 'openai'
                    ? 'bg-violet-50 text-violet-700'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {data.source === 'openai' ? `OpenAI · ${data.model ?? ''}` : '规则引擎（未配置 OpenAI Key）'}
              </span>
            </div>
            <article className="prose prose-sm max-w-none whitespace-pre-wrap text-slate-700">
              {data.insights}
            </article>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-500">暂无数据</div>
        )}
      </div>

      <div className="card-padded text-sm text-slate-500">
        <p>
          💡 <strong>提示</strong>：本页面会调用后端 <code>/api/ai/insights</code>，将你的支出汇总（不含原始记录）发给 LLM。
          如果没有配置 <code>OPENAI_API_KEY</code>，后端会自动回退到内置的规则引擎，依然能给出实用的财务建议。
        </p>
      </div>
    </div>
  );
}
