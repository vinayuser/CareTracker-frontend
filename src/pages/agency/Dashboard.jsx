import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Users,
  UserCheck,
  CalendarCheck,
  Clock,
  DollarSign,
  UserPlus,
  Calendar,
  ClipboardList,
  FileText,
  ShieldCheck,
  AlertTriangle,
  Info,
  Cake,
  CheckSquare,
} from 'lucide-react';
import { ROUTES } from '../../routes/routes';
import { getAuthUser } from '../../utils/auth';
import VisitOverviewChart from '../../components/agency/dashboard/VisitOverviewChart';
import ClientsStatusDonut from '../../components/agency/dashboard/ClientsStatusDonut';
import WelcomeIllustration from '../../components/agency/dashboard/WelcomeIllustration';
import AgencyKpiCard from '../../components/agency/dashboard/AgencyKpiCard';
import AgencyPanelCard from '../../components/agency/dashboard/AgencyPanelCard';
import { fetchAgencyDashboard } from '../../redux/slices/dashboardsSlice';

const quickActions = [
  { label: 'Add New Client', icon: UserPlus, route: ROUTES.AGENCY_CLIENTS_INTAKE },
  { label: 'Add Caregiver', icon: UserCheck, route: ROUTES.AGENCY_CAREGIVERS },
  { label: 'Schedule Visit', icon: Calendar, route: ROUTES.AGENCY_SCHEDULE },
  { label: 'Assessments', icon: ClipboardList, route: ROUTES.AGENCY_ASSESSMENTS },
  { label: 'Care Plans', icon: FileText, route: ROUTES.AGENCY_CARE_PLANS },
  { label: 'EVV Dashboard', icon: ShieldCheck, route: ROUTES.AGENCY_EVV_DASHBOARD },
];

const statusStyles = {
  Completed: 'bg-emerald-100 text-emerald-700',
  Scheduled: 'bg-blue-100 text-blue-700',
  'In Progress': 'bg-violet-100 text-violet-700',
  Missed: 'bg-red-100 text-red-700',
  Cancelled: 'bg-gray-100 text-gray-600',
};

const priorityStyles = {
  High: 'bg-red-100 text-red-600',
  Medium: 'bg-orange-100 text-orange-600',
  Low: 'bg-blue-100 text-blue-600',
};

const avatarColors = ['bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-500', 'bg-rose-500'];

