import {
  BarChart3,
  RefreshCw,
  UserPlus,
  UserRound,
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

function FeatureCard({ n, title, text, items }) {
  return (
    <div className="h-full rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_12px_32px_-24px_rgba(15,23,42,0.35)] sm:p-7">
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary text-[13px] font-bold text-primary">
        {n}
      </span>
      <h2 className="mt-4 text-[1.35rem] font-bold tracking-tight text-slate-900">{title}</h2>
      <p className="mt-2 text-[13px] leading-relaxed text-slate-500">{text}</p>
      <ul className="mt-5 space-y-2.5">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-[13px] text-slate-600">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            {item}
          </li>
        ))}
      </ul>
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

function StatusText({ label, tone }) {
  return <span className={`text-[12px] font-semibold ${tone}`}>{label}</span>;
}

function StatusPill({ label, tone }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${tone}`}>{label}</span>
  );
}

function HiringPipelineHero() {
  const stats = [
    { label: 'Pipeline Stages', value: '4', iconTone: 'bg-sky-100 text-sky-600' },
    { label: 'Required Documents', value: '16', iconTone: 'bg-emerald-100 text-emerald-600' },
    { label: 'Available Forms', value: '19', iconTone: 'bg-blue-100 text-primary' },
  ];
  const stages = [
    {
      n: 1,
      title: 'First Level Interview',
      tags: ['Employment Application', 'Background Check'],
    },
    {
      n: 2,
      title: 'Second Level Interview',
      tags: ['Skills Checklist', 'I-9 Form'],
    },
    {
      n: 3,
      title: 'Third Level Interview',
      tags: ['Reference Check', 'Drug Screening'],
    },
    {
      n: 4,
      title: 'Final Level Interview',
      tags: ['Offer Letter', 'Onboarding Packet'],
    },
  ];

  return (
    <MockCard className="shadow-[0_24px_50px_-28px_rgba(15,23,42,0.45)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-[15px] font-bold text-slate-900">Hiring Pipeline</h3>
        <button
          type="button"
          className="rounded-lg bg-primary px-3 py-1.5 text-[11px] font-semibold text-white"
        >
          Configure Pipeline
        </button>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2.5"
          >
            <span className={`inline-flex h-8 w-8 items-center justify-center rounded-lg text-[12px] font-bold ${s.iconTone}`}>
              {s.value}
            </span>
            <div>
              <p className="text-[11px] font-medium text-slate-500">{s.label}</p>
              <p className="text-sm font-bold text-slate-900">{s.value}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 space-y-2.5">
        {stages.map((stage) => (
          <div key={stage.n} className="rounded-xl border border-slate-100 bg-white px-3 py-2.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white">
                {stage.n}
              </span>
              <p className="text-[13px] font-semibold text-slate-800">{stage.title}</p>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5 pl-8">
              {stage.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </MockCard>
  );
}

function AtsVisual() {
  const stats = [
    { label: 'New Applications', value: '278' },
    { label: 'In Review', value: '124' },
    { label: 'Interview', value: '64' },
    { label: 'Offered', value: '20' },
    { label: 'Hired', value: '18' },
  ];
  const rows = [
    {
      name: 'Jessica Brown',
      position: 'Caregiver',
      date: 'May 10, 2024',
      status: 'In Review',
      tone: 'bg-sky-100 text-sky-700',
      avatar: 'bg-rose-400',
    },
    {
      name: 'Michael Davis',
      position: 'Nurse',
      date: 'May 9, 2024',
      status: 'Interview',
      tone: 'bg-emerald-100 text-emerald-700',
      avatar: 'bg-sky-500',
    },
    {
      name: 'Sarah Wilson',
      position: 'Home Health Aide',
      date: 'May 8, 2024',
      status: 'New',
      tone: 'bg-slate-100 text-slate-600',
      avatar: 'bg-violet-400',
    },
  ];

  return (
    <MockCard>
      <h3 className="text-[15px] font-bold text-slate-900">Application Pipeline</h3>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-slate-200 bg-white px-2.5 py-3 text-center">
            <p className="text-[10px] font-medium leading-tight text-slate-500">{s.label}</p>
            <p className="mt-1.5 text-lg font-bold text-slate-900">{s.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-5 flex items-center justify-between">
        <h4 className="text-[13px] font-bold text-slate-900">Recent Applicants</h4>
        <ViewAll />
      </div>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[480px] text-left text-[12px]">
          <thead>
            <tr className="text-[10px] uppercase tracking-wide text-slate-400">
              {['Candidate', 'Position', 'Applied On', 'Status'].map((h) => (
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
                <td className="py-3 pr-2">{row.date}</td>
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

function ScreeningVisual() {
  const stats = [
    { value: '102', label: 'Background Checks Completed', box: 'bg-slate-50 text-slate-900' },
    { value: '45', label: 'In Progress', box: 'bg-slate-50 text-slate-900' },
    {
      value: '12',
      label: 'Needs Attention — Action Required',
      box: 'bg-amber-50 text-amber-800',
    },
    { value: '98', label: 'Cleared — This Month', box: 'bg-emerald-50 text-emerald-700' },
  ];
  const rows = [
    {
      name: 'James Anderson',
      package: 'Standard Package',
      status: 'Completed',
      tone: 'text-emerald-600',
      date: 'May 10, 2024',
      avatar: 'bg-indigo-500',
    },
    {
      name: 'Linda Thomas',
      package: 'Enhanced Package',
      status: 'In Progress',
      tone: 'text-orange-500',
      date: 'May 9, 2024',
      avatar: 'bg-pink-400',
    },
  ];

  return (
    <MockCard>
      <h3 className="text-[15px] font-bold text-slate-900">Screening Overview</h3>
      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className={`rounded-xl px-3 py-3 ${s.box}`}>
            <p className="text-xl font-bold">{s.value}</p>
            <p className="mt-1 text-[10px] font-medium leading-snug opacity-80">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="mt-5 flex items-center justify-between">
        <h4 className="text-[13px] font-bold text-slate-900">Recent Screenings</h4>
        <ViewAll />
      </div>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[480px] text-left text-[12px]">
          <thead>
            <tr className="text-[10px] uppercase tracking-wide text-slate-400">
              {['Candidate', 'Package', 'Status', 'Updated On'].map((h) => (
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
                <td className="py-3 pr-2">{row.package}</td>
                <td className="py-3 pr-2">
                  <StatusText label={row.status} tone={row.tone} />
                </td>
                <td className="py-3">{row.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </MockCard>
  );
}

function OnboardingVisual() {
  const people = [
    { name: 'Emily Johnson', pct: 40, avatar: 'bg-rose-400' },
    { name: 'Anthony White', pct: 65, avatar: 'bg-sky-500' },
  ];
  const kpis = [
    {
      label: 'Applications',
      value: '1,248',
      trend: '+12% this month',
      Icon: UserRound,
    },
    {
      label: 'Hired This Month',
      value: '86',
      trend: '+18% this month',
      Icon: UserPlus,
    },
    {
      label: 'Onboarding In Progress',
      value: '54',
      trend: '+8% this month',
      Icon: RefreshCw,
    },
  ];

  const r = 54;
  const c = 2 * Math.PI * r;
  const completed = 0.33;
  const inProgress = 0.41;
  const completedLen = c * completed;
  const inProgressLen = c * inProgress;

  return (
    <MockCard>
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <h3 className="text-[15px] font-bold text-slate-900">Onboarding Progress</h3>
          <div className="relative mx-auto mt-4 h-44 w-44">
            <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
              <circle cx="70" cy="70" r={r} fill="none" stroke="#e2e8f0" strokeWidth="14" />
              <circle
                cx="70"
                cy="70"
                r={r}
                fill="none"
                stroke="#94a3b8"
                strokeWidth="14"
                strokeDasharray={`${c * 0.26} ${c}`}
                strokeDashoffset={-(completedLen + inProgressLen)}
                strokeLinecap="butt"
              />
              <circle
                cx="70"
                cy="70"
                r={r}
                fill="none"
                stroke="#22c55e"
                strokeWidth="14"
                strokeDasharray={`${completedLen} ${c}`}
                strokeLinecap="butt"
              />
              <circle
                cx="70"
                cy="70"
                r={r}
                fill="none"
                stroke="#0055d4"
                strokeWidth="14"
                strokeDasharray={`${inProgressLen} ${c}`}
                strokeDashoffset={-completedLen}
                strokeLinecap="butt"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-slate-900">54</span>
              <span className="text-[11px] font-medium text-slate-500">Total</span>
            </div>
          </div>
          <div className="mt-3 space-y-1.5 text-[11px] text-slate-600">
            <p className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Completed 18 (33%)
            </p>
            <p className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary" /> In Progress 22 (41%)
            </p>
            <p className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-slate-400" /> Not Started 14 (26%)
            </p>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-bold text-slate-900">Recent Onboarding</h3>
            <ViewAll />
          </div>
          <div className="mt-4 space-y-4">
            {people.map((p) => (
              <div key={p.name}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={p.name} tone={p.avatar} />
                    <div>
                      <p className="text-[13px] font-semibold text-slate-800">{p.name}</p>
                      <p className="text-[11px] font-medium text-emerald-600">In Progress</p>
                    </div>
                  </div>
                  <span className="text-[12px] font-semibold text-slate-700">{p.pct}%</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: `${p.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {kpis.map(({ label, value, trend, Icon }) => (
          <div
            key={label}
            className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3.5 py-3 shadow-sm"
          >
            <div>
              <p className="text-[11px] font-medium text-slate-500">{label}</p>
              <p className="mt-0.5 text-xl font-bold text-slate-900">{value}</p>
              <p className="text-[11px] font-semibold text-emerald-600">{trend}</p>
            </div>
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-primary">
              <Icon size={18} strokeWidth={1.85} />
            </span>
          </div>
        ))}
      </div>
    </MockCard>
  );
}

