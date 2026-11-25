import { useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Accessibility,
  ArrowRight,
  Check,
  Lock,
  Mail,
  Map,
  ShieldCheck,
} from 'lucide-react';
import ProductMock from '../../components/marketing/ProductMock';
import { RequestDemoButton } from '../../components/marketing/DemoRequestContext';
import { ROUTES } from '../../routes/routes';
import { getFooterPage } from '../../utils/footerPageCopy';

const PAGE_META = {
  security: {
    key: 'security',
    label: 'Security',
    icon: ShieldCheck,
    layout: 'security',
  },
  accessibility: {
    key: 'accessibility',
    label: 'Accessibility',
    icon: Accessibility,
    layout: 'accessibility',
  },
  sitemap: {
    key: 'sitemap',
    label: 'Sitemap',
    icon: Map,
    layout: 'sitemap',
  },
};

const DOC_TABS = [
  { slug: 'security', label: 'Security', to: ROUTES.SECURITY },
  { slug: 'accessibility', label: 'Accessibility', to: ROUTES.ACCESSIBILITY },
  { slug: 'sitemap', label: 'Sitemap', to: ROUTES.SITEMAP },
];

const SITEMAP_LINKS = [
  { label: 'Home', to: ROUTES.HOME, match: /^Home:/i },
  { label: 'Features', to: ROUTES.PRODUCT_FEATURES, match: /^Features:/i },
  { label: 'Client Management', to: ROUTES.MARKETING_CLIENT_MANAGEMENT, match: /^Client Management:/i },
  { label: 'Solutions', to: ROUTES.MARKETING_PRODUCT, match: /^Solutions:/i },
  { label: 'Mobile Application', to: '/portals/mobile-apps', match: /^Mobile Application:/i },
  { label: 'Privacy Policy', to: ROUTES.PRIVACY, match: /^Privacy Policy:/i },
  { label: 'Terms and Conditions', to: ROUTES.TERMS, match: /^Terms and Conditions:/i },
  { label: 'Security', to: ROUTES.SECURITY, match: /^Security and Accessibility:/i },
  { label: 'Accessibility', to: ROUTES.ACCESSIBILITY, match: /^Security and Accessibility:/i },
  { label: 'About Us', to: ROUTES.ABOUT, match: /^About Us:/i },
  { label: 'FAQ', to: ROUTES.FAQ, match: /^FAQ:/i },
  { label: 'Blog', to: '/resources/blog', match: /^Blog:/i },
  { label: 'Contact Us', to: '/resources/contact', match: /^Contact Us:/i },
];

function slugFromPath(pathname = '') {
  if (pathname === ROUTES.SECURITY || pathname.endsWith('/security')) return 'security';
  if (pathname === ROUTES.ACCESSIBILITY || pathname.endsWith('/accessibility')) return 'accessibility';
  if (pathname === ROUTES.SITEMAP || pathname.endsWith('/sitemap')) return 'sitemap';
  return '';
}

function Shell({ className = '', children }) {
  return (
    <section className={className}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">{children}</div>
    </section>
  );
}

