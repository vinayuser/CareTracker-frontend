import { Link } from 'react-router-dom';
import {
  Users,
  UserCheck,
  CalendarCheck,
  Clock,
  DollarSign,
  UserPlus,
  Calendar,
  CheckSquare,
  MessageSquare,
  FileBarChart,
  ChevronDown,
  AlertTriangle,
  Info,
  FileText,
  Cake,
} from 'lucide-react';
import { ROUTES } from '../../routes/routes';
import { getAuthUser } from '../../utils/auth';
import VisitOverviewChart from '../../components/agency/dashboard/VisitOverviewChart';
import ClientsStatusDonut from '../../components/agency/dashboard/ClientsStatusDonut';
import WelcomeIllustration from '../../components/agency/dashboard/WelcomeIllustration';
import AgencyKpiCard from '../../components/agency/dashboard/AgencyKpiCard';
import AgencyPanelCard from '../../components/agency/dashboard/AgencyPanelCard';

const kpis = [
  {
    label: 'Total Clients',
    value: '128',
    trendText: '8% from last month',
    icon: Users,
    iconBg: 'bg-blue-100 text-blue-600',
  },
  {
    label: 'Active Caregivers',
    value: '86',
    trendText: '12% from last month',
    icon: UserCheck,
    iconBg: 'bg-emerald-100 text-emerald-600',
  },
  {
    label: "Today's Visits",
    value: '42',
    link: "View today's schedule",
    linkTo: ROUTES.AGENCY_SCHEDULE,
    icon: CalendarCheck,
    iconBg: 'bg-violet-100 text-violet-600',
  },
  {
    label: 'Hours This Week',
    value: '1,842',
    trendText: '15% from last week',
    icon: Clock,
    iconBg: 'bg-orange-100 text-orange-600',
  },
  {
    label: 'Revenue (This Month)',
    value: '$24,560',
    trendText: '10% from last month',
    icon: DollarSign,
    iconBg: 'bg-teal-100 text-teal-600',
  },
];

const quickActions = [
  { label: 'Add New Client', icon: UserPlus, route: ROUTES.AGENCY_CLIENTS_INTAKE },
  { label: 'Add Caregiver', icon: UserCheck, route: ROUTES.AGENCY_CAREGIVERS },
  { label: 'Schedule Visit', icon: Calendar, route: ROUTES.AGENCY_SCHEDULE },
  { label: 'Create Task', icon: CheckSquare, route: ROUTES.AGENCY_TASKS },
  { label: 'Send Message', icon: MessageSquare, route: ROUTES.AGENCY_CLIENTS },
  { label: 'Generate Report', icon: FileBarChart, route: ROUTES.AGENCY_REPORTS },
];

const recentVisits = [
  { client: 'Mary Johnson', initials: 'MJ', time: '9:00 AM - 10:00 AM', caregiver: 'Sarah Williams', status: 'Completed' },
  { client: 'Robert Chen', initials: 'RC', time: '10:30 AM - 11:30 AM', caregiver: 'Mike Davis', status: 'Scheduled' },
  { client: 'Eleanor Williams', initials: 'EW', time: '1:00 PM - 2:00 PM', caregiver: 'Lisa Park', status: 'Completed' },
  { client: 'James Miller', initials: 'JM', time: '2:00 PM - 3:00 PM', caregiver: 'Unassigned', status: 'Missed' },
];

const caregiverActivity = [
  { name: 'Sarah Williams', initials: 'SW', hours: 32, onTime: 96 },
  { name: 'Mike Davis', initials: 'MD', hours: 38, onTime: 93 },
  { name: 'Lisa Park', initials: 'LP', hours: 36, onTime: 98 },
  { name: 'Tom Wilson', initials: 'TW', hours: 40, onTime: 91 },
];

const tasks = [
  { title: 'Care Plan Review — Robert Chen', due: 'Today, 3:00 PM', priority: 'High', done: false },
  { title: 'Complete assessment documentation', due: 'May 19', priority: 'Medium', done: false },
  { title: 'Schedule follow-up visit', due: 'May 20', priority: 'Low', done: true },
];

const alerts = [
  { text: '3 visits have no caregiver assigned', type: 'danger', icon: AlertTriangle },
  { text: '2 caregivers with expiring documents', type: 'warning', icon: AlertTriangle },
  { text: '5 clients with upcoming birthdays', type: 'info', icon: Info },
];