function Avatar({ initials, index }) {
  return (
    <div
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white ${avatarColors[index % avatarColors.length]}`}
    >
      {initials}
    </div>
  );
}

function AlertIcon({ type }) {
  if (type === 'info') return <Info size={16} className="mt-0.5 shrink-0" />;
  return <AlertTriangle size={16} className="mt-0.5 shrink-0" />;
}

export default function AgencyDashboard() {
  const dispatch = useDispatch();
  const authUser = getAuthUser();
  const { agency: data, agencyLoading } = useSelector((state) => state.dashboards);
  const agencyName = authUser?.agencyName || 'your agency';
  const k = data?.kpis || {};

  useEffect(() => {
    dispatch(fetchAgencyDashboard());
  }, [dispatch]);

  if (agencyLoading && !data?.kpis?.total_clients) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white px-5 py-16 text-center text-sm text-gray-500 shadow-sm">
        Loading dashboard…
      </div>
    );
  }

  const kpis = [
    {
      label: 'Total Clients',
      value: String(k.total_clients?.value ?? 0),
      subtitle: k.total_clients?.subtitle || undefined,
      icon: Users,
      iconBg: 'bg-blue-100 text-blue-600',
    },
    {
      label: 'Active Caregivers',
      value: String(k.active_caregivers?.value ?? 0),
      subtitle: k.active_caregivers?.subtitle || undefined,
      icon: UserCheck,
      iconBg: 'bg-emerald-100 text-emerald-600',
    },
    {
      label: "Today's Visits",
      value: String(k.today_visits?.value ?? 0),
      subtitle: k.today_visits?.subtitle || undefined,
      link: "View today's schedule",
      linkTo: ROUTES.AGENCY_SCHEDULE,
      icon: CalendarCheck,
      iconBg: 'bg-violet-100 text-violet-600',
    },
    {
      label: 'Hours This Week',
      value: k.hours_this_week?.value || '00h 00m',
      trendText: k.hours_this_week?.trend || undefined,
      icon: Clock,
      iconBg: 'bg-orange-100 text-orange-600',
    },
    {
      label: 'Revenue (This Month)',
      value: k.revenue_month?.value || '$0.00',
      trendText: k.revenue_month?.trend || undefined,
      icon: DollarSign,
      iconBg: 'bg-teal-100 text-teal-600',
    },
  ];

  const recentVisits = data?.recent_visits || [];
  const caregiverActivity = data?.caregiver_activity || [];
  const tasks = data?.tasks || [];
  const alerts = data?.alerts || [];
  const widgets = data?.widgets || {};

  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-xl border border-blue-100 bg-gradient-to-r from-[#e8f1fd] via-[#edf4ff] to-white px-6 py-5">
        <div className="flex items-center justify-between gap-6">
          <div>
            <h2 className="text-[1.35rem] font-bold text-[#1e3a8a]">
              Welcome back, {authUser?.name || authUser?.fullName || 'there'}!
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Here&apos;s what&apos;s happening with <span className="font-semibold text-gray-800">{agencyName}</span> today.
            </p>
          </div>
          <WelcomeIllustration />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {kpis.map((kpi) => (
          <AgencyKpiCard key={kpi.label} {...kpi} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm xl:col-span-6">
          <div className="mb-1 flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-gray-900">Visit Overview</h3>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" /> Completed
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-blue-500" /> Scheduled
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-red-500" /> Missed
                </span>
              </div>
              <span className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs text-gray-600">
                This Week
              </span>
            </div>
          </div>
          <VisitOverviewChart series={data?.visit_overview || []} />
        </div>

        <div className="min-w-0 rounded-xl border border-gray-200 bg-white p-5 shadow-sm xl:col-span-3">
          <h3 className="mb-3 text-sm font-semibold text-gray-900">Clients by Status</h3>
          <ClientsStatusDonut
            segments={data?.clients_by_status || []}
            total={data?.clients_total ?? 0}
          />
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm xl:col-span-3">
          <h3 className="mb-3 text-sm font-semibold text-gray-900">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map(({ label, icon: Icon, route }) => (
              <Link
                key={label}
                to={route}
                className="flex flex-col items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-2 py-3.5 text-center transition hover:border-primary/25 hover:shadow-sm"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e8f1fd] text-primary">
                  <Icon size={17} strokeWidth={2} />
                </div>
                <span className="text-[11px] font-medium leading-tight text-gray-700">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <AgencyPanelCard
          title="Recent Visits"
          action={
            <Link to={ROUTES.AGENCY_SCHEDULE} className="text-xs font-medium text-primary hover:underline">
              View Schedule
            </Link>
          }
        >
          {recentVisits.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-gray-500">No visits scheduled for today.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[320px]">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-[11px] font-medium uppercase tracking-wide text-gray-400">
                    <th className="px-5 py-2.5">Client</th>
                    <th className="py-2.5">Time</th>
                    <th className="py-2.5">Caregiver</th>
                    <th className="px-5 py-2.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentVisits.map((visit, i) => (
                    <tr key={visit.id || `${visit.client}-${i}`}>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar initials={visit.initials} index={i} />
                          <span className="text-sm font-medium text-gray-900">{visit.client}</span>
                        </div>
                      </td>
                      <td className="py-3 text-xs text-gray-500">{visit.time}</td>
                      <td className="py-3 text-xs text-gray-600">{visit.caregiver}</td>
                      <td className="px-5 py-3 text-right">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusStyles[visit.status] || statusStyles.Scheduled}`}>
                          {visit.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </AgencyPanelCard>

        <AgencyPanelCard title="Caregiver Activity">
          {caregiverActivity.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-gray-500">No caregiver hours logged this week.</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {caregiverActivity.map(({ id, name, initials, hours, onTime }, i) => (
                <div key={id || name} className="flex items-center gap-3 px-5 py-3.5">
                  <Avatar initials={initials} index={i + 1} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">{name}</p>
                    <p className="text-xs text-gray-500">{hours} hours this week</p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-emerald-600">{onTime}% On Time</span>
                </div>
              ))}
            </div>
          )}
        </AgencyPanelCard>

        <div className="flex flex-col gap-5">
          <AgencyPanelCard title="Action Items">
            {tasks.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-gray-500">No action items right now.</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {tasks.map((task) => (
                  <Link
                    key={task.id}
                    to={task.link || ROUTES.AGENCY_DASHBOARD}
                    className="flex items-start gap-3 px-5 py-3.5 hover:bg-gray-50"
                  >
                    <CheckSquare size={16} className="mt-0.5 shrink-0 text-primary" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900">{task.title}</p>
                      <p className="text-xs text-gray-500">Due: {task.due}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${priorityStyles[task.priority] || priorityStyles.Low}`}>
                      {task.priority}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </AgencyPanelCard>

          <AgencyPanelCard
            title="System Alerts"
            action={
              <Link to={ROUTES.AGENCY_EVV_DASHBOARD} className="text-xs font-medium text-primary hover:underline">
                EVV
              </Link>
            }
          >
            {alerts.length === 0 ? (
              <p className="px-5 py-6 text-center text-sm text-gray-500">No alerts right now.</p>
            ) : (
              <div className="space-y-2 p-4 pt-2">
                {alerts.map((alert) => (
                  <Link
                    key={alert.id}
                    to={alert.link || ROUTES.AGENCY_DASHBOARD}
                    className={`flex items-start gap-2.5 rounded-lg px-3 py-2.5 text-sm ${
                      alert.type === 'danger'
                        ? 'bg-red-50 text-red-700'
                        : alert.type === 'warning'
                          ? 'bg-orange-50 text-orange-700'
                          : 'bg-blue-50 text-blue-700'
                    }`}
                  >
                    <AlertIcon type={alert.type} />
                    <span>{alert.text}</span>
                  </Link>
                ))}
              </div>
            )}
          </AgencyPanelCard>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:max-w-2xl">
        <div className="flex items-center gap-3 rounded-xl border border-violet-100 bg-violet-50 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-violet-600 shadow-sm">
            <Cake size={18} />
          </div>
          <div>
            <p className="text-xl font-bold text-gray-900">{widgets.upcoming_birthdays ?? 0}</p>
            <p className="text-xs font-medium text-gray-700">Upcoming Birthdays</p>
            <p className="text-[10px] text-gray-500">Next 7 Days</p>
          </div>
        </div>
        <Link
          to={ROUTES.AGENCY_EVV_DASHBOARD}
          className="flex items-center gap-3 rounded-xl border border-amber-100 bg-amber-50 p-4 hover:border-amber-200"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-amber-600 shadow-sm">
            <ShieldCheck size={18} />
          </div>
          <div>
            <p className="text-xl font-bold text-gray-900">{widgets.pending_evv_approvals ?? 0}</p>
            <p className="text-xs font-medium text-gray-700">Pending EVV Approvals</p>
            <p className="text-[10px] text-gray-500">Visit logs awaiting review</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
