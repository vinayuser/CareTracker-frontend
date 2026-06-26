import { Check } from 'lucide-react';
import { INTAKE_STEPS } from '../../../constants/clientIntakeOptions';

export default function ClientIntakeStepper({ currentStep }) {
  return (
    <div className="mb-8 rounded-2xl border border-primary/10 bg-gradient-to-r from-primary/5 to-white px-4 py-5 sm:px-6">
      <div className="flex items-start justify-between gap-2">
        {INTAKE_STEPS.map((step, index) => {
          const done = currentStep > step.id;
          const active = currentStep === step.id;

          return (
            <div key={step.id} className="flex min-w-0 flex-1 items-start">
              <div className="flex min-w-0 flex-1 flex-col items-center text-center sm:items-start sm:text-left">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-all ${
                      done
                        ? 'bg-primary text-white shadow-sm'
                        : active
                          ? 'bg-primary text-white shadow-md ring-4 ring-primary/15'
                          : 'border-2 border-gray-200 bg-white text-gray-400'
                    }`}
                  >
                    {done ? <Check size={18} strokeWidth={2.5} /> : step.id}
                  </div>
                  <div className="hidden sm:block">
                    <p className={`text-sm font-semibold ${active ? 'text-primary' : done ? 'text-gray-800' : 'text-gray-400'}`}>
                      {step.label}
                    </p>
                    <p className="text-xs text-gray-500">{step.description}</p>
                  </div>
                </div>
              </div>
              {index < INTAKE_STEPS.length - 1 && (
                <div className={`mx-2 mt-5 h-0.5 min-w-[24px] flex-1 rounded-full ${done ? 'bg-primary' : 'bg-gray-200'}`} />
              )}
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-center text-sm font-semibold text-primary sm:hidden">
        {INTAKE_STEPS.find((s) => s.id === currentStep)?.label}
      </p>
    </div>
  );
}
