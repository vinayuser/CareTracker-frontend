import { BRAND_LOGO_SRC, BRAND_MARK_SRC, BRAND_NAME } from '../../constants/brand';

const SIZES = {
  xs: { mark: 28, wordmark: 22, text: 'text-sm', gap: 'gap-2' },
  sm: { mark: 32, wordmark: 26, text: 'text-sm', gap: 'gap-2' },
  md: { mark: 36, wordmark: 30, text: 'text-[15px]', gap: 'gap-2.5' },
  lg: { mark: 48, wordmark: 36, text: 'text-xl', gap: 'gap-3' },
};

function LogoMark({ size = 36, className = '' }) {
  return (
    <img
      src={BRAND_MARK_SRC}
      alt=""
      width={size}
      height={size}
      className={`shrink-0 object-contain ${className}`}
      aria-hidden
    />
  );
}

export function CareTrackerWordmark({ size = 'md', className = '' }) {
  const height = SIZES[size]?.wordmark || SIZES.md.wordmark;
  return (
    <img
      src={BRAND_LOGO_SRC}
      alt={BRAND_NAME}
      style={{ height, width: 'auto' }}
      className={`block max-w-[220px] object-contain object-left ${className}`}
    />
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

  if (!showWordmark) {
    return (
      <div className={`flex items-center justify-center ${className}`} title={BRAND_NAME}>
        <LogoMark size={config.mark} />
      </div>
    );
  }

  return (
    <div className={`flex min-w-0 flex-col ${className}`}>
      <CareTrackerWordmark size={size} />
      {tagline && (
        <p className={`mt-0.5 truncate text-[11px] ${light ? 'text-white/70' : 'text-gray-500'}`}>
          {tagline}
        </p>
      )}
    </div>
  );
}

export { LogoMark };
