import { Check } from 'lucide-react';
import PlanLimitsDisplay from './PlanLimitsDisplay';

export default function PlanSelector({ plans, selectedId, onSelect, name = 'subscriptionPlanId' }) {
  if (plans.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
        No active subscription plans available. Create one in Subscription Plans first.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {plans.map((plan) => {
        const isSelected = selectedId === plan.id;
        return (
          <label
            key={plan.id}
            className={`relative cursor-pointer rounded-xl border-2 p-5 transition-all ${
              isSelected
                ? 'border-primary bg-primary/5 shadow-sm'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <input
              type="radio"
              name={name}
              value={plan.id}
              checked={isSelected}
              onChange={() => onSelect(plan.id)}
              className="sr-only"
            />
            {isSelected && (
              <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                <Check size={12} className="text-white" />
              </span>
            )}
            <p className="text-base font-semibold text-gray-900">{plan.name}</p>
            <p className="mt-1 text-2xl font-bold text-primary">
              ${plan.price}
              <span className="text-sm font-normal text-gray-500">/{plan.billingCycle}</span>
            </p>
            <p className="mt-2 text-sm text-gray-500">{plan.description}</p>
            <PlanLimitsDisplay limits={plan.limits} compact />
            <ul className="mt-3 space-y-1">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-1.5 text-xs text-gray-600">
                  <Check size={12} className="shrink-0 text-success" />
                  {feature}
                </li>
              ))}
            </ul>
          </label>
        );
      })}
    </div>
  );
}
