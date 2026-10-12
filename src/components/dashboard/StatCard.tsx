import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  colorScheme?: 'blue' | 'indigo' | 'emerald' | 'amber' | 'purple';
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  colorScheme = 'blue',
}: StatCardProps) {
  const schemeStyles = {
    blue: {
      iconBg: 'bg-blue-50 text-blue-600 border-blue-100',
      badge: 'text-blue-700 bg-blue-50',
    },
    indigo: {
      iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      badge: 'text-indigo-700 bg-indigo-50',
    },
    emerald: {
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      badge: 'text-emerald-700 bg-emerald-50',
    },
    amber: {
      iconBg: 'bg-amber-50 text-amber-600 border-amber-100',
      badge: 'text-amber-700 bg-amber-50',
    },
    purple: {
      iconBg: 'bg-purple-50 text-purple-600 border-purple-100',
      badge: 'text-purple-700 bg-purple-50',
    },
  }[colorScheme];

  return (
    <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {title}
        </span>
        <div
          className={`flex items-center justify-center w-10 h-10 rounded-xl border ${schemeStyles.iconBg}`}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold text-slate-900 tracking-tight">{value}</span>
        {trend && (
          <span
            className={`text-xs font-medium px-1.5 py-0.5 rounded ${
              trend.isPositive ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'
            }`}
          >
            {trend.isPositive ? '+' : ''}
            {trend.value}
          </span>
        )}
      </div>

      {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
    </div>
  );
}
