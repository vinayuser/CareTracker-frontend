import { LIMIT_FIELDS } from '../../utils/subscriptionStore';

const inputClass =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:bg-gray-100 disabled:text-gray-400';

const labelClass = 'mb-1.5 block text-sm font-medium text-gray-700';

export default function PlanLimitsForm({ formData, onChange }) {
  const handleLimitChange = (key, field, value) => {
    onChange({ ...formData, [field]: value });
  };

  return (
    <div>
      <p className={labelClass}>Usage Limits *</p>
      <p className="mb-3 text-xs text-gray-500">
        Set maximum allowed clients, caregivers, admin users, and branches for this plan.
      </p>
      <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
        {LIMIT_FIELDS.map(({ key, label }) => {
          const unlimitedKey = `${key}Unlimited`;
          const isUnlimited = formData[unlimitedKey];

          return (
            <div key={key} className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:items-end">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">{label}</label>
                <input
                  type="number"
                  min="0"
                  required={!isUnlimited}
                  disabled={isUnlimited}
                  value={formData[key]}
                  onChange={(e) => handleLimitChange(key, key, e.target.value)}
                  placeholder={isUnlimited ? 'Unlimited' : '0'}
                  className={inputClass}
                />
              </div>
              <label className="flex items-center gap-2 pb-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={isUnlimited}
                  onChange={(e) => handleLimitChange(key, unlimitedKey, e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                Unlimited
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
}
