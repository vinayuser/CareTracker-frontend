import {
  BarChart3,
  Briefcase,
  Check,
  Pencil,
  Search,
  Trash2,
  UserPlus,
  UserRound,
  Users,
} from 'lucide-react';

function Avatar({ name, tone }) {
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2);
  return (
    <span
      className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white ${tone}`}
    >
      {initials}
    </span>
  );
}

function CheckList({ items }) {
  return (
    <ul className="mt-5 space-y-3">
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
    <div className="max-w-sm">
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary text-[13px] font-bold text-primary">
        {n}
      </span>
      <h2 className="mt-4 text-[1.45rem] font-bold tracking-tight text-slate-900">{title}</h2>
      <p className="mt-2 text-[13px] leading-relaxed text-slate-500">{text}</p>
      <CheckList items={items} />
    </div>
  );
}

function MockCard({ children, className = '' }) {
  return (
    <div
      className={`h-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.4)] sm:p-6 ${className}`}
    >
      {children}
    </div>
  );
}

function ViewAll() {
  return (
    <button type="button" className="text-[12px] font-semibold text-primary hover:text-primary-hover">
      View All
    </button>
  );
}

function StatusPill({ label, tone }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${tone}`}>{label}</span>
  );
}

function HrStaffHero() {
  const stats = [
    { label: 'Total HR Staff', value: '3', tone: 'bg-sky-50 text-sky-700' },
    { label: 'Active', value: '3', tone: 'bg-emerald-50 text-emerald-700' },
    { label: 'Pending', value: '0', tone: 'bg-amber-50 text-amber-700' },
    { label: 'Inactive', value: '0', tone: 'bg-slate-50 text-slate-600' },
  ];
  const rows = [
    {
      name: 'Amanda Clark',
      id: 'HR-001',
      title: 'HR Manager',
      dept: 'Human Resources',
      hire: 'Jan 12, 2023',
      avatar: 'bg-rose-400',
    },
    {
      name: 'Brian Foster',
      id: 'HR-002',
      title: 'HR Specialist',
      dept: 'Human Resources',
      hire: 'Mar 4, 2024',
      avatar: 'bg-sky-500',
    },
    {
      name: 'Nina Patel',
      id: 'HR-003',
      title: 'Recruiter',
      dept: 'Talent',
      hire: 'Apr 18, 2024',
      avatar: 'bg-violet-500',
    },
  ];

  return (
    <MockCard className="shadow-[0_24px_50px_-28px_rgba(15,23,42,0.45)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-[15px] font-bold text-slate-900">HR Staff</h3>
          <p className="mt-0.5 text-[11px] text-slate-500">
            Manage HR team members, credentials, and portal access for your agency.
          </p>
        </div>
        <button
          type="button"
          className="rounded-lg bg-primary px-3 py-1.5 text-[11px] font-semibold text-white"
        >
          + Create HR Account
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className={`rounded-xl px-3 py-2.5 ${s.tone}`}>
            <p className="text-[10px] font-medium opacity-80">{s.label}</p>
            <p className="mt-0.5 text-lg font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <h4 className="text-[13px] font-bold text-slate-900">HR Team Members</h4>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex h-8 w-40 items-center gap-2 rounded-lg border border-slate-200 px-2.5 text-[11px] text-slate-400">
            <Search size={12} /> Search...
          </div>
          <div className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] text-slate-500">
            All statuses
          </div>
        </div>
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[620px] text-left text-[11px]">
          <thead>
            <tr className="text-[10px] uppercase tracking-wide text-slate-400">
              {['Employee', 'Employee ID', 'Job Title', 'Department', 'Hire Date', 'Status', 'Actions'].map(
                (h) => (
                  <th key={h} className="pb-2 font-semibold">
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-slate-100 text-slate-600">
                <td className="py-2.5 pr-2">
                  <div className="flex items-center gap-2">
                    <Avatar name={row.name} tone={row.avatar} />
                    <span className="font-medium text-slate-800">{row.name}</span>
                  </div>
                </td>
                <td className="py-2.5 pr-2">{row.id}</td>
                <td className="py-2.5 pr-2">{row.title}</td>
                <td className="py-2.5 pr-2">{row.dept}</td>
                <td className="py-2.5 pr-2">{row.hire}</td>
                <td className="py-2.5 pr-2">
                  <StatusPill label="Active" tone="bg-emerald-100 text-emerald-700" />
                </td>
                <td className="py-2.5">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Pencil size={13} />
                    <Trash2 size={13} />
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

function KpiRow() {
  const cards = [
    {
      label: 'Total Employees',
      value: '1,248',
      trend: '+12% this month',
      trendTone: 'text-emerald-600',
      iconTone: 'bg-sky-50 text-sky-600',
      Icon: Users,
    },
    {
      label: 'Active Today',
      value: '986',
      trend: '+10% this month',
      trendTone: 'text-emerald-600',
      iconTone: 'bg-emerald-50 text-emerald-600',
      Icon: UserRound,
    },
    {
      label: 'On Leave',
      value: '86',
      trend: '+8% this month',
      trendTone: 'text-orange-500',
      iconTone: 'bg-orange-50 text-orange-500',
      Icon: Briefcase,
    },
    {
      label: 'Open Positions',
      value: '24',
      trend: '+5% this month',
      trendTone: 'text-violet-600',
      iconTone: 'bg-violet-50 text-violet-600',
      Icon: UserPlus,
    },
  ];

  return (
    <div className="mx-auto grid max-w-[1120px] gap-3 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
      {cards.map(({ label, value, trend, trendTone, iconTone, Icon }) => (
        <div
          key={label}
          className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white px-4 py-4 shadow-[0_12px_28px_-24px_rgba(15,23,42,0.35)]"
        >
          <div>
            <p className="text-[11px] font-medium text-slate-500">{label}</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
            <p className={`mt-1 text-[11px] font-semibold ${trendTone}`}>▲ {trend}</p>
          </div>
          <span className={`inline-flex h-11 w-11 items-center justify-center rounded-full ${iconTone}`}>
            <Icon size={18} strokeWidth={1.85} />
          </span>
        </div>
      ))}
    </div>
  );
}

function EmployeeVisual() {
  const stats = [
    { label: 'Total Employees', value: '1,248' },
    { label: 'Full Time', value: '842' },
    { label: 'Part Time', value: '286' },
    { label: 'Contract', value: '120' },
  ];
  const rows = [
    {
      name: 'Jessica Brown',
      position: 'Caregiver',
      dept: 'Care Services',
      date: 'May 10, 2024',
      avatar: 'bg-rose-400',
    },
    {
      name: 'Michael Davis',
      position: 'Nurse',
      dept: 'Nursing',
      date: 'May 8, 2024',
      avatar: 'bg-sky-500',
    },
  ];

  return (
    <MockCard>
      <h3 className="text-[15px] font-bold text-slate-900">Employee Overview</h3>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label}>
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">{s.label}</p>
            <p className="mt-1 text-xl font-bold text-slate-900">{s.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-5 flex items-center justify-between">
        <h4 className="text-[13px] font-bold text-slate-900">Recent Hires</h4>
        <ViewAll />
      </div>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[520px] text-left text-[12px]">
          <thead>
            <tr className="text-[10px] uppercase tracking-wide text-slate-400">
              {['Employee', 'Position', 'Department', 'Start Date', 'Status'].map((h) => (
                <th key={h} className="pb-2 font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.name} className="border-t border-slate-100 text-slate-600">
                <td className="py-3 pr-2">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={row.name} tone={row.avatar} />
                    <span className="font-medium text-slate-800">{row.name}</span>
                  </div>
                </td>
                <td className="py-3 pr-2">{row.position}</td>
                <td className="py-3 pr-2">{row.dept}</td>
                <td className="py-3 pr-2">{row.date}</td>
                <td className="py-3">
                  <StatusPill label="Active" tone="bg-emerald-100 text-emerald-700" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </MockCard>
  );
}

function AttendanceVisual() {
  const stats = [
    { label: 'Present Today', value: '986', pct: '79%' },
    { label: 'Absent Today', value: '112', pct: '9%' },
    { label: 'On Leave', value: '86', pct: '7%' },
    { label: 'Late / Early', value: '64', pct: '5%' },
  ];
  const rows = [
    {
      name: 'Sarah Wilson',
      in: '08:00 AM',
      out: '04:57 PM',
      hours: '8h 57m',
      status: 'Present',
      tone: 'bg-emerald-100 text-emerald-700',
      avatar: 'bg-violet-400',
    },
    {
      name: 'David Martinez',
      in: '09:05 AM',
      out: '06:04 PM',
      hours: '8h 59m',
      status: 'Late',
      tone: 'bg-orange-100 text-orange-600',
      avatar: 'bg-indigo-500',
    },
  ];

  return (
    <MockCard>
      <h3 className="text-[15px] font-bold text-slate-900">Attendance Overview</h3>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label}>
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">{s.label}</p>
            <p className="mt-1 text-xl font-bold text-slate-900">{s.value}</p>
            <p className="text-[11px] text-slate-400">{s.pct}</p>
          </div>
        ))}
      </div>
      <div className="mt-5 flex items-center justify-between">
        <h4 className="text-[13px] font-bold text-slate-900">Today&apos;s Attendance</h4>
        <ViewAll />
      </div>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[520px] text-left text-[12px]">
          <thead>
            <tr className="text-[10px] uppercase tracking-wide text-slate-400">
              {['Employee', 'Clock In', 'Clock Out', 'Total Hours', 'Status'].map((h) => (
                <th key={h} className="pb-2 font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.name} className="border-t border-slate-100 text-slate-600">
                <td className="py-3 pr-2">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={row.name} tone={row.avatar} />
                    <span className="font-medium text-slate-800">{row.name}</span>
                  </div>
                </td>
                <td className="py-3 pr-2">{row.in}</td>
                <td className="py-3 pr-2">{row.out}</td>
                <td className="py-3 pr-2">{row.hours}</td>
                <td className="py-3">
                  <StatusPill label={row.status} tone={row.tone} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </MockCard>
  );
}

function PayrollVisual() {
  const stats = [
    { label: 'Employees Paid', value: '1,182' },
    { label: 'Gross Payroll', value: '$485,620' },
    { label: 'Deductions', value: '$68,430' },
    { label: 'Net Payroll', value: '$417,190' },
  ];
  const rows = [
    {
      period: 'May 1 – May 15, 2024',
      date: 'May 20, 2024',
      employees: '1,182',
      gross: '$485,620',
    },
    {
      period: 'Apr 16 – Apr 30, 2024',
      date: 'May 5, 2024',
      employees: '1,174',
      gross: '$478,230',
    },
  ];

  return (
    <MockCard>
      <h3 className="text-[15px] font-bold text-slate-900">Payroll Overview</h3>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label}>
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">{s.label}</p>
            <p className="mt-1 text-xl font-bold text-slate-900">{s.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-5 flex items-center justify-between">
        <h4 className="text-[13px] font-bold text-slate-900">Recent Payroll</h4>
        <ViewAll />
      </div>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-[12px]">
          <thead>
            <tr className="text-[10px] uppercase tracking-wide text-slate-400">
              {['Pay Period', 'Pay Date', 'Employees', 'Gross Amount', 'Status'].map((h) => (
                <th key={h} className="pb-2 font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.period} className="border-t border-slate-100 text-slate-600">
                <td className="py-3 pr-2 font-medium text-slate-800">{row.period}</td>
                <td className="py-3 pr-2">{row.date}</td>
                <td className="py-3 pr-2">{row.employees}</td>
                <td className="py-3 pr-2">{row.gross}</td>
                <td className="py-3">
                  <StatusPill label="Completed" tone="bg-emerald-500 text-white" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </MockCard>
  );
}

function FeatureSection({ id, copy, visual }) {
  return (
    <section id={id} className="scroll-mt-24 py-10 sm:py-12">
      <div className="mx-auto grid max-w-[1120px] items-center gap-8 px-4 sm:px-6 lg:grid-cols-[0.85fr_1.4fr] lg:gap-10 lg:px-8">
        {copy}
        {visual}
      </div>
    </section>
  );
}

export default function HrPage() {
  return (
    <div className="bg-white text-slate-900">
      <section id="overview" className="scroll-mt-24">
        <div className="mx-auto grid max-w-[1120px] gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:gap-12 lg:px-8 lg:py-16">
          <div>
            <h1 className="text-[2.45rem] font-bold leading-[1.12] tracking-tight text-slate-900 sm:text-[2.85rem]">
              HR & Workforce
            </h1>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-slate-500">
              Manage your people, streamline operations, and build a stronger, more engaged workforce.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="#employee-management"
                className="inline-flex rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_-10px_rgba(0,85,212,0.7)] hover:bg-primary-hover"
              >
                View Live Monitor
              </a>
              <a
                href="#time-attendance"
                className="inline-flex items-center gap-2 rounded-lg border border-primary bg-white px-5 py-2.5 text-sm font-semibold text-primary hover:bg-primary/5"
              >
                <BarChart3 size={16} strokeWidth={2} />
                EVV Reports
              </a>
            </div>
          </div>
          <HrStaffHero />
        </div>
      </section>

      <section className="pb-6 pt-2">
        <KpiRow />
      </section>

      <FeatureSection
        id="employee-management"
        copy={
          <FeatureCopy
            n="1"
            title="Employee Management"
            text="Centralize employee information and maintain accurate records."
            items={[
              'Employee profiles & records',
              'Job & department management',
              'Document management',
              'Roles & permissions',
            ]}
          />
        }
        visual={<EmployeeVisual />}
      />

      <FeatureSection
        id="time-attendance"
        copy={
          <FeatureCopy
            n="2"
            title="Time & Attendance"
            text="Track attendance, shifts, breaks and ensure accountability."
            items={['Clock in / out tracking', 'Break tracking']}
          />
        }
        visual={<AttendanceVisual />}
      />

      <FeatureSection
        id="time-card-payroll"
        copy={
          <FeatureCopy
            n="3"
            title="Time Card & Payroll"
            text="Process time cards and run payroll accurately and on time."
            items={['Time card approvals', 'Payroll processing']}
          />
        }
        visual={<PayrollVisual />}
      />

      <section id="demo" className="scroll-mt-24 pb-16 pt-4">
        <div className="mx-auto max-w-[1120px] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 rounded-2xl border border-sky-100 bg-[#eef6ff] px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-7 sm:py-7">
            <div>
              <h3 className="text-[1.25rem] font-bold text-slate-900 sm:text-[1.35rem]">
                Empower Your Workforce. Deliver Better Care.
              </h3>
              <p className="mt-1.5 max-w-xl text-sm text-slate-500">
                Streamline HR operations and support your team with the tools they need to succeed.
              </p>
            </div>
            <a
              href="mailto:sales@caretraker.com?subject=HR%20%26%20Workforce%20Demo%20Request"
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
