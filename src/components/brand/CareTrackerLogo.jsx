const SIZES = {
  xs: { mark: 28, text: 'text-sm', gap: 'gap-2' },
  sm: { mark: 32, text: 'text-sm', gap: 'gap-2' },
  md: { mark: 36, text: 'text-[15px]', gap: 'gap-2.5' },
  lg: { mark: 48, text: 'text-xl', gap: 'gap-3' },
};

function LogoMark({ size = 36, className = '' }) {
  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      className={`shrink-0 ${className}`}
      aria-hidden
    >
      <defs>
        <linearGradient id="caretracker-bg" x1="8" y1="4" x2="40" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0055d4" />
          <stop offset="1" stopColor="#003d99" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="12" fill="url(#caretracker-bg)" />
      <path
        d="M10 28.5c3.5-8 8.5-12 14-12s10.5 4 14 12"
        stroke="#ffffff"
        strokeWidth="2.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.35"
      />
      <path
        d="M12 26.5 L17 26.5 L19.5 18 L22.5 32 L25.5 22 L28 26.5 L36 26.5"
        stroke="#ffffff"
        strokeWidth="2.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="36" cy="26.5" r="3.25" fill="#22c55e" stroke="#ffffff" strokeWidth="1.5" />
    </svg>
  );
}

export function CareTrackerWordmark({ size = 'md', light = false, className = '' }) {
  const textClass = SIZES[size]?.text || SIZES.md.text;
  return (
    <span className={`font-bold tracking-tight ${textClass} ${className}`}>
      <span className={light ? 'text-white' : 'text-slate-900'}>Care</span>
      <span className={light ? 'text-emerald-300' : 'text-primary'}>Traker</span>
    </span>
  );
}

export default function CareTrackerLogo({
  size = 'md',
  showWordmark = true,
  tagline,
  light = false,
  className = '',
}) {
  const config = SIZES[size] || SIZES.md;

  return (
    <div className={`flex items-center ${config.gap} ${className}`}>
      <LogoMark size={config.mark} />
      {showWordmark && (
        <div className="min-w-0">
          <CareTrackerWordmark size={size} light={light} />
          {tagline && (
            <p className={`truncate text-xs ${light ? 'text-white/70' : 'text-gray-500'}`}>
              {tagline}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export { LogoMark };
