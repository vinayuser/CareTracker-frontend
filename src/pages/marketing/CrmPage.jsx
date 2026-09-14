import { Link } from 'react-router-dom';
import {
  Award,
  Bell,
  CalendarDays,
  MessageSquare,
  Search,
  SmilePlus,
} from 'lucide-react';
import { ROUTES } from '../../routes/routes';

function SectionBadge({ n }) {
  return (
    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-[12px] font-bold text-primary">
      {n}
    </span>
  );
}

function BulletList({ items }) {
  return (
    <ul className="mt-5 space-y-2.5">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2.5 text-[13px] text-slate-600">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
          {item}
        </li>
      ))}
    </ul>
  );
}

function FeatureCopy({ n, title, subtitle, text, items, align = 'left' }) {
  return (
    <div className={`max-w-md ${align === 'right' ? 'lg:ml-auto' : ''}`}>
      <SectionBadge n={n} />
      <h2 className="mt-3 text-[1.85rem] font-bold tracking-tight text-slate-900">{title}</h2>
      <p className="mt-1 text-[1.05rem] font-bold text-primary">{subtitle}</p>
      {text && <p className="mt-3 text-sm leading-relaxed text-slate-500">{text}</p>}
      <BulletList items={items} />
    </div>
  );
}

function MockCard({ children, className = '' }) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_20px_45px_-28px_rgba(15,23,42,0.35)] ${className}`}
    >
      {children}
    </div>
  );
}

function StatusPill({ label, tone }) {
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${tone}`}>{label}</span>
  );
}

