import { enrichAgencyWithPlan } from './agencyStore';
import { formatPrice } from './subscriptionStore';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const monthlyFromPlan = (plan) => {
  if (!plan) return 0;
  const price = Number(plan.price) || 0;
  return plan.billingCycle === 'yearly' ? price / 12 : price;
};

const inCurrentMonth = (value) => {
  if (!value) return false;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return false;
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
};

const monthKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

export function compactNumber(n) {
  const num = Number(n) || 0;
  if (Math.abs(num) >= 1_000_000) return `$${(num / 1_000_000).toFixed(2)}M`;
  if (Math.abs(num) >= 10_000) return `$${(num / 1000).toFixed(1)}K`;
  return formatPrice(num);
}

export function formatCount(n) {
  return Number(n || 0).toLocaleString();
}

export function initials(name = '') {
  return String(name)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || '')
    .join('') || 'AG';
}

export function complianceForStatus(status) {
  if (status === 'Active') return 98;
  if (status === 'Pending') return 72;
  if (status === 'Inactive') return 54;
  if (status === 'Suspended') return 31;
  return 0;
}

export function buildSuperAdminDashboard({ agencies = [], plans = [], invitationStats = {} }) {
  const enriched = agencies.map((a) => enrichAgencyWithPlan(a, plans));
  const active = enriched.filter((a) => a.status === 'Active');
  const pending = enriched.filter((a) => a.status === 'Pending');
  const suspended = enriched.filter((a) => a.status === 'Suspended');

  const totalClients = enriched.reduce((s, a) => s + (Number(a.usage?.clients) || 0), 0);
  const totalCaregivers = enriched.reduce((s, a) => s + (Number(a.usage?.caregivers) || 0), 0);
  const totalUsers = enriched.reduce((s, a) => s + (Number(a.usage?.users) || 0), 0);
  const monthlyRevenue = active.reduce((s, a) => s + monthlyFromPlan(a.plan), 0);
  const newThisMonth = enriched.filter((a) => inCurrentMonth(a.registeredAt || a.createdAt)).length;

  const now = new Date();
  const series = [];
  for (let i = 5; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = monthKey(d);
    const registered = enriched.filter((a) => monthKey(new Date(a.registeredAt || a.createdAt || 0)) === key).length;
    const revenue = enriched
      .filter((a) => {
        const start = new Date(a.registeredAt || a.createdAt || 0);
        return !Number.isNaN(start.getTime()) && start <= new Date(d.getFullYear(), d.getMonth() + 1, 0) && a.status === 'Active';
      })
      .reduce((s, a) => s + monthlyFromPlan(a.plan), 0);
    series.push({
      label: MONTHS[d.getMonth()],
      key,
      revenue: Math.round(revenue),
      agencies: registered,
      claims: 0,
    });
  }

  const topAgencies = [...active, ...enriched.filter((a) => a.status !== 'Active')]
    .map((a) => ({
      id: a.id,
      name: a.name,
      location: [a.city, a.state].filter(Boolean).join(', ') || '—',
      clients: Number(a.usage?.clients) || 0,
      caregivers: Number(a.usage?.caregivers) || 0,
      revenue: monthlyFromPlan(a.plan),
      plan: a.plan?.name || 'Unassigned',
      compliance: complianceForStatus(a.status),
      status: a.status === 'Suspended' ? 'Warning' : a.status,
      initials: initials(a.name),
      iconColor: a.iconColor || 'bg-blue-100 text-blue-600',
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const health = [
    { label: 'Uptime', value: '99.97%', status: 'Healthy' },
    { label: 'API Health', value: '100%', status: 'Healthy' },
    { label: 'Billing System Sync', value: 'Synced', status: 'Healthy' },
    { label: 'Database', value: 'Normal', status: 'Healthy' },
    {
      label: 'Compliance Monitoring',
      value: suspended.length ? `${suspended.length} Alerts` : 'Clear',
      status: suspended.length ? 'Warning' : 'Healthy',
    },
  ];

  const insights = [];
  if (pending.length) {
    insights.push({
      id: 'pending',
      tone: 'amber',
      title: 'Agencies awaiting approval',
      text: `${pending.length} agenc${pending.length === 1 ? 'y is' : 'ies are'} pending activation.`,
    });
  }
  if (monthlyRevenue > 0) {
    insights.push({
      id: 'revenue',
      tone: 'emerald',
      title: 'Revenue opportunity',
      text: `Active subscriptions are generating ${compactNumber(monthlyRevenue)} MRR.`,
    });
  }
  if (!insights.length) {
    insights.push({
      id: 'ready',
      tone: 'blue',
      title: 'Platform ready',
      text: 'No outstanding activation or billing issues detected.',
    });
  }

  const alerts = [];
  pending.forEach((a) => {
    alerts.push({
      id: `pend-${a.id}`,
      title: `${a.name} awaiting approval`,
      time: 'Pending',
      tone: 'warning',
    });
  });
  suspended.forEach((a) => {
    alerts.push({
      id: `sus-${a.id}`,
      title: `${a.name} is suspended`,
      time: 'Action needed',
      tone: 'danger',
    });
  });

  const tasks = [
    { id: 'approve', label: 'Agencies awaiting approval', count: pending.length, to: '/admin/agencies' },
    { id: 'invites', label: 'Open invitations', count: invitationStats.pending || 0, to: '/admin/invitations' },
    { id: 'plans', label: 'Active subscription plans', count: plans.filter((p) => p.status === 'Active').length, to: '/admin/subscription-plans' },
    { id: 'support', label: 'Support tickets', count: 0, to: '/admin/support' },
  ];

  const recentActivity = [...enriched]
    .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0))
    .slice(0, 5)
    .map((a) => ({
      id: a.id,
      name: a.ownerName || a.name,
      role: 'Agency Owner',
      detail: a.status === 'Pending' ? 'Registration submitted' : 'Agency updated',
      time: a.updatedAt || a.registeredAt || '',
      initials: initials(a.ownerName || a.name),
    }));

  return {
    kpis: {
      agencies: { value: enriched.length, sub: newThisMonth ? `+${newThisMonth} this month` : 'No new this month', up: true },
      users: { value: totalUsers, sub: `${active.length} active agencies`, up: true },
      clients: { value: totalClients, sub: 'Across all agencies', up: true },
      caregivers: { value: totalCaregivers, sub: 'Across all agencies', up: true },
      revenue: { value: compactNumber(monthlyRevenue), sub: 'MRR from active plans', up: true },
      claims: { value: 0, sub: 'No claims pipeline yet', up: true },
      tickets: { value: 0, sub: 'Support module pending', up: false },
      social: { value: 0, sub: 'Community module pending', up: true },
    },
    series,
    topAgencies,
    health,
    insights,
    alerts,
    tasks,
    recentActivity,
    finance: {
      mrr: compactNumber(monthlyRevenue),
      unpaid: compactNumber(0),
      payouts: compactNumber(0),
      collections: compactNumber(monthlyRevenue),
      refunds: compactNumber(0),
    },
    social: {
      pendingPosts: 0,
      newReviews: 0,
      unreadMessages: 0,
      communities: [],
      topics: [],
    },
    tickets: [],
    invitationStats,
  };
}
