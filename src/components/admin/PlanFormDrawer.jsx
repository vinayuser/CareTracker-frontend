import { useEffect, useState } from 'react';
import { Calendar, Plus, X } from 'lucide-react';
import PlanLimitsForm from '../ui/PlanLimitsForm';
import PlanAgenciesSummary from '../ui/PlanAgenciesSummary';
import {
  PLAN_FEATURE_OPTIONS,
  getEmptyPlanFormState,
  planToFormState,
  formStateToPlanPayload,
} from '../../utils/subscriptionStore';

const inputClass =
  'w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20';

const labelClass = 'mb-1.5 block text-sm font-medium text-gray-700';

const sectionClass = 'space-y-4 border-b border-gray-100 pb-5';

export default function PlanFormDrawer({
  open,
  onSubmit,
  editingPlan,
  agencyCount = 0,
  onViewAgencies,
}) {
  const [formData, setFormData] = useState(getEmptyPlanFormState());

  useEffect(() => {
    if (!open) return;
    setFormData(editingPlan ? planToFormState(editingPlan) : getEmptyPlanFormState());
  }, [open, editingPlan]);

  const toggleFeature = (feature) => {
    const selected = formData.selectedFeatures.includes(feature)
      ? formData.selectedFeatures.filter((f) => f !== feature)
      : [...formData.selectedFeatures, feature];
    setFormData({ ...formData, selectedFeatures: selected });
  };

  const addCustomFeature = () => {
    const value = formData.customFeatureInput.trim();
    if (!value || formData.customFeatures.includes(value)) return;
    setFormData({
      ...formData,
      customFeatures: [...formData.customFeatures, value],
      customFeatureInput: '',
    });
  };

  const removeCustomFeature = (feature) => {
    setFormData({
      ...formData,
      customFeatures: formData.customFeatures.filter((f) => f !== feature),
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formStateToPlanPayload(formData));
  };

  return (
    <form id="plan-form" onSubmit={handleSubmit} className="space-y-5">
      <div className={sectionClass}>
        <div>
          <label className={labelClass}>Plan Name *</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Basic Plan"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Description</label>
          <textarea
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe the plan and its features..."
            className={inputClass}
          />
        </div>
      </div>

      {editingPlan && (
        <div className={sectionClass}>
          <PlanAgenciesSummary
            count={agencyCount}
            onView={() => onViewAgencies?.(editingPlan)}
          />
        </div>
      )}

      <div className={`${sectionClass} grid grid-cols-2 gap-4`}>
        <div>
          <label className={labelClass}>Price (USD) *</label>
          <input
            type="number"
            required
            min="0"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            placeholder="e.g., 99.00"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Billing Cycle *</label>
          <select
            value={formData.billingCycle}
            onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value })}
            className={inputClass}
          >
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
      </div>

      <div className={sectionClass}>
        <p className={labelClass}>Plan Duration</p>
        <div className="mb-4">
          <label className="mb-1 block text-xs font-medium text-gray-600">Start Date *</label>
          <div className="relative">
            <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="date"
              required
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className={`${inputClass} pl-9`}
            />
          </div>
        </div>
        <div className="space-y-3">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="radio"
              name="durationType"
              checked={formData.durationType === 'ongoing'}
              onChange={() => setFormData({ ...formData, durationType: 'ongoing' })}
              className="mt-1 text-primary focus:ring-primary"
            />
            <span className="text-sm text-gray-700">No end date (Ongoing)</span>
          </label>

          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="radio"
              name="durationType"
              checked={formData.durationType === 'dueDate'}
              onChange={() => setFormData({ ...formData, durationType: 'dueDate' })}
              className="mt-1 text-primary focus:ring-primary"
            />
            <div className="flex-1">
              <span className="text-sm text-gray-700">Set due date</span>
              {formData.durationType === 'dueDate' && (
                <div className="relative mt-2">
                  <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    required
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className={`${inputClass} pl-9`}
                  />
                </div>
              )}
            </div>
          </label>

          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="radio"
              name="durationType"
              checked={formData.durationType === 'limited'}
              onChange={() => setFormData({ ...formData, durationType: 'limited' })}
              className="mt-1 text-primary focus:ring-primary"
            />
            <div className="flex-1">
              <span className="text-sm text-gray-700">Duration (for limited time plan)</span>
              {formData.durationType === 'limited' && (
                <div className="mt-2 flex gap-2">
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.durationValue}
                    onChange={(e) =>
                      setFormData({ ...formData, durationValue: e.target.value })
                    }
                    className={`${inputClass} w-20`}
                  />
                  <select
                    value={formData.durationUnit}
                    onChange={(e) =>
                      setFormData({ ...formData, durationUnit: e.target.value })
                    }
                    className={inputClass}
                  >
                    <option value="months">Months</option>
                    <option value="years">Years</option>
                  </select>
                </div>
              )}
            </div>
          </label>
        </div>
      </div>

      <div className={sectionClass}>
        <p className={labelClass}>Plan Status</p>
        <label className="flex cursor-pointer items-center gap-3">
          <button
            type="button"
            role="switch"
            aria-checked={formData.isActive}
            onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
            className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors ${
              formData.isActive ? 'bg-primary' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 translate-y-0.5 rounded-full bg-white shadow transition-transform ${
                formData.isActive ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </button>
          <div>
            <p className="text-sm font-medium text-gray-900">Active</p>
            <p className="text-xs text-gray-500">Make this plan available for agencies to purchase</p>
          </div>
        </label>
      </div>

      <div className={sectionClass}>
        <PlanLimitsForm formData={formData} onChange={setFormData} />
      </div>

      <div className="space-y-3 pb-2">
        <p className={labelClass}>Features</p>
        <div className="space-y-2">
          {PLAN_FEATURE_OPTIONS.map((feature) => (
            <label key={feature} className="flex cursor-pointer items-center gap-2.5">
              <input
                type="checkbox"
                checked={formData.selectedFeatures.includes(feature)}
                onChange={() => toggleFeature(feature)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm text-gray-700">{feature}</span>
            </label>
          ))}
        </div>

        {formData.customFeatures.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {formData.customFeatures.map((feature) => (
              <span
                key={feature}
                className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700"
              >
                {feature}
                <button type="button" onClick={() => removeCustomFeature(feature)}>
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <input
            type="text"
            value={formData.customFeatureInput}
            onChange={(e) =>
              setFormData({ ...formData, customFeatureInput: e.target.value })
            }
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addCustomFeature();
              }
            }}
            placeholder="Custom feature name"
            className={inputClass}
          />
          <button
            type="button"
            onClick={addCustomFeature}
            className="flex shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            <Plus size={14} />
            Add Custom Feature
          </button>
        </div>
      </div>
    </form>
  );
}

export function PlanFormDrawerFooter({ onClose, loading, isEditing }) {
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
        form="plan-form"
        disabled={loading}
        className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-60"
      >
        {loading ? 'Saving...' : isEditing ? 'Update Plan' : 'Create Plan'}
      </button>
    </div>
  );
}
