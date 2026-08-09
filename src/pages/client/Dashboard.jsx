import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Calendar, Clock, Heart, ListChecks, ShieldCheck, CheckCircle2,
  ChevronRight, MapPin, UserRound, Footprints, Pill, Users, CreditCard,
  Smartphone,
} from 'lucide-react';
import { ROUTES } from '../../routes/routes';

const AREA_META = {
  personalCare: { icon: UserRound, bg: 'bg-blue-100 text-blue-600' },
  mobility: { icon: Footprints, bg: 'bg-violet-100 text-violet-600' },
  medications: { icon: Pill, bg: 'bg-amber-100 text-amber-600' },
  emotionalWellbeing: { icon: Heart, bg: 'bg-rose-100 text-rose-600' },
  nutrition: { icon: Heart, bg: 'bg-emerald-100 text-emerald-600' },
  householdSupport: { icon: Users, bg: 'bg-sky-100 text-sky-600' },
  otherNeeds: { icon: ListChecks, bg: 'bg-gray-100 text-gray-600' },
};

function Card({ children, className = '' }) {
  return (
    <div className={`rounded-xl border border-gray-200 bg-white p-5 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

function StatusPill({ status }) {
  if (status === 'COMPLETED') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-emerald-700">
        <CheckCircle2 size={13} strokeWidth={2.5} /> Completed
      </span>
    );
  }
  if (status === 'UPCOMING' || status === 'IN PROGRESS') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-blue-700">
        {status === 'IN PROGRESS' ? 'In Progress' : 'Upcoming'}
        <ChevronRight size={13} strokeWidth={2.5} />
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-gray-600">
      {status}
    </span>
  );
}

function Avatar({ name, initials, tone = 'blue' }) {
  const tones = {
    blue: 'bg-blue-100 text-blue-700',
    violet: 'bg-violet-100 text-violet-700',
    emerald: 'bg-emerald-100 text-emerald-700',
    amber: 'bg-amber-100 text-amber-700',
  };
  return (
    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold ${tones[tone] || tones.blue}`}>
      {initials || String(name || '?').slice(0, 2).toUpperCase()}
    </div>
  );
}

function money(n) {
  return `$${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function KpiCard({ label, value, icon: Icon, iconBg, children }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm text-gray-500">{label}</p>
          <p className="mt-2 text-[1.75rem] font-bold leading-none tracking-tight text-gray-900">{value}</p>
          {children && <div className="mt-2.5">{children}</div>}
        </div>
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${iconBg}`}>
          <Icon size={20} strokeWidth={2} />
        </div>
      </div>
    </div>
  );
}

