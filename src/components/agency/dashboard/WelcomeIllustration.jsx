export default function WelcomeIllustration() {
  return (
    <div className="relative hidden h-[110px] w-[200px] shrink-0 sm:block" aria-hidden>
      <svg viewBox="0 0 200 110" className="h-full w-full">
        <ellipse cx="100" cy="104" rx="72" ry="6" fill="#dbeafe" opacity="0.8" />
        {/* elderly patient */}
        <circle cx="62" cy="42" r="15" fill="#fde68a" />
        <path d="M47 58 Q62 52 77 58 L77 95 Q62 100 47 95 Z" fill="#93c5fd" />
        <path d="M55 48 Q62 54 69 48" stroke="#64748b" strokeWidth="1.5" fill="none" />
        {/* caregiver */}
        <circle cx="138" cy="36" r="14" fill="#fcd34d" />
        <path d="M124 50 Q138 44 152 50 L155 92 Q138 98 121 92 Z" fill="#2563eb" />
        <rect x="128" y="58" width="20" height="3" rx="1" fill="#60a5fa" />
        <path d="M130 44 Q138 50 146 44" stroke="#1e40af" strokeWidth="1.5" fill="none" />
        {/* heart accent */}
        <path
          d="M100 62 C96 58 88 58 88 66 C88 74 100 82 100 82 C100 82 112 74 112 66 C112 58 104 58 100 62Z"
          fill="#22c55e"
          opacity="0.85"
        />
      </svg>
    </div>
  );
}
