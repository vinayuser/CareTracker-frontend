import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import ProductMock from '../../components/marketing/ProductMock';
import { RequestDemoButton } from '../../components/marketing/DemoRequestContext';
import { ROUTES } from '../../routes/routes';
import { findFooterGuidePage } from './footerGuidePages';

export default function FooterGuidePage() {
  const { pathname } = useLocation();
  const page = findFooterGuidePage(pathname);

  useEffect(() => {
    if (!page) return undefined;
    const previous = document.title;
    document.title = `${page.label} | Caretraqer`;
    return () => {
      document.title = previous;
    };
  }, [page]);

  if (!page) {
    return (
      <div className="bg-white px-4 py-24 text-center">
        <h1 className="text-3xl font-bold text-slate-900">Page not found</h1>
        <Link to={ROUTES.HOME} className="mt-6 inline-flex text-sm font-semibold text-primary">
          Back to Caretraqer
        </Link>
      </div>
    );
  }

  const Body = BODIES[page.layout] || WorkflowBody;
  return (
    <div className="bg-white text-slate-900">
      <Body page={page} />
    </div>
  );
}

function Crumb({ page }) {
  return (
    <Link to={page.categoryPath} className="text-[12px] font-bold uppercase tracking-[0.14em] text-primary">
      {page.category}
    </Link>
  );
}

