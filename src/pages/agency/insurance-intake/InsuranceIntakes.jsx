import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Plus, Search, Pencil, Trash2, Shield, FileCheck, Clock, Printer } from 'lucide-react';
import AgencyKpiCard from '../../../components/agency/dashboard/AgencyKpiCard';
import { fetchInsuranceIntakes, fetchInsuranceIntakeStats, deleteInsuranceIntake } from '../../../redux/slices/insuranceIntakesSlice';
import { ROUTES } from '../../../routes/routes';
import { confirmAlert } from '../../../utils/swal';

const actionBtn = 'inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-sm font-semibold shadow-sm transition-colors';
const actionBtnNeutral = `${actionBtn} border-gray-200 bg-white text-gray-700 hover:border-primary/30 hover:bg-gray-50 hover:text-primary`;
const actionBtnDanger = `${actionBtn} border-red-200 bg-white text-red-600 hover:bg-red-50`;

function StatusBadge({ status }) {
  const styles = {
    Verified: 'bg-emerald-100 text-emerald-700',
    Submitted: 'bg-blue-100 text-blue-700',
    Draft: 'bg-amber-100 text-amber-700',
  };
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] || styles.Draft}`}>{status}</span>;
}

export default function InsuranceIntakes() {
  const dispatch = useDispatch();
  const { list, stats, loading } = useSelector((state) => state.insuranceIntakes);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const load = () => {
    dispatch(fetchInsuranceIntakes());
    dispatch(fetchInsuranceIntakeStats());
  };

  useEffect(() => { load(); }, [dispatch]);

  const filtered = useMemo(() => list.filter((item) => {
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    const q = search.trim().toLowerCase();
    if (!q) return matchesStatus;
    const haystack = [item.intakeCode, item.clientName, item.clientEmail, item.clientPhone].join(' ').toLowerCase();
    return matchesStatus && haystack.includes(q);
  }), [list, search, statusFilter]);

  const handleDelete = async (item) => {
    const confirmed = await confirmAlert({
      title: 'Delete insurance intake?',
      text: `Delete intake ${item.intakeCode}?`,
      confirmText: 'Delete',
      danger: true,
    });
    if (!confirmed) return;
    await dispatch(deleteInsuranceIntake(item.id));
    dispatch(fetchInsuranceIntakeStats());
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Insurance Intake</h1>
          <p className="mt-1 text-sm text-gray-500">Manage client insurance intake forms and verification.</p>
        </div>
        <Link to={ROUTES.AGENCY_INSURANCE_INTAKE_CREATE} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-hover">
          <Plus size={16} /> New Insurance Intake
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AgencyKpiCard label="Total Intakes" value={String(stats.total)} icon={Shield} iconBg="bg-blue-100 text-blue-600" />
        <AgencyKpiCard label="Draft" value={String(stats.draft)} icon={FileCheck} iconBg="bg-amber-100 text-amber-600" />
        <AgencyKpiCard label="Submitted" value={String(stats.submitted)} icon={Clock} iconBg="bg-blue-100 text-blue-600" />
        <AgencyKpiCard label="Verified" value={String(stats.verified)} icon={FileCheck} iconBg="bg-emerald-100 text-emerald-600" />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
          <div className="relative min-w-[220px] flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search intakes..." className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700">
            <option value="All">All statuses</option>
            <option value="Draft">Draft</option>
            <option value="Submitted">Submitted</option>
            <option value="Verified">Verified</option>
          </select>
        </div>

        {loading && list.length === 0 ? (
          <div className="p-12 text-center text-sm text-gray-500">Loading insurance intakes...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <h3 className="text-base font-semibold text-gray-900">No insurance intakes yet</h3>
            <p className="mt-2 text-sm text-gray-500">Create an insurance intake form for a client to verify coverage.</p>
            <Link to={ROUTES.AGENCY_INSURANCE_INTAKE_CREATE} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover">
              <Plus size={16} /> New Insurance Intake
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  <th className="px-5 py-3">Client</th>
                  <th className="px-5 py-3">Intake ID</th>
                  <th className="px-5 py-3">Intake Date</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-900">{item.clientName || '—'}</p>
                      <p className="text-xs text-gray-500">{item.clientPhone || item.clientEmail || '—'}</p>
                    </td>
                    <td className="px-5 py-4 text-gray-700">{item.intakeCode}</td>
                    <td className="px-5 py-4 text-gray-700">{item.intakeDate || '—'}</td>
                    <td className="px-5 py-4"><StatusBadge status={item.status} /></td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <button type="button" onClick={() => window.open(ROUTES.AGENCY_INSURANCE_INTAKE_PRINT.replace(':id', item.id), '_blank')} className={actionBtnNeutral}>
                          <Printer size={15} /> Print
                        </button>
                        <Link to={ROUTES.AGENCY_INSURANCE_INTAKE_EDIT.replace(':id', item.id)} className={actionBtnNeutral}>
                          <Pencil size={15} /> Edit
                        </Link>
                        <button type="button" onClick={() => handleDelete(item)} className={actionBtnDanger}>
                          <Trash2 size={15} /> Delete
                        </button>
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
