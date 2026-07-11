import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  CalendarDays, CheckCircle2, AlertTriangle, Clock, Timer, Info, TrendingUp, TrendingDown,
} from 'lucide-react';
import EvvDonutChart from '../../../components/agency/evv/EvvDonutChart';
import EvvComplianceGauge from '../../../components/agency/evv/EvvComplianceGauge';
import EvvVisitLogsTable from '../../../components/agency/evv/EvvVisitLogsTable';
import { fetchEvvDashboard } from '../../../redux/slices/dashboardsSlice';
import { setAgencyVisits } from '../../../redux/slices/visitSchedulesSlice';
import { ROUTES } from '../../../routes/routes';
import { toDateKey } from '../../../utils/evvVisitLogs';

function OverviewCard({ label, value, sub, trend, trendUp, icon: Icon, iconBg }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
          {sub && <p className="mt-1 text-xs text-gray-500">{sub}</p>}
          {trend && (
            <p className={`mt-2 flex items-center gap-1 text-xs font-medium ${trendUp ? 'text-emerald-600' : 'text-red-600'}`}>
              {trendUp ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
              {trend}
            </p>
          )}
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${iconBg}`}>
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}

function ChartPanel({ title, children, footerLabel, footerTo }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      <div className="mt-4">{children}</div>
      {footerLabel && footerTo && (
        <Link to={footerTo} className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
          {footerLabel} →
        </Link>
      )}
    </div>
  );
}

function defaultRange(days = 7) {
  const to = new Date();
  const from = new Date();
  from.setDate(to.getDate() - (days - 1));
  return { from: toDateKey(from), to: toDateKey(to) };
}

export default function EvvDashboard() {
  const dispatch = useDispatch();
  const { evv, evvLoading } = useSelector((state) => state.dashboards);
  const initial = useMemo(() => defaultRange(7), []);
  const [from, setFrom] = useState(initial.from);
  const [to, setTo] = useState(initial.to);

  useEffect(() => {
    let cancelled = false;
    dispatch(fetchEvvDashboard({ from, to }))
      .unwrap()
      .then((data) => {
        if (cancelled) return;
        dispatch(setAgencyVisits(data?.recent_visits || []));
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [dispatch, from, to]);

  const overview = evv.overview || {};
  const trends = overview.trends || {};
  const enrollment = evv.enrollment || {};
  const verifiedPct = overview.verified_pct ?? 0;
  const statusSegments = (evv.verification_status || []).filter((s) => s.pct > 0 || s.count > 0);
  const methodSegments = evv.verification_methods || [];
  const methodTotal = methodSegments.reduce((sum, s) => sum + (s.count || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900">EVV Dashboard</h1>
            <Info size={16} className="text-gray-400" />
          </div>
          <p className="mt-1 text-sm text-gray-500">Monitor visit verification, compliance, and enrollment readiness.</p>
        </div>
        <div className="inline-flex flex-wrap items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm">
          <CalendarDays size={16} className="text-gray-400" />
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="border-0 bg-transparent outline-none" />
          <span className="text-gray-400">–</span>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="border-0 bg-transparent outline-none" />
        </div>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">EVV Overview</h2>
        {evvLoading && !evv.range?.from ? (
          <div className="rounded-xl border border-gray-200 bg-white px-5 py-12 text-center text-sm text-gray-500 shadow-sm">
            Loading EVV dashboard…
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <OverviewCard
              label="Total Visits"
              value={overview.total_visits ?? 0}
              trend={trends.total_visits}
              trendUp={trends.total_visits_up}
              icon={CalendarDays}
              iconBg="bg-blue-100 text-blue-600"
            />
            <OverviewCard
              label="Verified Visits"
              value={overview.verified_visits ?? 0}
              sub={`${verifiedPct}% of total`}
              icon={CheckCircle2}
              iconBg="bg-emerald-100 text-emerald-600"
            />
            <OverviewCard
              label="Exceptions (late)"
              value={overview.exceptions ?? 0}
              trend={trends.exceptions}
              trendUp={trends.exceptions_up}
              icon={AlertTriangle}
              iconBg="bg-red-100 text-red-600"
            />
            <OverviewCard
              label="Unverified Visits"
              value={overview.unverified_visits ?? 0}
              trend={trends.unverified}
              trendUp={trends.unverified_up}
              icon={Clock}
              iconBg="bg-pink-100 text-pink-600"
            />
            <OverviewCard
              label="Avg. Visit Duration"
              value={overview.avg_duration || '00h 00m'}
              trend={trends.avg_duration}
              trendUp={trends.avg_duration_up}
              icon={Timer}
              iconBg="bg-violet-100 text-violet-600"
            />
          </div>
        )}
      </section>

      {(enrollment.pending + enrollment.submitted) > 0 && (
        <div className="rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3 text-sm text-blue-800">
          <strong>{enrollment.pending + enrollment.submitted}</strong> caregiver enrollment(s) need attention.
          <Link to={ROUTES.AGENCY_EVV_ENROLLMENTS} className="ml-2 font-semibold underline">View Enrollments</Link>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <ChartPanel title="Visit Verification Status" footerLabel="View Full Report" footerTo={ROUTES.AGENCY_EVV_LOGS}>
          <EvvDonutChart
            segments={statusSegments.length ? statusSegments : [{ label: 'No data', pct: 100, color: '#e5e7eb' }]}
            centerValue={`${verifiedPct}%`}
            centerLabel="Verified"
          />
        </ChartPanel>
        <ChartPanel title="Visits by Verification Method" footerLabel="View Full Report" footerTo={ROUTES.AGENCY_EVV_LOGS}>
          <EvvDonutChart
            segments={methodSegments.length ? methodSegments : [{ label: 'No check-ins', pct: 100, color: '#e5e7eb' }]}
            centerValue={String(methodTotal)}
            centerLabel="Check-ins"
          />
        </ChartPanel>
        <ChartPanel title="EVV Compliance" footerLabel="View Compliance Report" footerTo={ROUTES.AGENCY_EVV_LOGS}>
          <EvvComplianceGauge percent={evv.compliance?.percent ?? 0} goal={evv.compliance?.goal ?? 90} />
        </ChartPanel>
      </div>

      <EvvVisitLogsTable
        title="Recent Visit Logs"
        mode="range"
        controlledFrom={from}
        controlledTo={to}
        skipFetch
        showFilters={false}
        showSummary={false}
      />
    </div>
  );
}
