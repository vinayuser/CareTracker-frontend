import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Search, Eye, Trash2, ShieldCheck, Clock, CheckCircle, XCircle, Smartphone, Printer } from 'lucide-react';
import AgencyKpiCard from '../../../components/agency/dashboard/AgencyKpiCard';
import { fetchEvvEnrollments, fetchEvvEnrollmentStats, deleteEvvEnrollment } from '../../../redux/slices/evvEnrollmentsSlice';
import { ROUTES } from '../../../routes/routes';
import { confirmAlert } from '../../../utils/swal';

const actionBtn = 'inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-sm font-semibold shadow-sm transition-colors';
const actionBtnNeutral = `${actionBtn} border-gray-200 bg-white text-gray-700 hover:border-primary/30 hover:bg-gray-50 hover:text-primary`;
const actionBtnDanger = `${actionBtn} border-red-200 bg-white text-red-600 hover:bg-red-50`;

function StatusBadge({ status }) {
  const styles = {
    Verified: 'bg-emerald-100 text-emerald-700',
    Submitted: 'bg-blue-100 text-blue-700',
    Pending: 'bg-amber-100 text-amber-700',
    Rejected: 'bg-red-100 text-red-700',
  };
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] || styles.Pending}`}>{status}</span>;
}

export default function EvvEnrollments() {
  const dispatch = useDispatch();
  const { list, stats, loading } = useSelector((state) => state.evvEnrollments);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    dispatch(fetchEvvEnrollments());
    dispatch(fetchEvvEnrollmentStats());
  }, [dispatch]);

  const filtered = useMemo(() => list.filter((item) => {
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    const q = search.trim().toLowerCase();
    if (!q) return matchesStatus;
    const haystack = [
      item.enrollmentCode,
      item.clientName,
      item.caregiverName,
      item.planCode,
      ...(item.serviceAreas || []),
      item.serviceAreaKey,
    ].join(' ').toLowerCase();
    return matchesStatus && haystack.includes(q);
  }), [list, search, statusFilter]);

  const handleDelete = async (item) => {
    const confirmed = await confirmAlert({
      title: 'Delete EVV enrollment?',
      text: `Delete enrollment ${item.enrollmentCode}?`,
      confirmText: 'Delete',
      danger: true,
    });
    if (!confirmed) return;
    await dispatch(deleteEvvEnrollment(item.id));
    dispatch(fetchEvvEnrollmentStats());
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Enrollments</h1>
          <p className="mt-1 text-sm text-gray-500">
            Review caregiver EVV enrollment forms created from care plan assignments.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <AgencyKpiCard label="Total" value={String(stats.total)} icon={Smartphone} iconBg="bg-blue-100 text-blue-600" />
        <AgencyKpiCard label="Pending" value={String(stats.pending)} icon={Clock} iconBg="bg-amber-100 text-amber-600" />
        <AgencyKpiCard label="Submitted" value={String(stats.submitted)} icon={ShieldCheck} iconBg="bg-blue-100 text-blue-600" />
        <AgencyKpiCard label="Verified" value={String(stats.verified)} icon={CheckCircle} iconBg="bg-emerald-100 text-emerald-600" />
        <AgencyKpiCard label="Rejected" value={String(stats.rejected)} icon={XCircle} iconBg="bg-red-100 text-red-600" />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
          <div className="relative min-w-[220px] flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search enrollments..." className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700">
            <option value="All">All statuses</option>
            <option value="Pending">Pending</option>
            <option value="Submitted">Submitted</option>
            <option value="Verified">Verified</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {loading && list.length === 0 ? (
          <div className="p-12 text-center text-sm text-gray-500">Loading EVV enrollments...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <h3 className="text-base font-semibold text-gray-900">No EVV enrollments yet</h3>
            <p className="mt-2 text-sm text-gray-500">
              Assign caregivers to care plan services — enrollments are created automatically when you save a care plan.
            </p>
            <Link to={ROUTES.AGENCY_CARE_PLANS} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover">
              Go to Care Plans
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  <th className="px-5 py-3">Client / Service</th>
                  <th className="px-5 py-3">Caregiver</th>
                  <th className="px-5 py-3">Care Plan</th>
                  <th className="px-5 py-3">Enrollment ID</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-900">{item.clientName || '—'}</p>
                      <p className="text-xs text-gray-500">{(item.serviceAreas || []).join(', ') || '—'}</p>
                    </td>
                    <td className="px-5 py-4 text-gray-700">{item.caregiverName || '—'}</td>
                    <td className="px-5 py-4 text-gray-700">{item.planCode || '—'}</td>
                    <td className="px-5 py-4 text-gray-700">{item.enrollmentCode}</td>
                    <td className="px-5 py-4"><StatusBadge status={item.status} /></td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        <Link to={ROUTES.AGENCY_EVV_ENROLLMENTS_REVIEW.replace(':id', item.id)} className={actionBtnNeutral}>
                          <Eye size={15} /> Review
                        </Link>
                        <button type="button" onClick={() => window.open(ROUTES.AGENCY_EVV_ENROLLMENT_PRINT.replace(':id', item.id), '_blank')} className={actionBtnNeutral}>
                          <Printer size={15} /> Print
                        </button>
                        {item.status === 'Pending' && (
                          <button type="button" onClick={() => handleDelete(item)} className={actionBtnDanger}>
                            <Trash2 size={15} /> Delete
                          </button>
                        )}
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
