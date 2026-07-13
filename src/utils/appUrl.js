/**
 * App / asset URL helpers — always follow the environment you're currently in.
 * Local admin → localhost links. Production admin → production links.
 */

/** Rewrite any absolute URL to the current browser origin (for SPA routes like /candidate/forms). */
export function toCurrentAppOrigin(url) {
  if (!url || typeof window === 'undefined') return url;
  try {
    const parsed = new URL(String(url), window.location.origin);
    return `${window.location.origin}${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return url;
  }
}

/**
 * Rewrite /uploads/... → /api/uploads/... so nginx /api/ proxy serves the file.
 * Also keeps the current browser origin (local vs production).
 */
export function toApiUploadUrl(url) {
  if (!url || typeof window === 'undefined') return url;
  try {
    const parsed = new URL(String(url), window.location.origin);
    let pathname = parsed.pathname;
    if (pathname.startsWith('/uploads/')) {
      pathname = `/api${pathname}`;
    } else if (!pathname.startsWith('/api/uploads/') && pathname.includes('/uploads/')) {
      pathname = pathname.replace(/\/uploads\//, '/api/uploads/');
    }
    return `${window.location.origin}${pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return url;
  }
}
