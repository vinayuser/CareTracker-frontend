import { Check } from 'lucide-react';
import { WIZARD_STEPS } from '../../../constants/insuranceIntakeOptions';

export default function InsuranceIntakeStepper({ currentStep }) {
  return (
    <div className="mb-8 rounded-2xl border border-primary/20 bg-gradient-to-r from-blue-50/80 to-white px-4 py-5 sm:px-6">
      <div className="flex items-start justify-between gap-1 sm:gap-2">
        {WIZARD_STEPS.map((step, index) => {
          const done = currentStep > step.id;
          const active = currentStep === step.id;
          const upcoming = currentStep < step.id;
          return (
            <div key={step.id} className="flex min-w-0 flex-1 items-start">
              <div className="flex min-w-0 flex-1 flex-col items-center text-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all ${
                    done
                      ? 'bg-primary text-white shadow-sm shadow-blue-200'
                      : active
                        ? 'bg-primary text-white shadow-md shadow-blue-300 ring-4 ring-blue-100'
                        : 'border-2 border-blue-200 bg-white text-primary/50'
                  }`}
                >
                  {done ? <Check size={18} strokeWidth={2.5} /> : step.id}
                </div>
                <p className={`mt-2 hidden text-[11px] font-semibold leading-tight sm:block md:text-xs ${active ? 'text-primary' : done ? 'text-primary/80' : 'text-gray-400'}`}>
                  {step.label}
                </p>
              </div>
              {index < WIZARD_STEPS.length - 1 && (
                <div className={`mx-1 mt-5 h-0.5 min-w-[12px] flex-1 rounded-full sm:mx-2 ${done ? 'bg-primary' : upcoming ? 'bg-blue-100' : 'bg-blue-300'}`} />
              )}
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-center text-sm font-semibold text-primary sm:hidden">
        {WIZARD_STEPS.find((s) => s.id === currentStep)?.label}
      </p>
    </div>
  );
}
