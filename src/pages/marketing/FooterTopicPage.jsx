import { useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ArrowRight,
  Bell,
  CalendarDays,
  Check,
  ClipboardList,
  FileText,
  HeartHandshake,
  Mail,
  MapPinned,
  ShieldCheck,
  Smartphone,
  Users,
} from 'lucide-react';
import ProductMock from '../../components/marketing/ProductMock';
import ProductShot from '../../components/marketing/ProductShot';
import { RequestDemoButton } from '../../components/marketing/DemoRequestContext';
import { ROUTES } from '../../routes/routes';
import { splitFooterCopy } from '../../utils/footerPageCopy';
import { findFooterTopicPage } from './footerTopicPages';

const ICONS = [Users, CalendarDays, ShieldCheck, ClipboardList, Smartphone, Bell, HeartHandshake, FileText, MapPinned, Mail];

const FEATURE_READ_MORE = {
  'Client Management': ROUTES.MARKETING_CLIENT_MANAGEMENT,
  'Care Plan Management': ROUTES.MARKETING_CLIENT_MANAGEMENT,
  'Electronic Visit Verification (EVV)': ROUTES.MARKETING_EVV,
  'Caregiver Management': ROUTES.MARKETING_HR,
};

const PRICING_PLANS = [
  {
    name: 'Starter',
    blurb: 'Ideal for small agencies',
    price: '$99',
    period: '/month',
    features: ['Up to 50 Clients', 'Up to 25 Caregivers', 'Core EVV', 'Basic Reports', 'Email Support'],
    popular: false,
  },
  {
    name: 'Growth',
    blurb: 'Perfect for growing agencies',
    price: '$199',
    period: '/month',
    features: ['Up to 200 Clients', 'Up to 100 Caregivers', 'Full EVV Suite', 'CRM Tools', 'Advanced Reports', 'Priority Support'],
    popular: true,
  },
  {
    name: 'Pro',
    blurb: 'For larger agencies',
    price: '$349',
    period: '/month',
    features: ['Unlimited Clients', 'Unlimited Caregivers', 'Full EVV + Alerts', 'Automation', 'Custom Reports', 'Dedicated Support'],
    popular: false,
  },
  {
    name: 'Enterprise',
    blurb: 'Custom for multi-location teams',
    price: 'Custom',
    period: '',
    features: ['Multi-location Support', 'Custom Integrations', 'Advanced Security', 'SLA & Onboarding', 'Success Manager'],
    popular: false,
  },
];

const SITE = { badge: 'bg-[#eff6ff] text-primary', soft: 'bg-[#f5f7fb]', bar: 'bg-primary' };
const THEME = {
  sky: SITE,
  emerald: SITE,
  violet: SITE,
  orange: SITE,
  teal: SITE,
  rose: SITE,
  indigo: SITE,
  amber: SITE,
};

function splitItem(text) {
  const clean = String(text || '').replace(/^\d+\.\s+/, '');
  const index = clean.indexOf(':');
  if (index > 0 && index < 70) {
    return { title: clean.slice(0, index).trim(), text: clean.slice(index + 1).trim() };
  }
  return { title: clean, text: '' };
}

function Shell({ className = '', children }) {
  return (
    <section className={className}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">{children}</div>
    </section>
  );
}

function Visual({ topic, className = '' }) {
  if (topic.shot) return <ProductShot src={topic.shot} alt={topic.shortLabel} className={className} />;
  return <ProductMock variant={topic.mock || 'dashboard'} className={className} />;
}

function DemoCta({ label = 'Book a Demo' }) {
  return (
    <RequestDemoButton className="inline-flex items-center rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover">
      {label}
    </RequestDemoButton>
  );
}

