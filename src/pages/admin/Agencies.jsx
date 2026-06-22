import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Search,
  Filter,
  MoreHorizontal,
  Building2,
  CheckCircle2,
  Clock,
  Ban,
  Pencil,
  Trash2,
  Eye,
} from 'lucide-react';
import { fetchAgencies, updateAgency, deleteAgency } from '../../redux/slices/agencySlice';
import { fetchPlans } from '../../redux/slices/subscriptionPlanSlice';
import Drawer from '../../components/ui/Drawer';
import PlanStatCard from '../../components/ui/PlanStatCard';
import AgencyStatusBadge from '../../components/ui/AgencyStatusBadge';
import UsageLimitBar from '../../components/ui/UsageLimitBar';
import AgencyFormDrawer, { AgencyFormDrawerFooter } from '../../components/admin/AgencyFormDrawer';
import {
  AGENCY_TABS,
  getAgencyStats,
  enrichAgencyWithPlan,
  formatAgencyDate,
  formStateToAgencyPayload,
} from '../../utils/agencyStore';
import { formatPrice, formatBillingCycle } from '../../utils/subscriptionStore';

export default function Agencies() {
  const dispatch = useDispatch();
  const { list: agencies, status } = useSelector((state) => state.agencies);
  const { list: plans } = useSelector((state) => state.subscriptionPlans);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingAgency, setEditingAgency] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [openMenuId, setOpenMenuId] = useState(null);

  const loadData = () => {
    dispatch(fetchAgencies());
    dispatch(fetchPlans());
  };

  useEffect(() => {
    loadData();
  }, [dispatch]);

  useEffect(() => {
    const closeMenu = () => setOpenMenuId(null);
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, []);

  const enrichedAgencies = useMemo(
    () => agencies.map((a) => enrichAgencyWithPlan(a, plans)),
    [agencies, plans]
  );

  const stats = useMemo(() => getAgencyStats(agencies), [agencies]);

  const filteredAgencies = useMemo(() => {
    return enrichedAgencies.filter((agency) => {
      const matchesTab = activeTab === 'all' || agency.status === activeTab;
      const matchesSearch =
        !search ||
        agency.name.toLowerCase().includes(search.toLowerCase()) ||
        agency.email.toLowerCase().includes(search.toLowerCase()) ||
        agency.ownerName?.toLowerCase().includes(search.toLowerCase());
      const matchesPlan =
        planFilter === 'all' || agency.subscriptionPlanId === planFilter;
      const matchesStatus = statusFilter === 'all' || agency.status === statusFilter;
      return matchesTab && matchesSearch && matchesPlan && matchesStatus;
    });
  }, [enrichedAgencies, activeTab, search, planFilter, statusFilter]);

  const openEditDrawer = (agency) => {
    setEditingAgency(agency);
    setDrawerOpen(true);
    setOpenMenuId(null);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setEditingAgency(null);
  };

  const handleSubmit = async (formData) => {
    if (!editingAgency) return;
    setLoading(true);
    const payload = formStateToAgencyPayload(formData);
    await dispatch(updateAgency({ id: editingAgency.id, payload })).unwrap();
    closeDrawer();
    setLoading(false);
  };

  const handleDelete = async (id) => {
    await dispatch(deleteAgency(id)).unwrap();
    setOpenMenuId(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Agencies</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage agencies, subscriptions, and usage limits.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <PlanStatCard
          label="Total Agencies"
          value={stats.total}
          subtext="All registered agencies"
          icon={Building2}
          iconClass="bg-violet-100 text-violet-600"
        />
        <PlanStatCard
          label="Active"
          value={stats.active}
          subtext="Currently operating"
          icon={CheckCircle2}
          iconClass="bg-green-100 text-success"
        />
        <PlanStatCard
          label="Pending"
          value={stats.pending}
          subtext="Awaiting activation"
          icon={Clock}
          iconClass="bg-orange-100 text-warning"
        />
        <PlanStatCard
          label="Inactive"
          value={stats.inactive + stats.suspended}
          subtext="Inactive or suspended"
          icon={Ban}
          iconClass="bg-red-100 text-danger"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6">
          <div className="flex gap-6 overflow-x-auto">
            {AGENCY_TABS.map(({ key, label }) => (
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
              placeholder="Search agencies..."
              className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">All Plans</option>
              {plans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name}
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
              <option value="Pending">Pending</option>
              <option value="Inactive">Inactive</option>
              <option value="Suspended">Suspended</option>
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
                <th className="px-6 py-3">Agency</th>
                <th className="px-6 py-3">Subscription Plan</th>
                <th className="px-6 py-3">Clients</th>
                <th className="px-6 py-3">Caregivers</th>
                <th className="px-6 py-3">Users</th>
                <th className="px-6 py-3">Features</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Registered</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAgencies.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-400">
                    No agencies found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredAgencies.map((agency) => {
                  const plan = agency.plan;
                  const limits = plan?.limits ?? {};
                  return (
                    <tr key={agency.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${agency.iconColor}`}
                          >
                            <Building2 size={16} />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{agency.name}</p>
                            <p className="text-xs text-gray-500">{agency.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {plan ? (
                          <div>
                            <p className="font-medium text-gray-900">{plan.name}</p>
                            <p className="text-xs text-gray-500">
                              {formatPrice(plan.price)}/{formatBillingCycle(plan.billingCycle)}
                            </p>
                          </div>
                        ) : (
                          <span className="text-gray-400">No plan</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <UsageLimitBar
                          label=""
                          used={agency.usage.clients}
                          max={limits.maxClients}
                          compact
                        />
                      </td>
                      <td className="px-6 py-4">
                        <UsageLimitBar
                          label=""
                          used={agency.usage.caregivers}
                          max={limits.maxCaregivers}
                          compact
                        />
                      </td>
                      <td className="px-6 py-4">
                        <UsageLimitBar
                          label=""
                          used={agency.usage.users}
                          max={limits.maxUsers}
                          compact
                        />
                      </td>
                      <td className="px-6 py-4">
                        <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                          {plan?.features?.length ?? 0} features
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <AgencyStatusBadge status={agency.status} />
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {formatAgencyDate(agency.registeredAt)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(openMenuId === agency.id ? null : agency.id);
                            }}
                            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                          >
                            <MoreHorizontal size={18} />
                          </button>
                          {openMenuId === agency.id && (
                            <div className="absolute right-0 z-10 mt-1 w-40 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                              <button
                                type="button"
                                onClick={() => openEditDrawer(agency)}
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                              >
                                <Pencil size={14} />
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => openEditDrawer(agency)}
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                              >
                                <Eye size={14} />
                                View Details
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(agency.id)}
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
        title="Edit Agency"
        footer={
          <AgencyFormDrawerFooter onClose={closeDrawer} loading={loading} />
        }
      >
        <AgencyFormDrawer
          open={drawerOpen}
          editingAgency={editingAgency}
          plans={plans.filter((p) => p.status === 'Active' || p.id === editingAgency?.subscriptionPlanId)}
          onSubmit={handleSubmit}
        />
      </Drawer>
    </div>
  );
}
