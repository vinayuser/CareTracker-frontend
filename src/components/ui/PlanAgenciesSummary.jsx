import { Eye } from 'lucide-react';

export default function PlanAgenciesSummary({ count, onView, compact = false }) {
  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <span className="font-medium text-gray-900">{count}</span>
        <button
          type="button"
          onClick={onView}
          disabled={count === 0}
          className="text-sm font-medium text-primary hover:underline disabled:cursor-not-allowed disabled:text-gray-400 disabled:no-underline"
        >
          View
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-gray-900">Subscribed Agencies</p>
          <p className="mt-0.5 text-xs text-gray-500">
            {count} {count === 1 ? 'agency has' : 'agencies have'} purchased this plan
          </p>
        </div>
        <button
          type="button"
          onClick={onView}
          disabled={count === 0}
          className="flex items-center gap-1.5 rounded-lg border border-primary/30 bg-white px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/5 disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400"
        >
          <Eye size={14} />
          View
        </button>
      </div>
    </div>
  );
}
