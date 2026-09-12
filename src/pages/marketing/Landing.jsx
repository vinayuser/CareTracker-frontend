import { Link } from 'react-router-dom';
import {
  Building2,
  CalendarDays,
  CloudCheck,
  FileCheck2,
  FileText,
  HandHeart,
  Monitor,
  Receipt,
  Search,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Umbrella,
  UserPlus,
  UserRound,
  Users,
  PenLine,
  Bell,
  BedDouble,
} from 'lucide-react';
import ProductShot from '../../components/marketing/ProductShot';
import { ROUTES } from '../../routes/routes';

const SHOTS = {
  dashboard: '/marketing/agency-dashboard.png',
  assessments: '/marketing/assessments.png',
  evv: '/marketing/evv-dashboard.png',
};

const HERO_CARDS = [
  { icon: FileText, label: 'Complete Agency Management' },
  { icon: ShieldCheck, label: 'EVV & Compliance' },
  { icon: Users, label: 'Caregiver & Client Management' },
  { icon: FileCheck2, label: 'Secure Digital Documentation' },
];

const PILLARS = [
  {
    icon: Building2,
    title: 'Agency Management',
    text: 'Manage your entire agency from one central place.',
  },
  {
    icon: HandHeart,
    title: 'Care Management',
    text: 'Coordinate caregivers, clients, and care delivery seamlessly.',
  },
  {
    icon: ShieldCheck,
    title: 'Compliance',
    text: 'Stay audit-ready with EVV and regulatory controls.',
  },
  {
    icon: Receipt,
    title: 'Billing & Subscriptions',
    text: 'Keep billing, claims, and subscriptions organized.',
  },
];

const FEATURES = [
  {
    icon: UserRound,
    title: 'Client Management',
    text: 'Manage client profiles, care information, documents, and service history in one place.',
  },
  {
    icon: FileCheck2,
    title: 'Client Assessments',
    text: 'Create structured assessments, capture signatures, and maintain complete digital records.',
  },
  {
    icon: ShieldCheck,
    title: 'EVV',
    text: 'Track visits, caregiver activity, schedules, and service verification with streamlined EVV.',
  },
  {
    icon: Umbrella,
    title: 'Insurance Intake',
    text: 'Collect insurance information and organize required intake documentation.',
  },
  {
    icon: HandHeart,
    title: 'Caregiver Management',
    text: 'Manage caregiver profiles, credentials, assignments, and ongoing records with ease.',
  },
  {
    icon: BedDouble,
    title: 'Caregiver Onboarding',
    text: 'Simplify onboarding with digital forms, document collection, and e-signatures.',
  },
  {
    icon: FileText,
    title: 'Digital Documentation',
    text: 'Replace paper-heavy workflows with secure digital forms and documents.',
  },
  {
    icon: PenLine,
    title: 'E-Signatures',
    text: 'Collect valid digital signatures from clients, caregivers, and team members.',
  },
];

const STEPS = [
  {
    n: '01',
    icon: Building2,
    title: 'Set Up Your Agency',
    text: 'Create your agency profile, configure settings, and invite your team.',
  },
  {
    n: '02',
    icon: UserPlus,
    title: 'Onboard Caregivers',
    text: 'Collect applications, credentials, required documents, and e-signatures.',
  },
  {
    n: '03',
    icon: Settings2,
    title: 'Manage Clients',
    text: 'Complete intake, assessments, insurance information, and care documentation.',
  },
  {
    n: '04',
    icon: CalendarDays,
    title: 'Coordinate Care',
    text: 'Manage caregivers, schedules, visits, and ongoing client activities.',
  },
  {
    n: '05',
    icon: Search,
    title: 'Monitor & Manage',
    text: 'Use dashboards, reports, alerts, and centralized records to stay in control.',
  },
];

const CLIENT_LEFT = [
  'Client profile & personal information',
  'Care assessments & care plans',
  'Insurance information',
  'Documents & e-signatures',
];

const CLIENT_RIGHT = [
  'Emergency contacts',
  'Service history',
  'Caregiver assignments',
  'Notes & communications',
];

function Section({ id, className = '', children }) {
  return (
    <section id={id} className={`scroll-mt-24 ${className}`}>
      <div className="mx-auto max-w-[1120px] px-4 sm:px-6 lg:px-8">{children}</div>
    </section>
  );
}

function IconCircle({ icon: Icon, className = '' }) {
  return (
    <span
      className={`inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#e8f1ff] text-primary ${className}`}
    >
      <Icon size={24} strokeWidth={1.75} />
    </span>
  );
}

