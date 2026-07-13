import axiosInstance from '../../../api/axiosInstance';

/** Pull `fillable-forms/....pdf` (or any path under documents/) from a template URL. */
function extractDocumentsRelativePath(pdfUrl) {
  const raw = String(pdfUrl || '').trim();
  if (!raw) return '';

  try {
    const parsed = raw.startsWith('/')
      ? new URL(raw, typeof window !== 'undefined' ? window.location.origin : 'http://localhost')
      : new URL(raw);
    const pathname = decodeURIComponent(parsed.pathname);
    const marker = '/documents/';
    const idx = pathname.toLowerCase().lastIndexOf(marker);
    if (idx >= 0) {
      return pathname.slice(idx + marker.length).replace(/^\/+/, '');
    }
  } catch {
    /* fall through */
  }

  const match = raw.match(/documents\/(.+?)(?:\?|#|$)/i);
  return match ? decodeURIComponent(match[1]) : '';
}

/**
 * Build a PDF URL that always goes through the API host:
 *   {apiOrigin}/api/documents/fillable-forms/....pdf
 * Works locally and on production (nginx already proxies /api/).
 */
export function resolvePublicDocumentUrl(pdfUrl) {
  if (!pdfUrl) return pdfUrl;

  const relative = extractDocumentsRelativePath(pdfUrl);
  const apiBase = String(axiosInstance.defaults.baseURL || '').replace(/\/+$/, '');

  let origin = '';
  try {
    origin = new URL(apiBase || (typeof window !== 'undefined' ? window.location.origin : ''), window.location?.origin || 'http://localhost').origin;
  } catch {
    origin = typeof window !== 'undefined' ? window.location.origin : '';
  }

  if (relative && origin) {
    const encoded = relative.split('/').map((part) => encodeURIComponent(part)).join('/');
    return `${origin}/api/documents/${encoded}`;
  }

  // Last resort: keep original if we couldn't parse it
  return String(pdfUrl).replace('/documents/documents/', '/documents/');
}

export async function fetchPdfTemplateBytes(pdfUrl) {
  const url = resolvePublicDocumentUrl(pdfUrl);
  if (!url) {
    throw new Error('PDF template URL is missing. Please contact your agency.');
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Could not load form template (HTTP ${response.status}). URL: ${url}`);
  }
  const bytes = await response.arrayBuffer();
  const header = new TextDecoder().decode(bytes.slice(0, 8));
  if (!header.startsWith('%PDF')) {
    const sniff = header.replace(/\s+/g, ' ').slice(0, 40);
    throw new Error(
      `Form template is not a valid PDF (got "${sniff}…" from ${url}). `
      + 'The server returned a web page instead of the file — check API /api/documents is reachable.',
    );
  }
  return bytes;
}