function BottomBand({ title, text }) {
  return (
    <Shell className="pb-16 pt-2">
      <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-[#0b3d91] px-6 py-8 text-white sm:flex-row sm:items-center sm:px-10">
        <div className="max-w-2xl">
          <p className="text-lg font-bold">{title}</p>
          <p className="mt-1 text-sm text-white/75">{text}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            to={ROUTES.LOGIN}
            className="rounded-lg border border-white/30 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
          >
            Free Register
          </Link>
          <RequestDemoButton className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-primary hover:bg-slate-100">
            Request a Demo
          </RequestDemoButton>
        </div>
      </div>
    </Shell>
  );
}

/* ---------- Layout: feature grid ---------- */
function LayoutFeatureGrid({ topic, copy, theme }) {
  return (
    <>
      <Shell className="bg-white pb-8 pt-14">
        <div className="max-w-3xl">
          <p className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${theme.badge}`}>
            {topic.eyebrow}
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">{topic.headline}</h1>
          <p className="mt-5 text-[16px] leading-relaxed text-slate-600">{topic.summary}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <DemoCta />
            <Link to={topic.categoryPath} className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Back to Product
            </Link>
          </div>
        </div>
      </Shell>

      <Shell className="bg-[#f8fafc] py-14">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Platform capabilities</h2>
            <p className="mt-2 max-w-xl text-sm text-slate-500">{copy.intro[0]}</p>
          </div>
          <Visual topic={topic} className="hidden w-full max-w-sm lg:block" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {copy.items.map((item, i) => {
            const { title, text } = splitItem(item);
            const Icon = ICONS[i % ICONS.length];
            const moreTo = FEATURE_READ_MORE[title];
            return (
              <div key={title} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon size={18} />
                </span>
                <h3 className="mt-4 text-sm font-bold text-slate-900">{title}</h3>
                <p className="mt-2 flex-1 text-[12px] leading-relaxed text-slate-500">{text}</p>
                {moreTo ? (
                  <Link
                    to={moreTo}
                    className="mt-4 inline-flex text-sm font-semibold text-primary hover:text-primary-hover"
                  >
                    Read more
                  </Link>
                ) : null}
              </div>
            );
          })}
        </div>
      </Shell>
      <BottomBand title="Want these features in your agency?" text="Book a walkthrough and see the full Caretraqer suite." />
    </>
  );
}

/* ---------- Layout: pricing ---------- */
function LayoutPricing({ topic, copy, theme }) {
  return (
    <>
      <Shell className={`${theme.soft} py-16 text-center`}>
        <p className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${theme.badge}`}>
          {topic.eyebrow}
        </p>
        <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          {topic.headline}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-[15px] text-slate-600">{topic.summary}</p>
        <div className="mt-8 flex justify-center gap-3">
          <DemoCta label="Talk to sales" />
        </div>
      </Shell>

      <Shell className="bg-white py-14">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {PRICING_PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`flex flex-col overflow-hidden rounded-2xl bg-white ${
                plan.popular ? 'border-2 border-primary shadow-lg' : 'border border-slate-200 shadow-sm'
              }`}
            >
              {plan.popular ? (
                <div className="bg-primary py-1.5 text-center text-[11px] font-bold uppercase text-white">Most Popular</div>
              ) : null}
              <div className="flex flex-1 flex-col p-5">
                <p className="text-[15px] font-bold text-primary">{plan.name}</p>
                <p className="mt-1 text-[12px] text-slate-500">{plan.blurb}</p>
                <div className="mt-4 flex items-end gap-1">
                  <span className="text-[2rem] font-bold text-slate-900">{plan.price}</span>
                  {plan.period ? <span className="pb-1 text-[12px] text-slate-500">{plan.period}</span> : null}
                </div>
                <ul className="mt-5 space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex gap-2 text-[12px] text-slate-600">
                      <Check size={14} className="mt-0.5 shrink-0 text-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
                <RequestDemoButton
                  className={`mt-6 rounded-lg px-4 py-2.5 text-sm font-semibold ${
                    plan.popular ? 'bg-primary text-white' : 'border border-primary text-primary'
                  }`}
                >
                  {plan.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
                </RequestDemoButton>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <h2 className="text-lg font-bold text-slate-900">What’s usually included</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {copy.items.map((item) => {
              const { title } = splitItem(item);
              return (
                <div key={title} className="flex items-center gap-2 text-sm text-slate-700">
                  <span className={`h-2 w-2 rounded-full ${theme.bar}`} />
                  {title}
                </div>
              );
            })}
          </div>
        </div>
      </Shell>
    </>
  );
}

/* ---------- Layout: demo walkthrough ---------- */
function LayoutDemoWalkthrough({ topic, copy }) {
  const steps = copy.items.length ? copy.items : copy.intro;
  return (
    <>
      <section className="bg-[#0b3d91] text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-white/70">{topic.eyebrow}</p>
            <h1 className="mt-3 text-4xl font-bold sm:text-5xl">{topic.headline}</h1>
            <p className="mt-5 text-[15px] text-white/80">{topic.summary}</p>
            <div className="mt-8">
              <RequestDemoButton className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-primary hover:bg-slate-100">
                Request a Demo
              </RequestDemoButton>
            </div>
          </div>
          <Visual topic={topic} />
        </div>
      </section>

      <Shell className="bg-white py-14">
        <h2 className="text-2xl font-bold text-slate-900">What you can explore in the demo</h2>
        <div className="mt-8 space-y-4">
          {steps.map((item, i) => {
            const { title, text } = splitItem(item);
            return (
              <div key={title} className="flex gap-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-bold text-slate-900">{title}</h3>
                  {text ? <p className="mt-1 text-sm text-slate-600">{text}</p> : null}
                </div>
              </div>
            );
          })}
        </div>
      </Shell>

      <Shell className="pb-16">
        <div className="rounded-3xl border border-primary/20 bg-primary/5 px-6 py-10 text-center sm:px-10">
          <h2 className="text-2xl font-bold text-slate-900">Book your personalized demo today</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-600">
            {copy.closing[0] || 'Our team will walk you through the platform and answer questions for your agency.'}
          </p>
          <div className="mt-6">
            <DemoCta label="Request a Demo" />
          </div>
        </div>
      </Shell>
    </>
  );
}

/* ---------- Layout: intake steps ---------- */
function LayoutIntakeSteps({ topic, copy, theme }) {
  const steps = ['Personal Info', 'Care Needs', 'Documents', 'Review', 'Active'];
  return (
    <>
      <Shell className="bg-gradient-to-b from-[#eef6ff] to-white py-14">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase ${theme.badge}`}>{topic.eyebrow}</p>
            <h1 className="mt-4 text-4xl font-bold text-slate-900">{topic.headline}</h1>
            <p className="mt-4 text-[15px] text-slate-600">{topic.summary}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <DemoCta />
              <Link to={topic.categoryPath} className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700">
                Back to CRM
              </Link>
            </div>
          </div>
          <Visual topic={topic} />
        </div>

        <div className="mt-12 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-bold text-slate-900">Intake progress</p>
          <div className="mt-5 grid grid-cols-5 gap-2">
            {steps.map((step, i) => (
              <div key={step} className="text-center">
                <span className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                  i < 2 ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'
                }`}
                >
                  {i + 1}
                </span>
                <p className="mt-2 text-[10px] font-medium text-slate-500">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </Shell>

      <Shell className="bg-white py-14">
        <h2 className="text-2xl font-bold text-slate-900">What intake covers</h2>
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {copy.items.map((item) => {
            const { title, text } = splitItem(item);
            return (
              <div key={title} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
                <p className="font-semibold text-slate-900">{title}</p>
                <p className="mt-1 text-sm text-slate-600">{text}</p>
              </div>
            );
          })}
        </div>
      </Shell>
      <BottomBand title="Ready to simplify client onboarding?" text="See how intake flows into care plans and scheduling." />
    </>
  );
}

