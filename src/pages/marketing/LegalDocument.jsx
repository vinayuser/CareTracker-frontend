import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ArrowRight,
  ChevronRight,
  FileText,
  LoaderCircle,
  Mail,
  Printer,
  Scale,
  ShieldCheck,
} from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import API_ROUTES from '../../api/apiRoutes';
import { ROUTES } from '../../routes/routes';
import { plainTextToHtml, sanitizeLegalHtml } from '../../utils/legalContent';

const SLUG_META = {
  privacy: {
    fallbackTitle: 'Privacy Policy',
    path: ROUTES.PRIVACY,
    icon: ShieldCheck,
    kicker: 'Your information',
    summary:
      'How CareTraker collects, uses, and protects information across the website, agency portal, and mobile apps.',
  },
  terms: {
    fallbackTitle: 'Terms & Conditions',
    path: ROUTES.TERMS,
    icon: Scale,
    kicker: 'Using CareTraker',
    summary:
      'The agreement that governs access to CareTraker for agencies, caregivers, clients, and visitors.',
  },
};

const DOC_TABS = [
  { slug: 'privacy', label: 'Privacy Policy', to: ROUTES.PRIVACY },
  { slug: 'terms', label: 'Terms & Conditions', to: ROUTES.TERMS },
];

function slugFromPath(pathname = '') {
  if (pathname === ROUTES.PRIVACY || pathname.endsWith('/privacy-policy')) return 'privacy';
  if (pathname === ROUTES.TERMS || pathname.endsWith('/terms-and-conditions')) return 'terms';
  return '';
}

function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function stripTags(value = '') {
  return String(value)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|h[1-6]|li)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{2,}/g, '\n')
    .trim();
}

function decorateLegalHtml(html, pageTitle = '') {
  let index = 0;
  const toc = [];
  const titleNorm = stripTags(pageTitle).toLowerCase();
  let decorated = String(html || '').replace(
    /<(h[1-3])([^>]*)>([\s\S]*?)<\/\1>/gi,
    (full, tag, attrs, inner) => {
      const text = stripTags(inner);
      if (!text) return full;
      const level = Number(tag.slice(1));
      if (level === 1 && (text.toLowerCase() === titleNorm || /privacy policy|terms/i.test(text))) {
        return `<${tag}${attrs} class="legal-hidden-title">${inner}</${tag}>`;
      }
      index += 1;
      const id = `legal-section-${index}`;
      toc.push({ id, text, level });
      if (/\sid=/i.test(attrs)) return full.replace(/id="[^"]*"/i, `id="${id}"`);
      return `<${tag}${attrs} id="${id}">${inner}</${tag}>`;
    },
  );

  decorated = decorated.replace(/<p([^>]*)>([\s\S]*?)<\/p>/gi, (full, attrs, inner) => {
    const text = stripTags(inner);
    const heading = (text.match(/^(\d+\.\s+[^\n]+)/) || [])[1];
    if (!heading || /\sid="legal-section-/.test(attrs)) return full;
    index += 1;
    const id = `legal-section-${index}`;
    toc.push({ id, text: heading.trim(), level: 2 });
    const restMatch = inner.match(/<br\s*\/?>\s*([\s\S]*)/i);
    if (restMatch) {
      return `<p class="legal-section-heading" id="${id}">${heading}</p><p${attrs}>${restMatch[1]}</p>`;
    }
    const nextAttrs = /class="/i.test(attrs)
      ? attrs.replace(/class="/i, 'class="legal-section-heading ')
      : `${attrs} class="legal-section-heading"`;
    return `<p${nextAttrs} id="${id}">${inner}</p>`;
  });

  return { html: decorated, toc };
}

function LegalSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 w-2/3 rounded-lg bg-slate-100" />
      <div className="h-4 w-full rounded bg-slate-100" />
      <div className="h-4 w-[92%] rounded bg-slate-100" />
      <div className="h-4 w-[88%] rounded bg-slate-100" />
      <div className="mt-8 h-6 w-1/3 rounded bg-slate-100" />
      <div className="h-4 w-full rounded bg-slate-100" />
      <div className="h-4 w-[90%] rounded bg-slate-100" />
      <div className="h-4 w-[70%] rounded bg-slate-100" />
    </div>
  );
}

