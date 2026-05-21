import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Wallet } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function RegisterPage() {
  const navigate = useNavigate();
  const register = useAuthStore((s) => s.register);

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error('密码至少 6 位');
      return;
    }
    setLoading(true);
    try {
      await register(email, name, password);
      toast.success('注册成功');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      toast.error((err as Error).message || '注册失败');
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
          <h1 className="mt-3 text-xl font-bold">创建账号</h1>
          <p className="mt-1 text-sm text-slate-500">几秒即可开始管理你的财务</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="label" htmlFor="name">昵称</label>
            <input
              id="name"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={60}
              autoComplete="nickname"
            />
          </div>
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
              minLength={6}
              autoComplete="new-password"
            />
            <div className="mt-1 text-xs text-slate-500">至少 6 位字符</div>
          </div>
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? '注册中…' : '注册'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-500">
          已有账号？
          <Link to="/login" className="ml-1 font-medium text-primary-600 hover:underline">
            返回登录
          </Link>
        </p>
      </div>
    </div>
  );
}
