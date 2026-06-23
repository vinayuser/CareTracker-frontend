import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Pencil, Trash2, FileText, CheckCircle2, Archive } from 'lucide-react';
import AgencyKpiCard from '../../../components/agency/dashboard/AgencyKpiCard';
import { fetchCarePlans, fetchCarePlanStats, deleteCarePlan } from '../../../redux/slices/carePlansSlice';
import { ROUTES } from '../../../routes/routes';
import { confirmAlert } from '../../../utils/swal';

function StatusBadge({ status }) {
  const styles = {
    Active: 'bg-emerald-100 text-emerald-700',
    Draft: 'bg-amber-100 text-amber-700',
    Archived: 'bg-gray-100 text-gray-600',
  };
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] || styles.Draft}`}>{status}</span>;
}

export default function CarePlans() {
  const dispatch = useDispatch();
  const { list, stats, loading } = useSelector((state) => state.carePlans);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const load = () => {
    dispatch(fetchCarePlans());
    dispatch(fetchCarePlanStats());
  };

  useEffect(() => { load(); }, [dispatch]);

  const filtered = useMemo(() => list.filter((plan) => {
    const matchesStatus = statusFilter === 'All' || plan.status === statusFilter;
    const q = search.trim().toLowerCase();
    if (!q) return matchesStatus;
    const client = plan.client || {};
    const haystack = [plan.planCode, client.fullName, client.clientCode].join(' ').toLowerCase();
    return matchesStatus && haystack.includes(q);
  }), [list, search, statusFilter]);

  const handleDelete = async (plan) => {
    const confirmed = await confirmAlert({
      title: 'Delete care plan?',
      text: `Delete care plan ${plan.planCode}?`,
      confirmText: 'Delete',
      danger: true,
    });
    if (!confirmed) return;
    await dispatch(deleteCarePlan(plan.id));
    dispatch(fetchCarePlanStats());
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Care Plans</h1>
          <p className="mt-1 text-sm text-gray-500">Create and manage personalized care plans for clients.</p>
        </div>
        <Link to={ROUTES.AGENCY_CARE_PLANS_CREATE} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-hover">
          <Plus size={16} /> Generate Care Plan
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AgencyKpiCard label="Total Plans" value={String(stats.total)} icon={FileText} iconBg="bg-blue-100 text-blue-600" />
        <AgencyKpiCard label="Active" value={String(stats.active)} icon={CheckCircle2} iconBg="bg-emerald-100 text-emerald-600" />
        <AgencyKpiCard label="Draft" value={String(stats.draft)} icon={FileText} iconBg="bg-amber-100 text-amber-600" />
        <AgencyKpiCard label="Archived" value={String(stats.archived)} icon={Archive} iconBg="bg-gray-100 text-gray-600" />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
          <div className="relative min-w-[220px] flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search care plans..." className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700">
            <option value="All">All statuses</option>
            <option value="Active">Active</option>
            <option value="Draft">Draft</option>
            <option value="Archived">Archived</option>
          </select>
        </div>

        {loading && list.length === 0 ? (
          <div className="p-12 text-center text-sm text-gray-500">Loading care plans...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <h3 className="text-base font-semibold text-gray-900">No care plans yet</h3>
            <p className="mt-2 text-sm text-gray-500">Generate a care plan for a client to get started.</p>
            <Link to={ROUTES.AGENCY_CARE_PLANS_CREATE} className="mt-4 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover">Generate Care Plan</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  <th className="px-5 py-3">Plan</th>
                  <th className="px-5 py-3">Client</th>
                  <th className="px-5 py-3">Effective Date</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((plan) => (
                  <tr key={plan.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4 font-medium text-gray-900">{plan.planCode}</td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-900">{plan.client?.fullName || '—'}</p>
                      <p className="text-xs text-gray-500">{plan.client?.clientCode}</p>
                    </td>
                    <td className="px-5 py-4 text-gray-700">{plan.effectiveDate || '—'}</td>
                    <td className="px-5 py-4"><StatusBadge status={plan.status} /></td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Link to={ROUTES.AGENCY_CARE_PLANS_EDIT.replace(':id', plan.id)} className="text-sm font-medium text-primary hover:underline">Edit</Link>
                        <button type="button" onClick={() => handleDelete(plan)} className="text-gray-500 hover:text-red-600"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
