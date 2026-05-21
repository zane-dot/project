import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <div className="text-6xl font-bold text-primary-600">404</div>
      <div className="mt-2 text-lg text-slate-700">页面未找到</div>
      <Link to="/dashboard" className="mt-4 btn-primary">
        返回仪表盘
      </Link>
    </div>
  );
}
