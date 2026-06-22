import { Users, HeartHandshake, UserCog, Building2 } from 'lucide-react';
import { LIMIT_FIELDS, formatLimit } from '../../utils/subscriptionStore';

const limitIcons = {
  maxClients: Users,
  maxCaregivers: HeartHandshake,
  maxUsers: UserCog,
  maxBranches: Building2,
};

export default function PlanLimitsDisplay({ limits, compact = false }) {
  if (!limits) return null;

  if (compact) {
    return (
      <div className="mt-3 flex flex-wrap gap-2">
        {LIMIT_FIELDS.map(({ key, singular }) => (
          <span
            key={key}
            className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600"
          >
            {formatLimit(limits[key], singular)}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-lg border border-gray-100 bg-gray-50 p-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Usage Limits</p>
      <ul className="space-y-1.5">
        {LIMIT_FIELDS.map(({ key, singular, label }) => {
          const Icon = limitIcons[key];
          return (
            <li key={key} className="flex items-center gap-2 text-sm text-gray-700">
              <Icon size={14} className="shrink-0 text-primary" />
              <span className="font-medium text-gray-500">{label}:</span>
              <span>{formatLimit(limits[key], singular)}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
