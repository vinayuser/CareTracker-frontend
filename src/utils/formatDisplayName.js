/**
 * Title-case a person's name for display (handles spaces, hyphens, apostrophes).
 * e.g. "john doe" → "John Doe", "mary-jane o'brien" → "Mary-Jane O'Brien"
 */
export function formatDisplayName(value = '') {
  const raw = String(value || '').trim().replace(/\s+/g, ' ');
  if (!raw) return '';

  return raw
    .split(' ')
    .map((word) => word
      .split('-')
      .map((part) => part
        .split("'")
        .map((segment) => {
          if (!segment) return segment;
          return segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase();
        })
        .join("'"))
      .join('-'))
    .join(' ');
}