/* ---------- Layout: zigzag ---------- */
function LayoutZigzag({ topic, copy, theme }) {
  const rows = copy.items.slice(0, 6);
  return (
    <>
      <Shell className={`${theme.soft} py-14`}>
        <p className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase ${theme.badge}`}>{topic.eyebrow}</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-bold text-slate-900">{topic.headline}</h1>
        <p className="mt-4 max-w-2xl text-[15px] text-slate-600">{topic.summary}</p>
        <div className="mt-7"><DemoCta /></div>
      </Shell>

      {rows.map((item, i) => {
        const { title, text } = splitItem(item);
        const reverse = i % 2 === 1;
        return (
          <Shell key={title} className={`py-12 ${reverse ? 'bg-white' : 'bg-[#f8fafc]'}`}>
            <div className={`grid items-center gap-8 lg:grid-cols-2 ${reverse ? '' : ''}`}>
              <div className={reverse ? 'lg:order-2' : ''}>
                <p className="text-xs font-bold uppercase tracking-wide text-primary">0{i + 1}</p>
                <h2 className="mt-2 text-2xl font-bold text-slate-900">{title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{text || copy.intro[0]}</p>
              </div>
              <div className={reverse ? 'lg:order-1' : ''}>
                {i === 0 ? <Visual topic={topic} /> : <ProductMock variant={i % 2 ? 'table' : 'dashboard'} />}
              </div>
            </div>
          </Shell>
        );
      })}
      <BottomBand title="Grow your pipeline with Caretraqer CRM" text="Track sources, campaigns, and conversions in one place." />
    </>
  );
}

/* ---------- Layout: messaging ---------- */
function LayoutMessaging({ topic, copy, theme }) {
  return (
    <>
      <Shell className="bg-white py-14">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase ${theme.badge}`}>{topic.eyebrow}</p>
            <h1 className="mt-4 text-4xl font-bold text-slate-900">{topic.headline}</h1>
            <p className="mt-4 text-[15px] text-slate-600">{topic.summary}</p>
            <div className="mt-6 space-y-3">
              {['Email updates', 'SMS reminders', 'Team announcements'].map((label) => (
                <div key={label} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700">
                  <Mail size={14} className="text-primary" />
                  {label}
                </div>
              ))}
            </div>
            <div className="mt-7"><DemoCta /></div>
          </div>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
            <div className="border-b border-slate-100 px-4 py-3 text-sm font-semibold">Inbox preview</div>
            <div className="divide-y divide-slate-100">
              {[
                ['Visit reminder', 'Tomorrow 9:00 AM with Mary Johnson', 'SMS'],
                ['Care plan update', 'Shared with family portal', 'Email'],
                ['Schedule change', 'Caregiver reassigned for Friday', 'SMS'],
                ['Welcome message', 'New client onboarding packet', 'Email'],
              ].map(([title, body, channel]) => (
                <div key={title} className="flex items-start justify-between gap-3 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{title}</p>
                    <p className="text-xs text-slate-500">{body}</p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${theme.badge}`}>{channel}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Shell>

      <Shell className={`${theme.soft} py-12`}>
        <h2 className="text-2xl font-bold text-slate-900">Messaging capabilities</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {copy.items.map((item) => {
            const { title, text } = splitItem(item);
            return (
              <div key={title} className="rounded-xl border border-white bg-white p-4 shadow-sm">
                <p className="font-semibold text-slate-900">{title}</p>
                <p className="mt-1 text-sm text-slate-600">{text}</p>
              </div>
            );
          })}
        </div>
      </Shell>
    </>
  );
}

/* ---------- Layout: soft story ---------- */
function LayoutSoftStory({ topic, copy, theme }) {
  return (
    <>
      <Shell className="bg-gradient-to-b from-[#f5f7fb] to-white py-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase ${theme.badge}`}>{topic.eyebrow}</p>
          <h1 className="mt-4 text-4xl font-bold text-slate-900 sm:text-5xl">{topic.headline}</h1>
          <p className="mt-5 text-[16px] text-slate-600">{topic.summary}</p>
          <div className="mt-8 flex justify-center gap-3">
            <DemoCta />
          </div>
        </div>
      </Shell>

      <Shell className="bg-white py-14">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div className="rounded-3xl border border-[#dbe7ff] bg-[#eff6ff] p-8">
            <p className="text-lg font-semibold leading-relaxed text-slate-800">
              “{copy.intro[0] || topic.summary}”
            </p>
            <p className="mt-4 text-sm font-medium text-primary">— Built for patients, families, and care teams</p>
          </div>
          <Visual topic={topic} />
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {copy.items.slice(0, 6).map((item) => {
            const { title, text } = splitItem(item);
            return (
              <div key={title} className="rounded-2xl border border-slate-200 p-5">
                <HeartHandshake size={18} className="text-primary" />
                <h3 className="mt-3 font-bold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm text-slate-600">{text}</p>
              </div>
            );
          })}
        </div>
      </Shell>
    </>
  );
}

/* ---------- Layout: analytics board ---------- */
function LayoutAnalyticsBoard({ topic, copy, theme }) {
  const kpis = [
    { label: 'Open Leads', value: '48', tone: 'text-primary' },
    { label: 'Converted', value: '19', tone: 'text-primary' },
    { label: 'Visits Verified', value: '96%', tone: 'text-[#0b3d91]' },
    { label: 'Missed Visits', value: '3', tone: 'text-[#0b3d91]' },
  ];
  return (
    <>
      <Shell className="bg-[#0b3d91] py-14 text-white">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-white/70">{topic.eyebrow}</p>
            <h1 className="mt-3 max-w-2xl text-4xl font-bold">{topic.headline}</h1>
            <p className="mt-4 max-w-xl text-sm text-slate-300">{topic.summary}</p>
          </div>
          <DemoCta />
        </div>
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map((kpi) => (
            <div key={kpi.label} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
              <p className="text-[11px] text-slate-400">{kpi.label}</p>
              <p className={`mt-2 text-3xl font-bold ${kpi.tone}`}>{kpi.value}</p>
            </div>
          ))}
        </div>
      </Shell>

      <Shell className="bg-white py-14">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 p-5">
            <p className="text-sm font-bold text-slate-900">Report types</p>
            <div className="mt-4 space-y-3">
              {copy.items.map((item) => {
                const { title, text } = splitItem(item);
                return (
                  <div key={title} className="rounded-xl bg-slate-50 px-4 py-3">
                    <p className="font-semibold text-slate-900">{title}</p>
                    <p className="mt-1 text-xs text-slate-500">{text}</p>
                  </div>
                );
              })}
            </div>
          </div>
          <Visual topic={topic} />
        </div>
      </Shell>
      <BottomBand title="Turn operations into clear insights" text="Explore analytics built for home care agencies." />
    </>
  );
}

