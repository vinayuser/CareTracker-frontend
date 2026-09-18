import { Link } from 'react-router-dom';
import {
  Ban,
  BarChart3,
  Check,
  Eye,
  FileSignature,
  HeartPulse,
  LineChart,
  MessageSquare,
  MoreHorizontal,
  ShieldCheck,
  Umbrella,
  Wallet,
} from 'lucide-react';
import { ROUTES } from '../../routes/routes';

function StatusPill({ label, tone }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${tone}`}>
      {label}
    </span>
  );
}

function ClientInvoicesHero() {
  const rows = [
    {
      inv: 'INV-10004',
      client: 'Mary Johnson',
      email: 'mary.j@email.com',
      period: 'May 1 – May 15',
      visits: 12,
      total: '$1,240.00',
    },
    {
      inv: 'INV-10003',
      client: 'Robert Garcia',
      email: 'r.garcia@email.com',
      period: 'May 1 – May 15',
      visits: 8,
      total: '$980.00',
    },
    {
      inv: 'INV-10002',
      client: 'Linda Brown',
      email: 'linda.b@email.com',
      period: 'Apr 16 – Apr 30',
      visits: 10,
      total: '$1,120.00',
    },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_24px_50px_-28px_rgba(15,23,42,0.45)] sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-[15px] font-bold text-slate-900">Client Invoices</h3>
          <p className="mt-0.5 text-[11px] text-slate-500">
            Generate, send, and track invoices for private-pay and insurance clients.
          </p>
        </div>
        <button type="button" className="rounded-lg bg-primary px-3 py-1.5 text-[11px] font-semibold text-white">
          + Generate Invoice
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <div className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] text-slate-500">
          All statuses
        </div>
        <div className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] text-slate-500">
          This month
        </div>
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-[11px]">
          <thead>
            <tr className="text-[10px] uppercase tracking-wide text-slate-400">
              {['Invoice', 'Client', 'Period', 'Visits', 'Total', 'Status', 'Actions'].map((h) => (
                <th key={h} className="pb-2 font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.inv} className="border-t border-slate-100 text-slate-600">
                <td className="py-2.5 pr-2 font-semibold text-primary">{row.inv}</td>
                <td className="py-2.5 pr-2">
                  <p className="font-medium text-slate-800">{row.client}</p>
                  <p className="text-[10px] text-slate-400">{row.email}</p>
                </td>
                <td className="py-2.5 pr-2">{row.period}</td>
                <td className="py-2.5 pr-2">{row.visits}</td>
                <td className="py-2.5 pr-2 font-bold text-slate-900">{row.total}</td>
                <td className="py-2.5 pr-2">
                  <StatusPill label="Sent" tone="bg-sky-100 text-sky-700" />
                </td>
                <td className="py-2.5">
                  <div className="flex items-center gap-2 text-[10px] font-semibold">
                    <span className="inline-flex items-center gap-0.5 text-slate-500">
                      <Eye size={11} /> View
                    </span>
                    <span className="inline-flex items-center gap-0.5 text-emerald-600">
                      <Check size={11} /> Paid
                    </span>
                    <span className="inline-flex items-center gap-0.5 text-rose-500">
                      <Ban size={11} /> Void
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function KpiRow() {
  const cards = [
    { label: 'Total Integrations', value: '18' },
    { label: 'Connected', value: '12', meta: '67% of total', metaTone: 'text-emerald-600', dot: 'bg-emerald-500' },
    { label: 'Available', value: '6', meta: '33% of total', metaTone: 'text-orange-500', dot: 'bg-orange-400' },
    { label: 'Active Syncs', value: '48', meta: 'Real-time', metaTone: 'text-emerald-600', dot: 'bg-emerald-500' },
    { label: 'Data Exchanges', value: '12,846', meta: 'This month', metaTone: 'text-violet-600', dot: 'bg-violet-500' },
  ];

  return (
    <div className="mx-auto grid max-w-[1120px] gap-3 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-5 lg:px-8">
      {cards.map(({ label, value, meta, metaTone, dot }) => (
        <div
          key={label}
          className="rounded-2xl border border-slate-200/80 bg-white px-4 py-4 shadow-[0_12px_28px_-24px_rgba(15,23,42,0.35)]"
        >
          <p className="text-[11px] font-medium text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{value}</p>
          {meta ? (
            <p className={`mt-1.5 flex items-center gap-1.5 text-[11px] font-semibold ${metaTone}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
              {meta}
            </p>
          ) : (
            <p className="mt-1.5 text-[11px] font-medium text-transparent">.</p>
          )}
        </div>
      ))}
    </div>
  );
}

function SystemStatus({ status }) {
  if (status === 'Connected') {
    return <StatusPill label="Connected" tone="bg-emerald-100 text-emerald-700" />;
  }
  return <StatusPill label="Available" tone="bg-slate-100 text-slate-600" />;
}

