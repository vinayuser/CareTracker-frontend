import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

/** Overlay nav for < lg. Closes on route change and Escape. Desktop collapse is separate. */
export default function useMobileNav() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const toggleForViewport = (onDesktopToggle) => {
    if (typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches) {
      onDesktopToggle?.();
      return;
    }
    setOpen((value) => !value);
  };

  return { open, setOpen, toggleForViewport };
}
