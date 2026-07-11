import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  CalendarDays, CheckCircle2, AlertTriangle, Clock, Timer, Info, TrendingUp, TrendingDown,
} from 'lucide-react';
import EvvDonutChart from '../../../components/agency/evv/EvvDonutChart';
import EvvComplianceGauge from '../../../components/agency/evv/EvvComplianceGauge';
import EvvVisitLogsTable from '../../../components/agency/evv/EvvVisitLogsTable';
import { fetchEvvEnrollmentStats } from '../../../redux/slices/evvEnrollmentsSlice';
import {
  EVV_COMPLIANCE, EVV_OVERVIEW, VERIFICATION_METHOD_SEGMENTS, VERIFICATION_STATUS_SEGMENTS,
} from '../../../utils/evvDashboardData';
import { ROUTES } from '../../../routes/routes';

function OverviewCard({ label, value, sub, trend, trendUp, icon: Icon, iconBg }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
          {sub && <p className="mt-1 text-xs text-gray-500">{sub}</p>}
          {trend && (
            <p className={`mt-2 flex items-center gap-1 text-xs font-medium ${trendUp ? 'text-emerald-600' : 'text-emerald-600'}`}>
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

export default function EvvDashboard() {
  const dispatch = useDispatch();
  const enrollmentStats = useSelector((state) => state.evvEnrollments.stats);

  useEffect(() => {
    dispatch(fetchEvvEnrollmentStats());
  }, [dispatch]);

  const verifiedPct = ((EVV_OVERVIEW.verifiedVisits / EVV_OVERVIEW.totalVisits) * 100).toFixed(1);

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
        <button type="button" className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm">
          <CalendarDays size={16} /> May 19 – May 25, 2024
        </button>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">EVV Overview</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <OverviewCard label="Total Visits" value={EVV_OVERVIEW.totalVisits} trend={EVV_OVERVIEW.trends.totalVisits} trendUp icon={CalendarDays} iconBg="bg-blue-100 text-blue-600" />
          <OverviewCard label="Verified Visits" value={EVV_OVERVIEW.verifiedVisits} sub={`${verifiedPct}% of total`} icon={CheckCircle2} iconBg="bg-emerald-100 text-emerald-600" />
          <OverviewCard label="Exceptions" value={EVV_OVERVIEW.exceptions} trend={EVV_OVERVIEW.trends.exceptions} trendUp={false} icon={AlertTriangle} iconBg="bg-orange-100 text-orange-600" />
          <OverviewCard label="Unverified Visits" value={EVV_OVERVIEW.unverifiedVisits} trend={EVV_OVERVIEW.trends.unverified} trendUp={false} icon={Clock} iconBg="bg-pink-100 text-pink-600" />
          <OverviewCard label="Avg. Visit Duration" value={EVV_OVERVIEW.avgDuration} trend={EVV_OVERVIEW.trends.avgDuration} trendUp icon={Timer} iconBg="bg-violet-100 text-violet-600" />
        </div>
      </section>

      {enrollmentStats.total > 0 && (
        <div className="rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3 text-sm text-blue-800">
          <strong>{enrollmentStats.pending + enrollmentStats.submitted}</strong> caregiver enrollment(s) need attention.
          <Link to={ROUTES.AGENCY_EVV_ENROLLMENTS} className="ml-2 font-semibold underline">View Enrollments</Link>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <ChartPanel title="Visit Verification Status" footerLabel="View Full Report" footerTo={ROUTES.AGENCY_EVV_LOGS}>
          <EvvDonutChart segments={VERIFICATION_STATUS_SEGMENTS} centerValue={`${verifiedPct}%`} centerLabel="Verified" />
        </ChartPanel>
        <ChartPanel title="Visits by Verification Method" footerLabel="View Full Report" footerTo={ROUTES.AGENCY_EVV_LOGS}>
          <EvvDonutChart segments={VERIFICATION_METHOD_SEGMENTS} centerValue="482" centerLabel="Visits" />
        </ChartPanel>
        <ChartPanel title="EVV Compliance" footerLabel="View Compliance Report" footerTo={ROUTES.AGENCY_EVV_LOGS}>
          <EvvComplianceGauge percent={EVV_COMPLIANCE.percent} goal={EVV_COMPLIANCE.goal} />
        </ChartPanel>
      </div>

      <EvvVisitLogsTable />
    </div>
  );
}
