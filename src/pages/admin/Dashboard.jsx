import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  CreditCard,
  Clock,
  DollarSign,
  UserPlus,
  Users,
  HeartHandshake,
  Plus,
  Mail,
  BarChart3,
  FileText,
  Settings,
  AlertTriangle,
  CheckCircle2,
  Ticket,
  CalendarClock,
} from 'lucide-react';
import DashboardKpiCard from '../../components/dashboard/DashboardKpiCard';
import SalesChart from '../../components/dashboard/SalesChart';
import AgenciesPlanChart from '../../components/dashboard/AgenciesPlanChart';
import AgencyStatusBadge from '../../components/ui/AgencyStatusBadge';
import { fetchDashboardMetrics, formatPrice } from '../../utils/dashboardData';
import { ROUTES } from '../../routes/routes';
import { formatAgencyDate } from '../../utils/agencyStore';

const quickActions = [
  { label: 'Manage Agencies', icon: Building2, route: ROUTES.ADMIN_AGENCIES },
  { label: 'Create Plan', icon: Plus, route: ROUTES.ADMIN_SUBSCRIPTION_PLANS },
  { label: 'Send Invitation', icon: Mail, route: ROUTES.ADMIN_INVITATIONS, state: { openSendDrawer: true } },
  { label: 'View Reports', icon: BarChart3, route: ROUTES.ADMIN_REPORTS },
  { label: 'Audit Logs', icon: FileText, route: ROUTES.ADMIN_AUDIT_LOGS },
  { label: 'Settings', icon: Settings, route: ROUTES.ADMIN_SETTINGS },
];

const platformTasks = [
  { title: 'Review pending agency activations', priority: 'High', due: 'Today' },
  { title: 'Approve Premium Plan price update', priority: 'Medium', due: 'Jun 20' },
  { title: 'Export monthly revenue report', priority: 'Medium', due: 'Jun 22' },
  { title: 'Update platform terms of service', priority: 'Low', due: 'Jun 30' },
];