function HeroLeadsCard() {
  const stats = [
    { label: 'Total Leads', value: '4', tone: 'text-sky-600 bg-sky-50' },
    { label: 'Open', value: '1', tone: 'text-violet-600 bg-violet-50' },
    { label: 'Hot / High', value: '4', tone: 'text-orange-600 bg-orange-50' },
    { label: 'Converted', value: '3', tone: 'text-emerald-600 bg-emerald-50' },
  ];
  const rows = [
    ['Robert Chen', 'Robert Chen', 'Website', 'Proposal Sent', 'High', 'Sarah J.'],
    ['Linda Martinez', 'Linda Martinez', 'Referral', 'Converted', 'Medium', 'Mike T.'],
  ];
  return (
    <MockCard>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-[15px] font-bold text-slate-900">Leads</h3>
        <button type="button" className="rounded-md bg-primary px-2.5 py-1 text-[11px] font-semibold text-white">
          + Create Lead
        </button>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className={`rounded-xl px-3 py-2.5 ${s.tone.split(' ')[1]}`}>
            <p className="text-[10px] font-medium text-slate-500">{s.label}</p>
            <p className={`mt-0.5 text-lg font-bold ${s.tone.split(' ')[0]}`}>{s.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <div className="flex h-8 flex-1 items-center gap-2 rounded-lg border border-slate-200 px-2.5 text-[11px] text-slate-400">
          <Search size={12} /> Search leads...
        </div>
        <div className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] text-slate-500">All stages</div>
        <div className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] text-slate-500">All priorities</div>
      </div>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[520px] text-left text-[11px]">
          <thead>
            <tr className="text-[10px] uppercase tracking-wide text-slate-400">
              {['Lead', 'Recipient', 'Source', 'Stage', 'Priority', 'Assigned'].map((h) => (
                <th key={h} className="pb-2 font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-slate-600">
            {rows.map((row) => (
              <tr key={row[0]} className="border-t border-slate-100">
                {row.map((cell, i) => (
                  <td key={`${row[0]}-${i}`} className="py-2.5 pr-2">
                    {i === 3 ? (
                      <StatusPill
                        label={cell}
                        tone={
                          cell === 'Converted'
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'bg-violet-50 text-violet-600'
                        }
                      />
                    ) : (
                      cell
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </MockCard>
  );
}

function LeadListCard() {
  const rows = [
    ['Mary Johnson', 'Website', 'New', '(312) 555-0198', 'Sarah J.', 'May 20'],
    ['James Wilson', 'Referral', 'Contacted', '(773) 555-0122', 'Mike T.', 'May 19'],
    ['Patricia Brown', 'Campaign', 'Qualified', '(847) 555-0145', 'Sarah J.', 'May 18'],
    ['Robert Davis', 'Website', 'Contacted', '(630) 555-0177', 'Anna K.', 'May 17'],
  ];
  return (
    <MockCard>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-[15px] font-bold text-slate-900">All Leads</h3>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex h-8 w-40 items-center gap-2 rounded-lg border border-slate-200 px-2.5 text-[11px] text-slate-400">
            <Search size={12} /> Search...
          </div>
          <button type="button" className="rounded-md bg-primary px-2.5 py-1 text-[11px] font-semibold text-white">
            + New
          </button>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {['All', 'New', 'Contacted', 'Qualified', 'Converted'].map((tab, i) => (
          <span
            key={tab}
            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
              i === 0 ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'
            }`}
          >
            {tab}
          </span>
        ))}
      </div>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-[11px]">
          <thead>
            <tr className="text-[10px] uppercase tracking-wide text-slate-400">
              {['Lead Name', 'Source', 'Status', 'Phone', 'Assigned To', 'Date Added'].map((h) => (
                <th key={h} className="pb-2 font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row[0]} className="border-t border-slate-100 text-slate-600">
                {row.map((cell, i) => (
                  <td key={`${row[0]}-${i}`} className="py-2.5 pr-2">
                    {i === 2 ? (
                      <StatusPill
                        label={cell}
                        tone={
                          cell === 'New'
                            ? 'bg-sky-50 text-sky-600'
                            : cell === 'Contacted'
                              ? 'bg-emerald-50 text-emerald-600'
                              : 'bg-orange-50 text-orange-600'
                        }
                      />
                    ) : (
                      cell
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </MockCard>
  );
}

function IntakeCard() {
  const steps = ['Personal Info', 'Insurance', 'Care Needs', 'Documents', 'Review'];
  const fields = [
    ['First Name', 'Mary'],
    ['Last Name', 'Johnson'],
    ['Phone', '(312) 555-0198'],
    ['Email', 'mary.johnson@email.com'],
    ['Address', '1240 Oak Street'],
    ['City', 'Chicago'],
  ];
  return (
    <MockCard>
      <p className="text-[15px] font-bold text-slate-900">Client Intake</p>
      <div className="relative mt-5">
        <div className="absolute left-[10%] right-[10%] top-[11px] border-t border-slate-200" />
        <div className="relative grid grid-cols-5 gap-1">
          {steps.map((label, i) => (
            <div key={label} className="flex flex-col items-center text-center">
              <span
                className={`relative z-10 flex h-[22px] w-[22px] items-center justify-center rounded-full text-[10px] font-bold ${
                  i === 0 ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'
                }`}
              >
                {i + 1}
              </span>
              <span className={`mt-2 text-[9px] font-medium leading-tight ${i === 0 ? 'text-primary' : 'text-slate-400'}`}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {fields.map(([label, value]) => (
          <label key={label} className="block">
            <span className="text-[10px] font-medium text-slate-400">{label}</span>
            <div className="mt-1 rounded-lg bg-slate-50 px-3 py-2 text-[12px] text-slate-700">{value}</div>
          </label>
        ))}
      </div>
    </MockCard>
  );
}

function ReferralCard() {
  const rows = [
    ['Dr. Sarah Smith', '(312) 555-0101', '18', '9', '50%', 'May 18, 2024'],
    ['Senior Living Center', '(773) 555-0144', '24', '12', '50%', 'May 17, 2024'],
    ['Community Hospital', '(312) 555-0166', '15', '7', '46%', 'May 16, 2024'],
    ['Home Health Partners', '(630) 555-0188', '12', '6', '50%', 'May 14, 2024'],
  ];
  return (
    <MockCard>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-[15px] font-bold text-slate-900">Referral Partners</h3>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex h-8 w-44 items-center gap-2 rounded-lg border border-slate-200 px-2.5 text-[11px] text-slate-400">
            <Search size={12} /> Search partners...
          </div>
          <button type="button" className="rounded-md bg-primary px-2.5 py-1 text-[11px] font-semibold text-white">
            + Add Partner
          </button>
        </div>
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[620px] text-left text-[11px]">
          <thead>
            <tr className="text-[10px] uppercase tracking-wide text-slate-400">
              {['Partner Name', 'Contact', 'Referrals', 'Converted', 'Conversion Rate', 'Last Referral'].map((h) => (
                <th key={h} className="pb-2 font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row[0]} className="border-t border-slate-100 text-slate-600">
                {row.map((cell, i) => (
                  <td key={`${row[0]}-${i}`} className="py-2.5 pr-2">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </MockCard>
  );
}

function CampaignCard() {
  const metrics = [
    { label: 'Campaigns', value: '12', sub: 'Active Campaigns', bar: 'bg-teal-400' },
    { label: 'Leads Generated', value: '256', sub: '+18% this month', bar: 'bg-sky-500' },
    { label: 'Conversions', value: '56', sub: '+22% this month', bar: 'bg-blue-700' },
    { label: 'Cost per Lead', value: '$12.40', sub: '-10% this month', bar: 'bg-orange-400' },
  ];
  return (
    <MockCard>
      <h3 className="text-[15px] font-bold text-slate-900">Campaign Performance</h3>
      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {metrics.map((m) => (
          <div key={m.label} className="overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
            <div className={`h-1.5 w-full ${m.bar}`} />
            <div className="p-3">
              <p className="text-[10px] font-medium text-slate-400">{m.label}</p>
              <p className="mt-1 text-lg font-bold text-slate-900">{m.value}</p>
              <p className="mt-0.5 text-[10px] text-slate-500">{m.sub}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Top Campaigns</p>
          <div className="mt-2 space-y-2 text-[12px] text-slate-600">
            <div className="rounded-lg bg-slate-50 px-3 py-2">
              <p className="font-semibold text-slate-800">Spring Awareness Campaign</p>
              <p className="text-[11px] text-slate-500">86 Leads · 18 Conversions · 20.9% Rate</p>
            </div>
            <div className="rounded-lg bg-slate-50 px-3 py-2">
              <p className="font-semibold text-slate-800">Google Ads - Home Care</p>
              <p className="text-[11px] text-slate-500">64 Leads · 15 Conversions · 23.4% Rate</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Channels</p>
          <ul className="mt-2 space-y-1.5 text-[12px] text-slate-600">
            <li>Website 45%</li>
            <li>Email 25%</li>
            <li>Paid Ads 20%</li>
            <li>Social Media 10%</li>
          </ul>
        </div>
      </div>
    </MockCard>
  );
}

function EmailSmsCard() {
  return (
    <MockCard>
      <div className="flex gap-5 border-b border-slate-100">
        <button type="button" className="border-b-2 border-primary pb-2 text-[13px] font-bold text-primary">
          Email
        </button>
        <button type="button" className="pb-2 text-[13px] font-semibold text-slate-400">
          SMS
        </button>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Recent Campaigns</p>
          <div className="mt-2 space-y-2">
            {[
              ['Welcome Email', '124', 'May 20, 2024', '45%'],
              ['Care Services Info', '208', 'May 18, 2024', '38%'],
              ['Referral Partner Update', '88', 'May 15, 2024', '52%'],
            ].map(([title, sent, date, rate], i) => (
              <div
                key={title}
                className={`rounded-xl px-3 py-2.5 ${i === 0 ? 'bg-sky-50' : 'bg-slate-50'}`}
              >
                <p className="text-[12px] font-bold text-slate-800">{title}</p>
                <p className="mt-0.5 text-[10px] text-slate-500">
                  Sent to {sent} · {date}
                </p>
                <p className="mt-1 text-[11px] font-bold text-primary">Open Rate {rate}</p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Message Preview</p>
          <div className="mt-2 rounded-xl border border-slate-200 p-4">
            <p className="text-[12px] text-slate-500">Subject: Welcome to CareTraker Home Care</p>
            <p className="mt-3 text-[12px] leading-relaxed text-slate-600">
              Hi {'{{First Name}}'},
              <br />
              <br />
              Thank you for your interest in CareTraker Home Care. We&apos;re here to help you get started.
              <br />
              <br />- CareTraker Team
            </p>
            <button type="button" className="mt-4 w-full rounded-lg bg-primary py-2 text-[12px] font-semibold text-white">
              Next Step
            </button>
          </div>
        </div>
      </div>
    </MockCard>
  );
}

function EngagementCard() {
  const tiles = [
    { icon: CalendarDays, label: 'Upcoming Appointments', value: '3', foot: 'This Week', tone: 'bg-sky-50 text-sky-600' },
    { icon: Bell, label: 'Recent Notifications', value: '8', foot: 'Unread', tone: 'bg-emerald-50 text-emerald-600' },
    { icon: SmilePlus, label: 'Client Feedback', value: '4.8', foot: 'Average Rating', tone: 'bg-orange-50 text-orange-600' },
    { icon: MessageSquare, label: 'Messages', value: '5', foot: 'New Messages', tone: 'bg-indigo-50 text-indigo-600' },
  ];
  return (
    <MockCard>
      <h3 className="text-[15px] font-bold text-slate-900">Client Engagement</h3>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {tiles.map(({ icon: Icon, label, value, foot, tone }) => (
          <div key={label} className={`rounded-xl p-4 text-center ${tone.split(' ')[0]}`}>
            <Icon size={18} className={`mx-auto ${tone.split(' ')[1]}`} strokeWidth={1.85} />
            <p className="mt-2 text-[11px] text-slate-500">{label}</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
            <p className={`mt-1 text-[11px] font-semibold ${tone.split(' ')[1]}`}>{foot}</p>
          </div>
        ))}
      </div>
    </MockCard>
  );
}

function ReportsCard() {
  return (
    <MockCard>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-[15px] font-bold text-slate-900">CRM Reports</h3>
        <div className="flex flex-wrap gap-3 text-[12px]">
          {['Overview', 'Leads', 'Campaigns', 'Referrals', 'Clients'].map((tab, i) => (
            <span
              key={tab}
              className={i === 0 ? 'border-b-2 border-primary pb-0.5 font-bold text-primary' : 'font-medium text-slate-400'}
            >
              {tab}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ['Total Leads', '256', '+15%'],
          ['Converted Clients', '56', '+18%'],
          ['Conversion Rate', '21.9%', '+2.3%'],
          ['Revenue', '$124,560', '+12%'],
        ].map(([label, value, trend]) => (
          <div key={label} className="rounded-xl bg-slate-50 px-3 py-3">
            <p className="text-[10px] font-medium text-slate-400">{label}</p>
            <p className="mt-1 text-lg font-bold text-slate-900">{value}</p>
            <span className="mt-1 inline-flex rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600">
              {trend}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-xl bg-slate-50 p-4">
        <div className="flex items-center justify-between">
          <p className="text-[12px] font-bold text-slate-800">Leads vs Conversions</p>
          <div className="flex gap-3 text-[10px] text-slate-500">
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-sky-500" /> Leads
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-fuchsia-500" /> Conversions
            </span>
          </div>
        </div>
        <svg viewBox="0 0 480 140" className="mt-3 h-32 w-full" aria-hidden>
          {[30, 60, 90].map((y) => (
            <line key={y} x1="0" y1={y} x2="480" y2={y} stroke="#e2e8f0" strokeWidth="1" />
          ))}
          <path
            d="M20 100 C80 90, 120 70, 160 75 C220 85, 260 40, 320 50 C380 60, 420 30, 460 35"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="2.5"
          />
          <path
            d="M20 115 C80 110, 120 95, 160 100 C220 108, 260 70, 320 78 C380 88, 420 55, 460 60"
            fill="none"
            stroke="#d946ef"
            strokeWidth="2.5"
          />
          {[
            [20, 100],
            [160, 75],
            [320, 50],
            [460, 35],
          ].map(([x, y]) => (
            <circle key={`a-${x}`} cx={x} cy={y} r="3.5" fill="#38bdf8" />
          ))}
          {[
            [20, 115],
            [160, 100],
            [320, 78],
            [460, 60],
          ].map(([x, y]) => (
            <circle key={`b-${x}`} cx={x} cy={y} r="3.5" fill="#d946ef" />
          ))}
        </svg>
        <div className="mt-1 flex justify-between text-[10px] text-slate-400">
          {['2018', '2020', '2021', '2022', '2023'].map((y) => (
            <span key={y}>{y}</span>
          ))}
        </div>
      </div>
    </MockCard>
  );
}

function FeatureSection({ id, reverse = false, copy, visual }) {
  return (
    <section id={id} className="scroll-mt-24 py-14 sm:py-16">
      <div
        className={`mx-auto grid max-w-[1120px] items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:px-8 ${
          reverse ? '' : ''
        }`}
      >
        <div className={reverse ? 'lg:order-2' : ''}>{copy}</div>
        <div className={reverse ? 'lg:order-1' : ''}>{visual}</div>
      </div>
    </section>
  );
}

export default function CrmPage() {
  return (
    <div className="bg-[#f8fafc] text-slate-900">
      {/* Hero */}
      <section className="bg-gradient-to-b from-white to-[#f8fafc]">
        <div className="mx-auto grid max-w-[1120px] gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-12 lg:px-8 lg:py-16">
          <div>
            <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-primary">CRM</p>
            <h1 className="mt-3 text-[2.45rem] font-bold leading-[1.12] tracking-tight text-slate-900 sm:text-[2.9rem]">
              Build Stronger Relationships.
              <br />
              <span className="text-primary">Grow Your Agency.</span>
            </h1>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-slate-500">
              CareTraker CRM helps home care agencies attract, engage, and convert leads while building
              lasting relationships with clients and referral partners.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="#lead-management"
                className="inline-flex rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_-10px_rgba(37,99,235,0.7)] hover:bg-primary-hover"
              >
                View CRM Dashboard
              </a>
              <a
                href="#lead-management"
                className="inline-flex rounded-lg border border-primary bg-white px-5 py-2.5 text-sm font-semibold text-primary hover:bg-primary/5"
              >
                Create New Lead
              </a>
            </div>
          </div>
          <HeroLeadsCard />
        </div>
      </section>

      <FeatureSection
        id="lead-management"
        copy={
          <FeatureCopy
            n="01"
            title="Lead Management"
            subtitle="Capture. Track. Convert."
            text="Easily capture leads from multiple sources, track every interaction, and move leads through your pipeline with complete visibility."
            items={[
              'Lead capture from website, forms & campaigns',
              'Pipeline management with custom stages',
              'Lead scoring and prioritization',
              'Follow-up reminders and tasks',
            ]}
          />
        }
        visual={<LeadListCard />}
      />

      <FeatureSection
        id="client-intake"
        reverse
        copy={
          <FeatureCopy
            n="02"
            title="Client Intake"
            subtitle="Simplify. Organize. Onboard."
            text="Turn new clients into active care recipients with a guided digital intake process."
            items={[
              'Customizable intake forms',
              'Document upload & e-signatures',
              'Insurance & payer information',
              'Intake status tracking',
            ]}
            align="right"
          />
        }
        visual={<IntakeCard />}
      />

      <FeatureSection
        id="referral-tracking"
        copy={
          <FeatureCopy
            n="03"
            title="Referral Tracking"
            subtitle="Build Relationships. Get More Referrals."
            text="Track referral partners, monitor referral activity, and strengthen relationships that bring new clients."
            items={[
              'Referral source management',
              'Track referral status & conversions',
              'Referral partner profiles',
              'Performance & conversion insights',
            ]}
          />
        }
        visual={<ReferralCard />}
      />

      <FeatureSection
        id="marketing-tools"
        reverse
        copy={
          <FeatureCopy
            n="04"
            title="Marketing Tools"
            subtitle="Attract. Engage. Grow."
            text="Create and manage marketing campaigns that attract new leads and keep your agency top of mind."
            items={[
              'Campaign management',
              'Landing pages & lead forms',
              'Audience segmentation',
              'Campaign performance tracking',
            ]}
            align="right"
          />
        }
        visual={<CampaignCard />}
      />

      <FeatureSection
        id="email-sms"
        copy={
          <FeatureCopy
            n="05"
            title="Email & SMS"
            subtitle="Communicate at Every Step."
            text="Stay connected with leads, clients, and referral partners through personalized email and SMS."
            items={[
              'Email & SMS templates',
              'Automated follow-ups',
              'Two-way messaging',
              'Delivery & engagement tracking',
            ]}
          />
        }
        visual={<EmailSmsCard />}
      />

      <FeatureSection
        id="patient-engagement"
        reverse
        copy={
          <FeatureCopy
            n="06"
            title="Patient Engagement"
            subtitle="Build Trust. Strengthen Relationships."
            text="Keep clients and families informed and engaged through personalized communication and updates."
            items={[
              'Appointment reminders',
              'Care updates & notifications',
              'Surveys & feedback',
              'Client portal access',
            ]}
            align="right"
          />
        }
        visual={<EngagementCard />}
      />

      <FeatureSection
        id="analytics-reports"
        copy={
          <FeatureCopy
            n="07"
            title="Analytics & Reports"
            subtitle="Measure. Improve. Succeed."
            text="Gain valuable insights into your CRM performance and make data-driven decisions."
            items={[
              'Lead & conversion reports',
              'Campaign performance analytics',
              'Referral partner performance',
              'Custom reports & exports',
            ]}
          />
        }
        visual={<ReportsCard />}
      />

      {/* EVV CTA */}
      <section className="pb-16 pt-4">
        <div className="mx-auto max-w-[1120px] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 rounded-2xl border border-emerald-200/80 bg-[#ecfdf5] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
                <Award size={20} strokeWidth={1.85} />
              </span>
              <div>
                <h3 className="text-[1.15rem] font-bold text-slate-900">Stay Compliant. Deliver Better Care.</h3>
                <p className="mt-1 text-sm text-slate-500">
                  <span className="font-semibold text-slate-700">CareTraker EVV</span> ensures accurate visit
                  verification, reduces missed visits, and keeps your agency audit-ready.
                </p>
              </div>
            </div>
            <Link
              to={ROUTES.MARKETING_EVV}
              className="inline-flex shrink-0 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover"
            >
              Request a Demo
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
