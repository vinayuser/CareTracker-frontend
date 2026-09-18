import { Link } from 'react-router-dom';
import {
  BarChart3,
  Check,
  CheckCircle2,
  Eye,
  FilePlus2,
  FileText,
  Ban,
  ShieldCheck,
  Square,
} from 'lucide-react';
import { ROUTES } from '../../routes/routes';

function StatusPill({ label, tone }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${tone}`}>
      {label}
    </span>
  );
}

function ViewAll() {
  return (
    <button type="button" className="text-[12px] font-semibold text-primary hover:text-primary-hover">
      View All
    </button>
  );
}

function SectionNav({ items, active }) {
  return (
    <ul className="mt-5 space-y-2.5">
      {items.map((item) => {
        const isActive = item === active;
        return (
          <li key={item} className="flex items-start gap-2 text-[13px]">
            {isActive ? (
              <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                <Check size={10} strokeWidth={3} />
              </span>
            ) : (
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />
            )}
            <span className={isActive ? 'font-semibold text-slate-800' : 'text-slate-600'}>{item}</span>
          </li>
        );
      })}
    </ul>
  );
}

function ModuleSection({ id, n, title, text, links, activeLink, children }) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="mx-auto max-w-[1120px] px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_16px_40px_-32px_rgba(15,23,42,0.35)]">
          <div className="grid lg:grid-cols-[250px_minmax(0,1fr)]">
            <aside className="border-b border-slate-100 bg-white p-6 lg:border-b-0 lg:border-r lg:border-slate-100">
              <div className="flex items-start gap-3">
                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-100 text-[13px] font-bold text-primary">
                  {n}
                </span>
                <h2 className="pt-0.5 text-[1.15rem] font-bold tracking-tight text-slate-900">{title}</h2>
              </div>
              <p className="mt-3 text-[13px] leading-relaxed text-slate-500">{text}</p>
              <SectionNav items={links} active={activeLink} />
            </aside>
            <div className="min-w-0 p-5 sm:p-6">{children}</div>
          </div>
        </div>
      </div>
    </section>
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
    {
      label: 'Total Billed',
      value: '$1,248,960',
      trend: '+18% this month',
      trendTone: 'text-emerald-600',
      iconTone: 'bg-sky-50 text-sky-600',
      Icon: FileText,
      arrow: '▲',
    },
    {
      label: 'Total Claims',
      value: '1,982',
      trend: '+14% this month',
      trendTone: 'text-emerald-600',
      iconTone: 'bg-violet-50 text-violet-600',
      Icon: FilePlus2,
      arrow: '▲',
    },
    {
      label: 'Paid This Month',
      value: '$932,450',
      trend: '+16% this month',
      trendTone: 'text-emerald-600',
      iconTone: 'bg-emerald-50 text-emerald-600',
      Icon: CheckCircle2,
      arrow: '▲',
    },
    {
      label: 'A/R Balance',
      value: '$316,510',
      trend: '+8% this month',
      trendTone: 'text-rose-500',
      iconTone: 'bg-orange-50 text-orange-500',
      Icon: Square,
      arrow: '↑',
    },
    {
      label: 'Denial Rate',
      value: '3.2%',
      trend: '-1.5% this month',
      trendTone: 'text-emerald-600',
      iconTone: 'bg-indigo-50 text-indigo-600',
      Icon: ShieldCheck,
      arrow: '↓',
    },
  ];

  return (
    <div className="mx-auto grid max-w-[1120px] gap-3 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-5 lg:px-8">
      {cards.map(({ label, value, trend, trendTone, iconTone, Icon, arrow }) => (
        <div
          key={label}
          className="flex items-start justify-between rounded-2xl border border-slate-200/80 bg-white px-4 py-4 shadow-[0_12px_28px_-24px_rgba(15,23,42,0.35)]"
        >
          <div>
            <p className="text-[11px] font-medium text-slate-500">{label}</p>
            <p className="mt-1 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">{value}</p>
            <p className={`mt-1 text-[11px] font-semibold ${trendTone}`}>
              {arrow} {trend}
            </p>
          </div>
          <span className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconTone}`}>
            <Icon size={18} strokeWidth={1.85} />
          </span>
        </div>
      ))}
    </div>
  );
}

