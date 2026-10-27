import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import API_ROUTES from '../../api/apiRoutes';
import { ROUTES } from '../../routes/routes';
import { plainTextToHtml, sanitizeLegalHtml } from '../../utils/legalContent';

const SLUG_META = {
  privacy: { fallbackTitle: 'Privacy Policy', path: ROUTES.PRIVACY },
  terms: { fallbackTitle: 'Terms & Conditions', path: ROUTES.TERMS },
};

function slugFromPath(pathname = '') {
  if (pathname === ROUTES.PRIVACY || pathname.endsWith('/privacy-policy')) return 'privacy';
  if (pathname === ROUTES.TERMS || pathname.endsWith('/terms-and-conditions')) return 'terms';
  return '';
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

  const html = useMemo(
    () => sanitizeLegalHtml(plainTextToHtml(page?.content || '')),
    [page?.content],
  );
  const title = page?.title || meta?.fallbackTitle || 'Legal';
  const empty = !html || html === '<p><br></p>' || html === '<p></p>';

  if (!meta) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-16 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Page not found</h1>
        <Link to={ROUTES.HOME} className="mt-4 inline-block text-sm font-semibold text-[#0055d4] hover:underline">
          Back to CareTraker
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-50">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-3xl px-5 py-10 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#0055d4]">Legal</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{title}</h1>
          {page?.updatedAt ? (
            <p className="mt-2 text-sm text-slate-500">
              Last updated {new Date(page.updatedAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-5 py-10 sm:px-6 lg:px-8">
        {loading ? <p className="text-sm text-slate-500">Loading…</p> : null}
        {!loading && error ? <p className="text-sm text-rose-600">{error}</p> : null}
        {!loading && !error ? (
          <article className="rounded-2xl border border-slate-200 bg-white px-6 py-8 shadow-sm sm:px-8">
            {empty ? (
              <p className="text-sm text-slate-500">This page has no content yet.</p>
            ) : (
              <div
                className="legal-doc-body text-[15px] leading-7 text-slate-700"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            )}
            <style>{`
              .legal-doc-body h1 { font-size: 1.5rem; font-weight: 700; color: #0f172a; margin: 1.25rem 0 0.75rem; }
              .legal-doc-body h2 { font-size: 1.25rem; font-weight: 700; color: #0f172a; margin: 1.25rem 0 0.65rem; }
              .legal-doc-body h3 { font-size: 1.05rem; font-weight: 700; color: #0f172a; margin: 1rem 0 0.5rem; }
              .legal-doc-body p { margin: 0 0 0.9rem; }
              .legal-doc-body ul { list-style: disc; padding-left: 1.35rem; margin: 0 0 0.9rem; }
              .legal-doc-body ol { list-style: decimal; padding-left: 1.35rem; margin: 0 0 0.9rem; }
              .legal-doc-body li { margin: 0.2rem 0; }
              .legal-doc-body a { color: #0055d4; font-weight: 600; text-decoration: underline; }
              .legal-doc-body strong, .legal-doc-body b { font-weight: 700; color: #0f172a; }
            `}</style>
            <div className="mt-10 flex flex-wrap gap-4 border-t border-slate-100 pt-6 text-sm">
              <Link to={ROUTES.PRIVACY} className={`font-semibold ${slug === 'privacy' ? 'text-slate-900' : 'text-[#0055d4] hover:underline'}`}>
                Privacy Policy
              </Link>
              <Link to={ROUTES.TERMS} className={`font-semibold ${slug === 'terms' ? 'text-slate-900' : 'text-[#0055d4] hover:underline'}`}>
                Terms &amp; Conditions
              </Link>
              <Link to={ROUTES.HOME} className="font-medium text-slate-500 hover:text-[#0055d4]">
                Back to home
              </Link>
            </div>
          </article>
        ) : null}
      </div>
    </div>
  );
}