/* ---------- Layout: alternating rows (EVV style) ---------- */
function LayoutAlternatingRows({ topic, copy }) {
  const rows = copy.items.slice(0, 5);
  return (
    <>
      <Shell className="bg-white pb-8 pt-14">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">{topic.headline}</h1>
            <p className="mt-4 text-[15px] text-slate-600">{topic.summary}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <DemoCta />
              <Link to={topic.categoryPath} className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
                Explore EVV <ArrowRight size={16} />
              </Link>
            </div>
          </div>
          <Visual topic={topic} />
        </div>
      </Shell>

      {rows.map((item, i) => {
        const { title, text } = splitItem(item);
        const reverse = i % 2 === 1;
        return (
          <Shell key={title} className={`py-12 ${reverse ? 'bg-[#f7f9fc]' : 'bg-white'}`}>
            <div className="grid items-center gap-10 lg:grid-cols-2">
              <div className={reverse ? 'lg:order-2' : ''}>
                <h2 className="text-3xl font-bold text-slate-900">{title}</h2>
                <p className="mt-4 text-[15px] leading-relaxed text-slate-600">{text || copy.intro[0]}</p>
              </div>
              <div className={reverse ? 'lg:order-1' : ''}>
                {i === 0 ? (
                  <Visual topic={topic} />
                ) : (
                  <ProductMock variant={['map', 'table', 'form', 'calendar'][i % 4]} />
                )}
              </div>
            </div>
          </Shell>
        );
      })}
      <BottomBand title="Stay compliant. Deliver better care." text="See how Caretraqer EVV supports accurate visit records." />
    </>
  );
}

