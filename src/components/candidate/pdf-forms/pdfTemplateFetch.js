import axiosInstance from '../../../api/axiosInstance';
import { getDocumentAssetOrigin } from '../../../utils/appUrl';

/**
 * Resolve PDF template URL for the environment you're in right now.
 * Uses the API host (local backend port, or same production site).
 */
export function resolvePublicDocumentUrl(pdfUrl) {
  if (!pdfUrl) return pdfUrl;

  let next = String(pdfUrl).trim().replace('/documents/documents/', '/documents/');
  const assetOrigin = getDocumentAssetOrigin(axiosInstance.defaults.baseURL);

  try {
    const parsed = next.startsWith('/')
      ? new URL(next, assetOrigin || (typeof window !== 'undefined' ? window.location.origin : undefined))
      : new URL(next);

    if (assetOrigin) {
      return `${assetOrigin}${parsed.pathname}${parsed.search}`;
    }
    return `${parsed.origin}${parsed.pathname}${parsed.search}`;
  } catch {
    return next;
  }
}

export async function fetchPdfTemplateBytes(pdfUrl) {
  const url = resolvePublicDocumentUrl(pdfUrl);
  if (!url) {
    throw new Error('PDF template URL is missing. Please contact your agency.');
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Could not load form template (HTTP ${response.status})`);
  }
  const bytes = await response.arrayBuffer();
  const header = new TextDecoder().decode(bytes.slice(0, 5));
  if (!header.startsWith('%PDF')) {
    throw new Error('Form template is not a valid PDF. Please contact your agency.');
  }
  return bytes;
}
