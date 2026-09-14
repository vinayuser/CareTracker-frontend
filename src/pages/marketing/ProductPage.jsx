import {
  CalendarDays,
  Check,
  Cloud,
  FileText,
  FolderHeart,
  Presentation,
  Receipt,
  ShieldCheck,
  UserPlus,
} from 'lucide-react';

const OVERVIEW_STATS = [
  { label: 'Agencies', value: '128', trend: '+16% this month' },
  { label: 'Clients', value: '2,486', trend: '+22% this month' },
  { label: 'Caregivers', value: '1,724', trend: '+18% this month' },
  { label: 'EVV Compliance', value: '96%', trend: '+8% this month' },
];

const SNAPSHOT = ['All-in-one platform', 'Secure & compliant', 'Easy to use', 'Built for growth'];

const FEATURES = [
  {
    icon: UserPlus,
    title: 'Client Management',
    text: 'Complete client profiles, care plans, and history in one place.',
  },
  {
    icon: FolderHeart,
    title: 'Caregiver Management',
    text: 'Credentials, assignments, and workforce records made simple.',
  },
  {
    icon: ShieldCheck,
    title: 'EVV & Compliance',
    text: 'Visit verification, alerts, and audit-ready documentation.',
  },
  {
    icon: Cloud,
    title: 'CRM',
    text: 'Lead tracking, intake, and agency growth tools together.',
  },
  {
    icon: FileText,
    title: 'Digital Documentation',
    text: 'Secure forms, e-signatures, and paperless workflows.',
  },
  {
    icon: CalendarDays,
    title: 'Scheduling',
    text: 'Visit calendars, shifts, and caregiver coordination.',
  },
  {
    icon: Receipt,
    title: 'Billing & Invoicing',
    text: 'Claims, invoices, and revenue tracking that stay connected.',
  },
  {
    icon: Presentation,
    title: 'Reports & Analytics',
    text: 'Dashboards and insights to manage performance with clarity.',
  },
];

