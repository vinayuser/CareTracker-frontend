import { Link } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';

export default function AgencyKpiCard({ label, value, trendText, link, linkTo, icon: Icon, iconBg }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm text-gray-500">{label}</p>
          <p className="mt-2 text-[1.75rem] font-bold leading-none tracking-tight text-gray-900">{value}</p>
          {trendText && (
            <p className="mt-2.5 flex items-center gap-1 text-xs font-medium text-emerald-600">
              <TrendingUp size={13} className="shrink-0" />
              {trendText}
            </p>
          )}
          {link && linkTo && (
            <Link
              to={linkTo}
              className="mt-2.5 inline-flex items-center text-xs font-medium text-primary hover:underline"
            >
              {link} →
            </Link>
          )}
        </div>
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${iconBg}`}>
          <Icon size={20} strokeWidth={2} />
        </div>
      </div>
    </div>
  );
}
