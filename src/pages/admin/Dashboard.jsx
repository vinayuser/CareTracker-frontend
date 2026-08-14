import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  Building2,
  CheckCircle2,
  DollarSign,
  HeartHandshake,
  Landmark,
  LayoutDashboard,
  Megaphone,
  MessageSquare,
  Settings,
  Shield,
  ShieldCheck,
  Sparkles,
  Ticket,
  TrendingDown,
  TrendingUp,
  UserCheck,
  UserPlus,
  Users,
  Zap,
} from 'lucide-react';
import { fetchAgencies } from '../../redux/slices/agencySlice';
import { fetchPlans } from '../../redux/slices/subscriptionPlanSlice';
import { fetchInvitationStats } from '../../redux/slices/invitationSlice';
import { ROUTES } from '../../routes/routes';
import { formatPrice } from '../../utils/subscriptionStore';
import { buildSuperAdminDashboard, formatCount } from '../../utils/superAdminDashboard';
import PlatformPerformanceChart from '../../components/admin/dashboard/PlatformPerformanceChart';
import AgencyStatusBadge from '../../components/ui/AgencyStatusBadge';

const TABS = [
  { name: 'Overview', icon: LayoutDashboard },
  { name: 'Operations', icon: Settings },
  { name: 'Finance', icon: DollarSign },
  { name: 'Social', icon: MessageSquare },
  { name: 'Agencies', icon: Building2 },
  { name: 'Members', icon: Users },
  { name: 'Analytics', icon: BarChart3 },
  { name: 'System Health', icon: Activity },
  { name: 'Automations', icon: Zap },
  { name: 'Security', icon: Shield },
];

const planBadge = {
  Enterprise: 'bg-violet-100 text-violet-700',
  Professional: 'bg-blue-100 text-blue-700',
  Premium: 'bg-indigo-100 text-indigo-700',
  Growth: 'bg-cyan-100 text-cyan-700',
  Starter: 'bg-emerald-100 text-emerald-700',
  Basic: 'bg-gray-100 text-gray-700',
};

const QUICK_ACTIONS = [
  { label: 'Add Agency', icon: Building2, to: ROUTES.ADMIN_AGENCIES },
  { label: 'Invite User', icon: UserPlus, to: ROUTES.ADMIN_INVITATIONS, state: { openSendDrawer: true } },
  { label: 'Run Billing', icon: DollarSign, to: ROUTES.ADMIN_BILLING_CLAIMS },
  { label: 'Review Compliance', icon: ShieldCheck, to: ROUTES.ADMIN_EVV_COMPLIANCE },
  { label: 'Publish Announcement', icon: Megaphone, to: ROUTES.ADMIN_CONTENT },
  { label: 'View Reports', icon: BarChart3, to: ROUTES.ADMIN_REPORTS },
];

