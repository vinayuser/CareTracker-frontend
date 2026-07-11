import { Link } from 'react-router-dom';
import {
  CalendarCheck, Clock, Wallet, ShieldCheck, CheckCircle2, MapPin, Coffee, LogOut,
  MessageSquare, AlertTriangle, Info, ChevronRight,
} from 'lucide-react';
import { getAuthUser } from '../../utils/auth';
import { ROUTES } from '../../routes/routes';
import {
  CAREGIVER_ALERTS, CAREGIVER_KPIS, CAREGIVER_MESSAGES, EVV_CLOCK,
  STATUS_STYLES, TODAY_SCHEDULE, WEEKLY_HOURS, WEEKLY_SUMMARY,
} from '../../utils/caregiverDashboardData';

function KpiCard({ label, children, icon: Icon, iconBg }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">{children}</div>
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${iconBg}`}>
          <Icon size={18} />
        </div>
      </div>
      <p className="mt-2 text-xs font-medium text-gray-500">{label}</p>
    </div>
  );
}

function WeeklyBarChart() {
  const max = Math.max(...WEEKLY_HOURS.map((d) => d.hours));
  return (
    <div>
      <div className="flex h-36 items-end justify-between gap-2">
        {WEEKLY_HOURS.map((item) => (
          <div key={item.day} className="flex flex-1 flex-col items-center gap-2">
            <div
              className="w-full rounded-t-md bg-primary/80"
              style={{ height: `${(item.hours / max) * 100}%`, minHeight: '8px' }}
            />
            <span className="text-xs text-gray-500">{item.day}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-4 border-t border-gray-100 pt-3 text-sm">
        <span className="text-gray-600">Total Hours: <strong className="text-gray-900">{WEEKLY_SUMMARY.totalHours}</strong></span>
        <span className="text-gray-600">Total Visits: <strong className="text-gray-900">{WEEKLY_SUMMARY.totalVisits}</strong></span>
      </div>
    </div>
  );
}

export default function CaregiverDashboard() {
  const authUser = getAuthUser();
  const kpis = CAREGIVER_KPIS;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Good morning, {authUser?.name ?? 'Sarah Williams'} 👋
          </h1>
          <p className="mt-1 text-sm text-gray-500">Here&apos;s your overview for today.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Today's Visits" icon={CalendarCheck} iconBg="bg-blue-100 text-blue-600">
          <p className="text-3xl font-bold text-gray-900">{kpis.todayVisits.total}</p>
          <div className="mt-2 flex flex-wrap gap-2 text-xs font-medium">
            <span className="text-emerald-600">{kpis.todayVisits.completed} Completed</span>
            <span className="text-blue-600">{kpis.todayVisits.upcoming} Upcoming</span>
          </div>
        </KpiCard>

        <KpiCard label="Hours This Week" icon={Clock} iconBg="bg-violet-100 text-violet-600">
          <p className="text-3xl font-bold text-gray-900">{kpis.hoursThisWeek.current}</p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
            <div className="h-full rounded-full bg-primary" style={{ width: `${kpis.hoursThisWeek.percent}%` }} />
          </div>
          <p className="mt-1 text-xs text-gray-500">Goal: {kpis.hoursThisWeek.goal}</p>
        </KpiCard>

        <KpiCard label="Upcoming Pay" icon={Wallet} iconBg="bg-emerald-100 text-emerald-600">
          <p className="text-3xl font-bold text-gray-900">{kpis.upcomingPay.amount}</p>
          <p className="mt-1 text-xs text-gray-500">Pay Date: {kpis.upcomingPay.payDate}</p>
        </KpiCard>

        <KpiCard label="EVV Compliance" icon={ShieldCheck} iconBg="bg-teal-100 text-teal-600">
          <p className="text-3xl font-bold text-gray-900">{kpis.evvCompliance.percent}%</p>
          <p className="mt-1 text-xs text-gray-500">{kpis.evvCompliance.period}</p>
        </KpiCard>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm xl:col-span-2">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <h2 className="font-semibold text-gray-900">Today&apos;s Schedule</h2>
            <Link to={ROUTES.CAREGIVER_JOBS} className="text-sm font-medium text-primary hover:underline">
              View Full Schedule
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {TODAY_SCHEDULE.map((visit) => (
              <div key={visit.id} className="flex items-start gap-4 px-5 py-4">
                <div className="min-w-[120px] text-sm font-medium text-gray-700">{visit.time}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-gray-900">{visit.client}</p>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${STATUS_STYLES[visit.status]}`}>
                      {visit.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{visit.service}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                    <MapPin size={12} /> {visit.address}
                  </p>
                </div>
                <div className="shrink-0 text-gray-400">
                  {visit.status === 'Completed' ? <CheckCircle2 size={18} className="text-emerald-500" /> : <MapPin size={18} className="text-primary" />}
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 px-5 py-3">
            <Link to={ROUTES.CAREGIVER_JOBS} className="text-sm font-medium text-primary hover:underline">
              View Full Schedule →
            </Link>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-gray-900">EVV Clock</h2>
          {EVV_CLOCK.clockedIn ? (
            <>
              <div className="mt-3 flex items-center gap-2 text-sm font-medium text-emerald-600">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                You are currently Clocked In
              </div>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between gap-2"><dt className="text-gray-500">Client</dt><dd className="font-medium text-gray-900">{EVV_CLOCK.client}</dd></div>
                <div className="flex justify-between gap-2"><dt className="text-gray-500">Since</dt><dd className="font-medium text-gray-900">{EVV_CLOCK.since}</dd></div>
                <div className="flex justify-between gap-2"><dt className="text-gray-500">Service</dt><dd className="font-medium text-gray-900">{EVV_CLOCK.service}</dd></div>
                <div className="flex justify-between gap-2"><dt className="text-gray-500">Duration</dt><dd className="font-medium text-gray-900">{EVV_CLOCK.duration}</dd></div>
              </dl>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <Link to={ROUTES.CAREGIVER_CLOCK} className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-primary px-4 py-3 text-sm font-semibold text-primary hover:bg-primary/5">
                  <Coffee size={16} /> Take Break
                </Link>
                <Link to={ROUTES.CAREGIVER_CLOCK} className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-3 text-sm font-semibold text-white hover:bg-red-600">
                  <LogOut size={16} /> Clock Out
                </Link>
              </div>
            </>
          ) : (
            <div className="mt-4">
              <p className="text-sm text-gray-500">You are not clocked in.</p>
              <Link to={ROUTES.CAREGIVER_CLOCK} className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary-hover">
                Clock In
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <h2 className="flex items-center gap-2 font-semibold text-gray-900">
              <MessageSquare size={18} className="text-primary" /> Messages
            </h2>
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">3</span>
          </div>
          <div className="divide-y divide-gray-50">
            {CAREGIVER_MESSAGES.map((msg) => (
              <div key={msg.id} className="flex items-start gap-3 px-5 py-3">
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${msg.color}`}>
                  {msg.initials}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-gray-900">{msg.from}</p>
                    <span className="text-xs text-gray-400">{msg.time}</span>
                  </div>
                  <p className="mt-0.5 truncate text-sm text-gray-500">{msg.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <h2 className="flex items-center gap-2 font-semibold text-gray-900">
              <AlertTriangle size={18} className="text-orange-500" /> Alerts
            </h2>
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">2</span>
          </div>
          <div className="divide-y divide-gray-50">
            {CAREGIVER_ALERTS.map((alert) => (
              <div key={alert.id} className="flex items-start gap-3 px-5 py-3">
                <div className={`mt-0.5 shrink-0 ${alert.tone === 'warning' ? 'text-amber-500' : 'text-blue-500'}`}>
                  {alert.tone === 'warning' ? <AlertTriangle size={16} /> : <Info size={16} />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-gray-900">{alert.type}</p>
                    <span className="text-xs text-gray-400">{alert.time}</span>
                  </div>
                  <p className="mt-0.5 text-sm text-gray-500">{alert.text}</p>
                </div>
                <ChevronRight size={16} className="shrink-0 text-gray-300" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="font-semibold text-gray-900">This Week Overview</h2>
        <div className="mt-4">
          <WeeklyBarChart />
        </div>
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 pt-4 text-xs text-gray-400">
        <span>© {new Date().getFullYear()} CareTraker. All rights reserved.</span>
        <div className="flex gap-4">
          <button type="button" className="hover:text-gray-600">Privacy Policy</button>
          <button type="button" className="hover:text-gray-600">Terms of Service</button>
          <button type="button" className="hover:text-gray-600">Support</button>
        </div>
      </footer>
    </div>
  );
}