function IconTile({ icon: Icon }) {
  return (
    <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#e8f1ff] text-primary">
      <Icon size={20} strokeWidth={1.75} />
    </span>
  );
}

export default function Landing() {
  const evvItems = [
    { icon: ShieldCheck, label: 'Electronic Visit Verification (EVV)' },
    { icon: SlidersHorizontal, label: 'Visit Tracking' },
    { icon: CalendarDays, label: 'Time & Attendance' },
    { icon: CloudCheck, label: 'Service Verification' },
    { icon: Monitor, label: 'Compliance Monitoring' },
    { icon: Bell, label: 'Administrative Alerts' },
  ];

  return (
    <div className="bg-[#fbfcfe] text-slate-900">
      {/* Hero */}
      <Section id="platform" className="bg-[#fbfcfe] pb-8 pt-12 lg:pt-14">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
          <div>
            <p className="text-[13px] font-semibold tracking-wide text-primary">
              Home Care Management Platform
            </p>
            <h1 className="mt-3 text-[2.35rem] font-bold leading-[1.12] tracking-tight text-slate-900 sm:text-[2.85rem]">
              Empowering better care, one agency at a time.
            </h1>
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-slate-500">
              CareTraker gives home care organizations a powerful platform to manage clients,
              caregivers, compliance, billing, onboarding, and day-to-day operations—all from one
              secure system.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#demo"
                className="inline-flex rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-primary/25 hover:bg-primary-hover"
              >
                Request a Demo
              </a>
              <Link
                to={ROUTES.MARKETING_EVV}
                className="inline-flex rounded-lg border border-[#c9daf8] bg-white px-5 py-2.5 text-sm font-semibold text-primary hover:bg-primary/5"
              >
                Explore Platform
              </Link>
            </div>
          </div>
          <ProductShot
            src={SHOTS.dashboard}
            alt="CareTraker agency dashboard"
            className="shadow-[0_25px_60px_-20px_rgba(15,23,42,0.4)]"
          />
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {HERO_CARDS.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white px-4 py-3.5 shadow-[0_8px_20px_-12px_rgba(15,23,42,0.25)]"
            >
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center text-primary">
                <Icon size={20} strokeWidth={1.75} />
              </span>
              <span className="text-[13px] font-semibold leading-snug text-slate-800">{label}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Pillars */}
      <Section id="solutions" className="bg-[#eef3f9] py-16">
        <h2 className="mx-auto max-w-3xl text-center text-[1.9rem] font-bold leading-tight tracking-tight text-slate-900 sm:text-[2.1rem]">
          Everything Your Home Care Agency Needs. One Connected Platform.
        </h2>
        <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map(({ icon: Icon, title, text }) => (
            <div key={title} className="text-center">
              <IconCircle icon={Icon} />
              <h3 className="mt-4 text-base font-bold text-slate-900">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{text}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Feature cards */}
      <Section id="features" className="bg-[#f3f5f8] py-16">
        <h2 className="mx-auto max-w-3xl text-center text-[1.9rem] font-bold leading-tight tracking-tight text-slate-900 sm:text-[2.1rem]">
          One Platform. Every Part of Your Care Operation.
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-[15px] leading-relaxed text-slate-500">
          CareTraker brings your most important home care workflows together, helping administrators
          spend less time managing paperwork and more time improving care.
        </p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.35)]"
            >
              <IconTile icon={Icon} />
              <h3 className="mt-4 text-[15px] font-bold text-slate-900">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{text}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Workflow */}
      <Section className="bg-white py-16">
        <h2 className="mx-auto max-w-3xl text-center text-[1.9rem] font-bold leading-tight tracking-tight text-primary sm:text-[2.1rem]">
          From Onboarding to Ongoing Care—Everything Connected.
        </h2>
        <div className="mt-14 grid gap-8 sm:grid-cols-5">
          {STEPS.map(({ n, icon: Icon, title, text }, index) => (
            <div key={title} className="relative text-center">
              {index < STEPS.length - 1 && (
                <div className="absolute left-[58%] top-7 hidden w-[85%] border-t-2 border-dashed border-[#c9daf8] sm:block" />
              )}
              <div className="relative z-10 mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#c9daf8] bg-white shadow-[0_8px_20px_-10px_rgba(37,99,235,0.45)]">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e8f1ff] text-primary">
                  <Icon size={18} strokeWidth={1.75} />
                </span>
              </div>
              <p className="mt-4 text-xs font-semibold text-[#93b4f0]">{n}</p>
              <h3 className="mt-1 text-sm font-bold text-slate-800">{title}</h3>
              <p className="mt-2 text-[12px] leading-relaxed text-slate-500">{text}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Caregiver */}
      <Section id="caregivers" className="border-t border-slate-100 bg-[#f7f8fa] py-16">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <ProductShot
            src={SHOTS.assessments}
            alt="Caregiver onboarding and assessments"
            className="shadow-[0_25px_60px_-20px_rgba(15,23,42,0.35)]"
          />
          <div>
            <p className="text-sm font-semibold text-primary">Caregiver Management</p>
            <h2 className="mt-2 text-[1.85rem] font-bold leading-tight tracking-tight text-slate-900 sm:text-[2.05rem]">
              Simplify Caregiver Onboarding From Start to Finish.
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-slate-500">
              Turn a complicated onboarding process into a simple, digital workflow that saves time
              and improves accuracy.
            </p>
            <Link
              to={ROUTES.LOGIN}
              className="mt-7 inline-flex rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-primary/20 hover:bg-primary-hover"
            >
              Explore Caregiver Management
            </Link>
          </div>
        </div>
      </Section>

      {/* Client */}
      <Section id="clients" className="bg-white py-16">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">
              Client Management
            </p>
            <h2 className="mt-2 text-[1.85rem] font-bold leading-tight tracking-tight text-slate-900 sm:text-[2.05rem]">
              Complete Client Management at Your Fingertips.
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-slate-500">
              Give your team a 360° view of every client and keep all care-related information
              organized and accessible.
            </p>
            <div className="mt-6 grid gap-x-8 gap-y-3 sm:grid-cols-2">
              <div className="space-y-3">
                {CLIENT_LEFT.map((item) => (
                  <div key={item} className="flex items-start gap-2.5 text-sm text-slate-700">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    {item}
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                {CLIENT_RIGHT.map((item) => (
                  <div key={item} className="flex items-start gap-2.5 text-sm text-slate-700">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <Link
              to={ROUTES.LOGIN}
              className="mt-8 inline-flex rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-primary/20 hover:bg-primary-hover"
            >
              Explore Client Management
            </Link>
          </div>
          <ProductShot
            src={SHOTS.evv}
            alt="Client and EVV overview"
            className="shadow-[0_25px_60px_-20px_rgba(15,23,42,0.35)]"
          />
        </div>
      </Section>

      {/* EVV */}
      <Section id="resources" className="bg-[#f0f4fa] py-16">
        <p className="text-center text-sm font-semibold text-primary">EVV & Compliance</p>
        <h2 className="mx-auto mt-2 max-w-3xl text-center text-[1.9rem] font-bold leading-tight tracking-tight text-slate-900 sm:text-[2.1rem]">
          Stay Accurate. Stay Compliant. Stay in Control.
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-[15px] leading-relaxed text-slate-500">
          CareTraker helps agencies maintain accurate service records while giving administrators
          better visibility into caregiver visits and client services.
        </p>
        <div className="mt-12 grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-6">
          {evvItems.map(({ icon: Icon, label }) => (
            <div key={label} className="text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-primary shadow-[0_10px_24px_-12px_rgba(15,23,42,0.35)]">
                <Icon size={22} strokeWidth={1.75} />
              </span>
              <p className="mt-3 text-[12px] font-semibold leading-snug text-slate-700">{label}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <Section id="demo" className="bg-white pb-16 pt-6">
        <div className="rounded-[28px] bg-gradient-to-br from-[#3b82f6] via-primary to-[#1d4ed8] px-6 py-14 text-center text-white shadow-xl shadow-primary/30 sm:px-10">
          <h2 className="text-[1.85rem] font-bold tracking-tight sm:text-[2.15rem]">
            Ready to Simplify Your Home Care Operations?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-white/90">
            Bring your agency, caregivers, clients, documentation, and compliance workflows together
            in one platform built for home care success.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href="mailto:sales@caretraker.com?subject=Demo%20Request"
              className="rounded-lg border-2 border-white bg-transparent px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
            >
              Request a Demo
            </a>
            <a
              href="mailto:sales@caretraker.com?subject=Talk%20to%20CareTraker%20Team"
              className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-primary hover:bg-slate-50"
            >
              Talk to Our Team
            </a>
          </div>
        </div>
      </Section>

      <div id="about" className="sr-only" aria-hidden />
      <div id="pricing" className="sr-only" aria-hidden />
    </div>
  );
}
