import DOMPurify from 'dompurify';

export function looksLikeHtml(value = '') {
  return /<[a-z][\s\S]*>/i.test(String(value));
}

/** Turn legacy plain-text policies into simple HTML paragraphs. */
export function plainTextToHtml(value = '') {
  const text = String(value || '').replace(/\r\n/g, '\n').trim();
  if (!text) return '';
  if (looksLikeHtml(text)) return text;
  return text
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => `<p>${escapeHtml(block).replace(/\n/g, '<br/>')}</p>`)
    .join('');
}

export function sanitizeLegalHtml(value = '') {
  return DOMPurify.sanitize(String(value || ''), {
    USE_PROFILES: { html: true },
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'a',
      'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'blockquote', 'span',
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
  });
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
