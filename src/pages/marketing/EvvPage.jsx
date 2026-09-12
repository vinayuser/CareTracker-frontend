import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CalendarCheck2,
  ClipboardCheck,
  Clock3,
  FileSignature,
  MapPinned,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import ProductShot from '../../components/marketing/ProductShot';
import ProductMock from '../../components/marketing/ProductMock';
import { ROUTES } from '../../routes/routes';

const SHOTS = {
  dashboard: '/marketing/agency-dashboard.png',
  evv: '/marketing/evv-dashboard.png',
  assessments: '/marketing/assessments.png',
};

const STATS = [
  { icon: CalendarCheck2, value: '342', label: 'Active Caregivers', trend: '+2% this week', tone: 'text-emerald-600', color: 'bg-sky-50 text-sky-600' },
  { icon: ClipboardCheck, value: '288', label: 'Scheduled Visits', trend: '+4% this week', tone: 'text-emerald-600', color: 'bg-blue-50 text-primary' },
  { icon: MapPinned, value: '12', label: 'Missed Visits', trend: '-1% this week', tone: 'text-rose-600', color: 'bg-rose-50 text-rose-600' },
  { icon: TrendingUp, value: '22', label: 'Late Visits', trend: '+1% this week', tone: 'text-amber-600', color: 'bg-amber-50 text-amber-600' },
  { icon: ShieldCheck, value: '98%', label: 'Visits On Time', trend: '+3% this week', tone: 'text-emerald-600', color: 'bg-emerald-50 text-emerald-600' },
  { icon: FileSignature, value: '156', label: 'Visits Completed', trend: '+5% this week', tone: 'text-emerald-600', color: 'bg-violet-50 text-violet-600' },
];

const FEATURES = [
  {
    id: 'checkin',
    title: 'Check In. Deliver Care. Check Out.',
    text: 'Caregivers clock in and out with verified visit records so agencies always know when care started and ended.',
    shot: SHOTS.dashboard,
    mock: null,
    reverse: false,
  },
  {
    id: 'gps',
    title: 'Verify Every Visit Starts in the Right Place.',
    text: 'GPS verification confirms caregivers arrive at the client location—reducing fraud risk and supporting payer compliance.',
    shot: null,
    mock: 'map',
    reverse: true,
  },
  {
    id: 'verification',
    title: 'Visit Verification You Can Trust.',
    text: 'Track scheduled vs actual visit windows, exceptions, and late check-ins in a clear calendar and log view.',
    shot: SHOTS.evv,
    mock: null,
    reverse: false,
  },
  {
    id: 'details',
    title: 'Capture Every Detail That Matters.',
    text: 'Collect service notes, condition updates, and digital signatures so every visit is documented and billable.',
    shot: SHOTS.assessments,
    mock: null,
    reverse: true,
  },
  {
    id: 'reports',
    title: 'Never Miss an Important Visit.',
    text: 'Real-time visit reports highlight completed, in-progress, late, and missed visits before they become compliance issues.',
    shot: SHOTS.evv,
    mock: null,
    reverse: false,
  },
];

function SectionShell({ id, className = '', children }) {
  return (
    <section id={id} className={`scroll-mt-20 ${className}`}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">{children}</div>
    </section>
  );
}

export default function EvvPage() {
  return (
    <div className="bg-white">
      <SectionShell className="pb-10 pt-12 lg:pb-14 lg:pt-16">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
          <div className="login-fade-in">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-[2.6rem] sm:leading-tight">
              EVV Made Simple. Accurate Visits. Better Compliance. Stronger Care.
            </h1>
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-slate-600">
              CareTraker EVV helps agencies verify caregiver visits with GPS, time stamps, and digital
              documentation—so compliance stays clean and care stays on track.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="mailto:sales@caretraker.com?subject=EVV%20Demo%20Request"
                className="inline-flex items-center rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover"
              >
                Book a Demo
              </a>
              <Link
                to={ROUTES.LOGIN}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-hover"
              >
                Get Started <ArrowRight size={16} />
              </Link>
            </div>
          </div>
          <ProductShot src={SHOTS.evv} alt="CareTraker EVV dashboard" className="login-fade-in" />
        </div>

        <div className="mt-12 grid gap-3 rounded-2xl border border-slate-200 bg-[#f5f7fb] p-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {STATS.map(({ icon: Icon, value, label, trend, tone, color }) => (
            <div key={label} className="rounded-xl border border-white bg-white px-3 py-3 shadow-sm">
              <div className="flex items-center gap-2">
                <span className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${color}`}>
                  <Icon size={15} strokeWidth={1.75} />
                </span>
                <span className="text-[11px] font-medium text-slate-500">{label}</span>
              </div>
              <p className="mt-2 text-xl font-bold text-slate-900">{value}</p>
              <p className={`text-[11px] font-medium ${tone}`}>{trend}</p>
            </div>
          ))}
        </div>
      </SectionShell>

      {FEATURES.map((feature) => (
        <SectionShell
          key={feature.id}
          id={feature.id}
          className={`py-14 ${feature.reverse ? 'bg-[#f7f9fc]' : 'bg-white'}`}
        >
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div className={feature.reverse ? 'lg:order-2' : ''}>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">{feature.title}</h2>
              <p className="mt-4 text-[15px] leading-relaxed text-slate-600">{feature.text}</p>
              <a
                href="mailto:sales@caretraker.com?subject=EVV%20Learn%20More"
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover"
              >
                Learn More <ArrowRight size={16} />
              </a>
            </div>
            <div className={feature.reverse ? 'lg:order-1' : ''}>
              {feature.shot ? (
                <ProductShot src={feature.shot} alt={feature.title} />
              ) : (
                <ProductMock variant={feature.mock} />
              )}
            </div>
          </div>
        </SectionShell>
      ))}

      <SectionShell id="compliance" className="bg-white py-16">
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <ShieldCheck size={20} strokeWidth={1.75} />
            </span>
            <h3 className="mt-4 text-xl font-bold text-slate-900">Stay Compliant. Stay Audit-Ready.</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Automatically capture visit evidence—who, when, where, and what was delivered—so audits and
              payer reviews are faster and less stressful.
            </p>
            <Link to={ROUTES.LANDING} className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
              Explore Now <ArrowRight size={14} />
            </Link>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
              <Clock3 size={20} strokeWidth={1.75} />
            </span>
            <h3 className="mt-4 text-xl font-bold text-slate-900">See Every Visit. In Real Time.</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Monitor check-ins, exceptions, late arrivals, and completions as they happen across your
              entire caregiver network.
            </p>
            <Link to={ROUTES.LOGIN} className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
              Explore Now <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </SectionShell>

      <SectionShell className="pb-16">
        <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-emerald-50 px-6 py-8 sm:flex-row sm:items-center sm:px-10">
          <div className="max-w-2xl">
            <p className="text-lg font-bold text-slate-900">Stay Compliant. Deliver Better Care.</p>
            <p className="mt-1 text-sm text-slate-600">
              Over 500,000+ visits successfully verified for compliance and billing readiness.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to={ROUTES.LOGIN}
              className="rounded-lg border border-primary px-5 py-2.5 text-sm font-semibold text-primary hover:bg-white"
            >
              Free Register
            </Link>
            <a
              href="mailto:sales@caretraker.com?subject=EVV%20Demo%20Request"
              className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover"
            >
              Request a Demo
            </a>
          </div>
        </div>
      </SectionShell>
    </div>
  );
}
