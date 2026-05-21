import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Receipt, PiggyBank, Sparkles, LogOut, Wallet } from 'lucide-react';
import clsx from 'clsx';
import { useAuthStore } from '../store/authStore';

const NAV = [
  { to: '/dashboard', label: '仪表盘', icon: LayoutDashboard },
  { to: '/transactions', label: '账单管理', icon: Receipt },
  { to: '/budgets', label: '预算管理', icon: PiggyBank },
  { to: '/insights', label: 'AI 洞察', icon: Sparkles },
];

export default function Sidebar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-slate-200 bg-white px-4 py-6 md:flex">
      <div className="mb-8 flex items-center gap-2 px-2">
        <div className="rounded-lg bg-primary-600 p-2 text-white">
          <Wallet className="h-5 w-5" />
        </div>
        <div>
          <div className="text-base font-bold">Finance Tracker</div>
          <div className="text-xs text-slate-500">AI 驱动的财务助手</div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
              )
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto border-t border-slate-200 pt-4">
        {user && (
          <div className="mb-3 px-2 text-sm">
            <div className="font-medium text-slate-900">{user.name}</div>
            <div className="truncate text-xs text-slate-500">{user.email}</div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        >
          <LogOut className="h-4 w-4" />
          退出登录
        </button>
      </div>
    </aside>
  );
}
