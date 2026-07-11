import { X } from 'lucide-react';
import { useEffect } from 'react';

export default function Drawer({ open, onClose, title, children, footer, width = 'md', elevated = false }) {
  const widthClass = {
    md: 'max-w-md',
    lg: 'max-w-xl',
    xl: 'max-w-2xl',
    '2xl': 'max-w-3xl',
    '3xl': 'max-w-5xl',
  }[width] ?? 'max-w-md';
  useEffect(() => {
    if (!open) return undefined;

    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className={`fixed inset-0 flex justify-end ${elevated ? 'z-[70]' : 'z-50'}`}>
      <button
        type="button"
        aria-label="Close drawer"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <aside className={`drawer-panel relative flex h-full w-full ${widthClass} flex-col bg-white shadow-2xl`}>
        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>

        {footer && (
          <div className="shrink-0 border-t border-gray-200 px-6 py-4">{footer}</div>
        )}
      </aside>
    </div>
  );
}
