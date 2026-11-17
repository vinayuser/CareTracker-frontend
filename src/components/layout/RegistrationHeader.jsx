import CareTrackerLogo from '../brand/CareTrackerLogo';

export default function RegistrationHeader({ currentStep }) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 lg:justify-end lg:px-8">
      <div className="min-w-0 lg:hidden">
        <CareTrackerLogo size="sm" />
        {currentStep ? (
          <p className="mt-0.5 truncate text-[11px] text-gray-500">Step {currentStep} of 3</p>
        ) : null}
      </div>
      <div className="flex items-center gap-3">
        <span className="hidden text-sm text-gray-500 sm:inline">Need help?</span>
        <button
          type="button"
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 lg:px-4"
        >
          Contact Support
        </button>
      </div>
    </header>
  );
}
