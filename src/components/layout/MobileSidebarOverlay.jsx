export default function MobileSidebarOverlay({ open, onClose, children }) {
  if (!open) return null;

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-label="Close menu"
        className="fixed inset-0 z-40 bg-black/40"
        onClick={onClose}
      />
      <div className="fixed inset-y-0 left-0 z-50 flex h-full max-w-[min(20rem,88vw)] overflow-hidden shadow-2xl">
        {children}
      </div>
    </div>
  );
}
