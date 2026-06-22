import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Search, UserCheck, Users, UserX, Clock, KeyRound } from 'lucide-react';
import AgencyKpiCard from '../../../components/agency/dashboard/AgencyKpiCard';
import SetCaregiverPasswordDrawer from '../../../components/agency/caregivers/SetCaregiverPasswordDrawer';
import { fetchCaregivers, fetchCaregiverStats } from '../../../redux/slices/caregiversSlice';
import { ROUTES } from '../../../routes/routes';
import { isAgencyOwner } from '../../../utils/moduleAccess';

function StatusBadge({ status }) {
  const styles = {
    Active: 'bg-emerald-100 text-emerald-700',
    Pending: 'bg-orange-100 text-orange-700',
    Inactive: 'bg-gray-100 text-gray-600',
  };
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] || styles.Inactive}`}>
      {status}
    </span>
  );
}

export default function Caregivers() {
  const dispatch = useDispatch();
  const { list, stats, loading } = useSelector((state) => state.caregivers);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [passwordDrawerOpen, setPasswordDrawerOpen] = useState(false);
  const [selectedCaregiver, setSelectedCaregiver] = useState(null);
  const owner = isAgencyOwner();

  const loadData = () => {
    dispatch(fetchCaregivers());
    dispatch(fetchCaregiverStats());
  };

  useEffect(() => {
    loadData();
  }, [dispatch]);

  const filtered = useMemo(() => {
    return list.filter((caregiver) => {
      const matchesStatus = statusFilter === 'All' || caregiver.status === statusFilter;
      const query = search.trim().toLowerCase();
      if (!query) return matchesStatus;
      const haystack = [
        caregiver.fullName,
        caregiver.email,
        caregiver.userId,
        caregiver.source_job_title,
        caregiver.candidate?.first_name,
        caregiver.candidate?.last_name,
      ]
        .join(' ')
        .toLowerCase();
      return matchesStatus && haystack.includes(query);
    });
  }, [list, search, statusFilter]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Caregivers</h1>
          <p className="mt-1 text-sm text-gray-500">
            Caregivers appear here after you mark a job&apos;s hiring cycle complete. They can sign in to the caregiver portal.
          </p>
        </div>
        <Link
          to={ROUTES.AGENCY_JOBS}
          className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          View Jobs
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AgencyKpiCard label="Total Caregivers" value={String(stats.total)} icon={Users} iconBg="bg-blue-100 text-blue-600" />
        <AgencyKpiCard label="Active" value={String(stats.active)} icon={UserCheck} iconBg="bg-emerald-100 text-emerald-600" />
        <AgencyKpiCard label="Pending" value={String(stats.pending)} icon={Clock} iconBg="bg-orange-100 text-orange-600" />
        <AgencyKpiCard label="Inactive" value={String(stats.inactive)} icon={UserX} iconBg="bg-gray-100 text-gray-600" />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
          <div className="relative min-w-[220px] flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search caregivers..."
              className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700"
          >
            <option value="All">All statuses</option>
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        {loading && list.length === 0 ? (
          <div className="p-12 text-center text-sm text-gray-500">Loading caregivers...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <h3 className="text-base font-semibold text-gray-900">No caregivers yet</h3>
            <p className="mt-2 text-sm text-gray-500">
              Hire a candidate on a job, then use <strong>Mark Hiring Complete</strong> to add them to your caregiver roster.
            </p>
            <Link
              to={ROUTES.AGENCY_JOBS}
              className="mt-4 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
            >
              Go to Jobs
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  <th className="px-5 py-3">Caregiver</th>
                  <th className="px-5 py-3">Login ID</th>
                  <th className="px-5 py-3">Hired for Job</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Added</th>
                  {owner && <th className="px-5 py-3">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((caregiver) => (
                  <tr key={caregiver.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-900">{caregiver.fullName}</p>
                      <p className="text-xs text-gray-500">{caregiver.email}</p>
                    </td>
                    <td className="px-5 py-4 text-gray-700">{caregiver.userId}</td>
                    <td className="px-5 py-4 text-gray-700">
                      {caregiver.source_job_title || '—'}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={caregiver.status} />
                    </td>
                    <td className="px-5 py-4 text-gray-500">
                      {caregiver.createdAt
                        ? new Date(caregiver.createdAt).toLocaleDateString()
                        : '—'}
                    </td>
                    {owner && (
                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCaregiver(caregiver);
                            setPasswordDrawerOpen(true);
                          }}
                          className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                        >
                          <KeyRound size={14} />
                          Set Password
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <SetCaregiverPasswordDrawer
        open={passwordDrawerOpen}
        onClose={() => {
          setPasswordDrawerOpen(false);
          setSelectedCaregiver(null);
        }}
        caregiver={selectedCaregiver}
        onSuccess={loadData}
      />
    </div>
  );
}