const statusStyles = {
  Completed: 'bg-emerald-100 text-emerald-700',
  Scheduled: 'bg-blue-100 text-blue-700',
  Missed: 'bg-red-100 text-red-700',
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

export default function AgencyDashboard() {
  const authUser = getAuthUser();
  const agencyName = authUser?.agencyName ?? 'BrightCare Home Health';

  return (
    <div className="space-y-5">
      {/* Welcome banner */}
      <div className="overflow-hidden rounded-xl border border-blue-100 bg-gradient-to-r from-[#e8f1fd] via-[#edf4ff] to-white px-6 py-5">
        <div className="flex items-center justify-between gap-6">
          <div>
            <h2 className="text-[1.35rem] font-bold text-[#1e3a8a]">Welcome back, {authUser?.name ?? 'John Smith'}!</h2>
            <p className="mt-1 text-sm text-gray-600">
              Here&apos;s what&apos;s happening with <span className="font-semibold text-gray-800">{agencyName}</span> today.
            </p>
          </div>
          <WelcomeIllustration />
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {kpis.map((kpi) => (
          <AgencyKpiCard key={kpi.label} {...kpi} />
        ))}
      </div>

      {/* Charts + quick actions */}
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
              <button
                type="button"
                className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-50"
              >
                This Week
                <ChevronDown size={14} />
              </button>
            </div>
          </div>
          <VisitOverviewChart />
        </div>

        <div className="min-w-0 rounded-xl border border-gray-200 bg-white p-5 shadow-sm xl:col-span-3">
          <h3 className="mb-3 text-sm font-semibold text-gray-900">Clients by Status</h3>
          <ClientsStatusDonut />
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

      {/* Activity row — 3 columns like mockup */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <AgencyPanelCard title="Recent Visits">
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
                  <tr key={visit.client}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar initials={visit.initials} index={i} />
                        <span className="text-sm font-medium text-gray-900">{visit.client}</span>
                      </div>
                    </td>
                    <td className="py-3 text-xs text-gray-500">{visit.time}</td>
                    <td className="py-3 text-xs text-gray-600">{visit.caregiver}</td>
                    <td className="px-5 py-3 text-right">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusStyles[visit.status]}`}>
                        {visit.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AgencyPanelCard>

        <AgencyPanelCard title="Caregiver Activity">
          <div className="divide-y divide-gray-50">
            {caregiverActivity.map(({ name, initials, hours, onTime }, i) => (
              <div key={name} className="flex items-center gap-3 px-5 py-3.5">
                <Avatar initials={initials} index={i + 1} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900">{name}</p>
                  <p className="text-xs text-gray-500">{hours} hours this week</p>
                </div>
                <span className="shrink-0 text-sm font-semibold text-emerald-600">{onTime}% On Time</span>
              </div>
            ))}
          </div>
        </AgencyPanelCard>

        <div className="flex flex-col gap-5">
          <AgencyPanelCard
            title="Tasks"
            action={
              <Link to={ROUTES.AGENCY_TASKS} className="text-xs font-medium text-primary hover:underline">
                View All
              </Link>
            }
          >
            <div className="divide-y divide-gray-50">
              {tasks.map((task) => (
                <div key={task.title} className="flex items-start gap-3 px-5 py-3.5">
                  <input
                    type="radio"
                    name="dashboard-task"
                    defaultChecked={!task.done && task.priority === 'High'}
                    className="mt-0.5 h-4 w-4 border-gray-300 text-primary focus:ring-primary/20"
                  />
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm ${task.done ? 'text-gray-400 line-through' : 'font-medium text-gray-900'}`}>
                      {task.title}
                    </p>
                    <p className="text-xs text-gray-500">Due: {task.due}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${priorityStyles[task.priority]}`}>
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>
          </AgencyPanelCard>

          <AgencyPanelCard
            title="System Alerts"
            action={
              <Link to={ROUTES.AGENCY_INCIDENTS} className="text-xs font-medium text-primary hover:underline">
                View All
              </Link>
            }
          >
            <div className="space-y-2 p-4 pt-2">
              {alerts.map(({ text, type, icon: Icon }) => (
                <div
                  key={text}
                  className={`flex items-start gap-2.5 rounded-lg px-3 py-2.5 text-sm ${
                    type === 'danger'
                      ? 'bg-red-50 text-red-700'
                      : type === 'warning'
                        ? 'bg-orange-50 text-orange-700'
                        : 'bg-blue-50 text-blue-700'
                  }`}
                >
                  <Icon size={16} className="mt-0.5 shrink-0" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </AgencyPanelCard>
        </div>
      </div>

      {/* Footer widgets — only 2 cards per mockup */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:max-w-2xl">
        <div className="flex items-center gap-3 rounded-xl border border-violet-100 bg-violet-50 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-violet-600 shadow-sm">
            <Cake size={18} />
          </div>
          <div>
            <p className="text-xl font-bold text-gray-900">5</p>
            <p className="text-xs font-medium text-gray-700">Upcoming Birthdays</p>
            <p className="text-[10px] text-gray-500">Next 7 Days</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-amber-100 bg-amber-50 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-amber-600 shadow-sm">
            <FileText size={18} />
          </div>
          <div>
            <p className="text-xl font-bold text-gray-900">8</p>
            <p className="text-xs font-medium text-gray-700">Expiring Documents</p>
            <p className="text-[10px] text-gray-500">Next 30 Days</p>
          </div>
        </div>
      </div>
    </div>
  );
}