function Tabs({ slug }) {
  return (
    <div className="mb-8 inline-flex rounded-full border border-slate-200 bg-white p-1">
      {DOC_TABS.map((tab) => (
        <Link
          key={tab.slug}
          to={tab.to}
          className={`rounded-full px-4 py-2 text-sm font-semibold ${
            tab.slug === slug ? 'bg-primary text-white' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}

function SecurityLayout({ page }) {
  return (
    <>
      <Shell className="bg-[#0b3d91] py-16 text-white">
        <Tabs slug="security" />
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.14em] text-white/70">
              <ShieldCheck size={14} /> Trust & Security
            </p>
            <h1 className="mt-4 text-4xl font-bold sm:text-5xl">Protect sensitive home care information.</h1>
            <p className="mt-5 text-[15px] text-white/80">{page.paragraphs[0]}</p>
            <a
              href="mailto:support@caretraker.com"
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover"
            >
              <Lock size={16} /> Report a security concern
            </a>
          </div>
          <ProductMock variant="dashboard" />
        </div>
      </Shell>

      <Shell className="bg-white py-14">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ['Role-based access', page.paragraphs[1]],
            ['Account protection', page.paragraphs[2]],
            ['Confidential care data', page.paragraphs[3]],
          ].map(([title, text]) => (
            <div key={title} className="rounded-2xl border border-slate-200 p-5">
              <Lock size={18} className="text-primary" />
              <h3 className="mt-4 font-bold text-slate-900">{title}</h3>
              <p className="mt-2 text-sm text-slate-600">{text}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 rounded-2xl bg-[#eff6ff] px-6 py-8">
          <p className="text-lg font-bold text-slate-900">{page.paragraphs[4]}</p>
          <p className="mt-2 text-sm text-slate-600">{page.paragraphs[5]}</p>
        </div>
      </Shell>
    </>
  );
}

function AccessibilityLayout({ page }) {
  return (
    <>
      <Shell className="bg-gradient-to-b from-[#f5f7fb] to-white py-16">
        <Tabs slug="accessibility" />
        <div className="mx-auto max-w-3xl text-center">
          <p className="inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.14em] text-primary">
            <Accessibility size={14} /> Inclusive Design
          </p>
          <h1 className="mt-4 text-4xl font-bold text-slate-900 sm:text-5xl">
            Technology that more people can use with ease.
          </h1>
          <p className="mt-5 text-[15px] text-slate-600">{page.paragraphs[0]}</p>
        </div>
      </Shell>

      <Shell className="bg-white py-14">
        <div className="grid items-start gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-4">
            {page.paragraphs.slice(1, 5).map((text, i) => (
              <div key={text.slice(0, 24)} className="flex gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#eff6ff] text-sm font-bold text-primary">
                  {i + 1}
                </span>
                <p className="text-sm leading-relaxed text-slate-700">{text}</p>
              </div>
            ))}
          </div>
          <ProductMock variant="form" />
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#dbe7ff] bg-[#eff6ff] px-6 py-6">
          <p className="max-w-2xl text-sm text-slate-700">{page.paragraphs[4] || page.paragraphs.at(-1)}</p>
          <a href="mailto:support@caretraker.com" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
            <Mail size={16} /> Contact support
          </a>
        </div>
      </Shell>
    </>
  );
}

function SitemapLayout({ page }) {
  const links = page.paragraphs.filter((para) => /^[A-Z][^:]{1,40}:\s+\S/.test(para));
  return (
    <>
      <Shell className="bg-white py-14">
        <Tabs slug="sitemap" />
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-primary">Sitemap</p>
            <h1 className="mt-3 text-4xl font-bold text-slate-900">Find any Caretraqer page quickly.</h1>
            <p className="mt-4 max-w-2xl text-[15px] text-slate-600">{page.paragraphs[0]}</p>
          </div>
          <RequestDemoButton className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white">
            Request a Demo
          </RequestDemoButton>
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {links.map((para) => {
            const [label, ...rest] = para.split(':');
            const description = rest.join(':').trim();
            const link = SITEMAP_LINKS.find((item) => item.match.test(para));
            return (
              <div key={para} className="rounded-xl border border-slate-200 bg-[#fafafa] p-4 hover:border-primary/30">
                {link ? (
                  <Link to={link.to} className="inline-flex items-center gap-1 font-bold text-primary hover:underline">
                    {label} <ArrowRight size={14} />
                  </Link>
                ) : (
                  <p className="font-bold text-slate-900">{label}</p>
                )}
                <p className="mt-2 text-sm text-slate-600">{description}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-4">
          {[
            ['Product', ROUTES.MARKETING_PRODUCT],
            ['CRM', ROUTES.MARKETING_CRM],
            ['EVV', ROUTES.MARKETING_EVV],
            ['Privacy', ROUTES.PRIVACY],
          ].map(([label, to]) => (
            <Link
              key={label}
              to={to}
              className="rounded-2xl bg-[#eff6ff] px-4 py-5 text-center font-bold text-primary hover:bg-[#dbe7ff]"
            >
              {label}
            </Link>
          ))}
        </div>
      </Shell>
    </>
  );
}

export default function MarketingInfoDocument() {
  const { pathname } = useLocation();
  const slug = slugFromPath(pathname);
  const meta = PAGE_META[slug];
  const page = useMemo(() => (meta ? getFooterPage(meta.key) : null), [meta]);

  useEffect(() => {
    if (!meta) return undefined;
    const previous = document.title;
    document.title = `${meta.label} | Caretraqer`;
    return () => {
      document.title = previous;
    };
  }, [meta]);

  if (!meta || !page) {
    return (
      <div className="bg-white px-4 py-24 text-center">
        <h1 className="text-3xl font-bold text-slate-900">Page not found</h1>
        <Link to={ROUTES.HOME} className="mt-6 inline-flex text-sm font-semibold text-primary">
          Back to Caretraqer
        </Link>
      </div>
    );
  }

  if (meta.layout === 'security') return <div className="bg-white"><SecurityLayout page={page} /></div>;
  if (meta.layout === 'accessibility') return <div className="bg-white"><AccessibilityLayout page={page} /></div>;
  return <div className="bg-white"><SitemapLayout page={page} /></div>;
}
