import { Check } from 'lucide-react';
import CareTrackerLogo from '../brand/CareTrackerLogo';
import { REGISTRATION_STEPS, ROUTES } from '../../routes/routes';

export default function RegistrationSidebar({ currentStep }) {
  return (
    <aside className="flex w-72 shrink-0 flex-col bg-sidebar px-6 py-8 text-white">
      <div className="mb-10">
        <CareTrackerLogo size="md" tagline="Agency registration" light />
        <p className="mt-4 text-sm leading-relaxed text-white/60">
          Complete your agency information to create your account and get started.
        </p>
      </div>

      <nav className="space-y-1">
        {REGISTRATION_STEPS.map(({ key, label, step }) => {
          const isCompleted = step < currentStep;
          const isActive = step === currentStep;

          return (
            <div
              key={key}
              className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm ${
                isActive
                  ? 'bg-primary/20 text-white'
                  : isCompleted
                    ? 'text-white/80'
                    : 'text-white/50'
              }`}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                  isActive
                    ? 'bg-primary text-white'
                    : isCompleted
                      ? 'bg-success text-white'
                      : 'border border-white/30 text-white/50'
                }`}
              >
                {isCompleted ? <Check size={14} /> : step}
              </span>
              <span className={isActive ? 'font-medium' : ''}>{label}</span>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
