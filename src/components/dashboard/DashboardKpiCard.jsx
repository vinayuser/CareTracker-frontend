import { TrendingUp, TrendingDown } from 'lucide-react';

export default function DashboardKpiCard({
  label,
  value,
  subtext,
  trend,
  trendUp = true,
  icon: Icon,
  iconClass = 'bg-primary/10 text-primary',
  action,
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-sm text-gray-500">{label}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className={`mt-1 flex items-center gap-1 text-xs font-medium ${trendUp ? 'text-success' : 'text-danger'}`}>
              {trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {trend}
            </p>
          )}
          {subtext && !trend && <p className="mt-1 text-xs text-gray-400">{subtext}</p>}
          {action && <p className="mt-1 text-xs font-medium text-primary">{action}</p>}
        </div>
        {Icon && (
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconClass}`}>
            <Icon size={20} />
          </div>
        )}
      </div>
    </div>
  );
}