export default function ClientDashboard() {
  const { dashboard: d, dashboardLoading } = useSelector((s) => s.clientPortal);
  const k = d?.kpis || {};

  if (dashboardLoading && !d) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white px-5 py-16 text-center text-sm text-gray-500 shadow-sm">
        Loading dashboard…
      </div>
    );
  }

  const carePlanLink = d?.carePlan?.id
    ? ROUTES.CLIENT_CARE_PLAN_DETAIL.replace(':id', d.carePlan.id)
    : ROUTES.CLIENT_CARE_PLANS;

  return (
    <div className="mx-auto max-w-[1400px] space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard
          label="Upcoming Visits"
          value={k.upcomingVisits?.total ?? 0}
          icon={Calendar}
          iconBg="bg-blue-100 text-blue-600"
        >
          <p className="text-xs text-gray-500">
            <span className="font-semibold text-gray-700">Today: {k.upcomingVisits?.today ?? 0}</span>
            <span className="mx-1.5 text-gray-300">|</span>
            {k.upcomingVisits?.thisWeek ?? 0} This Week
          </p>
        </KpiCard>

        <KpiCard
          label="Hours This Week"
          value={k.hoursThisWeek?.label || '0h 00m'}
          icon={Clock}
          iconBg="bg-violet-100 text-violet-600"
        >
          <div className="h-2 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-emerald-500"
              style={{ width: `${k.hoursThisWeek?.percent || 0}%` }}
            />
          </div>
          <p className="mt-1.5 text-xs text-gray-500">
            {k.hoursThisWeek?.percent || 0}% · Goal: {k.hoursThisWeek?.goalHours || 20}h
          </p>
        </KpiCard>

        <KpiCard
          label="Caregivers"
          value={k.caregivers?.total ?? 0}
          icon={Heart}
          iconBg="bg-rose-100 text-rose-600"
        >
          <p className="truncate text-xs text-gray-500">
            {k.caregivers?.primaryName ? `Primary: ${k.caregivers.primaryName}` : 'No caregivers yet'}
          </p>
        </KpiCard>

        <KpiCard
          label="Care Plan Tasks"
          value={k.carePlanTasks?.total ?? 0}
          icon={ListChecks}
          iconBg="bg-amber-100 text-amber-600"
        >
          <p className="text-xs font-medium">
            <span className="text-emerald-600">{k.carePlanTasks?.completed ?? 0} Completed</span>
            <span className="mx-1.5 text-gray-300">·</span>
            <span className="text-orange-500">{k.carePlanTasks?.pending ?? 0} Pending</span>
          </p>
        </KpiCard>

        <KpiCard
          label="EVV Compliance"
          value={`${k.evvCompliance?.percent ?? 100}%`}
          icon={ShieldCheck}
          iconBg="bg-emerald-100 text-emerald-600"
        >
          <p className="text-xs font-medium text-emerald-600">{k.evvCompliance?.period || 'This Week'}</p>
        </KpiCard>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="flex flex-col !p-0 overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
            <h2 className="text-base font-semibold text-gray-900">Today&apos;s Schedule</h2>
            <Link to={ROUTES.CLIENT_SCHEDULE} className="text-sm font-medium text-primary hover:underline">
              View Full Schedule
            </Link>
          </div>

          <div className="flex-1 px-5 py-2">
            {(d?.todaySchedule || []).length === 0 ? (
              <p className="py-10 text-center text-sm text-gray-500">No visits scheduled for today.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {d.todaySchedule.map((item) => (
                  <li key={item.id} className="flex items-start justify-between gap-3 py-4">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{item.time}</p>
                      <p className="mt-1 text-sm font-medium text-gray-800">{item.caregiverName}</p>
                      <p className="text-xs text-gray-500">{item.service}</p>
                      {item.address ? (
                        <p className="mt-1.5 flex items-start gap-1 text-xs text-gray-400">
                          <MapPin size={12} className="mt-0.5 shrink-0" />
                          <span className="line-clamp-1">{item.address}</span>
                        </p>
                      ) : null}
                    </div>
                    <StatusPill status={item.status} />
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="border-t border-gray-100 px-5 py-4">
            <Link
              to={ROUTES.CLIENT_SCHEDULE}
              className="flex w-full items-center justify-center rounded-lg border border-gray-200 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              View Full Schedule
            </Link>
          </div>
        </Card>

        <Card className="flex flex-col !p-0 overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
            <h2 className="text-base font-semibold text-gray-900">Recent Visit</h2>
            <Link to={ROUTES.CLIENT_EVV_VISITS} className="text-sm font-medium text-primary hover:underline">
              View All Visits
            </Link>
          </div>

          {!d?.recentVisit ? (
            <p className="flex-1 px-5 py-10 text-center text-sm text-gray-500">No completed visits yet.</p>
          ) : (
            <div className="flex flex-1 flex-col px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {d.recentVisit.date
                      ? new Date(`${d.recentVisit.date}T12:00:00`).toLocaleDateString(undefined, {
                        month: 'long', day: 'numeric', year: 'numeric',
                      })
                      : '—'}
                  </p>
                  <p className="mt-0.5 text-sm text-gray-500">{d.recentVisit.time}</p>
                </div>
                <StatusPill status={d.recentVisit.status} />
              </div>

              <div className="mt-4 flex items-center gap-3">
                <Avatar name={d.recentVisit.caregiverName} initials={d.recentVisit.caregiverInitials} />
                <div>
                  <p className="text-sm font-semibold text-gray-900">{d.recentVisit.caregiverName}</p>
                  <p className="text-xs text-gray-500">{d.recentVisit.service || 'Caregiver'}</p>
                </div>
              </div>

              <dl className="mt-5 space-y-3 text-sm">
                {[
                  ['Duration', d.recentVisit.duration],
                  ['Checked In', d.recentVisit.checkIn || '—'],
                  ['Checked Out', d.recentVisit.checkOut || '—'],
                  ['Method', d.recentVisit.method],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-3">
                    <dt className="text-gray-500">{label}</dt>
                    <dd className={`font-medium ${label === 'Method' ? 'text-primary' : 'text-gray-900'}`}>{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          <div className="mt-auto border-t border-gray-100 px-5 py-4">
            <Link
              to={ROUTES.CLIENT_EVV_VISITS}
              className="flex w-full items-center justify-center rounded-lg border border-gray-200 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Visit History
            </Link>
          </div>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-gray-900">My Care Plan</h2>
            <Link to={carePlanLink} className="text-sm font-medium text-primary hover:underline">View Care Plan</Link>
          </div>
          {(d?.carePlan?.progress || []).length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">No care plan areas yet.</p>
          ) : (
            <ul className="space-y-4">
              {d.carePlan.progress.slice(0, 4).map((area) => {
                const meta = AREA_META[area.key] || AREA_META.otherNeeds;
                const Icon = meta.icon;
                return (
                  <li key={area.key}>
                    <div className="flex items-center gap-3">
                      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${meta.bg}`}>
                        <Icon size={16} strokeWidth={2} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-medium text-gray-900">{area.label}</p>
                          <p className="shrink-0 text-xs text-gray-500">{area.completed}/{area.total}</p>
                        </div>
                        <p className="mt-0.5 text-xs text-gray-500">{area.completed} of {area.total} tasks completed</p>
                        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-gray-100">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${area.percent}%` }} />
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card className="flex flex-col">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-gray-900">Messages</h2>
            <Link to={ROUTES.CLIENT_MESSAGES} className="text-sm font-medium text-primary hover:underline">View All</Link>
          </div>
          {(d?.messages || []).length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center py-6 text-center">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <Users size={18} />
              </div>
              <p className="text-sm text-gray-500">No messages yet from your care team.</p>
            </div>
          ) : (
            <ul className="flex-1 divide-y divide-gray-100">
              {d.messages.slice(0, 3).map((m, idx) => (
                <li key={m.id} className="flex gap-3 py-3">
                  <Avatar
                    name={m.from}
                    initials={m.initials}
                    tone={['blue', 'violet', 'emerald'][idx % 3]}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-gray-900">{m.from}</p>
                      <p className="shrink-0 text-[11px] text-gray-400">{m.time}</p>
                    </div>
                    <p className="mt-0.5 truncate text-sm text-gray-600">{m.preview}</p>
                  </div>
                  {m.unread ? <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" /> : null}
                </li>
              ))}
            </ul>
          )}
          <Link
            to={ROUTES.CLIENT_MESSAGES}
            className="mt-4 flex w-full items-center justify-center rounded-lg bg-primary py-2.5 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            Go to Messages
          </Link>
        </Card>

        <Card className="flex flex-col">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-gray-900">Invoices & Payments</h2>
            <Link to={ROUTES.CLIENT_INVOICES} className="text-sm font-medium text-primary hover:underline">View All</Link>
          </div>

          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Current Balance</p>
              <p className="mt-1 text-3xl font-bold text-gray-900">{money(d?.invoices?.balance)}</p>
              <p className={`mt-1 text-sm font-medium ${d?.invoices?.paidUp !== false ? 'text-emerald-600' : 'text-amber-600'}`}>
                {d?.invoices?.paidUp !== false ? "You're all paid up!" : 'Payment due'}
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CreditCard size={20} strokeWidth={2} />
            </div>
          </div>

          <div className="mt-5 rounded-xl bg-gray-50 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Last Payment</p>
            {d?.invoices?.lastPayment ? (
              <p className="mt-1 text-sm font-semibold text-gray-900">
                {money(d.invoices.lastPayment.amount)}
                <span className="ml-2 font-normal text-gray-500">
                  on {new Date(d.invoices.lastPayment.date).toLocaleDateString(undefined, {
                    month: 'short', day: 'numeric', year: 'numeric',
                  })}
                </span>
              </p>
            ) : (
              <p className="mt-1 text-sm text-gray-500">No payments recorded yet</p>
            )}
          </div>

          <Link
            to={ROUTES.CLIENT_INVOICES}
            className="mt-auto flex w-full items-center justify-center rounded-lg border border-gray-200 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Payment History
          </Link>
        </Card>
      </div>

      <div className="flex flex-col items-start justify-between gap-4 rounded-xl border border-blue-100 bg-blue-50 px-5 py-5 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-primary shadow-sm">
            <Smartphone size={20} strokeWidth={2} />
          </div>
          <div>
            <p className="font-semibold text-gray-900">Get the Caregiver App</p>
            <p className="mt-0.5 text-sm text-gray-600">
              Your care team uses CareTraker to clock visits and keep EVV records accurate.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="rounded-lg bg-gray-900 px-3.5 py-2 text-xs font-semibold text-white">
            App Store
          </button>
          <button type="button" className="rounded-lg bg-gray-900 px-3.5 py-2 text-xs font-semibold text-white">
            Google Play
          </button>
        </div>
      </div>
    </div>
  );
}
