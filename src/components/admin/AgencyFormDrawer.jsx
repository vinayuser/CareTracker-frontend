import { useEffect, useMemo, useState } from 'react';
import { Check } from 'lucide-react';
import UsageLimitBar from '../ui/UsageLimitBar';
import {
  AGENCY_STATUSES,
  agencyToFormState,
} from '../../utils/agencyStore';
import { LIMIT_FIELDS, formatPrice, formatBillingCycle } from '../../utils/subscriptionStore';

const inputClass =
  'w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20';

const labelClass = 'mb-1.5 block text-sm font-medium text-gray-700';

const sectionClass = 'space-y-4 border-b border-gray-100 pb-5';

const usageKeyMap = {
  maxClients: 'clients',
  maxCaregivers: 'caregivers',
  maxUsers: 'users',
  maxBranches: 'branches',
};

export default function AgencyFormDrawer({ open, editingAgency, plans, onSubmit }) {
  const [formData, setFormData] = useState(() => agencyToFormState(editingAgency ?? {}));

  useEffect(() => {
    if (!open || !editingAgency) return;
    setFormData(agencyToFormState(editingAgency));
  }, [open, editingAgency]);

  const selectedPlan = useMemo(
    () => plans.find((p) => p.id === formData.subscriptionPlanId) ?? null,
    [plans, formData.subscriptionPlanId]
  );

  const usage = editingAgency?.usage ?? {
    clients: 0,
    caregivers: 0,
    users: 0,
    branches: 0,
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form id="agency-form" onSubmit={handleSubmit} className="space-y-5">
      <div className={sectionClass}>
        <p className="text-sm font-semibold text-gray-900">Agency Information</p>
        <div>
          <label className={labelClass}>Agency Name *</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Sunshine Home Care"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Legal Name</label>
          <input
            type="text"
            value={formData.legalName}
            onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
            placeholder="Registered legal business name"
            className={inputClass}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Email *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className={inputClass}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>City</label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>State</label>
            <input
              type="text"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              className={inputClass}
            />
          </div>
        </div>
        <div>
          <label className={labelClass}>Owner Name</label>
          <input
            type="text"
            value={formData.ownerName}
            onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
            className={inputClass}
          />
        </div>
      </div>

      <div className={sectionClass}>
        <p className="text-sm font-semibold text-gray-900">Agency Status</p>
        <div>
          <label className={labelClass}>Status *</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className={inputClass}
          >
            {AGENCY_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={sectionClass}>
        <p className="text-sm font-semibold text-gray-900">Subscription Plan</p>
        <div>
          <label className={labelClass}>Assigned Plan *</label>
          <select
            required
            value={formData.subscriptionPlanId}
            onChange={(e) =>
              setFormData({ ...formData, subscriptionPlanId: e.target.value })
            }
            className={inputClass}
          >
            <option value="">Select a plan</option>
            {plans.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.name} — {formatPrice(plan.price)}/{formatBillingCycle(plan.billingCycle)}
              </option>
            ))}
          </select>
        </div>

        {selectedPlan && (
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
            <p className="text-sm font-semibold text-gray-900">{selectedPlan.name}</p>
            <p className="mt-0.5 text-xs text-gray-500">{selectedPlan.description}</p>
            <p className="mt-2 text-lg font-bold text-primary">
              {formatPrice(selectedPlan.price)}
              <span className="text-xs font-normal text-gray-500">
                /{formatBillingCycle(selectedPlan.billingCycle)}
              </span>
            </p>

            <div className="mt-4 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Usage vs Plan Limits
              </p>
              {LIMIT_FIELDS.map(({ key, label }) => {
                const used = usage[usageKeyMap[key]] ?? 0;
                const max = selectedPlan.limits?.[key];
                return (
                  <UsageLimitBar key={key} label={label} used={used} max={max} />
                );
              })}
            </div>

            <div className="mt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Included Features
              </p>
              <ul className="space-y-1">
                {selectedPlan.features?.map((feature) => (
                  <li key={feature} className="flex items-center gap-1.5 text-xs text-gray-600">
                    <Check size={12} className="text-success" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </form>
  );
}

export function AgencyFormDrawerFooter({ onClose, loading }) {
  return (
    <div className="flex gap-3">
      <button
        type="button"
        onClick={onClose}
        className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        Cancel
      </button>
      <button
        type="submit"
        form="agency-form"
        disabled={loading}
        className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-60"
      >
        {loading ? 'Saving...' : 'Update Agency'}
      </button>
    </div>
  );
}