function ClaimsVisual() {
  const stats = [
    { label: 'Claims Created', value: '1,982' },
    { label: 'Claims Submitted', value: '1,742' },
    { label: 'Claims Accepted', value: '1,563' },
    { label: 'Claims Denied', value: '123' },
    { label: 'Pending Review', value: '56' },
  ];
  const rows = [
    {
      claim: 'CLM-100274',
      client: 'Mary Johnson',
      payer: 'Aetna',
      date: 'May 10, 2024',
      amount: '$1,240.00',
      status: 'Accepted',
      tone: 'bg-emerald-100 text-emerald-700',
    },
    {
      claim: 'CLM-100273',
      client: 'Robert Garcia',
      payer: 'UnitedHealthcare',
      date: 'May 10, 2024',
      amount: '$980.00',
      status: 'Pending',
      tone: 'bg-sky-100 text-sky-700',
    },
    {
      claim: 'CLM-100272',
      client: 'Linda Brown',
      payer: 'Humana',
      date: 'May 9, 2024',
      amount: '$1,120.00',
      status: 'Denied',
      tone: 'bg-rose-100 text-rose-700',
    },
  ];

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-3">
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">{s.label}</p>
            <p className="mt-1 text-xl font-bold text-slate-900">{s.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-5 flex items-center justify-between">
        <h3 className="text-[13px] font-bold text-slate-900">Recent Claims</h3>
        <ViewAll />
      </div>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-[12px]">
          <thead>
            <tr className="text-[10px] uppercase tracking-wide text-slate-400">
              {['Claim #', 'Client', 'Payer', 'Service Date', 'Amount', 'Status'].map((h) => (
                <th key={h} className="pb-2 font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.claim} className="border-t border-slate-100 text-slate-600">
                <td className="py-3 pr-2 font-semibold text-slate-800">{row.claim}</td>
                <td className="py-3 pr-2">{row.client}</td>
                <td className="py-3 pr-2">{row.payer}</td>
                <td className="py-3 pr-2">{row.date}</td>
                <td className="py-3 pr-2 font-bold text-slate-900">{row.amount}</td>
                <td className="py-3">
                  <StatusPill label={row.status} tone={row.tone} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function StatCards({ cards }) {
  return (
    <div className={`grid gap-3 sm:grid-cols-2 ${cards.length >= 4 ? 'xl:grid-cols-4' : 'xl:grid-cols-3'}`}>
      {cards.map((s) => (
        <div key={s.label} className="rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-4">
          <p className="text-[11px] font-medium text-slate-500">{s.label}</p>
          <p className="mt-1.5 text-2xl font-bold text-slate-900">{s.value}</p>
        </div>
      ))}
    </div>
  );
}

function ArDonut() {
  const segments = [
    { label: '0 - 30 Days', amount: '$112,450', pct: '35%', color: '#1d4ed8' },
    { label: '31 - 60 Days', amount: '$88,230', pct: '27%', color: '#6366f1' },
    { label: '61 - 90 Days', amount: '$63,420', pct: '20%', color: '#38bdf8' },
    { label: '90+ Days', amount: '$54,410', pct: '18%', color: '#f97316' },
  ];

  return (
    <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
      <div className="rounded-xl border border-slate-200 p-4 sm:p-5">
        <h3 className="text-[13px] font-bold text-slate-900">A/R Aging</h3>
        <div className="mt-4 flex flex-wrap items-center gap-5">
          <div
            className="relative mx-auto h-40 w-40 shrink-0 rounded-full sm:mx-0"
            style={{
              background:
                'conic-gradient(#1d4ed8 0% 35%, #6366f1 35% 62%, #38bdf8 62% 82%, #f97316 82% 100%)',
            }}
          >
            <div className="absolute inset-[18%] flex flex-col items-center justify-center rounded-full bg-white text-center">
              <p className="text-lg font-bold text-slate-900">$316,510</p>
              <p className="text-[10px] font-medium text-slate-400">Total A/R</p>
            </div>
          </div>
          <ul className="min-w-0 flex-1 space-y-2.5">
            {segments.map((s) => (
              <li key={s.label} className="flex items-start gap-2 text-[12px]">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: s.color }} />
                <div className="min-w-0 flex-1">
                  <p className="text-slate-500">{s.label}</p>
                  <p className="font-bold text-slate-900">
                    {s.amount} <span className="font-medium text-slate-400">({s.pct})</span>
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-[13px] font-bold text-slate-900">A/R Summary</h3>
          <ViewAll />
        </div>
        <dl className="mt-4 space-y-3.5">
          {[
            { label: 'Total A/R', value: '$316,510', bold: true },
            { label: 'Current (0-30 Days)', value: '$112,450' },
            { label: 'Over 30 Days', value: '$204,060' },
            { label: 'Collections', value: '$18,230' },
            { label: 'Write Offs YTD', value: '$9,430' },
          ].map((row) => (
            <div key={row.label} className="flex items-center justify-between gap-3 text-[13px]">
              <dt className="text-slate-500">{row.label}</dt>
              <dd className={row.bold ? 'font-bold text-slate-900' : 'font-semibold text-slate-800'}>
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

function SimpleTable({ headers, rows, statusIndex }) {
  return (
    <div className="mt-5 overflow-x-auto">
      <table className="w-full min-w-[520px] text-left text-[12px]">
        <thead>
          <tr className="text-[10px] uppercase tracking-wide text-slate-400">
            {headers.map((h) => (
              <th key={h} className="pb-2 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key} className="border-t border-slate-100 text-slate-600">
              {row.cells.map((cell, i) => (
                <td key={`${row.key}-${i}`} className="py-3 pr-2">
                  {i === statusIndex ? (
                    <StatusPill label={cell.label} tone={cell.tone} />
                  ) : (
                    <span className={i === 0 ? 'font-semibold text-slate-800' : ''}>{cell}</span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function BillingPage() {
  return (
    <div className="bg-[#f5f7fb] text-slate-900">
      <section id="overview" className="scroll-mt-24 bg-gradient-to-b from-white to-[#f5f7fb]">
        <div className="mx-auto grid max-w-[1120px] gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-12 lg:px-8 lg:py-16">
          <div>
            <h1 className="text-[2.45rem] font-bold leading-[1.12] tracking-tight text-slate-900 sm:text-[2.85rem]">
              Billing & Revenue
            </h1>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-slate-500">
              Streamline your revenue cycle, reduce claim denials, and improve cash flow.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="#claims-management"
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
        <ModuleSection
          id="claims-management"
          n="1"
          title="Claims Management"
          text="Manage the entire claims lifecycle from creation to payment."
          links={[
            'Claim creation & scrubbing',
            'Claim status tracking',
            'Denial management',
            'Resubmissions',
            'Claims analytics',
          ]}
          activeLink="Claim status tracking"
        >
          <ClaimsVisual />
        </ModuleSection>

        <ModuleSection
          id="medicaid-eligibility"
          n="2"
          title="Medicaid Eligibility"
          text="Verify Medicaid eligibility and track recertifications."
          links={['Eligibility verification', 'Benefits lookup']}
          activeLink="Eligibility verification"
        >
          <StatCards
            cards={[
              { label: 'Active Medicaid Clients', value: '842' },
              { label: 'Expiring Soon', value: '68' },
              { label: 'Not Eligible', value: '35' },
              { label: 'Pending Verification', value: '42' },
            ]}
          />
        </ModuleSection>

        <ModuleSection
          id="medicare-eligibility"
          n="3"
          title="Medicare Eligibility"
          text="Confirm Medicare coverage, plan details, and authorization status."
          links={['Coverage verification', 'Plan & benefit details', 'Authorization tracking']}
          activeLink="Coverage verification"
        >
          <StatCards
            cards={[
              { label: 'Active Medicare Clients', value: '624' },
              { label: 'Part A / Part B', value: '518' },
              { label: 'Advantage Plans', value: '106' },
              { label: 'Pending Checks', value: '29' },
            ]}
          />
          <div className="mt-5 flex items-center justify-between">
            <h3 className="text-[13px] font-bold text-slate-900">Recent Verifications</h3>
            <ViewAll />
          </div>
          <SimpleTable
            headers={['Client', 'Plan', 'Checked', 'Status']}
            statusIndex={3}
            rows={[
              {
                key: '1',
                cells: [
                  'Helen Carter',
                  'Medicare Part B',
                  'May 12, 2024',
                  { label: 'Eligible', tone: 'bg-emerald-100 text-emerald-700' },
                ],
              },
              {
                key: '2',
                cells: [
                  'James Wright',
                  'Medicare Advantage',
                  'May 11, 2024',
                  { label: 'Pending', tone: 'bg-sky-100 text-sky-700' },
                ],
              },
            ]}
          />
        </ModuleSection>

        <ModuleSection
          id="insurance-verification"
          n="4"
          title="Insurance Verification"
          text="Validate commercial insurance benefits before care begins."
          links={['Benefits verification', 'Copay & deductible', 'Prior authorization']}
          activeLink="Benefits verification"
        >
          <StatCards
            cards={[
              { label: 'Verified This Month', value: '318' },
              { label: 'Auth Required', value: '47' },
              { label: 'Expired Policies', value: '12' },
              { label: 'Avg Turnaround', value: '4.2h' },
            ]}
          />
        </ModuleSection>

        <ModuleSection
          id="electronic-claims-edi"
          n="5"
          title="Electronic Claims (EDI)"
          text="Submit, track, and reconcile EDI claims with payers in real time."
          links={['837 claim submission', '835 remittance advice', 'EDI error queue']}
          activeLink="837 claim submission"
        >
          <StatCards
            cards={[
              { label: 'EDI Claims Sent', value: '1,426' },
              { label: 'Accepted', value: '1,308' },
              { label: 'Rejected', value: '67' },
              { label: 'In Transit', value: '51' },
            ]}
          />
          <div className="mt-5 flex items-center justify-between">
            <h3 className="text-[13px] font-bold text-slate-900">Recent EDI Batches</h3>
            <ViewAll />
          </div>
          <SimpleTable
            headers={['Batch #', 'Payer', 'Claims', 'Submitted', 'Status']}
            statusIndex={4}
            rows={[
              {
                key: 'b1',
                cells: [
                  'EDI-88421',
                  'Aetna',
                  '48',
                  'May 12, 2024',
                  { label: 'Accepted', tone: 'bg-emerald-100 text-emerald-700' },
                ],
              },
              {
                key: 'b2',
                cells: [
                  'EDI-88418',
                  'Humana',
                  '36',
                  'May 11, 2024',
                  { label: 'In Transit', tone: 'bg-sky-100 text-sky-700' },
                ],
              },
            ]}
          />
        </ModuleSection>

        <ModuleSection
          id="payment-posting"
          n="6"
          title="Payment Posting"
          text="Post payments, adjustments, and denials with full audit trails."
          links={['Auto payment posting', 'Manual adjustments', 'Denial posting']}
          activeLink="Auto payment posting"
        >
          <StatCards
            cards={[
              { label: 'Posted This Month', value: '$932,450' },
              { label: 'Payments', value: '1,204' },
              { label: 'Adjustments', value: '$24,180' },
              { label: 'Unapplied', value: '$6,420' },
            ]}
          />
          <div className="mt-5 flex items-center justify-between">
            <h3 className="text-[13px] font-bold text-slate-900">Recent Postings</h3>
            <ViewAll />
          </div>
          <SimpleTable
            headers={['Payment #', 'Payer / Client', 'Amount', 'Posted', 'Status']}
            statusIndex={4}
            rows={[
              {
                key: 'p1',
                cells: [
                  'PAY-55201',
                  'UnitedHealthcare',
                  '$12,480.00',
                  'May 12, 2024',
                  { label: 'Posted', tone: 'bg-emerald-100 text-emerald-700' },
                ],
              },
              {
                key: 'p2',
                cells: [
                  'PAY-55198',
                  'Mary Johnson',
                  '$240.00',
                  'May 11, 2024',
                  { label: 'Posted', tone: 'bg-emerald-100 text-emerald-700' },
                ],
              },
            ]}
          />
        </ModuleSection>

        <ModuleSection
          id="accounts-receivable"
          n="7"
          title="Accounts Receivable"
          text="Manage A/R, follow ups, and collections."
          links={['A/R aging', 'Patient statements']}
          activeLink="A/R aging"
        >
          <ArDonut />
        </ModuleSection>

        <ModuleSection
          id="financial-reporting"
          n="8"
          title="Financial Reporting"
          text="Monitor revenue performance with billing and cash-flow reports."
          links={['Revenue reports', 'Collections analytics', 'Export & schedules']}
          activeLink="Revenue reports"
        >
          <StatCards
            cards={[
              { label: 'Net Revenue MTD', value: '$932,450' },
              { label: 'Gross Billed MTD', value: '$1.25M' },
              { label: 'Collection Rate', value: '94.8%' },
              { label: 'Avg Days to Pay', value: '28' },
            ]}
          />
          <div className="mt-5 flex items-center justify-between">
            <h3 className="text-[13px] font-bold text-slate-900">Saved Reports</h3>
            <ViewAll />
          </div>
          <SimpleTable
            headers={['Report', 'Period', 'Owner', 'Status']}
            statusIndex={3}
            rows={[
              {
                key: 'r1',
                cells: [
                  'Monthly Revenue Summary',
                  'May 2024',
                  'Finance',
                  { label: 'Ready', tone: 'bg-emerald-100 text-emerald-700' },
                ],
              },
              {
                key: 'r2',
                cells: [
                  'Denial Trends',
                  'Q2 2024',
                  'Billing Ops',
                  { label: 'Scheduled', tone: 'bg-sky-100 text-sky-700' },
                ],
              },
            ]}
          />
        </ModuleSection>
      </div>

      <section id="demo" className="scroll-mt-24 pb-16 pt-4">
        <div className="mx-auto max-w-[1120px] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 rounded-2xl border border-sky-100 bg-gradient-to-r from-[#eef6ff] to-[#e8f7f4] px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-7 sm:py-7">
            <div>
              <h3 className="text-[1.25rem] font-bold text-slate-900 sm:text-[1.35rem]">
                Improve Cash Flow. Increase Collections. Grow Revenue.
              </h3>
              <p className="mt-1.5 max-w-xl text-sm text-slate-500">
                Optimize your billing process and get paid faster with CareTraker.
              </p>
            </div>
            <a
              href="mailto:sales@caretraker.com?subject=Billing%20%26%20Revenue%20Demo%20Request"
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
