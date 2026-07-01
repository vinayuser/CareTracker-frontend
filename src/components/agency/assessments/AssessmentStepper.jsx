import { Check } from 'lucide-react';
import { ASSESSMENT_STEPS } from '../../../constants/assessmentOptions';

export default function AssessmentStepper({ currentStep }) {
  return (
    <div className="mb-8 rounded-2xl border border-primary/10 bg-gradient-to-r from-primary/5 to-white px-4 py-5 sm:px-6">
      <div className="flex items-start justify-between gap-2">
        {ASSESSMENT_STEPS.map((step, index) => {
          const done = currentStep > step.id;
          const active = currentStep === step.id;
          return (
            <div key={step.id} className="flex min-w-0 flex-1 items-start">
              <div className="flex min-w-0 flex-1 items-center gap-3 sm:flex-col sm:items-start">
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold ${done ? 'bg-primary text-white' : active ? 'bg-primary text-white ring-4 ring-primary/15' : 'border-2 border-gray-200 bg-white text-gray-400'}`}>
                  {done ? <Check size={18} /> : step.id}
                </div>
                <div className="hidden sm:block">
                  <p className={`text-sm font-semibold ${active ? 'text-primary' : 'text-gray-700'}`}>{step.label}</p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
              </div>
              {index < ASSESSMENT_STEPS.length - 1 && <div className={`mx-2 mt-5 h-0.5 min-w-[24px] flex-1 rounded-full ${done ? 'bg-primary' : 'bg-gray-200'}`} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
