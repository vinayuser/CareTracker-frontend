import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  CalendarCheck, Clock, Wallet, ShieldCheck, CheckCircle2, MapPin, Coffee, LogOut,
  AlertTriangle, Info, ChevronRight,
} from 'lucide-react';
import { getAuthUser } from '../../utils/auth';
import { ROUTES } from '../../routes/routes';
import { fetchCaregiverDashboard } from '../../redux/slices/dashboardsSlice';

const STATUS_STYLES = {
  Completed: 'bg-emerald-100 text-emerald-700',
  'Late Completed': 'bg-red-100 text-red-800',
  'In Progress': 'bg-blue-100 text-blue-700',
  InProgress: 'bg-blue-100 text-blue-700',
  'Late / In Progress': 'bg-red-100 text-red-800',
  Scheduled: 'bg-orange-100 text-orange-700',
  Exception: 'bg-red-100 text-red-800',
  Missed: 'bg-red-100 text-red-700',
  Late: 'bg-orange-100 text-orange-700',
  Cancelled: 'bg-gray-100 text-gray-600',
};

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

function WeeklyBarChart({ weeklyHours = [], weeklySummary = {} }) {
  const max = Math.max(1, ...weeklyHours.map((d) => d.hours || 0));
  return (
    <div>
      <div className="flex h-36 items-end justify-between gap-2">
        {weeklyHours.map((item) => (
          <div key={item.day} className="flex flex-1 flex-col items-center gap-2">
            <div
              className="w-full rounded-t-md bg-primary/80"
              style={{ height: `${Math.max(8, ((item.hours || 0) / max) * 100)}%`, minHeight: '8px' }}
            />
            <span className="text-xs text-gray-500">{item.day}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-4 border-t border-gray-100 pt-3 text-sm">
        <span className="text-gray-600">Total Hours: <strong className="text-gray-900">{weeklySummary.total_hours || '00h 00m'}</strong></span>
        <span className="text-gray-600">Total Visits: <strong className="text-gray-900">{weeklySummary.total_visits ?? 0}</strong></span>
      </div>
    </div>
  );
}

function greetingForNow() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function CaregiverDashboard() {
  const dispatch = useDispatch();
  const authUser = getAuthUser();
  const { caregiver, caregiverLoading } = useSelector((state) => state.dashboards);

  useEffect(() => {
    dispatch(fetchCaregiverDashboard());
  }, [dispatch]);

  const data = caregiver;
  const kpis = data?.kpis;
  const name = data?.caregiver_name || authUser?.name || 'Caregiver';
  const todaySchedule = data?.today_schedule || [];
  const clock = data?.active_clock || { clocked_in: false };
  const alerts = data?.alerts || [];
  const weeklyHours = data?.weekly_hours || [];
  const weeklySummary = data?.weekly_summary || {};

  const greeting = useMemo(() => greetingForNow(), []);

  if (caregiverLoading && !data) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white px-5 py-16 text-center text-sm text-gray-500 shadow-sm">
        Loading dashboard…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {greeting}, {name}
          </h1>
          <p className="mt-1 text-sm text-gray-500">Here&apos;s your overview for today.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Today's Visits" icon={CalendarCheck} iconBg="bg-blue-100 text-blue-600">
          <p className="text-3xl font-bold text-gray-900">{kpis?.today_visits?.total ?? 0}</p>
          <div className="mt-2 flex flex-wrap gap-2 text-xs font-medium">
            <span className="text-emerald-600">{kpis?.today_visits?.completed ?? 0} Completed</span>
            <span className="text-blue-600">{kpis?.today_visits?.upcoming ?? 0} Upcoming</span>
          </div>
        </KpiCard>

        <KpiCard label="Hours This Week" icon={Clock} iconBg="bg-violet-100 text-violet-600">
          <p className="text-3xl font-bold text-gray-900">{kpis?.hours_this_week?.current || '00h 00m'}</p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
            <div className="h-full rounded-full bg-primary" style={{ width: `${kpis?.hours_this_week?.percent ?? 0}%` }} />
          </div>
          <p className="mt-1 text-xs text-gray-500">Goal: {kpis?.hours_this_week?.goal || '40h'}</p>
        </KpiCard>

        <KpiCard label="Upcoming Pay (est.)" icon={Wallet} iconBg="bg-emerald-100 text-emerald-600">
          <p className="text-3xl font-bold text-gray-900">{kpis?.upcoming_pay?.amount || '$0.00'}</p>
          <p className="mt-1 text-xs text-gray-500">{kpis?.upcoming_pay?.note || kpis?.upcoming_pay?.pay_date}</p>
        </KpiCard>

        <KpiCard label="EVV Compliance" icon={ShieldCheck} iconBg="bg-teal-100 text-teal-600">
          <p className="text-3xl font-bold text-gray-900">{kpis?.evv_compliance?.percent ?? 100}%</p>
          <p className="mt-1 text-xs text-gray-500">{kpis?.evv_compliance?.period || 'This Week'}</p>
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
            {todaySchedule.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-gray-500">
                No visits scheduled for today.
              </div>
            ) : (
              todaySchedule.map((visit) => (
                <div key={visit.id} className={`flex items-start gap-4 px-5 py-4 ${visit.late_check_in || visit.status === 'Missed' || visit.status === 'Exception' ? 'bg-red-50/60' : ''}`}>
                  <div className="min-w-[120px] text-sm font-medium text-gray-700">{visit.time}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-gray-900">{visit.client}</p>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${STATUS_STYLES[visit.status] || STATUS_STYLES.Scheduled}`}>
                        {visit.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{visit.service}</p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                      <MapPin size={12} /> {visit.address || 'Address on file'}
                    </p>
                  </div>
                  <div className="shrink-0 text-gray-400">
                    {visit.status === 'Completed' ? <CheckCircle2 size={18} className="text-emerald-500" /> : <MapPin size={18} className="text-primary" />}
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="border-t border-gray-100 px-5 py-3">
            <Link to={ROUTES.CAREGIVER_JOBS} className="text-sm font-medium text-primary hover:underline">
              View Full Schedule →
            </Link>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-gray-900">EVV Clock</h2>
          {clock.clocked_in ? (
            <>
              <div className={`mt-3 flex items-center gap-2 text-sm font-medium ${clock.late ? 'text-red-600' : 'text-emerald-600'}`}>
                <span className={`h-2 w-2 rounded-full ${clock.late ? 'bg-red-500' : 'bg-emerald-500'}`} />
                {clock.late ? 'Clocked in late (exception)' : 'You are currently Clocked In'}
              </div>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between gap-2"><dt className="text-gray-500">Client</dt><dd className="font-medium text-gray-900">{clock.client}</dd></div>
                <div className="flex justify-between gap-2"><dt className="text-gray-500">Since</dt><dd className="font-medium text-gray-900">{clock.since}</dd></div>
                <div className="flex justify-between gap-2"><dt className="text-gray-500">Service</dt><dd className="font-medium text-gray-900">{clock.service}</dd></div>
                <div className="flex justify-between gap-2"><dt className="text-gray-500">Duration</dt><dd className="font-medium text-gray-900">{clock.duration}</dd></div>
              </dl>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <Link to={ROUTES.CAREGIVER_CLOCK} className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-primary px-4 py-3 text-sm font-semibold text-primary hover:bg-primary/5">
                  <Coffee size={16} /> Take Break
                </Link>
                <Link to={ROUTES.CAREGIVER_JOBS} className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-3 text-sm font-semibold text-white hover:bg-red-600">
                  <LogOut size={16} /> Clock Out
                </Link>
              </div>
            </>
          ) : (
            <div className="mt-4">
              <p className="text-sm text-gray-500">You are not clocked in.</p>
              <Link to={ROUTES.CAREGIVER_JOBS} className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary-hover">
                Go to Schedule
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="flex items-center gap-2 font-semibold text-gray-900">
            <AlertTriangle size={18} className="text-orange-500" /> Alerts
          </h2>
          <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">{alerts.length}</span>
        </div>
        <div className="divide-y divide-gray-50">
          {alerts.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-gray-500">No alerts right now.</div>
          ) : (
            alerts.map((alert) => (
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
            ))
          )}
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="font-semibold text-gray-900">This Week Overview</h2>
        <div className="mt-4">
          <WeeklyBarChart weeklyHours={weeklyHours} weeklySummary={weeklySummary} />
        </div>
      </div>
    </div>
  );
}
