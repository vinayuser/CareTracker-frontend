import { Loader2 } from 'lucide-react';

/**
 * Primary action button that shows a spinner and stays disabled while busy.
 * Use with a submitting/saving/loading boolean that is set true for the full API call.
 */
export default function SubmitButton({
  loading = false,
  disabled = false,
  loadingLabel = 'Saving...',
  children,
  className = '',
  type = 'button',
  onClick,
  form,
  icon: Icon,
}) {
  const busy = Boolean(loading);
  const isDisabled = busy || disabled;

  return (
    <button
      type={type}
      form={form}
      disabled={isDisabled}
      aria-busy={busy}
      onClick={busy ? undefined : onClick}
      className={`inline-flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {busy ? (
        <Loader2 size={18} className="animate-spin shrink-0" aria-hidden />
      ) : Icon ? (
        <Icon size={18} className="shrink-0" aria-hidden />
      ) : null}
      <span>{busy ? loadingLabel : children}</span>
    </button>
  );
}