/* ---------- Layout: notes workspace ---------- */
function LayoutNotesWorkspace({ topic, copy, theme }) {
  return (
    <>
      <Shell className="bg-[#f5f7fb] py-14">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
            <div className="border-b border-slate-100 px-4 py-3 text-sm font-semibold">Care note editor</div>
            <div className="space-y-3 p-4">
              {['Client condition', 'Tasks completed', 'Family update', 'Follow-up needed'].map((label) => (
                <div key={label}>
                  <p className="mb-1 text-xs font-medium text-slate-500">{label}</p>
                  <div className="h-10 rounded-lg border border-slate-200 bg-slate-50" />
                </div>
              ))}
              <div className="h-20 rounded-lg border border-dashed border-primary/30 bg-[#eff6ff]" />
            </div>
          </div>
          <div>
            <p className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase ${theme.badge}`}>{topic.eyebrow}</p>
            <h1 className="mt-4 text-4xl font-bold text-slate-900">{topic.headline}</h1>
            <p className="mt-4 text-[15px] text-slate-600">{topic.summary}</p>
            <ul className="mt-6 space-y-2">
              {copy.items.slice(0, 5).map((item) => {
                const { title } = splitItem(item);
                return (
                  <li key={title} className="flex items-center gap-2 text-sm text-slate-700">
                    <Check size={14} className="text-primary" />
                    {title}
                  </li>
                );
              })}
            </ul>
            <div className="mt-7"><DemoCta /></div>
          </div>
        </div>
      </Shell>

      <Shell className="bg-white py-12">
        <h2 className="text-2xl font-bold text-slate-900">Why digital care notes matter</h2>
        <p className="mt-3 max-w-3xl text-sm text-slate-600">{copy.intro[0]}</p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {copy.items.slice(0, 3).map((item) => {
            const { title, text } = splitItem(item);
            return (
              <div key={title} className="rounded-xl border border-slate-200 p-4">
                <p className="font-semibold text-slate-900">{title}</p>
                <p className="mt-2 text-sm text-slate-600">{text}</p>
              </div>
            );
          })}
        </div>
      </Shell>
    </>
  );
}

/* ---------- Layout: alerts feed ---------- */
function LayoutAlertsFeed({ topic, copy, theme }) {
  const alerts = [
    { title: 'Missed check-in', detail: 'Visit with Robert Chen · Expected 08:00', tone: 'bg-[#eff6ff] text-primary' },
    { title: 'Late arrival', detail: 'Caregiver Aisha Khan · 18 minutes late', tone: 'bg-[#eff6ff] text-[#0b3d91]' },
    { title: 'Incomplete checkout', detail: 'Visit still open after scheduled end', tone: 'bg-[#eff6ff] text-[#0b3d91]' },
    { title: 'Follow-up needed', detail: 'Admin review requested for exception', tone: 'bg-[#eff6ff] text-primary' },
  ];
  return (
    <>
      <Shell className="bg-white py-14">
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <p className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase ${theme.badge}`}>{topic.eyebrow}</p>
            <h1 className="mt-4 text-4xl font-bold text-slate-900">{topic.headline}</h1>
            <p className="mt-4 text-[15px] text-slate-600">{topic.summary}</p>
            <div className="mt-7"><DemoCta /></div>
          </div>
          <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <p className="text-sm font-semibold">Alert center</p>
              <span className="rounded-full bg-[#eff6ff] px-2 py-0.5 text-[10px] font-bold text-primary">4 open</span>
            </div>
            <div className="divide-y divide-slate-100">
              {alerts.map((alert) => (
                <div key={alert.title} className="flex items-start justify-between gap-3 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{alert.title}</p>
                    <p className="text-xs text-slate-500">{alert.detail}</p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${alert.tone}`}>Action</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Shell>

      <Shell className={`${theme.soft} py-12`}>
        <h2 className="text-2xl font-bold text-slate-900">How alerts help your team</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {copy.items.map((item) => {
            const { title, text } = splitItem(item);
            return (
              <div key={title} className="rounded-xl border border-white bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <Bell size={16} className="text-primary" />
                  <p className="font-semibold text-slate-900">{title}</p>
                </div>
                <p className="mt-2 text-sm text-slate-600">{text}</p>
              </div>
            );
          })}
        </div>
      </Shell>
    </>
  );
}

/* ---------- Layout: live ops ---------- */
function LayoutLiveOps({ topic, copy, theme }) {
  return (
    <>
      <Shell className="bg-[#f5f7fb] py-14">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase ${theme.badge}`}>{topic.eyebrow}</p>
            <h1 className="mt-4 text-4xl font-bold text-slate-900">{topic.headline}</h1>
            <p className="mt-4 max-w-2xl text-[15px] text-slate-600">{topic.summary}</p>
          </div>
          <DemoCta />
        </div>
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <ProductMock variant="map" />
          <div className="space-y-3">
            {[
              ['In progress', '12 visits', 'bg-[#eff6ff] text-primary'],
              ['Completed', '28 visits', 'bg-[#eff6ff] text-[#0b3d91]'],
              ['Pending', '7 visits', 'bg-slate-100 text-slate-700'],
              ['Exceptions', '2 visits', 'bg-[#eff6ff] text-primary'],
            ].map(([label, value, tone]) => (
              <div key={label} className="rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-slate-900">{label}</p>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${tone}`}>{value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Shell>

      <Shell className="bg-white py-12">
        <h2 className="text-2xl font-bold text-slate-900">Operational visibility</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {copy.items.map((item, i) => {
            const { title, text } = splitItem(item);
            const Icon = ICONS[i % ICONS.length];
            return (
              <div key={title} className="rounded-xl border border-slate-200 p-4">
                <Icon size={16} className="text-primary" />
                <p className="mt-3 font-semibold text-slate-900">{title}</p>
                <p className="mt-1 text-sm text-slate-600">{text}</p>
              </div>
            );
          })}
        </div>
      </Shell>
    </>
  );
}

const LAYOUTS = {
  featureGrid: LayoutFeatureGrid,
  pricing: LayoutPricing,
  demoWalkthrough: LayoutDemoWalkthrough,
  intakeSteps: LayoutIntakeSteps,
  zigzag: LayoutZigzag,
  messaging: LayoutMessaging,
  softStory: LayoutSoftStory,
  analyticsBoard: LayoutAnalyticsBoard,
  alternatingRows: LayoutAlternatingRows,
  notesWorkspace: LayoutNotesWorkspace,
  alertsFeed: LayoutAlertsFeed,
  liveOps: LayoutLiveOps,
};

export default function FooterTopicPage() {
  const { pathname } = useLocation();
  const topic = findFooterTopicPage(pathname);
  const copy = useMemo(() => (topic ? splitFooterCopy(topic.contentKey) : null), [topic]);

  useEffect(() => {
    if (!topic) return undefined;
    const previous = document.title;
    document.title = `${topic.shortLabel} | Caretraqer`;
    return () => {
      document.title = previous;
    };
  }, [topic]);

  if (!topic || !copy) {
    return (
      <div className="bg-white px-4 py-24 text-center">
        <h1 className="text-3xl font-bold text-slate-900">Page not found</h1>
        <Link to={ROUTES.HOME} className="mt-6 inline-flex text-sm font-semibold text-primary">
          Back to Caretraqer
        </Link>
      </div>
    );
  }

  const Layout = LAYOUTS[topic.layout] || LayoutFeatureGrid;
  const theme = THEME[topic.theme] || THEME.sky;

  return (
    <div className="bg-white text-slate-900">
      <Layout topic={topic} copy={copy} theme={theme} />
    </div>
  );
}