function IntegrationCard({
  id,
  n,
  title,
  text,
  features,
  systems,
  benefits,
  lastSync,
  Icon,
  iconTone = 'bg-emerald-50 text-emerald-600',
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="mx-auto max-w-[1120px] px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-[0_16px_40px_-32px_rgba(15,23,42,0.35)] sm:p-6">
          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.95fr_0.85fr_160px] lg:items-start">
            <div>
              <div className="flex items-start gap-3">
                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-primary text-[13px] font-bold text-primary">
                  {n}
                </span>
                <span className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconTone}`}>
                  <Icon size={20} strokeWidth={1.85} />
                </span>
              </div>
              <h2 className="mt-4 text-[1.2rem] font-bold tracking-tight text-slate-900">{title}</h2>
              <p className="mt-2 text-[13px] leading-relaxed text-slate-500">{text}</p>
              <ul className="mt-4 space-y-2">
                {features.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-[13px] text-slate-600">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Connected Systems
              </p>
              <ul className="mt-3 space-y-3">
                {systems.map((sys) => (
                  <li key={sys.name} className="flex items-center justify-between gap-3">
                    <span className={`text-[13px] font-semibold ${sys.tone || 'text-slate-800'}`}>
                      {sys.name}
                    </span>
                    <SystemStatus status={sys.status} />
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Benefits</p>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                {benefits.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-[13px] text-slate-600">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col items-stretch justify-between gap-4 lg:items-end lg:text-right">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Last Sync</p>
                <p className="mt-2 flex items-center gap-1.5 text-[13px] font-semibold text-emerald-600 lg:justify-end">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  {lastSync}
                </p>
              </div>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-lg border border-primary px-5 py-2 text-sm font-semibold text-primary hover:bg-primary/5"
              >
                Manage
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const INTEGRATIONS = [
  {
    id: 'ehr-emr',
    n: '1',
    title: 'EHR / EMR',
    text: 'Seamlessly sync client data, care plans, visit notes, and charts with leading EHR/EMR systems.',
    features: [
      'Patient demographics & history sync',
      'Care plans & assessments',
      'Visit notes & documentation',
      'Medication & allergy information',
      'Real-time data exchange',
    ],
    systems: [
      { name: 'CareEvolution', status: 'Connected', tone: 'text-slate-800' },
      { name: 'MatrixCare', status: 'Connected', tone: 'text-rose-600' },
      { name: 'PointClickCare', status: 'Connected', tone: 'text-sky-600' },
    ],
    benefits: ['Reduce data entry', 'Improve accuracy', 'Faster charting', 'Better coordination'],
    lastSync: '2 mins ago',
    Icon: HeartPulse,
    iconTone: 'bg-emerald-50 text-emerald-600',
  },
  {
    id: 'payers-insurance',
    n: '2',
    title: 'Payers & Insurance',
    text: 'Verify eligibility, submit claims, and receive information securely.',
    features: ['Eligibility verification', 'Claims submission', 'Claim status tracking'],
    systems: [
      { name: 'Aetna', status: 'Connected' },
      { name: 'UnitedHealthcare', status: 'Connected', tone: 'text-sky-700' },
      { name: 'Cigna', status: 'Available' },
    ],
    benefits: ['Faster claims processing', 'Reduced claim denials'],
    lastSync: '2 mins ago',
    Icon: Umbrella,
    iconTone: 'bg-emerald-50 text-emerald-600',
  },
  {
    id: 'quickbooks',
    n: '3',
    title: 'QuickBooks',
    text: 'Sync financial data, invoices, payments, and expenses with QuickBooks.',
    features: ['Invoice & payment sync', 'Chart of accounts mapping'],
    systems: [{ name: 'QuickBooks Online', status: 'Connected' }],
    benefits: ['Accurate bookkeeping'],
    lastSync: '10 mins ago',
    Icon: LineChart,
    iconTone: 'bg-emerald-50 text-emerald-600',
  },
  {
    id: 'payroll-systems',
    n: '4',
    title: 'Payroll Systems',
    text: 'Push approved time cards and caregiver hours directly into payroll platforms.',
    features: ['Time card export', 'Wage & overtime mapping', 'Pay period sync'],
    systems: [
      { name: 'ADP', status: 'Connected' },
      { name: 'Paychex', status: 'Connected' },
      { name: 'Gusto', status: 'Available' },
    ],
    benefits: ['Faster payroll runs', 'Fewer timesheet errors', 'Audit-ready exports'],
    lastSync: '25 mins ago',
    Icon: Wallet,
    iconTone: 'bg-sky-50 text-sky-600',
  },
  {
    id: 'background-check',
    n: '5',
    title: 'Background Check',
    text: 'Automate caregiver screening and keep compliance records in one place.',
    features: ['Order background checks', 'Status notifications', 'Document storage'],
    systems: [
      { name: 'Checkr', status: 'Connected' },
      { name: 'Sterling', status: 'Available' },
    ],
    benefits: ['Faster hiring', 'Compliance confidence'],
    lastSync: '1 hour ago',
    Icon: ShieldCheck,
    iconTone: 'bg-violet-50 text-violet-600',
  },
  {
    id: 'e-signature-fomiqsign',
    n: '6',
    title: 'E-Signature (FomiqSign)',
    text: 'Collect legally binding signatures on intake forms, consents, and care documents.',
    features: ['Send for signature', 'Template library', 'Audit trail'],
    systems: [{ name: 'FomiqSign', status: 'Connected', tone: 'text-primary' }],
    benefits: ['Paperless workflows', 'Faster onboarding'],
    lastSync: '4 mins ago',
    Icon: FileSignature,
    iconTone: 'bg-emerald-50 text-emerald-600',
  },
  {
    id: 'communication-email-sms',
    n: '7',
    title: 'Communication (Email/SMS)',
    text: 'Reach caregivers, clients, and families with branded email and SMS messaging.',
    features: ['Transactional email', 'Two-way SMS', 'Delivery tracking'],
    systems: [
      { name: 'Twilio', status: 'Connected', tone: 'text-rose-600' },
      { name: 'SendGrid', status: 'Connected', tone: 'text-sky-700' },
    ],
    benefits: ['Higher engagement', 'Fewer missed updates'],
    lastSync: '1 min ago',
    Icon: MessageSquare,
    iconTone: 'bg-sky-50 text-sky-600',
  },
  {
    id: 'and-more',
    n: '8',
    title: 'And More...',
    text: 'Extend CareTraker with calendars, storage, identity, and custom API connectors.',
    features: ['Google Calendar', 'Microsoft 365', 'Custom webhooks & APIs'],
    systems: [
      { name: 'Google Workspace', status: 'Connected' },
      { name: 'Microsoft 365', status: 'Available' },
      { name: 'Custom API', status: 'Available' },
    ],
    benefits: ['Flexible growth', 'Future-proof stack'],
    lastSync: 'Just now',
    Icon: MoreHorizontal,
    iconTone: 'bg-slate-100 text-slate-600',
  },
];

export default function IntegrationsPage() {
  return (
    <div className="bg-[#f5f7fb] text-slate-900">
      <section id="overview" className="scroll-mt-24 bg-gradient-to-b from-white to-[#f5f7fb]">
        <div className="mx-auto grid max-w-[1120px] gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-12 lg:px-8 lg:py-16">
          <div>
            <h1 className="text-[2.45rem] font-bold leading-[1.12] tracking-tight text-slate-900 sm:text-[2.85rem]">
              Integrations
            </h1>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-slate-500">
              Connect CareTraker with the tools you use every day. Streamline workflows, reduce manual
              work, and improve efficiency.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="#ehr-emr"
                className="inline-flex rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_-10px_rgba(0,85,212,0.7)] hover:bg-primary-hover"
              >
                View Live Monitor
              </a>
              <Link
                to={ROUTES.MARKETING_EVV}
                className="inline-flex items-center gap-2 rounded-lg border border-primary bg-white px-5 py-2.5 text-sm font-semibold text-primary hover:bg-primary/5"
              >
                <BarChart3 size={16} strokeWidth={2} />
                EVV Reports
              </Link>
            </div>
          </div>
          <ClientInvoicesHero />
        </div>
      </section>

      <section className="pb-8 pt-1">
        <KpiRow />
      </section>

      <div className="space-y-5 pb-6">
        {INTEGRATIONS.map((item) => (
          <IntegrationCard key={item.id} {...item} />
        ))}
      </div>

      <section id="demo" className="scroll-mt-24 pb-16 pt-4">
        <div className="mx-auto max-w-[1120px] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 rounded-2xl border border-sky-100 bg-gradient-to-r from-[#eef6ff] to-[#e8f7f4] px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-7 sm:py-7">
            <div>
              <h3 className="text-[1.25rem] font-bold text-slate-900 sm:text-[1.35rem]">
                Connect. Sync. Simplify.
              </h3>
              <p className="mt-1.5 max-w-xl text-sm text-slate-500">
                Integrate CareTraker with your favorite tools and automate your workflows.
              </p>
            </div>
            <a
              href="mailto:sales@caretraker.com?subject=Integrations%20Demo%20Request"
              className="inline-flex shrink-0 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_-10px_rgba(0,85,212,0.7)] hover:bg-primary-hover"
            >
              Request a Demo
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
