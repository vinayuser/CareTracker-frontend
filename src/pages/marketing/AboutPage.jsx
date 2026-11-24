import { Link } from 'react-router-dom';
import {
  Building2,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
} from 'lucide-react';
import ProductShot from '../../components/marketing/ProductShot';
import { RequestDemoButton } from '../../components/marketing/DemoRequestContext';
import { ROUTES } from '../../routes/routes';

const SHOTS = {
  dashboard: '/marketing/agency-dashboard.png',
};

const PILLARS = [
  {
    icon: Target,
    title: 'Our Mission',
    text: 'Help home care agencies run cleaner operations so caregivers can spend more time delivering care and less time fighting paperwork.',
  },
  {
    icon: Sparkles,
    title: 'Our Vision',
    text: 'Make home care management simpler, more organized, and more connected through practical digital tools built for everyday agency work.',
  },
  {
    icon: HeartHandshake,
    title: 'Our Commitment',
    text: 'Stay focused on real workflows—scheduling, EVV, documentation, billing, and communication—so agencies can grow with confidence.',
  },
];

const VALUES = [
  {
    icon: Users,
    title: 'Built for people who deliver care',
    text: 'Caregivers, coordinators, and agency owners each need a clear view of their day. Caretraqer is designed around those roles—not generic software menus.',
  },
  {
    icon: ShieldCheck,
    title: 'Compliance without the chaos',
    text: 'EVV, visit records, and audit-ready documentation belong in the same system as scheduling and care notes, so compliance is part of the workflow—not a separate scramble.',
  },
  {
    icon: Building2,
    title: 'One platform for the whole agency',
    text: 'From hiring and onboarding to visits, billing, and family communication, Caretraqer brings the moving parts of a home care business into one secure place.',
  },
];

const WHO_WE_SERVE = [
  'Home care agency owners and administrators',
  'Care coordinators and scheduling teams',
  'Caregivers working in the field',
  'Clients and families who need clear updates',
];

function Section({ className = '', children }) {
  return (
    <section className={className}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">{children}</div>
    </section>
  );
}

export default function AboutPage() {
  return (
    <div className="bg-[#fbfcfe] text-slate-900">
      <Section className="pb-12 pt-12 lg:pb-16 lg:pt-16">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
          <div data-reveal="left" data-reveal-delay="0">
            <p className="text-[13px] font-semibold tracking-wide text-primary">About Caretraqer</p>
            <h1 className="mt-3 text-[2.35rem] font-bold leading-[1.12] tracking-tight text-slate-900 sm:text-[2.85rem]">
              Technology that helps home care agencies work with clarity.
            </h1>
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-slate-500">
              Caretraqer is a home care management platform built to simplify daily operations—
              caregiver coordination, client records, EVV, documentation, billing, and the
              communication that keeps care on track.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <RequestDemoButton className="inline-flex rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-primary/25 hover:bg-primary-hover">
                Request a Demo
              </RequestDemoButton>
              <Link
                to={ROUTES.MARKETING_PRODUCT}
                className="inline-flex rounded-lg border border-[#c9daf8] bg-white px-5 py-2.5 text-sm font-semibold text-primary hover:bg-primary/5"
              >
                Explore the Platform
              </Link>
            </div>
          </div>
          <div data-reveal="right" data-reveal-delay="120">
            <ProductShot
              src={SHOTS.dashboard}
              alt="Caretraqer agency dashboard"
              className="shadow-[0_25px_60px_-20px_rgba(15,23,42,0.4)]"
            />
          </div>
        </div>
      </Section>

      <Section className="bg-[#eef3f9] py-16">
        <h2 className="mx-auto max-w-3xl text-center text-[1.9rem] font-bold leading-tight tracking-tight text-slate-900 sm:text-[2.1rem]">
          Mission, vision, and what we stand for.
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-[15px] leading-relaxed text-slate-500">
          We exist to improve home care management—so agencies can stay organized, caregivers stay
          supported, and clients receive reliable care.
        </p>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {PILLARS.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.3)]"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#e8f1ff] text-primary">
                <Icon size={20} strokeWidth={1.75} />
              </span>
              <h3 className="mt-4 text-[15px] font-bold text-slate-900">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section className="bg-white py-16">
        <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="text-sm font-semibold text-primary">Who we are</p>
            <h2 className="mt-2 text-[1.85rem] font-bold leading-tight tracking-tight text-slate-900 sm:text-[2.05rem]">
              A team focused on the real work of home care.
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-slate-500">
              Home care agencies juggle people, schedules, compliance, and revenue every day.
              Caretraqer brings those responsibilities into one connected system so teams can see
              what is happening, act quickly, and keep records audit-ready.
            </p>
            <p className="mt-4 text-[15px] leading-relaxed text-slate-500">
              We design for the full agency—not only the office. Caregivers get mobile tools for
              visits and notes. Administrators get dashboards, reports, and controls. Families get
              clearer communication when care plans and schedules change.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-primary">Who we serve</p>
            <ul className="mt-4 space-y-3">
              {WHO_WE_SERVE.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 rounded-xl border border-slate-100 bg-[#f8fafc] px-4 py-3 text-sm font-medium text-slate-700"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section className="bg-[#f3f5f8] py-16">
        <h2 className="mx-auto max-w-3xl text-center text-[1.9rem] font-bold leading-tight tracking-tight text-slate-900 sm:text-[2.1rem]">
          What guides how we build.
        </h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {VALUES.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.3)]"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#e8f1ff] text-primary">
                <Icon size={20} strokeWidth={1.75} />
              </span>
              <h3 className="mt-4 text-[15px] font-bold text-slate-900">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section className="bg-white pb-16 pt-6">
        <div className="rounded-[28px] bg-gradient-to-br from-[#3b82f6] via-primary to-[#1d4ed8] px-6 py-14 text-center text-white shadow-xl shadow-primary/30 sm:px-10">
          <h2 className="text-[1.85rem] font-bold tracking-tight sm:text-[2.15rem]">
            Ready to see Caretraqer for your agency?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-white/90">
            Walk through the platform with our team, or explore product features when you are ready
            to dig deeper.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <RequestDemoButton className="rounded-lg border-2 border-white bg-transparent px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10">
              Request a Demo
            </RequestDemoButton>
            <Link
              to="/resources/contact"
              className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-primary hover:bg-slate-50"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </Section>
    </div>
  );
}