function Card({ title, action, children, className = '' }) {
  return (
    <div className={`rounded-xl border border-gray-200 bg-white shadow-sm ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-3.5">
          <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

function Kpi({ label, value, sub, up = true, icon: Icon, iconBg }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-4 py-3.5 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-medium text-gray-500">{label}</p>
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${iconBg}`}>
          <Icon size={15} />
        </div>
      </div>
      <p className="mt-2 text-[1.35rem] font-bold leading-none tracking-tight text-gray-900">{value}</p>
      {sub ? (
        <p className={`mt-1.5 flex items-center gap-1 text-[11px] font-medium ${up ? 'text-emerald-600' : 'text-rose-500'}`}>
          {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          {sub}
        </p>
      ) : null}
    </div>
  );
}

function timeAgo(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  const mins = Math.round((Date.now() - d.getTime()) / 60000);
  if (mins < 60) return `${Math.max(1, mins)}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

function Sparkline() {
  return (
    <svg viewBox="0 0 220 56" className="h-14 w-full">
      <polyline
        fill="none"
        stroke="#5B7CFA"
        strokeWidth="2.5"
        strokeLinejoin="round"
        points="0,42 24,38 48,40 72,28 96,32 120,18 144,22 168,12 192,16 220,8"
      />
      <circle cx="220" cy="8" r="3.5" fill="#5B7CFA" />
    </svg>
  );
}

export default function Dashboard() {
  const dispatch = useDispatch();
  const { list: agencies, status: agencyStatus } = useSelector((s) => s.agencies);
  const { list: plans } = useSelector((s) => s.subscriptionPlans);
  const { stats: invitationStats } = useSelector((s) => s.invitations);
  const [tab, setTab] = useState('Overview');
  const [supportTab, setSupportTab] = useState('tickets');

  useEffect(() => {
    dispatch(fetchAgencies());
    dispatch(fetchPlans());
    dispatch(fetchInvitationStats());
  }, [dispatch]);

  const data = useMemo(
    () => buildSuperAdminDashboard({ agencies, plans, invitationStats }),
    [agencies, plans, invitationStats],
  );

  const loading = agencyStatus === 'loading' && agencies.length === 0;
  const k = data.kpis;
  const show = (names) => names.includes(tab);

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white px-5 py-16 text-center text-sm text-gray-500 shadow-sm">
        Loading dashboard…
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="-mx-6 -mt-6 border-b border-gray-200 bg-white px-6">
        <div className="flex gap-1 overflow-x-auto">
          {TABS.map(({ name, icon: Icon }) => {
            const active = tab === name;
            return (
              <button
                key={name}
                type="button"
                onClick={() => setTab(name)}
                className={`flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-3 text-[13px] font-medium transition-colors ${
                  active
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                <Icon size={15} strokeWidth={1.75} />
                {name}
              </button>
            );
          })}
        </div>
      </div>

      {show(['Overview', 'Agencies', 'Members', 'Finance', 'Analytics']) && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
          <Kpi label="Total Agencies" value={formatCount(k.agencies.value)} sub={k.agencies.sub} icon={Building2} iconBg="bg-violet-100 text-violet-600" />
          <Kpi label="Active Users" value={formatCount(k.users.value)} sub={k.users.sub} icon={Users} iconBg="bg-blue-100 text-blue-600" />
          <Kpi label="Total Clients" value={formatCount(k.clients.value)} sub={k.clients.sub} icon={HeartHandshake} iconBg="bg-emerald-100 text-emerald-600" />
          <Kpi label="Active Caregivers" value={formatCount(k.caregivers.value)} sub={k.caregivers.sub} icon={UserCheck} iconBg="bg-pink-100 text-pink-600" />
          <Kpi label="Monthly Revenue" value={k.revenue.value} sub={k.revenue.sub} icon={DollarSign} iconBg="bg-teal-100 text-teal-600" />
          <Kpi label="Claims Processed" value={formatCount(k.claims.value)} sub={k.claims.sub} icon={Landmark} iconBg="bg-indigo-100 text-indigo-600" />
          <Kpi label="Support Tickets" value={formatCount(k.tickets.value)} sub={k.tickets.sub} up={false} icon={Ticket} iconBg="bg-orange-100 text-orange-600" />
          <Kpi label="Social Engagement" value={formatCount(k.social.value)} sub={k.social.sub} icon={MessageSquare} iconBg="bg-sky-100 text-sky-600" />
        </div>
      )}

      {show(['Overview', 'Analytics', 'Operations', 'System Health']) && (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
          {show(['Overview', 'Analytics']) && (
            <div className="xl:col-span-8">
              <PlatformPerformanceChart />
            </div>
          )}
          <div className={`space-y-5 ${show(['Overview', 'Analytics']) ? 'xl:col-span-4' : 'xl:col-span-12 grid gap-5 lg:grid-cols-3'}`}>
            {show(['Overview', 'Operations', 'System Health']) && (
              <Card title="Platform Health">
                <ul className="divide-y divide-gray-50 px-5 py-2">
                  {data.health.map((row) => (
                    <li key={row.label} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                      <span className="text-gray-600">{row.label}</span>
                      <span className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">{row.value}</span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          row.status === 'Healthy' ? 'bg-emerald-50 text-emerald-700' : 'bg-orange-50 text-orange-700'
                        }`}
                        >
                          {row.status}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
            {show(['Overview', 'Operations']) && (
              <Card title="AI Insights & Recommendations">
                <ul className="space-y-2.5 p-4">
                  {data.insights.map((item) => (
                    <li key={item.id} className="flex gap-2.5 rounded-lg bg-gray-50 px-3 py-2.5">
                      <Sparkles size={16} className={`mt-0.5 shrink-0 ${
                        item.tone === 'emerald' ? 'text-emerald-500' : item.tone === 'amber' ? 'text-amber-500' : 'text-primary'
                      }`}
                      />
                      <div>
                        <p className="text-xs font-semibold text-gray-900">{item.title}</p>
                        <p className="mt-0.5 text-xs text-gray-500">{item.text}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
            {show(['Overview', 'Operations', 'System Health', 'Security']) && (
              <Card
                title="Urgent Alerts"
                action={<span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">{data.alerts.length}</span>}
              >
                {data.alerts.length === 0 ? (
                  <p className="px-5 py-8 text-center text-sm text-gray-400">No urgent alerts.</p>
                ) : (
                  <ul className="divide-y divide-gray-50 px-4 py-2">
                    {data.alerts.slice(0, 5).map((alert) => (
                      <li key={alert.id} className="flex items-start gap-2.5 py-2.5">
                        <AlertTriangle size={15} className={alert.tone === 'danger' ? 'mt-0.5 text-red-500' : 'mt-0.5 text-amber-500'} />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900">{alert.title}</p>
                          <p className="text-[11px] text-gray-400">{alert.time}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            )}
          </div>
        </div>
      )}

      {show(['Overview', 'Agencies', 'Finance', 'Operations']) && (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
          {show(['Overview', 'Agencies']) && (
            <Card
              className="xl:col-span-8"
              title="Top Agencies by Revenue"
              action={<Link to={ROUTES.ADMIN_AGENCIES} className="text-xs font-medium text-primary hover:underline">View all</Link>}
            >
              {data.topAgencies.length === 0 ? (
                <p className="px-5 py-10 text-center text-sm text-gray-400">No agencies yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 text-left text-[11px] font-medium uppercase tracking-wide text-gray-400">
                        <th className="px-5 py-2.5">#</th>
                        <th className="py-2.5">Agency</th>
                        <th className="py-2.5">Location</th>
                        <th className="py-2.5">Clients</th>
                        <th className="py-2.5">Caregivers</th>
                        <th className="py-2.5">Revenue (MTD)</th>
                        <th className="py-2.5">Plan</th>
                        <th className="py-2.5">Compliance</th>
                        <th className="px-5 py-2.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {data.topAgencies.map((agency, i) => (
                        <tr key={agency.id} className="hover:bg-gray-50">
                          <td className="px-5 py-3 text-xs text-gray-400">{i + 1}</td>
                          <td className="py-3">
                            <div className="flex items-center gap-2.5">
                              <div className={`flex h-8 w-8 items-center justify-center rounded-lg text-[10px] font-bold ${agency.iconColor}`}>
                                {agency.initials}
                              </div>
                              <span className="font-medium text-gray-900">{agency.name}</span>
                            </div>
                          </td>
                          <td className="py-3 text-xs text-gray-500">{agency.location}</td>
                          <td className="py-3 text-gray-700">{agency.clients}</td>
                          <td className="py-3 text-gray-700">{agency.caregivers}</td>
                          <td className="py-3 font-semibold text-gray-900">{formatPrice(agency.revenue)}</td>
                          <td className="py-3">
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${planBadge[agency.plan] || 'bg-gray-100 text-gray-600'}`}>
                              {agency.plan}
                            </span>
                          </td>
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-100">
                                <div className="h-full rounded-full bg-emerald-500" style={{ width: `${agency.compliance}%` }} />
                              </div>
                              <span className="text-xs text-gray-600">{agency.compliance}%</span>
                            </div>
                          </td>
                          <td className="px-5 py-3">
                            <AgencyStatusBadge status={agency.status === 'Warning' ? 'Suspended' : agency.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          )}

          <div className={`space-y-5 ${show(['Overview', 'Agencies']) ? 'xl:col-span-4' : 'xl:col-span-12 grid gap-5 lg:grid-cols-2'}`}>
            {show(['Overview', 'Finance']) && (
              <Card title="Finance Summary">
                <div className="px-5 pt-3">
                  <p className="text-[11px] text-gray-500">Revenue trend · last 30 days</p>
                  <Sparkline />
                </div>
                <div className="grid grid-cols-2 gap-3 p-4 pt-2">
                  {[
                    ['MRR', data.finance.mrr],
                    ['Unpaid Invoices', data.finance.unpaid],
                    ['Payouts', data.finance.payouts],
                    ['Collections', data.finance.collections],
                    ['Refunds', data.finance.refunds],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-lg bg-gray-50 px-3 py-2.5">
                      <p className="text-[11px] text-gray-500">{label}</p>
                      <p className="mt-0.5 text-sm font-bold text-gray-900">{value}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}
            {show(['Overview', 'Operations']) && (
              <Card title="Platform Tasks">
                <ul className="divide-y divide-gray-50 px-2 py-1">
                  {data.tasks.map((task) => (
                    <li key={task.id}>
                      <Link to={task.to} className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50">
                        <input type="checkbox" readOnly checked={task.count === 0} className="h-4 w-4 rounded border-gray-300 text-primary" />
                        <span className="min-w-0 flex-1 text-sm text-gray-800">{task.label}</span>
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700">{task.count}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>
        </div>
      )}

      {show(['Overview', 'Social', 'Members', 'Security', 'Automations']) && (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-4">
          {show(['Overview', 'Social']) && (
            <Card title="Social & Community Overview">
              <div className="grid grid-cols-3 gap-2 px-4 pt-4">
                {[
                  ['Pending Posts', data.social.pendingPosts],
                  ['New Reviews', data.social.newReviews],
                  ['Messages', data.social.unreadMessages],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-lg bg-gray-50 px-2 py-2 text-center">
                    <p className="text-lg font-bold text-gray-900">{value}</p>
                    <p className="text-[10px] text-gray-500">{label}</p>
                  </div>
                ))}
              </div>
              <div className="px-5 py-4">
                <p className="text-xs font-semibold text-gray-500">Top Communities</p>
                <p className="mt-2 text-sm text-gray-400">No communities yet.</p>
                <p className="mt-3 text-xs font-semibold text-gray-500">Trending Topics</p>
                <p className="mt-2 text-sm text-gray-400">No topics yet.</p>
              </div>
            </Card>
          )}

          {show(['Overview', 'Members']) && (
            <Card title="User Management" action={<Link to={ROUTES.ADMIN_USERS} className="text-xs font-medium text-primary hover:underline">View users</Link>}>
              <div className="grid grid-cols-3 gap-2 px-4 pt-4">
                {[
                  ['New Signups', data.kpis.agencies.sub.startsWith('+') ? data.kpis.agencies.sub.replace(' this month', '') : '0'],
                  ['Pending', data.tasks[0]?.count ?? 0],
                  ['Invites', invitationStats.pending || 0],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-lg bg-gray-50 px-2 py-2 text-center">
                    <p className="text-lg font-bold text-gray-900">{value}</p>
                    <p className="text-[10px] text-gray-500">{label}</p>
                  </div>
                ))}
              </div>
              <div className="px-5 py-3">
                <p className="mb-2 text-xs font-semibold text-gray-500">Recent User Activity</p>
                {data.recentActivity.length === 0 ? (
                  <p className="py-4 text-sm text-gray-400">No recent activity.</p>
                ) : (
                  <ul className="space-y-2.5">
                    {data.recentActivity.map((row) => (
                      <li key={row.id} className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                          {row.initials}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-gray-900">{row.name}</p>
                          <p className="text-[11px] text-gray-400">{row.role} · {row.detail}</p>
                        </div>
                        <span className="text-[10px] text-gray-400">{timeAgo(row.time)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Card>
          )}

          {show(['Overview', 'Security']) && (
            <Card
              title="Support & Audit Overview"
              action={(
                <div className="flex gap-1">
                  {[
                    ['tickets', 'Tickets'],
                    ['audit', 'Audit'],
                    ['security', 'Security'],
                  ].map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setSupportTab(id)}
                      className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                        supportTab === id ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            >
              {supportTab === 'tickets' && (
                <p className="px-5 py-8 text-center text-sm text-gray-400">No support tickets yet.</p>
              )}
              {supportTab === 'audit' && (
                <div className="px-5 py-4">
                  <Link to={ROUTES.ADMIN_AUDIT_LOGS} className="text-sm font-medium text-primary hover:underline">
                    Open audit logs →
                  </Link>
                  <p className="mt-2 text-xs text-gray-400">Platform activity tracking is available in Audit Logs.</p>
                </div>
              )}
              {supportTab === 'security' && (
                <ul className="space-y-2 p-4">
                  <li className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                    <CheckCircle2 size={15} /> No security alerts
                  </li>
                </ul>
              )}
            </Card>
          )}

          {show(['Overview', 'Automations']) && (
            <Card title="Quick Actions">
              <div className="grid grid-cols-2 gap-2 p-4">
                {QUICK_ACTIONS.map(({ label, icon: Icon, to, state }) => (
                  <Link
                    key={label}
                    to={to}
                    state={state}
                    className="flex flex-col items-center gap-2 rounded-xl border border-gray-200 px-2 py-4 text-center text-[11px] font-semibold text-gray-700 hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Icon size={16} />
                    </div>
                    {label}
                  </Link>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {tab === 'Automations' && (
        <Card title="Automations">
          <div className="flex items-center gap-3 px-5 py-10 text-sm text-gray-500">
            <Bell size={18} className="text-primary" />
            Billing runs, compliance reminders, and announcement workflows will appear here.
          </div>
        </Card>
      )}
    </div>
  );
}