function TimelineBody({ page }) {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <Crumb page={page} />
      <h1 className="mt-3 text-4xl font-bold tracking-tight">{page.label}</h1>
      <p className="mt-4 text-[15px] leading-7 text-slate-500">{page.summary}</p>
      <ol className="mt-12 border-l border-slate-200">
        {page.sections.map(([title, text]) => (
          <li key={title} className="relative pb-10 pl-8">
            <span className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary" />
            <h2 className="text-lg font-bold">{title}</h2>
            <p className="mt-2 text-[15px] leading-7 text-slate-600">{text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function QuartersBody({ page }) {
  return (
    <section className="overflow-hidden bg-[#f5f7fb]">
      <div className="mx-auto max-w-[1120px] px-4 py-16 sm:px-6 lg:px-8">
        <Crumb page={page} />
        <h1 className="mt-3 max-w-xl text-4xl font-bold tracking-tight">{page.label}</h1>
        <p className="mt-4 max-w-xl text-[15px] leading-7 text-slate-500">{page.summary}</p>
        <div className="mt-12 grid gap-px bg-slate-200 sm:grid-cols-2 lg:grid-cols-4">
          {page.sections.map(([title, text]) => (
            <article key={title} className="bg-white p-6">
              <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-primary">{title}</p>
              <p className="mt-4 text-[14px] leading-6 text-slate-600">{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function StoriesBody({ page }) {
  return (
    <div>
      <section className="bg-[#0b3d91] text-white">
        <div className="mx-auto max-w-[1120px] px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-white/70">{page.category}</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">{page.headline}</h1>
        </div>
      </section>
      {page.sections.map(([title, text], index) => (
        <section key={title} className={index % 2 ? 'bg-[#f5f7fb]' : 'bg-white'}>
          <div className="mx-auto grid max-w-[1120px] gap-6 px-4 py-12 sm:px-6 lg:grid-cols-[180px_1fr] lg:px-8">
            <p className="text-5xl font-bold text-primary/20">{String(index + 1).padStart(2, '0')}</p>
            <div>
              <h2 className="text-2xl font-bold">{title}</h2>
              <p className="mt-3 max-w-2xl text-[15px] leading-7 text-slate-600">{text}</p>
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}

function WorkflowBody({ page }) {
  return (
    <section className="mx-auto max-w-[1120px] px-4 py-16 sm:px-6 lg:px-8">
      <Crumb page={page} />
      <h1 className="mt-3 max-w-2xl text-4xl font-bold tracking-tight">{page.label}</h1>
      <p className="mt-4 max-w-2xl text-[15px] leading-7 text-slate-500">{page.summary}</p>
      <ol className="mt-12 grid gap-8 md:grid-cols-2">
        {page.sections.map(([title, text], index) => (
          <li key={title} className="border-t-2 border-primary pt-4">
            <p className="text-[12px] font-bold text-primary">Step {index + 1}</p>
            <h2 className="mt-2 text-xl font-bold">{title}</h2>
            <p className="mt-2 text-[14px] leading-6 text-slate-600">{text}</p>
          </li>
        ))}
      </ol>
      <RequestDemoButton className="mt-10 inline-flex rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover">
        Request a Demo
      </RequestDemoButton>
    </section>
  );
}

function MapBody({ page }) {
  return (
    <section className="mx-auto grid max-w-[1120px] items-start gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8">
      <div>
        <Crumb page={page} />
        <h1 className="mt-3 text-4xl font-bold tracking-tight">{page.label}</h1>
        <p className="mt-4 text-[15px] leading-7 text-slate-500">{page.summary}</p>
        <div className="mt-8">
          <ProductMock variant="map" />
        </div>
      </div>
      <ul className="divide-y divide-slate-200 border-y border-slate-200">
        {page.sections.map(([title, text]) => (
          <li key={title} className="py-5">
            <h2 className="font-bold">{title}</h2>
            <p className="mt-1 text-[14px] leading-6 text-slate-600">{text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ChecklistBody({ page }) {
  return (
    <section className="mx-auto grid max-w-[1120px] gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[280px_1fr] lg:px-8">
      <div className="lg:sticky lg:top-24 lg:self-start">
        <Crumb page={page} />
        <h1 className="mt-3 text-3xl font-bold tracking-tight">{page.label}</h1>
        <p className="mt-4 text-[14px] leading-6 text-slate-500">{page.summary}</p>
      </div>
      <ul className="space-y-3">
        {page.sections.map(([title, text]) => (
          <li key={title} className="flex gap-4 rounded-xl bg-[#f5f7fb] p-5">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-white">
              <Check size={14} />
            </span>
            <div>
              <h2 className="font-bold">{title}</h2>
              <p className="mt-1 text-[14px] leading-6 text-slate-600">{text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function BoardBody({ page }) {
  return (
    <section className="bg-[#f5f7fb]">
      <div className="mx-auto max-w-[1120px] px-4 py-16 sm:px-6 lg:px-8">
        <Crumb page={page} />
        <h1 className="mt-3 text-4xl font-bold tracking-tight">{page.label}</h1>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {page.sections.map(([title], index) => (
            <div key={title} className="rounded-xl bg-white px-4 py-5 shadow-sm">
              <p className="text-2xl font-bold text-primary">{String(index + 1).padStart(2, '0')}</p>
              <p className="mt-2 text-sm font-semibold text-slate-800">{title}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
          {page.sections.map(([title, text]) => (
            <div key={title} className="grid gap-2 border-b border-slate-100 px-5 py-4 last:border-0 md:grid-cols-[220px_1fr]">
              <h2 className="text-sm font-bold">{title}</h2>
              <p className="text-[14px] leading-6 text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AlertsBody({ page }) {
  return (
    <section className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <Crumb page={page} />
      <h1 className="mt-3 text-4xl font-bold tracking-tight">{page.label}</h1>
      <p className="mt-4 text-[15px] leading-7 text-slate-500">{page.summary}</p>
      <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200">
        {page.sections.map(([title, text]) => (
          <article key={title} className="border-b border-slate-100 px-5 py-4 last:border-0">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-bold">{title}</h2>
              <span className="rounded-full bg-[#eff6ff] px-2 py-0.5 text-[11px] font-bold text-primary">Open</span>
            </div>
            <p className="mt-1 text-[14px] leading-6 text-slate-600">{text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function RowsBody({ page }) {
  return (
    <section>
      <div className="border-b border-slate-200">
        <div className="mx-auto max-w-[1120px] px-4 py-16 sm:px-6 lg:px-8">
          <Crumb page={page} />
          <h1 className="mt-4 max-w-3xl text-5xl font-bold tracking-tight">{page.headline}</h1>
        </div>
      </div>
      <div className="mx-auto max-w-[1120px] px-4 sm:px-6 lg:px-8">
        {page.sections.map(([title, text]) => (
          <div key={title} className="grid gap-3 border-b border-slate-200 py-8 md:grid-cols-[240px_1fr] md:gap-16">
            <h2 className="text-lg font-bold">{title}</h2>
            <p className="max-w-xl text-[15px] leading-7 text-slate-600">{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function DirectoryBody({ page }) {
  return (
    <section className="mx-auto max-w-[1120px] px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-8">
        <div>
          <Crumb page={page} />
          <h1 className="mt-3 text-4xl font-bold tracking-tight">{page.label}</h1>
        </div>
        <Link to={ROUTES.PRODUCT_REQUEST_DEMO} className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
          Talk to us <ArrowRight size={16} />
        </Link>
      </div>
      <p className="mt-6 max-w-2xl text-[15px] leading-7 text-slate-500">{page.summary}</p>
      <div className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2">
        {page.sections.map(([title, text]) => (
          <article key={title}>
            <h2 className="border-l-2 border-primary pl-3 text-lg font-bold">{title}</h2>
            <p className="mt-2 pl-3.5 text-[14px] leading-6 text-slate-600">{text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function PortalBody({ page }) {
  return (
    <section className="bg-gradient-to-b from-[#f5f7fb] to-white">
      <div className="mx-auto grid max-w-[1120px] items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
        <ProductMock variant={page.path.includes('mobile') ? 'form' : 'dashboard'} />
        <div>
          <Crumb page={page} />
          <h1 className="mt-3 text-4xl font-bold tracking-tight">{page.label}</h1>
          <p className="mt-4 text-[15px] leading-7 text-slate-500">{page.summary}</p>
          <ul className="mt-8 space-y-5">
            {page.sections.map(([title, text]) => (
              <li key={title}>
                <h2 className="font-bold">{title}</h2>
                <p className="mt-1 text-[14px] leading-6 text-slate-600">{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

const BODIES = {
  timeline: TimelineBody,
  quarters: QuartersBody,
  stories: StoriesBody,
  workflow: WorkflowBody,
  map: MapBody,
  checklist: ChecklistBody,
  board: BoardBody,
  alerts: AlertsBody,
  rows: RowsBody,
  directory: DirectoryBody,
  portal: PortalBody,
};