export default function LegalDocument() {
  const { pathname } = useLocation();
  const slug = slugFromPath(pathname);
  const meta = SLUG_META[slug];
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!meta) {
      setLoading(false);
      setError('Page not found');
      return undefined;
    }
    let cancelled = false;
    setLoading(true);
    setError('');
    axiosInstance.get(API_ROUTES.LEGAL.PUBLIC(slug), { skipErrorToast: true })
      .then((response) => {
        if (!cancelled) setPage(response.data?.data || null);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.response?.data?.message || 'Could not load this page');
          setPage(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [slug, meta]);

  const title = page?.title || meta?.fallbackTitle || 'Legal';
  const updatedLabel = formatDate(page?.updatedAt);
  const Icon = meta?.icon || FileText;

  const { html, toc } = useMemo(() => {
    const sanitized = sanitizeLegalHtml(plainTextToHtml(page?.content || ''));
    return decorateLegalHtml(sanitized, title);
  }, [page?.content, title]);

  const empty = !html || html === '<p><br></p>' || html === '<p></p>';

  useEffect(() => {
    const previous = document.title;
    document.title = `${title} | CareTraker`;
    return () => { document.title = previous; };
  }, [title]);

  if (!meta) {
    return (
      <div className="bg-[#fbfcfe] px-4 py-24 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Page not found</h1>
        <p className="mt-3 text-sm text-slate-500">This legal document is not available.</p>
        <Link
          to={ROUTES.HOME}
          className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-hover"
        >
          Back to CareTraker <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#fbfcfe]">
      <section className="relative overflow-hidden border-b border-slate-200/80 bg-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,85,212,0.08),transparent_42%),radial-gradient(circle_at_bottom_left,rgba(0,85,212,0.05),transparent_36%)]" />
        <div className="relative mx-auto max-w-[1120px] px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <nav className="legal-chrome flex flex-wrap items-center gap-1.5 text-[13px] text-slate-500">
            <Link to={ROUTES.HOME} className="hover:text-primary">Home</Link>
            <ChevronRight size={14} className="text-slate-300" />
            <span>Legal</span>
            <ChevronRight size={14} className="text-slate-300" />
            <span className="font-medium text-slate-700">{title}</span>
          </nav>

          <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_auto]">
            <div className="login-fade-in max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#e8f1ff] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
                <Icon size={14} />
                {meta.kicker}
              </span>
              <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 sm:text-[2.6rem] sm:leading-tight">
                {title}
              </h1>
              <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-slate-600">
                {meta.summary}
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                {updatedLabel ? (
                  <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 font-medium text-slate-600">
                    Last updated {updatedLabel}
                  </span>
                ) : null}
                <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 font-medium text-slate-600">
                  Applies to web and mobile
                </span>
              </div>
            </div>

            <div className="legal-chrome login-fade-in flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-300"
              >
                <Printer size={16} />
                Print
              </button>
              <a
                href="mailto:support@caretraker.com"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
              >
                <Mail size={16} />
                Contact support
              </a>
            </div>
          </div>

          <div className="legal-chrome mt-8 inline-flex rounded-full border border-slate-200 bg-[#f5f7fb] p-1">
            {DOC_TABS.map((tab) => {
              const active = tab.slug === slug;
              return (
                <Link
                  key={tab.slug}
                  to={tab.to}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    active
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1120px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-12">
          <aside className="legal-chrome hidden lg:block">
            <div className="sticky top-24 space-y-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">On this page</p>
                {loading ? (
                  <div className="mt-3 space-y-2">
                    <div className="h-3 w-40 rounded bg-slate-100" />
                    <div className="h-3 w-32 rounded bg-slate-100" />
                    <div className="h-3 w-36 rounded bg-slate-100" />
                  </div>
                ) : toc.length ? (
                  <nav className="mt-3 space-y-1.5">
                    {toc.map((item) => (
                      <a
                        key={item.id}
                        href={`#${item.id}`}
                        className={`block text-[13px] leading-snug text-slate-500 transition-colors hover:text-primary ${
                          item.level > 2 ? 'pl-3' : ''
                        }`}
                      >
                        {item.text}
                      </a>
                    ))}
                  </nav>
                ) : (
                  <p className="mt-3 text-[13px] text-slate-400">Read the full document to the right.</p>
                )}
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-sm font-semibold text-slate-900">Questions about this policy?</p>
                <p className="mt-1 text-[13px] leading-relaxed text-slate-500">
                  Email support and we will point you to the right place.
                </p>
                <a
                  href="mailto:support@caretraker.com"
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-hover"
                >
                  support@caretraker.com <ArrowRight size={14} />
                </a>
              </div>
            </div>
          </aside>

          <article className="legal-doc-sheet min-w-0 overflow-hidden rounded-3xl border border-slate-200 bg-white px-6 py-8 shadow-[0_24px_50px_-28px_rgba(15,23,42,0.28)] sm:px-10 sm:py-12">
            {loading ? (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <LoaderCircle size={16} className="animate-spin text-primary" />
                Loading document…
              </div>
            ) : null}
            {loading ? <div className="mt-8"><LegalSkeleton /></div> : null}

            {!loading && error ? (
              <div className="rounded-2xl border border-rose-100 bg-rose-50 px-5 py-6">
                <p className="font-semibold text-rose-800">Could not load this page</p>
                <p className="mt-1 text-sm text-rose-600">{error}</p>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="mt-4 text-sm font-semibold text-rose-700 hover:underline"
                >
                  Try again
                </button>
              </div>
            ) : null}

            {!loading && !error && empty ? (
              <p className="text-sm text-slate-500">This page has no content yet.</p>
            ) : null}

            {!loading && !error && !empty ? (
              <div
                className="legal-doc-body text-[16px] leading-8 text-slate-700"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            ) : null}

            <div className="legal-chrome mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-6">
              <p className="text-sm text-slate-500">
                CareTraker may update this document. Continued use means you accept the current version.
              </p>
              <Link
                to={slug === 'privacy' ? ROUTES.TERMS : ROUTES.PRIVACY}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-hover"
              >
                {slug === 'privacy' ? 'Read Terms & Conditions' : 'Read Privacy Policy'}
                <ArrowRight size={16} />
              </Link>
            </div>
          </article>
        </div>
      </section>

      <style>{`
        .legal-doc-body { overflow-wrap: anywhere; word-break: break-word; }
        .legal-doc-body h1 { font-size: 1.65rem; font-weight: 700; color: #0f172a; margin: 0 0 1rem; letter-spacing: -0.02em; }
        .legal-doc-body h1.legal-hidden-title { display: none; }
        .legal-doc-body h2 { font-size: 1.2rem; font-weight: 700; color: #0f172a; margin: 2rem 0 0.7rem; letter-spacing: -0.01em; scroll-margin-top: 6rem; }
        .legal-doc-body h3 { font-size: 1.05rem; font-weight: 700; color: #0f172a; margin: 1.4rem 0 0.5rem; scroll-margin-top: 6rem; }
        .legal-doc-body p { margin: 0 0 1rem; }
        .legal-doc-body .legal-section-heading { font-size: 1.15rem; font-weight: 700; color: #0f172a; margin: 2rem 0 0.7rem; scroll-margin-top: 6rem; }
        .legal-doc-body ul { list-style: disc; padding-left: 1.4rem; margin: 0 0 1rem; }
        .legal-doc-body ol { list-style: decimal; padding-left: 1.4rem; margin: 0 0 1rem; }
        .legal-doc-body li { margin: 0.25rem 0; }
        .legal-doc-body a { color: #0055d4; font-weight: 600; text-decoration: underline; text-underline-offset: 3px; }
        .legal-doc-body strong, .legal-doc-body b { font-weight: 700; color: #0f172a; }
        .legal-doc-body blockquote { border-left: 3px solid #dbe7ff; margin: 1rem 0; padding: 0.25rem 0 0.25rem 1rem; color: #475569; }
        @media print {
          header, footer, .legal-chrome { display: none !important; }
          .legal-doc-sheet { border: none !important; box-shadow: none !important; padding: 0 !important; }
          .legal-doc-body { font-size: 12pt; line-height: 1.5; color: #111; }
        }
      `}</style>
    </div>
  );
}
