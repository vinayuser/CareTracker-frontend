import { FOOTER_PAGES } from '../content/footerPagesContent';

const HEADING_RE = /^(Key |What You Can |Improve |Deliver |Strengthen |Book Your |Flexible |Contact Us for |Explore Our )/i;
const LABEL_ITEM_RE = /^(\d+\.\s+)?[A-Z][^:]{1,80}:\s+\S/;
const BARE_ITEM_RE = /^[A-Z][^.]{2,80}\.$/;

export function getFooterPage(key) {
  return FOOTER_PAGES[key] || null;
}

/** Split a content block into intro paragraphs, optional mid headings, and bullet-like items. */
export function splitFooterCopy(key) {
  const page = getFooterPage(key);
  if (!page) return { title: '', intro: [], items: [], closing: [] };

  const intro = [];
  const items = [];
  const closing = [];
  let stage = 'intro';

  page.paragraphs.forEach((raw) => {
    const text = String(raw || '').trim();
    if (!text) return;

    if (HEADING_RE.test(text) && !text.includes(': ')) {
      stage = stage === 'intro' ? 'items' : 'closing';
      if (stage === 'closing') closing.push(text);
      return;
    }

    if (LABEL_ITEM_RE.test(text) || (stage === 'items' && BARE_ITEM_RE.test(text) && text.length < 90)) {
      stage = 'items';
      items.push(text.replace(/^\d+\.\s+/, ''));
      return;
    }

    if (stage === 'items') {
      stage = 'closing';
      closing.push(text);
      return;
    }

    if (stage === 'closing') {
      closing.push(text);
      return;
    }

    intro.push(text);
  });

  return {
    title: page.title,
    intro,
    items,
    closing,
  };
}

export function firstParagraph(key, fallback = '') {
  const page = getFooterPage(key);
  return page?.paragraphs?.[0] || fallback;
}

export function itemLabels(key) {
  return splitFooterCopy(key).items.map((item) => {
    const idx = item.indexOf(':');
    if (idx > 0 && idx < 70) return item.slice(0, idx).trim();
    return item;
  });
}

export function itemBullets(key) {
  return splitFooterCopy(key).items.map((item) => {
    const idx = item.indexOf(':');
    if (idx > 0 && idx < 70) {
      const label = item.slice(0, idx).trim();
      const rest = item.slice(idx + 1).trim();
      return rest ? `${label}: ${rest}` : label;
    }
    return item;
  });
}
