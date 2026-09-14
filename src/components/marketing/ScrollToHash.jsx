import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Scrolls to location.hash after route changes.
 * Needed because React Router does not scroll to hash targets by default.
 */
export default function ScrollToHash() {
  const { pathname, hash, key } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }

    const id = decodeURIComponent(hash.replace(/^#/, ''));
    if (!id) return;

    let cancelled = false;
    let attempts = 0;

    const tryScroll = () => {
      if (cancelled) return;
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      attempts += 1;
      if (attempts < 20) {
        window.setTimeout(tryScroll, 50);
      }
    };

    // Wait one frame so the new route content is mounted
    const raf = window.requestAnimationFrame(() => {
      window.setTimeout(tryScroll, 0);
    });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(raf);
    };
  }, [pathname, hash, key]);

  return null;
}
