import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  Search,
  UserCheck,
  Users,
  UserX,
  Clock,
  KeyRound,
  Eye,
  Pencil,
  Mail,
  Power,
} from 'lucide-react';
import AgencyKpiCard from '../../../components/agency/dashboard/AgencyKpiCard';
import SetCaregiverPasswordDrawer from '../../../components/agency/caregivers/SetCaregiverPasswordDrawer';
import EditCaregiverDrawer from '../../../components/agency/caregivers/EditCaregiverDrawer';
import ViewCaregiverDrawer from '../../../components/agency/caregivers/ViewCaregiverDrawer';
import SendCaregiverEmailDrawer from '../../../components/agency/caregivers/SendCaregiverEmailDrawer';
import ActionIconButton from '../../../components/ui/ActionIconButton';
import {
  fetchCaregivers,
  fetchCaregiverStats,
  setCaregiverStatus,
} from '../../../redux/slices/caregiversSlice';
import { ROUTES } from '../../../routes/routes';

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
  const [selectedCaregiver, setSelectedCaregiver] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);

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

  const openAction = (caregiver, action) => {
    setSelectedCaregiver(caregiver);
    if (action === 'view') setViewOpen(true);
    if (action === 'edit') setEditOpen(true);
    if (action === 'password') setPasswordOpen(true);
    if (action === 'email') setEmailOpen(true);
  };

  const handleStatusToggle = async (caregiver) => {
    const nextStatus = caregiver.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await dispatch(setCaregiverStatus({ id: caregiver.id, status: nextStatus })).unwrap();
      loadData();
    } catch {
      // toast in slice
    }
  };

  const closeDrawers = () => {
    setSelectedCaregiver(null);
    setViewOpen(false);
    setEditOpen(false);
    setPasswordOpen(false);
    setEmailOpen(false);
  };

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
                  <th className="px-5 py-3">Actions</th>
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
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-0.5">
                        <ActionIconButton
                          label="View"
                          onClick={() => openAction(caregiver, 'view')}
                          className="text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                        >
                          <Eye size={16} />
                        </ActionIconButton>
                        <ActionIconButton
                          label="Edit details"
                          onClick={() => openAction(caregiver, 'edit')}
                          className="text-gray-500 hover:bg-blue-50 hover:text-blue-700"
                        >
                          <Pencil size={16} />
                        </ActionIconButton>
                        <ActionIconButton
                          label="Reset password"
                          onClick={() => openAction(caregiver, 'password')}
                          className="text-gray-500 hover:bg-amber-50 hover:text-amber-700"
                        >
                          <KeyRound size={16} />
                        </ActionIconButton>
                        <ActionIconButton
                          label="Send email"
                          onClick={() => openAction(caregiver, 'email')}
                          className="text-gray-500 hover:bg-primary/10 hover:text-primary"
                        >
                          <Mail size={16} />
                        </ActionIconButton>
                        <ActionIconButton
                          label={caregiver.status === 'Active' ? 'Deactivate account' : 'Activate account'}
                          onClick={() => handleStatusToggle(caregiver)}
                          className={
                            caregiver.status === 'Active'
                              ? 'text-gray-500 hover:bg-red-50 hover:text-red-600'
                              : 'text-gray-500 hover:bg-emerald-50 hover:text-emerald-700'
                          }
                        >
                          <Power size={16} />
                        </ActionIconButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ViewCaregiverDrawer
        open={viewOpen}
        onClose={closeDrawers}
        caregiver={selectedCaregiver}
      />
      <EditCaregiverDrawer
        open={editOpen}
        onClose={closeDrawers}
        caregiver={selectedCaregiver}
        onSuccess={loadData}
      />
      <SetCaregiverPasswordDrawer
        open={passwordOpen}
        onClose={closeDrawers}
        caregiver={selectedCaregiver}
        onSuccess={loadData}
      />
      <SendCaregiverEmailDrawer
        open={emailOpen}
        onClose={closeDrawers}
        caregiver={selectedCaregiver}
      />
    </div>
  );
}
