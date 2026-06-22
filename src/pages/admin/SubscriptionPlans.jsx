import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Layers,
  CheckCircle2,
  Clock,
  Ban,
  CreditCard,
  Pencil,
  Trash2,
} from 'lucide-react';
import {
  fetchPlans,
  createPlan,
  updatePlan,
  deletePlan,
} from '../../redux/slices/subscriptionPlanSlice';
import { fetchAgencies } from '../../redux/slices/agencySlice';
import Drawer from '../../components/ui/Drawer';
import PlanFormDrawer, { PlanFormDrawerFooter } from '../../components/admin/PlanFormDrawer';
import PlanAgenciesDrawer from '../../components/admin/PlanAgenciesDrawer';
import PlanAgenciesSummary from '../../components/ui/PlanAgenciesSummary';
import PlanStatCard from '../../components/ui/PlanStatCard';
import PlanStatusBadge from '../../components/ui/PlanStatusBadge';
import {
  PLAN_TABS,
  getPlanStats,
  formatPrice,
  formatBillingCycle,
  formatPlanDate,
} from '../../utils/subscriptionStore';
import { countAgenciesByPlanId } from '../../utils/agencyStore';

export default function SubscriptionPlans() {
  const dispatch = useDispatch();
  const { list: plans } = useSelector((state) => state.subscriptionPlans);
  const { list: agencies } = useSelector((state) => state.agencies);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [agenciesDrawerPlan, setAgenciesDrawerPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [agencyFilter, setAgencyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [openMenuId, setOpenMenuId] = useState(null);

  const loadData = () => {
    dispatch(fetchPlans());
    dispatch(fetchAgencies());
  };

  useEffect(() => {
    loadData();
  }, [dispatch]);

  useEffect(() => {
    const closeMenu = () => setOpenMenuId(null);
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, []);

  const getAgencyCount = (planId) => countAgenciesByPlanId(planId, agencies);

  const stats = useMemo(() => getPlanStats(plans), [plans]);

  const filteredPlans = useMemo(() => {
    return plans.filter((plan) => {
      const matchesTab = activeTab === 'all' || plan.status === activeTab;
      const planAgencies = agencies.filter((a) => a.subscriptionPlanId === plan.id);
      const matchesSearch =
        !search ||
        plan.name.toLowerCase().includes(search.toLowerCase()) ||
        plan.description.toLowerCase().includes(search.toLowerCase()) ||
        planAgencies.some((a) => a.name.toLowerCase().includes(search.toLowerCase()));
      const matchesAgency =
        agencyFilter === 'all' ||
        planAgencies.some((a) => a.id === agencyFilter);
      const matchesStatus = statusFilter === 'all' || plan.status === statusFilter;
      return matchesTab && matchesSearch && matchesAgency && matchesStatus;
    });
  }, [plans, agencies, activeTab, search, agencyFilter, statusFilter]);

  const agenciesForDrawer = useMemo(() => {
    if (!agenciesDrawerPlan) return [];
    return agencies.filter((a) => a.subscriptionPlanId === agenciesDrawerPlan.id);
  }, [agenciesDrawerPlan, agencies]);

  const openCreateDrawer = () => {
    setEditingPlan(null);
    setDrawerOpen(true);
  };

  const openEditDrawer = (plan) => {
    setEditingPlan(plan);
    setDrawerOpen(true);
    setOpenMenuId(null);
  };

  const openAgenciesDrawer = (plan) => {
    setAgenciesDrawerPlan(plan);
    setOpenMenuId(null);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setEditingPlan(null);
  };

  const handleSubmit = async (payload) => {
    setLoading(true);
    if (editingPlan) {
      await dispatch(updatePlan({ id: editingPlan.id, payload })).unwrap();
    } else {
      await dispatch(createPlan(payload)).unwrap();
    }
    closeDrawer();
    setLoading(false);
  };

  const handleToggleActive = async (plan) => {
    await dispatch(
      updatePlan({
        id: plan.id,
        payload: {
          isActive: !plan.isActive,
          status: plan.isActive ? 'Inactive' : 'Active',
        },
      }),
    ).unwrap();
    setOpenMenuId(null);
  };

  const handleDelete = async (id) => {
    await dispatch(deletePlan(id)).unwrap();
    setOpenMenuId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subscription Plans</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage plans, pricing, and subscription limits.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateDrawer}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-hover"
        >
          <Plus size={16} />
          Create Plan
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <PlanStatCard
          label="Total Plans"
          value={stats.total}
          subtext="All subscription plans"
          icon={Layers}
          iconClass="bg-violet-100 text-violet-600"
        />
        <PlanStatCard
          label="Active Plans"
          value={stats.active}
          subtext="Currently active"
          icon={CheckCircle2}
          iconClass="bg-green-100 text-success"
        />
        <PlanStatCard
          label="Scheduled"
          value={stats.scheduled}
          subtext="Upcoming plans"
          icon={Clock}
          iconClass="bg-orange-100 text-warning"
        />
        <PlanStatCard
          label="Inactive Plans"
          value={stats.inactive}
          subtext="Currently inactive"
          icon={Ban}
          iconClass="bg-red-100 text-danger"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6">
          <div className="flex gap-6 overflow-x-auto">
            {PLAN_TABS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
                className={`shrink-0 border-b-2 py-4 text-sm font-medium transition-colors ${
                  activeTab === key
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 border-b border-gray-200 px-6 py-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search plans..."
              className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <select
              value={agencyFilter}
              onChange={(e) => setAgencyFilter(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">All Agencies</option>
              {agencies.map((agency) => (
                <option key={agency.id} value={agency.id}>
                  {agency.name}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Inactive">Inactive</option>
              <option value="Expired">Expired</option>
            </select>
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Filter size={14} />
              Filter
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                <th className="px-6 py-3">Plan Name</th>
                <th className="px-6 py-3">Agencies</th>
                <th className="px-6 py-3">Price</th>
                <th className="px-6 py-3">Billing Cycle</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Start Date</th>
                <th className="px-6 py-3">End / Due Date</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPlans.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                    No plans found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredPlans.map((plan) => {
                  const agencyCount = getAgencyCount(plan.id);
                  return (
                    <tr key={plan.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${plan.iconColor}`}
                          >
                            <CreditCard size={16} />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{plan.name}</p>
                            <p className="text-xs text-gray-500">{plan.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <PlanAgenciesSummary
                          count={agencyCount}
                          compact
                          onView={() => openAgenciesDrawer(plan)}
                        />
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">{formatPrice(plan.price)}</td>
                      <td className="px-6 py-4 text-gray-600">{formatBillingCycle(plan.billingCycle)}</td>
                      <td className="px-6 py-4">
                        <PlanStatusBadge status={plan.status} />
                      </td>
                      <td className="px-6 py-4 text-gray-600">{formatPlanDate(plan.startDate)}</td>
                      <td className="px-6 py-4 text-gray-600">{formatPlanDate(plan.endDate)}</td>
                      <td className="px-6 py-4">
                        <div className="relative">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(openMenuId === plan.id ? null : plan.id);
                            }}
                            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                          >
                            <MoreHorizontal size={18} />
                          </button>
                          {openMenuId === plan.id && (
                            <div className="absolute right-0 z-10 mt-1 w-44 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                              <button
                                type="button"
                                onClick={() => openAgenciesDrawer(plan)}
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                              >
                                View Agencies
                              </button>
                              <button
                                type="button"
                                onClick={() => openEditDrawer(plan)}
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                              >
                                <Pencil size={14} />
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToggleActive(plan)}
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                              >
                                {plan.isActive ? 'Deactivate' : 'Activate'}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(plan.id)}
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-danger hover:bg-red-50"
                              >
                                <Trash2 size={14} />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Drawer
        open={drawerOpen}
        onClose={closeDrawer}
        title={editingPlan ? 'Edit Plan' : 'Create New Plan'}
        footer={
          <PlanFormDrawerFooter
            onClose={closeDrawer}
            loading={loading}
            isEditing={Boolean(editingPlan)}
          />
        }
      >
        <PlanFormDrawer
          open={drawerOpen}
          onSubmit={handleSubmit}
          editingPlan={editingPlan}
          agencyCount={editingPlan ? getAgencyCount(editingPlan.id) : 0}
          onViewAgencies={(plan) => openAgenciesDrawer(plan)}
        />
      </Drawer>

      <PlanAgenciesDrawer
        open={Boolean(agenciesDrawerPlan)}
        onClose={() => setAgenciesDrawerPlan(null)}
        plan={agenciesDrawerPlan}
        agencies={agenciesForDrawer}
      />
    </div>
  );
}
