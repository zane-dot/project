import { FormEvent, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Wallet } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((s) => s.login);
  const token = useAuthStore((s) => s.token);

  const [email, setEmail] = useState('demo@finance.app');
  const [password, setPassword] = useState('demo1234');
  const [loading, setLoading] = useState(false);

  if (token) {
    navigate('/dashboard', { replace: true });
  }

  const from = (location.state as { from?: string } | null)?.from || '/dashboard';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('登录成功');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error((err as Error).message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 via-white to-slate-100 px-4">
      <div className="w-full max-w-md card-padded">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="rounded-xl bg-primary-600 p-3 text-white">
            <Wallet className="h-6 w-6" />
          </div>
          <h1 className="mt-3 text-xl font-bold">登录 Finance Tracker</h1>
          <p className="mt-1 text-sm text-slate-500">AI 驱动的个人财务管理</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="label" htmlFor="email">邮箱</label>
            <input
              id="email"
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label className="label" htmlFor="password">密码</label>
            <input
              id="password"
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              minLength={6}
            />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? '登录中…' : '登录'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-500">
          还没有账号？
          <Link to="/register" className="ml-1 font-medium text-primary-600 hover:underline">
            立即注册
          </Link>
        </p>

        <div className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
          演示账号已预填：<code>demo@finance.app</code> / <code>demo1234</code>
          <br />（需先在后端运行 <code>npm run prisma:seed</code>）
        </div>
      </div>
    </div>
  );
}