const priorityStyles = {
  High: 'bg-red-50 text-danger',
  Medium: 'bg-orange-50 text-warning',
  Low: 'bg-gray-100 text-gray-600',
};

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    fetchDashboardMetrics().then(setMetrics);
  }, []);

  if (!metrics) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-400">
        Loading dashboard...
      </div>
    );
  }

  const { kpis, agenciesByPlan, recentSignups, agenciesNearLimit, alerts, platformStats } = metrics;

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-r from-primary/10 via-white to-blue-50 shadow-sm">
        <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, Admin User!</h1>
            <p className="mt-1 text-sm text-gray-600">
              Here&apos;s what&apos;s happening across the CareTraker platform today.
            </p>
          </div>
          <div className="hidden h-24 w-40 shrink-0 items-end justify-center rounded-xl bg-primary/5 sm:flex">
            <Building2 size={64} className="text-primary/30" strokeWidth={1.5} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <DashboardKpiCard
          label="Total Agencies"
          value={kpis.totalAgencies}
          trend={`${kpis.agenciesTrend} from last month`}
          icon={Building2}
          iconClass="bg-violet-100 text-violet-600"
        />
        <DashboardKpiCard
          label="Active Subscriptions"
          value={kpis.activeSubscriptions}
          trend={`${kpis.subscriptionsTrend} from last month`}
          icon={CreditCard}
          iconClass="bg-blue-100 text-blue-600"
        />
        <DashboardKpiCard
          label="Pending Agencies"
          value={kpis.pendingAgencies}
          subtext={kpis.pendingLabel}
          icon={Clock}
          iconClass="bg-orange-100 text-warning"
        />
        <DashboardKpiCard
          label="Platform Users"
          value={platformStats.totalPlatformUsers}
          trend={`${kpis.caregiversTrend} caregivers platform-wide`}
          icon={Users}
          iconClass="bg-cyan-100 text-cyan-600"
        />
        <DashboardKpiCard
          label="Revenue (This Month)"
          value={formatPrice(kpis.monthlyRevenue)}
          trend={`${kpis.revenueTrend} from last month`}
          icon={DollarSign}
          iconClass="bg-green-100 text-success"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <DashboardKpiCard
          label="New Signups"
          value={kpis.newSignupsThisMonth}
          trend={`${kpis.signupsTrend} this month`}
          icon={UserPlus}
          iconClass="bg-indigo-100 text-indigo-600"
        />
        <DashboardKpiCard
          label="Total Clients"
          value={kpis.totalClients}
          trend={`${kpis.clientsTrend} across all agencies`}
          icon={Users}
          iconClass="bg-emerald-100 text-emerald-600"
        />
        <DashboardKpiCard
          label="Total Caregivers"
          value={kpis.totalCaregivers}
          trend={`${kpis.caregiversTrend} across all agencies`}
          icon={HeartHandshake}
          iconClass="bg-pink-100 text-pink-600"
        />
        <DashboardKpiCard
          label="Active Plans"
          value={platformStats.activePlans}
          action="View all plans →"
          icon={CreditCard}
          iconClass="bg-primary/10 text-primary"
        />
        <DashboardKpiCard
          label="Open Invitations"
          value={platformStats.openInvitations}
          action="Manage invitations →"
          icon={Mail}
          iconClass="bg-amber-100 text-amber-600"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <SalesChart />
        </div>
        <AgenciesPlanChart data={agenciesByPlan} total={kpis.totalAgencies} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900">Quick Actions</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {quickActions.map(({ label, icon: Icon, route, state }) => (
              <Link
                key={label}
                to={route}
                state={state}
                className="flex flex-col items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-4 text-center text-xs font-medium text-gray-700 transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
              >
                <Icon size={20} />
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white shadow-sm lg:col-span-2">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-base font-semibold text-gray-900">Recent Agency Sign-ups</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  <th className="px-6 py-3">Agency</th>
                  <th className="px-6 py-3">Plan</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentSignups.map((signup) => (
                  <tr key={signup.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 font-medium text-gray-900">{signup.name}</td>
                    <td className="px-6 py-3 text-gray-600">{signup.plan}</td>
                    <td className="px-6 py-3 text-gray-600">
                      {signup.amount ? `${formatPrice(signup.amount)}/mo` : '—'}
                    </td>
                    <td className="px-6 py-3 text-gray-600">{formatAgencyDate(signup.date)}</td>
                    <td className="px-6 py-3">
                      <AgencyStatusBadge status={signup.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900">Agencies Near Limit</h2>
          <p className="mt-0.5 text-xs text-gray-500">Usage approaching plan caps</p>
          <ul className="mt-4 space-y-3">
            {agenciesNearLimit.length === 0 ? (
              <li className="text-sm text-gray-400">No agencies near limits</li>
            ) : (
              agenciesNearLimit.map((item) => (
                <li key={`${item.agencyId}-${item.metric}`} className="rounded-lg bg-gray-50 p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-900">{item.agencyName}</span>
                    <span className="text-xs font-semibold text-warning">{item.percent}%</span>
                  </div>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {item.metric}: {item.used} / {item.max}
                  </p>
                  <div className="mt-2 h-1.5 rounded-full bg-gray-200">
                    <div
                      className="h-1.5 rounded-full bg-warning"
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900">Platform Tasks</h2>
          <ul className="mt-4 space-y-3">
            {platformTasks.map((task) => (
              <li key={task.title} className="flex items-start gap-3 rounded-lg border border-gray-100 p-3">
                <input type="checkbox" className="mt-0.5 rounded border-gray-300 text-primary" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-800">{task.title}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${priorityStyles[task.priority]}`}>
                      {task.priority}
                    </span>
                    <span className="text-xs text-gray-400">Due {task.due}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900">System Alerts</h2>
          <ul className="mt-4 space-y-3">
            {alerts.map((alert) => (
              <li
                key={alert.id}
                className={`flex items-start gap-3 rounded-lg p-3 text-sm ${
                  alert.type === 'danger'
                    ? 'bg-red-50 text-red-800'
                    : alert.type === 'warning'
                      ? 'bg-orange-50 text-orange-800'
                      : 'bg-blue-50 text-blue-800'
                }`}
              >
                <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                {alert.message}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {[
          { label: 'Active Plans', value: platformStats.activePlans, icon: CreditCard },
          { label: 'Failed Payments', value: platformStats.failedPayments, icon: DollarSign },
          { label: 'Support Tickets', value: platformStats.supportTickets, icon: Ticket },
          { label: 'Trial Expiring', value: platformStats.trialExpiring, icon: CalendarClock },
          { label: 'Open Invites', value: platformStats.openInvitations, icon: Mail },
          { label: 'All Clear', value: '✓', icon: CheckCircle2 },
        ].map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
              <Icon size={16} />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
