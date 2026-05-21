import type { ReactNode } from 'react';
import clsx from 'clsx';

interface StatCardProps {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  trend?: ReactNode;
  accent?: 'blue' | 'green' | 'red' | 'amber' | 'slate';
}

const ACCENTS: Record<NonNullable<StatCardProps['accent']>, string> = {
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-emerald-50 text-emerald-600',
  red: 'bg-red-50 text-red-600',
  amber: 'bg-amber-50 text-amber-600',
  slate: 'bg-slate-100 text-slate-600',
};

export default function StatCard({ label, value, icon, trend, accent = 'slate' }: StatCardProps) {
  return (
    <div className="card-padded">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm text-slate-500">{label}</div>
          <div className="mt-2 text-2xl font-bold tabular-nums text-slate-900">{value}</div>
          {trend && <div className="mt-1 text-xs text-slate-500">{trend}</div>}
        </div>
        {icon && (
          <div className={clsx('rounded-lg p-2', ACCENTS[accent])} aria-hidden>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
