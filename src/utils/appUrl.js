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
 * Origin that serves /documents and /uploads.
 * Uses the API host (local: :3000/:5000, prod: same site via nginx).
 */
export function getDocumentAssetOrigin(apiBaseUrl) {
  if (typeof window === 'undefined') return '';
  const apiBase = String(apiBaseUrl || '').trim();
  if (apiBase) {
    try {
      return new URL(apiBase, window.location.origin).origin;
    } catch {
      /* fall through */
    }
  }
  return window.location.origin;
}