const PLANS = [
  {
    name: 'Starter',
    blurb: 'Ideal for small agencies',
    price: '$99',
    period: '/month',
    note: 'Billed annually',
    features: ['Up to 50 Clients', 'Up to 25 Caregivers', 'Core EVV', 'Basic Reports', 'Email Support'],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Growth',
    blurb: 'Perfect for growing agencies',
    price: '$199',
    period: '/month',
    note: 'Billed annually',
    features: [
      'Up to 200 Clients',
      'Up to 100 Caregivers',
      'Full EVV Suite',
      'CRM & Marketing Tools',
      'Advanced Reports',
      'Priority Support',
      'Document Library',
    ],
    cta: 'Get Started',
    popular: true,
  },
  {
    name: 'Pro',
    blurb: 'For large agencies',
    price: '$349',
    period: '/month',
    note: 'Billed annually',
    features: [
      'Unlimited Clients',
      'Unlimited Caregivers',
      'Full EVV + Alerts',
      'CRM & Automation',
      'Custom Reports',
      'API Access',
      'Dedicated Support',
      'Training Included',
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Enterprise',
    blurb: 'Custom solutions for enterprise agencies',
    price: 'Custom',
    period: '',
    note: 'Talk to our team for custom pricing.',
    features: [
      'Multi-location Support',
      'Custom Integrations',
      'Advanced Security',
      'SLA & Onboarding',
      'Dedicated Success Manager',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

const UPDATES = [
  {
    date: 'May 20, 2024',
    tag: 'New',
    tagTone: 'bg-emerald-50 text-emerald-600',
    title: 'Advanced Reporting Dashboard',
    text: 'New customizable dashboards with deeper insights and filters.',
  },
  {
    date: 'May 10, 2024',
    tag: 'New',
    tagTone: 'bg-emerald-50 text-emerald-600',
    title: 'SMS Communication Enhancements',
    text: 'Improved SMS deliverability and message templates.',
  },
  {
    date: 'Apr 28, 2024',
    tag: 'Improvement',
    tagTone: 'bg-sky-50 text-sky-600',
    title: 'Faster Document Uploads',
    text: 'Bulk upload and drag-and-drop support for documents.',
  },
  {
    date: 'Apr 15, 2024',
    tag: 'New',
    tagTone: 'bg-emerald-50 text-emerald-600',
    title: 'Caregiver Mobile App Updates',
    text: 'New features for schedules, time tracking and alerts.',
  },
];

const ROADMAP = [
  {
    quarter: 'Q2 2024',
    items: ['Caregiver Mobile App 2.0', 'Enhanced Scheduling', 'Custom Report Builder'],
  },
  {
    quarter: 'Q3 2024',
    items: ['AI-Powered Insights', 'Automated Workflows', 'Client Portal'],
  },
  {
    quarter: 'Q4 2024',
    items: ['Advanced Analytics', 'Multi-Agency View', 'API Enhancements'],
  },
  {
    quarter: 'Q1 2025',
    items: ['Voice Assistant', 'Smart Notifications', 'Marketplace Integrations'],
  },
];

const CASES = [
  {
    name: 'Sunrise Home Care',
    text: 'Reduced admin time and improved EVV compliance across every location.',
    tone: 'bg-orange-100',
    stats: [
      { value: '40%', label: 'Time Saved' },
      { value: '28%', label: 'Growth' },
    ],
    image: 'Caregivers Talking',
  },
  {
    name: 'BrightPath Care Services',
    text: 'Streamlined onboarding and scheduling for a rapidly growing team.',
    tone: 'bg-emerald-100',
    stats: [
      { value: '55%', label: 'Faster Onboarding' },
      { value: '32%', label: 'Retention' },
    ],
    image: 'Smiling Caregiver',
  },
  {
    name: 'Compassion Home Care',
    text: 'Delivered better client outcomes with connected care documentation.',
    tone: 'bg-sky-100',
    stats: [
      { value: '96%', label: 'Compliance' },
      { value: '22%', label: 'Satisfaction' },
    ],
    image: 'Patient Support',
  },
];

function SectionLabel({ n }) {
  return (
    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-primary/40 text-[12px] font-bold text-primary">
      {n}
    </span>
  );
}

function SectionIntro({ n, title, subtitle, text, link, href = '#' }) {
  return (
    <div className="max-w-[260px] shrink-0">
      <SectionLabel n={n} />
      <h2 className="mt-3 text-[2rem] font-bold tracking-tight text-slate-900">{title}</h2>
      <p className="mt-1 text-[1.05rem] font-bold text-primary">{subtitle}</p>
      {text && <p className="mt-3 text-sm leading-relaxed text-slate-500">{text}</p>}
      {link && (
        <a href={href} className="mt-4 inline-block text-sm font-bold text-primary hover:underline">
          {link}
        </a>
      )}
    </div>
  );
}

export default function ProductPage() {
  return (
    <div className="bg-white text-slate-900">
      {/* Hero */}
      <section id="overview" className="scroll-mt-24 bg-gradient-to-b from-[#f5f7fb] to-white">
        <div className="mx-auto grid max-w-[1120px] gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-12 lg:px-8 lg:py-16">
          <div>
            <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-primary">Product</p>
            <h1 className="mt-3 text-[2.55rem] font-bold leading-[1.12] tracking-tight text-slate-900 sm:text-[3rem]">
              Built for Home Care.
              <br />
              <span className="text-primary">Designed for Impact.</span>
            </h1>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-slate-500">
              CareTraker brings every part of your home care operation together in one powerful
              platform—helping agencies deliver better care, stay compliant, and grow with confidence.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="#demo"
                className="inline-flex rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_-10px_rgba(37,99,235,0.7)] hover:bg-primary-hover"
              >
                Request a Demo
              </a>
              <a
                href="#features"
                className="inline-flex rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Explore Features
              </a>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_24px_50px_-28px_rgba(15,23,42,0.35)]">
            <div className="flex">
              <div className="w-1.5 shrink-0 bg-primary" />
              <div className="flex-1 p-5 sm:p-6">
                <h3 className="text-[15px] font-bold text-slate-800">Product Overview</h3>
                <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
                  {OVERVIEW_STATS.map((stat) => (
                    <div key={stat.label} className="rounded-xl bg-slate-50 px-3 py-3">
                      <p className="text-[11px] font-medium text-slate-500">{stat.label}</p>
                      <p className="mt-1 text-xl font-bold text-slate-900">{stat.value}</p>
                      <p className="mt-0.5 text-[11px] font-semibold text-emerald-500">{stat.trend}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-[12px] font-bold text-slate-800">Platform Snapshot</p>
                    <ul className="mt-3 space-y-2">
                      {SNAPSHOT.map((item) => (
                        <li key={item} className="flex items-center gap-2 text-[12px] text-slate-600">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex min-h-[120px] items-center justify-center rounded-xl bg-slate-100 text-[12px] font-medium text-slate-400">
                    Chart Placeholder
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="scroll-mt-24 border-t border-slate-100 bg-white py-16">
        <div className="mx-auto flex max-w-[1120px] flex-col gap-10 px-4 sm:px-6 lg:flex-row lg:gap-12 lg:px-8">
          <SectionIntro
            n="01"
            title="Features"
            subtitle="Everything you need. All in one place."
            text="CareTraker offers a complete suite of tools to manage your agency efficiently and deliver exceptional care."
            link="View All Features"
            href="#features"
          />
          <div className="grid flex-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_8px_20px_-16px_rgba(15,23,42,0.35)]"
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#eff6ff] text-primary">
                  <Icon size={18} strokeWidth={1.85} />
                </span>
                <h3 className="mt-3 text-[14px] font-bold text-slate-900">{title}</h3>
                <p className="mt-1.5 text-[12px] leading-relaxed text-slate-500">{text}</p>
                <a href="#features" className="mt-3 inline-block text-[12px] font-semibold text-primary hover:underline">
                  Learn more →
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="scroll-mt-24 bg-[#f8fafc] py-16">
        <div className="mx-auto flex max-w-[1120px] flex-col gap-10 px-4 sm:px-6 lg:flex-row lg:gap-10 lg:px-8">
          <SectionIntro
            n="02"
            title="Pricing"
            subtitle="Simple. Transparent. Scalable."
            text="Choose the plan that fits your agency's needs. Upgrade or downgrade anytime."
            link="Compare Plans"
            href="#pricing"
          />
          <div className="grid flex-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_12px_30px_-20px_rgba(15,23,42,0.35)] ${
                  plan.popular ? 'border-2 border-primary' : 'border border-slate-200'
                }`}
              >
                {plan.popular && (
                  <div className="bg-primary py-1.5 text-center text-[11px] font-bold uppercase tracking-wide text-white">
                    Most Popular
                  </div>
                )}
                <div className="flex flex-1 flex-col p-5">
                  <p className="text-[15px] font-bold text-primary">{plan.name}</p>
                  <p className="mt-1 text-[12px] text-slate-500">{plan.blurb}</p>
                  <div className="mt-4 flex items-end gap-1">
                    <span className="text-[2rem] font-bold leading-none text-slate-900">{plan.price}</span>
                    {plan.period && <span className="pb-1 text-[12px] text-slate-500">{plan.period}</span>}
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400">{plan.note}</p>
                  <ul className="mt-5 space-y-2.5">
                    {plan.features.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-[12px] text-slate-600">
                        <Check size={14} className="mt-0.5 shrink-0 text-primary" strokeWidth={2.5} />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <a
                    href="#demo"
                    className={`mt-6 inline-flex w-full items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold ${
                      plan.popular
                        ? 'bg-primary text-white shadow-sm shadow-primary/30 hover:bg-primary-hover'
                        : 'border border-primary text-primary hover:bg-primary/5'
                    }`}
                  >
                    {plan.cta}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="mt-8 text-center text-[12px] text-slate-400">Secure • Compliant • HIPAA Ready</p>
      </section>

      {/* What's New */}
      <section id="whats-new" className="scroll-mt-24 bg-white py-16">
        <div className="mx-auto flex max-w-[1120px] flex-col gap-10 px-4 sm:px-6 lg:flex-row lg:gap-12 lg:px-8">
          <SectionIntro
            n="03"
            title="What's New"
            subtitle="Latest updates and enhancements."
            text="We're always working to make CareTraker better and more powerful for your agency."
            link="View All Updates"
            href="#whats-new"
          />
          <div className="grid flex-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {UPDATES.map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_8px_20px_-16px_rgba(15,23,42,0.35)]"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-400">{item.date}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${item.tagTone}`}>{item.tag}</span>
                </div>
                <h3 className="mt-3 text-[14px] font-bold leading-snug text-slate-900">{item.title}</h3>
                <p className="mt-2 text-[12px] leading-relaxed text-slate-500">{item.text}</p>
                <a href="#whats-new" className="mt-4 inline-block text-[12px] font-semibold text-primary hover:underline">
                  Read More →
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section id="roadmap" className="scroll-mt-24 bg-[#f8fafc] py-16">
        <div className="mx-auto flex max-w-[1120px] flex-col gap-10 px-4 sm:px-6 lg:flex-row lg:items-start lg:gap-14 lg:px-8">
          <div className="w-full max-w-[220px] shrink-0">
            <SectionLabel n="04" />
            <h2 className="mt-3 text-[2rem] font-bold tracking-tight text-slate-900">Roadmap</h2>
            <p className="mt-1 text-[1.05rem] font-bold text-primary">What&apos;s coming next.</p>
            <p className="mt-3 text-sm leading-relaxed text-slate-500">
              Here&apos;s a look at what our team is building for the future.
            </p>
            <a href="#roadmap" className="mt-4 inline-block text-sm font-bold text-primary hover:underline">
              View Full Roadmap
            </a>
          </div>

          <div className="min-w-0 flex-1 lg:pt-[52px]">
            {/* Timeline track */}
            <div className="relative mb-5 hidden h-3 lg:block">
              <div className="absolute left-[6px] top-1/2 w-[calc(75%)] -translate-y-1/2 border-t border-dashed border-slate-300" />
              <div className="absolute inset-0 grid grid-cols-4">
                {ROADMAP.map((col) => (
                  <div key={`dot-${col.quarter}`} className="flex items-center">
                    <span className="relative z-10 block h-3 w-3 rounded-full bg-primary shadow-[0_0_0_4px_#f8fafc]" />
                  </div>
                ))}
              </div>
            </div>

            {/* Quarter columns under the dots */}
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {ROADMAP.map((col) => (
                <div key={col.quarter} className="min-w-0">
                  <span className="mb-4 block h-3 w-3 rounded-full bg-primary lg:hidden" />
                  <p className="text-[13px] font-bold text-slate-900">{col.quarter}</p>
                  <ul className="mt-3 space-y-2">
                    {col.items.map((item) => (
                      <li key={item} className="text-[12px] leading-snug text-slate-500">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Case Studies */}
      <section id="case-studies" className="scroll-mt-24 bg-white py-16">
        <div className="mx-auto flex max-w-[1120px] flex-col gap-10 px-4 sm:px-6 lg:flex-row lg:gap-10 lg:px-8">
          <SectionIntro
            n="05"
            title="Case Studies"
            subtitle="Real stories. Real impact."
            text="See how agencies are using CareTraker to transform their operations, grow and deliver better care."
            link="View All Case Studies"
            href="#case-studies"
          />
          <div className="grid flex-1 gap-4 md:grid-cols-3">
            {CASES.map((item) => (
              <div
                key={item.name}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_28px_-20px_rgba(15,23,42,0.35)]"
              >
                <div className="p-5">
                  <span className={`inline-block h-8 w-8 rounded-lg ${item.tone}`} />
                  <h3 className="mt-3 text-[15px] font-bold text-slate-900">{item.name}</h3>
                  <p className="mt-2 text-[12px] leading-relaxed text-slate-500">{item.text}</p>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    {item.stats.map((stat) => (
                      <div key={stat.label}>
                        <p className="text-lg font-bold text-primary">{stat.value}</p>
                        <p className="text-[11px] text-slate-400">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                  <a
                    href="#case-studies"
                    className="mt-4 inline-block text-[12px] font-semibold text-primary hover:underline"
                  >
                    Read Full Story →
                  </a>
                </div>
                <div className="flex h-28 items-center justify-center bg-slate-100 text-[12px] font-medium text-slate-400">
                  {item.image}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="demo" className="scroll-mt-24 bg-white pb-16 pt-4">
        <div className="mx-auto max-w-[1120px] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 rounded-2xl bg-gradient-to-br from-[#2dd4bf] via-[#3b82f6] to-[#2563eb] px-6 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <div className="max-w-xl">
              <h2 className="text-[1.65rem] font-bold tracking-tight text-white">Ready to Transform Your Agency?</h2>
              <p className="mt-2 text-sm leading-relaxed text-white/90">
                Let our team show you how CareTraker can simplify your operations and improve care outcomes.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-3">
              <a
                href={`mailto:support@caretraker.com?subject=${encodeURIComponent('Request a Demo')}`}
                className="inline-flex rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-primary hover:bg-slate-50"
              >
                Request a Demo
              </a>
              <a
                href="mailto:info@caretraker.com"
                className="inline-flex rounded-lg border border-white/70 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
              >
                Talk to Sales
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
