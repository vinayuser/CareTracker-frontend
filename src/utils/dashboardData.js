import { getAllAgencies, enrichAgencyWithPlan } from './agencyStore';
import { getAllPlans, formatPrice, isUnlimited } from './subscriptionStore';

export const SALES_WEEK_LABELS = ['Jun 13', 'Jun 14', 'Jun 15', 'Jun 16', 'Jun 17', 'Jun 18', 'Jun 19'];

export const SALES_WEEK_DATA = {
  revenue: [4200, 5100, 4800, 6200, 5900, 7100, 6800],
  newAgencies: [1, 0, 2, 1, 1, 2, 1],
  renewals: [3, 2, 4, 3, 5, 4, 3],
};

const PLAN_CHART_COLORS = {
  'Basic Plan': '#7c3aed',
  'Pro Plan': '#2563eb',
  'Enterprise Plan': '#4f46e5',
  'Starter Plan': '#059669',
  'Growth Plan': '#0891b2',
  'Premium Plan': '#d97706',
  'Team Plan': '#ea580c',
  'Legacy Plan': '#9ca3af',
  Unassigned: '#d1d5db',
};

function getUsagePercent(used, max) {
  if (isUnlimited(max) || !max) return 0;
  return Math.round((used / max) * 100);
}

function normalizeMonthlyRevenue(price, billingCycle) {
  return billingCycle === 'yearly' ? price / 12 : price;
}

export function buildDashboardMetrics(agencies, plans) {
  const enriched = agencies.map((a) => enrichAgencyWithPlan(a, plans));
  const activeAgencies = enriched.filter((a) => a.status === 'Active');
  const pendingAgencies = enriched.filter((a) => a.status === 'Pending');

  const monthlyRevenue = activeAgencies.reduce((sum, agency) => {
    if (!agency.plan) return sum;
    return sum + normalizeMonthlyRevenue(agency.plan.price, agency.plan.billingCycle);
  }, 0);

  const activeSubscriptions = activeAgencies.filter((a) => a.plan?.status === 'Active').length;

  const planDistribution = enriched.reduce((acc, agency) => {
    const label = agency.plan?.name ?? 'Unassigned';
    acc[label] = (acc[label] ?? 0) + 1;
    return acc;
  }, {});

  const agenciesByPlan = Object.entries(planDistribution).map(([name, count]) => ({
    name,
    count,
    color: PLAN_CHART_COLORS[name] ?? '#6366f1',
    percent: Math.round((count / agencies.length) * 100),
  }));

  const recentSignups = [...enriched]
    .sort((a, b) => new Date(b.registeredAt) - new Date(a.registeredAt))
    .slice(0, 5)
    .map((agency) => ({
      id: agency.id,
      name: agency.name,
      plan: agency.plan?.name ?? '—',
      date: agency.registeredAt,
      status: agency.status,
      amount: agency.plan ? normalizeMonthlyRevenue(agency.plan.price, agency.plan.billingCycle) : 0,
    }));

  const agenciesNearLimit = enriched
    .flatMap((agency) => {
      if (!agency.plan?.limits) return [];
      const checks = [
        { label: 'Clients', used: agency.usage.clients, max: agency.plan.limits.maxClients },
        { label: 'Caregivers', used: agency.usage.caregivers, max: agency.plan.limits.maxCaregivers },
        { label: 'Users', used: agency.usage.users, max: agency.plan.limits.maxUsers },
      ];
      return checks
        .filter(({ max }) => !isUnlimited(max) && max > 0)
        .map(({ label, used, max }) => ({
          agencyId: agency.id,
          agencyName: agency.name,
          metric: label,
          used,
          max,
          percent: getUsagePercent(used, max),
        }))
        .filter((item) => item.percent >= 70);
    })
    .sort((a, b) => b.percent - a.percent)
    .slice(0, 5);

  const totalClients = enriched.reduce((sum, a) => sum + a.usage.clients, 0);
  const totalCaregivers = enriched.reduce((sum, a) => sum + a.usage.caregivers, 0);

  const alerts = [];
  if (pendingAgencies.length > 0) {
    alerts.push({
      id: 'pending',
      type: 'warning',
      message: `${pendingAgencies.length} agencies awaiting activation`,
    });
  }
  if (agenciesNearLimit.length > 0) {
    alerts.push({
      id: 'limits',
      type: 'warning',
      message: `${agenciesNearLimit.length} agencies approaching plan usage limits`,
    });
  }
  const expiredPlans = plans.filter((p) => p.status === 'Expired').length;
  if (expiredPlans > 0) {
    alerts.push({
      id: 'expired',
      type: 'danger',
      message: `${expiredPlans} subscription plans have expired`,
    });
  }
  alerts.push({
    id: 'payments',
    type: 'info',
    message: 'All platform payments processed successfully this week',
  });

  return {
    kpis: {
      totalAgencies: agencies.length,
      agenciesTrend: '+8%',
      activeSubscriptions,
      subscriptionsTrend: '+12%',
      pendingAgencies: pendingAgencies.length,
      pendingLabel: 'Awaiting approval',
      monthlyRevenue,
      revenueTrend: '+10%',
      newSignupsThisMonth: recentSignups.filter((s) => {
        const d = new Date(s.date);
        const now = new Date();
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }).length,
      signupsTrend: '+5%',
      totalClients,
      clientsTrend: '+8%',
      totalCaregivers,
      caregiversTrend: '+12%',
    },
    agenciesByPlan,
    recentSignups,
    agenciesNearLimit,
    alerts,
    platformStats: {
      activePlans: plans.filter((p) => p.status === 'Active').length,
      openInvitations: 8,
      failedPayments: 0,
      supportTickets: 3,
      trialExpiring: 2,
      totalPlatformUsers: enriched.reduce((sum, a) => sum + a.usage.users, 0),
    },
  };
}

export async function fetchDashboardMetrics() {
  const agencies = getAllAgencies();
  const plans = getAllPlans();
  return buildDashboardMetrics(agencies, plans);
}

export { formatPrice };
