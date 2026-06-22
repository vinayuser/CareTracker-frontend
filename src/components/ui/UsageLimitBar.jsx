import { isUnlimited } from '../../utils/subscriptionStore';

export function formatUsage(used, max) {
  if (isUnlimited(max)) return `${used} / Unlimited`;
  return `${used} / ${max}`;
}

export function getUsagePercent(used, max) {
  if (isUnlimited(max) || max === 0) return 0;
  return Math.min(100, Math.round((used / max) * 100));
}

export function getUsageBarColor(used, max) {
  const percent = getUsagePercent(used, max);
  if (isUnlimited(max)) return 'bg-primary';
  if (percent >= 90) return 'bg-danger';
  if (percent >= 70) return 'bg-warning';
  return 'bg-success';
}

export default function UsageLimitBar({ label, used, max, compact = false }) {
  const percent = getUsagePercent(used, max);
  const barColor = getUsageBarColor(used, max);

  if (compact) {
    return (
      <div className="min-w-[100px]">
        <div className="flex items-center justify-between text-xs">
          {label ? <span className="text-gray-500">{label}</span> : <span />}
          <span className="font-medium text-gray-700">{formatUsage(used, max)}</span>
        </div>
        {!isUnlimited(max) && (
          <div className="mt-1 h-1.5 w-full rounded-full bg-gray-100">
            <div className={`h-1.5 rounded-full ${barColor}`} style={{ width: `${percent}%` }} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium text-gray-900">{formatUsage(used, max)}</span>
      </div>
      {!isUnlimited(max) && (
        <div className="h-2 w-full rounded-full bg-gray-100">
          <div className={`h-2 rounded-full transition-all ${barColor}`} style={{ width: `${percent}%` }} />
        </div>
      )}
    </div>
  );
}
