import { Link } from 'react-router-dom';
import {
  Ban,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  DollarSign,
  Download,
  Eye,
  FileText,
  Flame,
  Pencil,
  Play,
  Plus,
  Search,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-react';
import { ROUTES } from '../../routes/routes';

function StatusPill({ label, tone }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${tone}`}>
      {label}
    </span>
  );
}

function MockCard({ children, className = '' }) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_20px_45px_-28px_rgba(15,23,42,0.35)] sm:p-5 ${className}`}
    >
      {children}
    </div>
  );
}

function CheckList({ items }) {
  return (
    <ul className="mt-5 space-y-2.5">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2.5 text-[13px] text-slate-600">
          <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
            <Check size={10} strokeWidth={3} />
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}

function FeatureCopy({ n, title, text, items }) {
  return (
    <div className="max-w-md">
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-[13px] font-bold text-white">
        {n}
      </span>
      <h2 className="mt-4 text-[1.65rem] font-bold tracking-tight text-slate-900">{title}</h2>
      <p className="mt-3 text-[14px] leading-relaxed text-slate-500">{text}</p>
      <CheckList items={items} />
      <a
        href="#demo"
        className="mt-6 inline-flex rounded-lg border border-primary bg-white px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/5"
      >
        Learn More
      </a>
    </div>
  );
}

function FeatureSection({ id, reverse = false, copy, visual }) {
  return (
    <section id={id} className="scroll-mt-24 py-10 sm:py-12">
      <div className="mx-auto max-w-[1120px] px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white px-5 py-8 shadow-[0_16px_40px_-32px_rgba(15,23,42,0.3)] sm:px-8 sm:py-10">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
            <div className={reverse ? 'lg:order-2' : ''}>{copy}</div>
            <div className={reverse ? 'lg:order-1' : ''}>{visual}</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Avatar({ name, tone = 'bg-sky-500' }) {
  const initials = String(name)
    .split(/\s+/)
    .map((p) => p[0])
    .join('')
    .slice(0, 2);
  return (
    <span
      className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${tone}`}
    >
      {initials}
    </span>
  );
}

function ActionIcons() {
  return (
    <div className="flex items-center gap-2 text-slate-400">
      <Eye size={13} />
      <Pencil size={13} />
      <Download size={13} />
      <Trash2 size={13} />
    </div>
  );
}

function AgencyDashboardHero() {
  const kpis = [
    { label: 'Total Clients', value: '3', Icon: Users, tone: 'bg-sky-50 text-sky-600' },
    { label: 'Active Caregivers', value: '4', Icon: UserPlus, tone: 'bg-emerald-50 text-emerald-600' },
    { label: "Today's Visits", value: '0', Icon: CalendarDays, tone: 'bg-violet-50 text-violet-600' },
    { label: 'Hours This Week', value: '00h 00m', Icon: Clock3, tone: 'bg-orange-50 text-orange-500' },
    { label: 'Revenue (This Month)', value: '$17.50', Icon: DollarSign, tone: 'bg-teal-50 text-teal-600' },
  ];
  const actions = [
    'Add New Client',
    'Add Caregiver',
    'Schedule Visit',
    'Assessments',
    'Care Plans',
    'EVV Dashboard',
  ];

  return (
    <MockCard className="shadow-[0_24px_50px_-28px_rgba(15,23,42,0.45)]">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {kpis.map(({ label, value, Icon, tone }) => (
          <div key={label} className="rounded-xl border border-slate-100 bg-slate-50/70 px-2.5 py-2.5">
            <div className="flex items-start justify-between gap-1">
              <div>
                <p className="text-[9px] font-medium text-slate-500">{label}</p>
                <p className="mt-0.5 text-sm font-bold text-slate-900">{value}</p>
              </div>
              <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full ${tone}`}>
                <Icon size={13} />
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[1.2fr_0.7fr_0.7fr]">
        <div className="rounded-xl border border-slate-100 p-3">
          <p className="text-[12px] font-bold text-slate-900">Visit Overview</p>
          <svg viewBox="0 0 280 90" className="mt-2 h-20 w-full" aria-hidden>
            <polyline
              fill="none"
              stroke="#0055d4"
              strokeWidth="2.5"
              points="8,70 48,55 88,62 128,40 168,48 208,28 248,35 272,22"
            />
            <polyline
              fill="none"
              stroke="#94a3b8"
              strokeWidth="1.5"
              strokeDasharray="4 3"
              points="8,75 48,68 88,72 128,60 168,64 208,50 248,55 272,48"
            />
          </svg>
        </div>
        <div className="rounded-xl border border-slate-100 p-3">
          <p className="text-[12px] font-bold text-slate-900">Clients by Status</p>
          <p className="mt-2 text-lg font-bold text-slate-900">3 Total</p>
          <ul className="mt-2 space-y-1 text-[11px] text-slate-500">
            <li className="flex justify-between"><span>Active</span><span className="font-semibold text-emerald-600">3</span></li>
            <li className="flex justify-between"><span>Pending</span><span className="font-semibold">0</span></li>
            <li className="flex justify-between"><span>Inactive</span><span className="font-semibold">0</span></li>
          </ul>
        </div>
        <div className="rounded-xl border border-slate-100 p-3">
          <p className="text-[12px] font-bold text-slate-900">Quick Actions</p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {actions.map((a) => (
              <div key={a} className="flex flex-col items-center gap-1 text-center">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Plus size={14} />
                </span>
                <span className="text-[9px] font-medium leading-tight text-slate-500">{a}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-100 p-3">
          <p className="text-[12px] font-bold text-slate-900">Recent Visits</p>
          <p className="mt-3 text-[11px] text-slate-400">No visits scheduled for today.</p>
        </div>
        <div className="rounded-xl border border-slate-100 p-3">
          <p className="text-[12px] font-bold text-slate-900">Caregiver Activity</p>
          <p className="mt-3 text-[11px] text-slate-400">No caregiver hours logged this week.</p>
        </div>
        <div className="rounded-xl border border-slate-100 p-3">
          <p className="text-[12px] font-bold text-slate-900">Action Items</p>
          <ul className="mt-2 space-y-2 text-[11px]">
            <li className="flex items-start justify-between gap-2">
              <span className="text-slate-600">Review 1 submitted EVV enrollment</span>
              <StatusPill label="High" tone="bg-rose-100 text-rose-700" />
            </li>
            <li className="flex items-start justify-between gap-2">
              <span className="text-slate-600">1 open assessment in pipeline</span>
              <StatusPill label="Medium" tone="bg-orange-100 text-orange-700" />
            </li>
          </ul>
        </div>
      </div>
    </MockCard>
  );
}

function CarePlansMock() {
  const stats = [
    { label: 'Total Plans', value: '3', tone: 'bg-sky-50 text-sky-600', Icon: FileText },
    { label: 'Active', value: '3', tone: 'bg-emerald-50 text-emerald-600', Icon: CheckCircle2 },
    { label: 'Draft', value: '0', tone: 'bg-amber-50 text-amber-600', Icon: FileText },
    { label: 'Archived', value: '0', tone: 'bg-slate-100 text-slate-500', Icon: Trash2 },
  ];
  return (
    <MockCard>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-[15px] font-bold text-slate-900">Care Plans</h3>
          <p className="mt-0.5 text-[11px] text-slate-500">Create and manage personalized care plans for clients.</p>
        </div>
        <button type="button" className="rounded-lg bg-primary px-3 py-1.5 text-[11px] font-semibold text-white">
          + Generate Care Plan
        </button>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {stats.map(({ label, value, tone, Icon }) => (
          <div key={label} className={`rounded-xl px-3 py-2.5 ${tone}`}>
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-medium opacity-80">{label}</p>
              <Icon size={13} />
            </div>
            <p className="mt-0.5 text-lg font-bold">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <div className="flex h-8 flex-1 items-center gap-2 rounded-lg border border-slate-200 px-2.5 text-[11px] text-slate-400">
          <Search size={12} /> Search care plans...
        </div>
        <div className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] text-slate-500">All statuses</div>
      </div>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[520px] text-left text-[11px]">
          <thead>
            <tr className="text-[10px] uppercase tracking-wide text-slate-400">
              {['Plan', 'Client', 'Assessor', 'Effective', 'Status', 'Actions'].map((h) => (
                <th key={h} className="pb-2 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ['CP-10003', 'Mary Johnson', 'Sarah J.', '2024-05-01'],
              ['CP-10002', 'Robert Garcia', 'Mike T.', '2024-04-18'],
              ['CP-10001', 'Linda Brown', 'Anna K.', '2024-03-22'],
            ].map((row) => (
              <tr key={row[0]} className="border-t border-slate-100 text-slate-600">
                <td className="py-2.5 pr-2 font-semibold text-primary">{row[0]}</td>
                <td className="py-2.5 pr-2">{row[1]}</td>
                <td className="py-2.5 pr-2">
                  <div className="flex items-center gap-2">
                    <Avatar name={row[2]} />
                    {row[2]}
                  </div>
                </td>
                <td className="py-2.5 pr-2">{row[3]}</td>
                <td className="py-2.5 pr-2">
                  <StatusPill label="Active" tone="bg-emerald-100 text-emerald-700" />
                </td>
                <td className="py-2.5"><ActionIcons /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </MockCard>
  );
}

function CaregiversMock() {
  const stats = [
    { label: 'Total Caregivers', value: '4', tone: 'bg-sky-50 text-sky-600' },
    { label: 'Active', value: '4', tone: 'bg-emerald-50 text-emerald-600' },
    { label: 'Pending', value: '0', tone: 'bg-orange-50 text-orange-600' },
    { label: 'Inactive', value: '0', tone: 'bg-slate-100 text-slate-600' },
  ];
  const rows = [
    { name: 'Leena Anand', email: 'leena@email.com', id: 'CG-10014', phone: '(312) 555-0144', role: 'Caregiver' },
    { name: 'Bala Ji', email: 'bala@email.com', id: 'CG-10011', phone: '(773) 555-0192', role: 'Caregiver' },
  ];
  return (
    <MockCard>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-[15px] font-bold text-slate-900">Caregivers</h3>
          <p className="mt-0.5 max-w-sm text-[11px] text-slate-500">
            Caregivers appear here after you mark a job&apos;s hiring cycle complete.
          </p>
        </div>
        <button type="button" className="text-[12px] font-semibold text-primary">View jobs</button>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className={`rounded-xl px-3 py-2.5 ${s.tone}`}>
            <p className="text-[10px] font-medium opacity-80">{s.label}</p>
            <p className="mt-0.5 text-lg font-bold">{s.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[520px] text-left text-[11px]">
          <thead>
            <tr className="text-[10px] uppercase tracking-wide text-slate-400">
              {['Caregiver', 'Contact', 'Role', 'Status', 'Actions'].map((h) => (
                <th key={h} className="pb-2 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-slate-100 text-slate-600">
                <td className="py-2.5 pr-2">
                  <div className="flex items-center gap-2">
                    <Avatar name={row.name} tone="bg-violet-500" />
                    <div>
                      <p className="font-semibold text-slate-800">{row.name}</p>
                      <p className="text-[10px] text-slate-400">{row.id}</p>
                    </div>
                  </div>
                </td>
                <td className="py-2.5 pr-2">
                  <p>{row.phone}</p>
                  <p className="text-[10px] text-slate-400">{row.email}</p>
                </td>
                <td className="py-2.5 pr-2">{row.role}</td>
                <td className="py-2.5 pr-2">
                  <StatusPill label="Active" tone="bg-emerald-100 text-emerald-700" />
                </td>
                <td className="py-2.5"><ActionIcons /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </MockCard>
  );
}

function ClientsMock() {
  const rows = [
    { name: 'Jimmy Johnson', id: 'CLT-10022', contact: '(312) 555-0101', loc: 'Chicago, IL' },
    { name: 'Hemant Singh', id: 'CLT-10021', contact: '(773) 555-0188', loc: 'Evanston, IL' },
    { name: 'Mary Johnson', id: 'CLT-10018', contact: '(847) 555-0145', loc: 'Naperville, IL' },
  ];
  return (
    <MockCard>
      <div>
        <h3 className="text-[15px] font-bold text-slate-900">Clients</h3>
        <p className="mt-0.5 text-[11px] text-slate-500">View client profiles and manage care assignments.</p>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {[
          { label: 'Total Clients', value: '3', tone: 'bg-sky-50 text-sky-700' },
          { label: 'Active', value: '3', tone: 'bg-emerald-50 text-emerald-700' },
          { label: 'Inactive', value: '0', tone: 'bg-slate-100 text-slate-600' },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl px-3 py-2.5 ${s.tone}`}>
            <p className="text-[10px] font-medium opacity-80">{s.label}</p>
            <p className="mt-0.5 text-lg font-bold">{s.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[520px] text-left text-[11px]">
          <thead>
            <tr className="text-[10px] uppercase tracking-wide text-slate-400">
              {['Client', 'Contact', 'Location', 'Status', 'Actions'].map((h) => (
                <th key={h} className="pb-2 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-slate-100 text-slate-600">
                <td className="py-2.5 pr-2">
                  <p className="font-semibold text-slate-800">{row.name}</p>
                  <p className="text-[10px] text-slate-400">{row.id}</p>
                </td>
                <td className="py-2.5 pr-2">{row.contact}</td>
                <td className="py-2.5 pr-2">{row.loc}</td>
                <td className="py-2.5 pr-2">
                  <StatusPill label="Active" tone="bg-emerald-100 text-emerald-700" />
                </td>
                <td className="py-2.5"><ActionIcons /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </MockCard>
  );
}

function InvoicesMock() {
  const rows = [
    { inv: 'INV-10004', client: 'Mary Johnson', email: 'mary.j@email.com', period: '2024-09-01 — 2024-09-15', visits: 12, total: '$1,240.00' },
    { inv: 'INV-10002', client: 'Linda Brown', email: 'linda.b@email.com', period: '2024-09-02 — 2024-09-03', visits: 2, total: '$17.50' },
  ];
  return (
    <MockCard>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-[15px] font-bold text-slate-900">Client Invoices</h3>
          <p className="mt-0.5 text-[11px] text-slate-500">
            Generate private-pay invoices from approved EVV visits and care-plan rates.
          </p>
        </div>
        <button type="button" className="rounded-lg bg-primary px-3 py-1.5 text-[11px] font-semibold text-white">
          + Generate Invoice
        </button>
      </div>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-[11px]">
          <thead>
            <tr className="text-[10px] uppercase tracking-wide text-slate-400">
              {['Invoice', 'Client', 'Period', 'Visits', 'Total', 'Status', 'Actions'].map((h) => (
                <th key={h} className="pb-2 font-semibold">{h}</th>
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
                  <div className="flex items-center gap-2 text-slate-400">
                    <Eye size={13} />
                    <DollarSign size={13} className="text-emerald-500" />
                    <Ban size={13} className="text-rose-500" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </MockCard>
  );
}

function MobileAppsMock() {
  const phones = [
    {
      title: 'EVV Dashboard',
      body: (
        <>
          <p className="text-[11px] font-semibold text-slate-800">Welcome back</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-sky-50 p-2">
              <p className="text-[9px] text-slate-500">Today&apos;s Visits</p>
              <p className="text-sm font-bold text-slate-900">3</p>
            </div>
            <div className="rounded-lg bg-emerald-50 p-2">
              <p className="text-[9px] text-slate-500">Hours</p>
              <p className="text-sm font-bold text-slate-900">6.5h</p>
            </div>
          </div>
        </>
      ),
    },
    {
      title: 'Care Plans',
      body: (
        <div className="mt-2 space-y-2">
          {['Personal Care · Emma D.', 'Medication · John W.', 'Housekeeping · James C.'].map((t) => (
            <div key={t} className="rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-2 text-[10px] font-medium text-slate-700">
              {t}
            </div>
          ))}
        </div>
      ),
    },
    {
      title: 'Assessments',
      body: (
        <>
          <button type="button" className="mt-1 w-full rounded-md bg-primary py-1.5 text-[10px] font-semibold text-white">
            + New Assessment
          </button>
          <div className="mt-2 space-y-2">
            {['Initial Assessment', 'Reassessment', 'Discharge'].map((t) => (
              <div key={t} className="rounded-lg border border-slate-100 px-2.5 py-2 text-[10px] text-slate-600">
                {t}
              </div>
            ))}
          </div>
        </>
      ),
    },
  ];

  return (
    <MockCard>
      <div className="grid grid-cols-3 gap-3">
        {phones.map((phone) => (
          <div
            key={phone.title}
            className="rounded-[1.25rem] border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-2 shadow-inner"
          >
            <div className="mx-auto mb-2 h-1 w-8 rounded-full bg-slate-300" />
            <p className="text-center text-[10px] font-bold text-slate-800">{phone.title}</p>
            <div className="mt-2 min-h-[140px] rounded-xl bg-white p-2 shadow-sm">{phone.body}</div>
          </div>
        ))}
      </div>
    </MockCard>
  );
}

function AssessmentsMock() {
  return (
    <MockCard>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-[15px] font-bold text-slate-900">Client Assessments</h3>
          <p className="mt-0.5 text-[11px] text-slate-500">Track enquiry-to-onboard assessment workflow.</p>
        </div>
        <button type="button" className="rounded-lg bg-primary px-3 py-1.5 text-[11px] font-semibold text-white">
          + New Assessment
        </button>
      </div>
      <div className="mt-3 rounded-lg bg-sky-50 px-3 py-2 text-[10px] text-sky-800">
        Workflow: New enquiry → Complete assessment → Generate quote → Client agrees → Onboard for service.
      </div>
      <div className="mt-3 grid grid-cols-4 gap-2">
        {[
          { label: 'Total', value: '4', tone: 'bg-sky-50 text-sky-700' },
          { label: 'Enquiries', value: '1', tone: 'bg-blue-50 text-blue-700' },
          { label: 'Denied', value: '0', tone: 'bg-amber-50 text-amber-700' },
          { label: 'Onboarded', value: '3', tone: 'bg-emerald-50 text-emerald-700' },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl px-2.5 py-2 ${s.tone}`}>
            <p className="text-[9px] font-medium opacity-80">{s.label}</p>
            <p className="text-base font-bold">{s.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[480px] text-left text-[11px]">
          <thead>
            <tr className="text-[10px] uppercase tracking-wide text-slate-400">
              {['Client', 'Assessment ID', 'Status', 'Actions'].map((h) => (
                <th key={h} className="pb-2 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ['Mary Johnson', 'ASM-1004', 'Accepted', 'bg-emerald-100 text-emerald-700'],
              ['Robert Garcia', 'ASM-1003', 'Enquiry', 'bg-sky-100 text-sky-700'],
            ].map((row) => (
              <tr key={row[1]} className="border-t border-slate-100 text-slate-600">
                <td className="py-2.5 pr-2 font-medium text-slate-800">{row[0]}</td>
                <td className="py-2.5 pr-2">{row[1]}</td>
                <td className="py-2.5 pr-2">
                  <StatusPill label={row[2]} tone={row[3]} />
                </td>
                <td className="py-2.5"><ActionIcons /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </MockCard>
  );
}

function LeadsMock() {
  return (
    <MockCard>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          { label: 'Total Leads', value: '4', tone: 'bg-sky-50 text-sky-700' },
          { label: 'Open', value: '1', tone: 'bg-violet-50 text-violet-700' },
          { label: 'Hot / High', value: '4', tone: 'bg-orange-50 text-orange-700', Icon: Flame },
          { label: 'Converted', value: '3', tone: 'bg-emerald-50 text-emerald-700' },
        ].map(({ label, value, tone, Icon }) => (
          <div key={label} className={`rounded-xl px-3 py-2.5 ${tone}`}>
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-medium opacity-80">{label}</p>
              {Icon ? <Icon size={13} /> : null}
            </div>
            <p className="mt-0.5 text-lg font-bold">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[520px] text-left text-[11px]">
          <thead>
            <tr className="text-[10px] uppercase tracking-wide text-slate-400">
              {['Lead', 'Source', 'Stage', 'Priority', 'Assigned'].map((h) => (
                <th key={h} className="pb-2 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ['Robert Chen', 'Website', 'Proposal Sent', 'High', 'Sarah J.', 'bg-violet-100 text-violet-700'],
              ['Linda Martinez', 'Referral', 'Converted', 'Medium', 'Mike T.', 'bg-emerald-100 text-emerald-700'],
            ].map((row) => (
              <tr key={row[0]} className="border-t border-slate-100 text-slate-600">
                <td className="py-2.5 pr-2 font-semibold text-slate-800">{row[0]}</td>
                <td className="py-2.5 pr-2">{row[1]}</td>
                <td className="py-2.5 pr-2">
                  <StatusPill label={row[2]} tone={row[5]} />
                </td>
                <td className={`py-2.5 pr-2 font-semibold ${row[3] === 'High' ? 'text-rose-600' : 'text-slate-600'}`}>
                  {row[3]}
                </td>
                <td className="py-2.5">{row[4]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </MockCard>
  );
}

const SECTIONS = [
  {
    id: 'caregiver-dashboard',
    n: '01',
    title: 'Caregiver Dashboard',
    text: 'Caregivers get everything they need in one place to manage visits, tasks, clients, and documentation on the go.',
    items: [
      'View daily schedules and visits',
      'Track time with EVV',
      'Access client care plans',
      'Upload documents & notes',
      'Message clients & admin',
    ],
    reverse: false,
    visual: <CarePlansMock />,
  },
  {
    id: 'patient-family-portal',
    n: '02',
    title: 'Patient / Family Portal',
    text: 'Empower families with visibility into care, schedules, updates, messages and important documents.',
    items: [
      'View care plans & schedules',
      'Receive visit updates',
      'Message caregivers',
      'Access documents & reports',
      'Track care progress',
    ],
    reverse: true,
    visual: <CaregiversMock />,
  },
  {
    id: 'client-portal',
    n: '03',
    title: 'Client Portal',
    text: 'Clients can view their care plans, visits, messages, and documents in an easy-to-use, secure portal.',
    items: [
      'View care plans & goals',
      'Check visit schedules',
      'See caregiver notes',
      'Access documents',
      'Message care team',
    ],
    reverse: false,
    visual: <ClientsMock />,
  },
  {
    id: 'payer-auditor-portal',
    n: '04',
    title: 'Payer / Auditor Portal',
    text: 'Payers and auditors get secure access to necessary information, reports, and compliance data.',
    items: [
      'View authorizations & claims',
      'Access visit & EVV reports',
      'Review documentation',
      'Track compliance',
      'Generate audit reports',
    ],
    reverse: true,
    visual: <InvoicesMock />,
  },
  {
    id: 'admin-dashboard',
    n: '05',
    title: 'Admin Dashboard',
    text: 'Administrators get a complete overview of operations, users, compliance, billing, and performance.',
    items: [
      'Manage agencies, users & roles',
      'Monitor schedules & visits',
      'View reports & analytics',
      'Manage billing & subscriptions',
      'System settings & alerts',
    ],
    reverse: false,
    visual: <AgencyDashboardHero />,
  },
  {
    id: 'mobile-apps',
    n: '06',
    title: 'Mobile Apps',
    text: 'CareTraker mobile apps help caregivers and staff stay connected and productive anywhere.',
    items: [
      'Caregiver mobile app',
      'EVV with geolocation',
      'Offline access',
      'Real-time notifications',
      'Secure & easy to use',
    ],
    reverse: true,
    visual: <MobileAppsMock />,
  },
  {
    id: 'telehealth',
    n: '07',
    title: 'Telehealth',
    text: 'Built-in telehealth tools enable virtual visits, consultations, and remote check-ins.',
    items: [
      'One-click video visits',
      'Secure & HIPAA compliant',
      'Screen sharing',
      'Visit notes & documentation',
      'Easy scheduling',
    ],
    reverse: false,
    visual: <AssessmentsMock />,
  },
  {
    id: 'communication-tools',
    n: '08',
    title: 'Communication Tools',
    text: 'Stay connected with secure messaging, announcements, alerts, and team collaboration.',
    items: [
      'Secure in-app messaging',
      'Announcements',
      'Real-time notifications',
      'Team collaboration',
      'Document sharing',
    ],
    reverse: true,
    visual: <LeadsMock />,
  },
];

export default function PortalsPage() {
  return (
    <div className="bg-[#f5f7fb] text-slate-900">
      <section id="overview" className="scroll-mt-24 bg-gradient-to-b from-[#eef5ff] via-white to-[#f5f7fb]">
        <div className="mx-auto grid max-w-[1120px] gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[0.95fr_1.15fr] lg:items-center lg:gap-12 lg:px-8 lg:py-16">
          <div>
            <p className="text-[13px] font-semibold text-primary">Portals</p>
            <h1 className="mt-3 text-[2.35rem] font-bold leading-[1.12] tracking-tight text-slate-900 sm:text-[2.75rem]">
              One Platform.{' '}
              <span className="text-primary">Every Portal.</span>
              <br />
              Every User.
            </h1>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-slate-500">
              CareTraker connects caregivers, clients, families, payers, auditors and administrators in one
              seamless, secure ecosystem.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="mailto:sales@caretraker.com?subject=Portals%20Demo%20Request"
                className="inline-flex rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_-10px_rgba(0,85,212,0.7)] hover:bg-primary-hover"
              >
                Request a Demo
              </a>
              <a
                href="#caregiver-dashboard"
                className="inline-flex items-center gap-2 rounded-lg border border-primary bg-white px-5 py-2.5 text-sm font-semibold text-primary hover:bg-primary/5"
              >
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white">
                  <Play size={10} fill="currentColor" />
                </span>
                Explore Portals
              </a>
            </div>
          </div>
          <AgencyDashboardHero />
        </div>
      </section>

      <section className="px-4 pb-4 pt-6 text-center sm:px-6 lg:px-8">
        <h2 className="text-[1.65rem] font-bold tracking-tight text-slate-900 sm:text-[1.85rem]">
          Built for Every Role. Designed for Every Need.
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500">
          Explore powerful portals created for every user in the home care ecosystem.
        </p>
      </section>

      <div className="pb-4">
        {SECTIONS.map((section) => (
          <FeatureSection
            key={section.id}
            id={section.id}
            reverse={section.reverse}
            copy={
              <FeatureCopy
                n={section.n}
                title={section.title}
                text={section.text}
                items={section.items}
              />
            }
            visual={section.visual}
          />
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
                Give every role the right portal — and keep your whole care network connected.
              </p>
            </div>
            <a
              href="mailto:sales@caretraker.com?subject=Portals%20Demo%20Request"
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