function TrainingVisual() {
  const stats = [
    { label: 'Assigned', value: '156', box: 'bg-slate-50 text-slate-900' },
    { label: 'In Progress', value: '88', box: 'bg-sky-50 text-slate-900' },
    { label: 'Completed', value: '124', box: 'bg-emerald-50 text-emerald-700' },
    { label: 'Overdue', value: '16', box: 'bg-rose-50 text-rose-600' },
  ];
  const rows = [
    {
      course: 'HIPAA Compliance',
      assigned: '25 Caregivers',
      status: 'In Progress',
      tone: 'text-primary',
      due: 'May 20, 2024',
    },
    {
      course: 'Infection Control',
      assigned: '18 Caregivers',
      status: 'Completed',
      tone: 'text-emerald-600',
      due: 'May 18, 2024',
    },
  ];

  return (
    <MockCard>
      <h3 className="text-[15px] font-bold text-slate-900">Training Overview</h3>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className={`rounded-xl px-3 py-3 ${s.box}`}>
            <p className="text-[11px] font-medium text-slate-500">{s.label}</p>
            <p className="mt-1 text-xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-5 flex items-center justify-between">
        <h4 className="text-[13px] font-bold text-slate-900">Recent Training</h4>
        <ViewAll />
      </div>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[480px] text-left text-[12px]">
          <thead>
            <tr className="text-[10px] uppercase tracking-wide text-slate-400">
              {['Course', 'Assigned To', 'Status', 'Due Date'].map((h) => (
                <th key={h} className="pb-2 font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.course} className="border-t border-slate-100 text-slate-600">
                <td className="py-3 pr-2 font-medium text-slate-800">{row.course}</td>
                <td className="py-3 pr-2">{row.assigned}</td>
                <td className="py-3 pr-2">
                  <StatusText label={row.status} tone={row.tone} />
                </td>
                <td className="py-3">{row.due}</td>
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
    <section id={id} className="scroll-mt-24 py-8 sm:py-10">
      <div className="mx-auto grid max-w-[1120px] items-stretch gap-5 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.35fr] lg:gap-6 lg:px-8">
        {copy}
        {visual}
      </div>
    </section>
  );
}

export default function HiringPage() {
  return (
    <div className="bg-[#f5f7fb] text-slate-900">
      <section id="overview" className="scroll-mt-24 bg-gradient-to-b from-white to-[#f5f7fb]">
        <div className="mx-auto grid max-w-[1120px] gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:gap-12 lg:px-8 lg:py-16">
          <div>
            <h1 className="text-[2.45rem] font-bold leading-[1.12] tracking-tight text-slate-900 sm:text-[2.85rem]">
              Hiring & Onboarding
            </h1>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-slate-500">
              Attract, hire, onboard and develop the best caregivers with a unified, compliant and
              efficient workflow.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="#ats"
                className="inline-flex rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_-10px_rgba(0,85,212,0.7)] hover:bg-primary-hover"
              >
                View Live Monitor
              </a>
              <a
                href="#training"
                className="inline-flex items-center gap-2 rounded-lg border border-primary bg-white px-5 py-2.5 text-sm font-semibold text-primary hover:bg-primary/5"
              >
                <BarChart3 size={16} strokeWidth={2} />
                EVV Reports
              </a>
            </div>
          </div>
          <HiringPipelineHero />
        </div>
      </section>

      <FeatureSection
        id="ats"
        copy={
          <FeatureCard
            n="1"
            title="Applicant Tracking (ATS)"
            text="Streamline your hiring process from job posting to offer letter with an intuitive ATS."
            items={[
              'Create & publish job openings',
              'Centralized applicant pipeline',
              'Application forms & custom fields',
              'Candidate communication & updates',
              'Interview scheduling & feedback',
              'Offer letters & e-signatures',
            ]}
          />
        }
        visual={<AtsVisual />}
      />

      <FeatureSection
        id="screening"
        copy={
          <FeatureCard
            n="2"
            title="Screening & Background"
            text="Ensure safety and compliance with comprehensive screening tools."
            items={[
              'Background checks & verifications',
              'Identity verification',
              'Reference checks',
              'Drug screening',
              'Custom screening packages',
              'Real-time status tracking',
            ]}
          />
        }
        visual={<ScreeningVisual />}
      />

      <FeatureSection
        id="onboarding"
        copy={
          <FeatureCard
            n="3"
            title="Onboarding"
            text="Make onboarding simple, fast and paperless."
            items={[
              'Digital onboarding checklist',
              'Document collection',
              'E-signatures',
              'Policy acknowledgments',
              'Welcome forms & tasks',
              'Progress tracking',
            ]}
          />
        }
        visual={<OnboardingVisual />}
      />

      <FeatureSection
        id="training"
        copy={
          <FeatureCard
            n="4"
            title="Training & LMS"
            text="Train caregivers, track progress and ensure competency."
            items={[
              'Online training modules',
              'Course assignments',
              'Quizzes & assessments',
              'Certificates & completions',
              'Training progress tracking',
              'Compliance training',
            ]}
          />
        }
        visual={<TrainingVisual />}
      />

      <section id="demo" className="scroll-mt-24 pb-16 pt-4">
        <div className="mx-auto max-w-[1120px] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 rounded-2xl border border-sky-100 bg-gradient-to-r from-emerald-50 via-sky-50 to-blue-50 px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-7 sm:py-7">
            <div>
              <h3 className="text-[1.25rem] font-bold text-slate-900 sm:text-[1.35rem]">
                Build a Stronger Team. Deliver Better Care.
              </h3>
              <p className="mt-1.5 max-w-xl text-sm text-slate-500">
                Simplify hiring, accelerate onboarding and manage your workforce with confidence.
              </p>
            </div>
            <a
              href="mailto:sales@caretraker.com?subject=Hiring%20%26%20Onboarding%20Demo%20Request"
              className="inline-flex shrink-0 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover"
            >
              Request a Demo
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
