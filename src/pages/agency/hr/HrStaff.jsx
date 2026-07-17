import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  Eye,
  Pencil,
  KeyRound,
  Mail,
  Power,
  UserCheck,
  UserX,
  Users,
  Clock,
} from 'lucide-react';
import AgencyKpiCard from '../../../components/agency/dashboard/AgencyKpiCard';
import CreateHrStaffDrawer from '../../../components/agency/hr/CreateHrStaffDrawer';
import EditHrStaffDrawer from '../../../components/agency/hr/EditHrStaffDrawer';
import SetHrPasswordDrawer from '../../../components/agency/hr/SetHrPasswordDrawer';
import SendHrEmailDrawer from '../../../components/agency/hr/SendHrEmailDrawer';
import HrStatusBadge from '../../../components/agency/hr/HrStatusBadge';
import ActionIconButton from '../../../components/ui/ActionIconButton';
import {
  fetchHrStaff,
  fetchHrStaffStats,
  setHrStaffStatus,
} from '../../../redux/slices/hrStaffSlice';
import { formatHrDate } from '../../../utils/hrStaffStore';
import { getUserRole } from '../../../utils/auth';
import { ROLES } from '../../../constants/roles';
import { ROUTES } from '../../../routes/routes';

export default function HrStaff() {
  const dispatch = useDispatch();
  const { list, stats } = useSelector((state) => state.hrStaff);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const isAgencyOwner = getUserRole() === ROLES.AGENCY_OWNER;

  const loadData = () => {
    dispatch(fetchHrStaff());
    dispatch(fetchHrStaffStats());
  };

  useEffect(() => {
    loadData();
  }, [dispatch]);

  const filtered = useMemo(() => {
    return list.filter((member) => {
      const matchesStatus = statusFilter === 'All' || member.status === statusFilter;
      const query = search.trim().toLowerCase();
      if (!query) return matchesStatus;
      const haystack = [
        member.firstName,
        member.lastName,
        member.email,
        member.employeeId,
        member.jobTitle,
        member.department,
      ]
        .join(' ')
        .toLowerCase();
      return matchesStatus && haystack.includes(query);
    });
  }, [list, search, statusFilter]);

  const openAction = (member, action) => {
    setSelectedMember(member);
    if (action === 'edit') setEditOpen(true);
    if (action === 'password') setPasswordOpen(true);
    if (action === 'email') setEmailOpen(true);
  };

  const handleStatusToggle = async (member) => {
    const nextStatus = member.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await dispatch(setHrStaffStatus({ id: member.id, status: nextStatus })).unwrap();
      loadData();
    } catch {
      // toast in slice
    }
  };

  const closeDrawers = () => {
    setSelectedMember(null);
    setEditOpen(false);
    setPasswordOpen(false);
    setEmailOpen(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">HR Staff</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage HR team members, credentials, and portal access for your agency.
          </p>
        </div>
        {isAgencyOwner && (
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-hover"
          >
            <Plus size={16} />
            Create HR Account
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AgencyKpiCard label="Total HR Staff" value={String(stats.total)} icon={Users} iconBg="bg-blue-100 text-blue-600" />
        <AgencyKpiCard label="Active" value={String(stats.active)} icon={UserCheck} iconBg="bg-emerald-100 text-emerald-600" />
        <AgencyKpiCard label="Pending" value={String(stats.pending)} icon={Clock} iconBg="bg-orange-100 text-orange-600" />
        <AgencyKpiCard label="Inactive" value={String(stats.inactive)} icon={UserX} iconBg="bg-gray-100 text-gray-600" />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
          <h2 className="text-sm font-semibold text-gray-900">HR Team Members</h2>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search HR staff..."
                className="w-56 rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/80 text-left text-[11px] font-medium uppercase tracking-wide text-gray-400">
                <th className="px-5 py-3">Employee</th>
                <th className="px-5 py-3">Employee ID</th>
                <th className="px-5 py-3">Job Title</th>
                <th className="px-5 py-3">Department</th>
                <th className="px-5 py-3">Hire Date</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-gray-500">
                    {isAgencyOwner
                      ? 'No HR staff found. Create your first HR account to get started.'
                      : 'No HR staff records match your search.'}
                  </td>
                </tr>
              ) : (
                filtered.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50/80">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {member.firstName[0]}
                          {member.lastName[0]}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {member.firstName} {member.lastName}
                          </p>
                          <p className="text-xs text-gray-500">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">{member.employeeId}</td>
                    <td className="px-5 py-3.5 text-gray-600">{member.jobTitle}</td>
                    <td className="px-5 py-3.5 text-gray-600">{member.department}</td>
                    <td className="px-5 py-3.5 text-gray-600">{formatHrDate(member.hireDate)}</td>
                    <td className="px-5 py-3.5">
                      <HrStatusBadge status={member.status} />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-0.5">
                        <ActionIconButton
                          label="View"
                          as={Link}
                          to={ROUTES.AGENCY_HR_STAFF_DETAIL.replace(':id', member.id)}
                          className="text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                        >
                          <Eye size={16} />
                        </ActionIconButton>
                        {isAgencyOwner && (
                          <>
                            <ActionIconButton
                              label="Edit details"
                              onClick={() => openAction(member, 'edit')}
                              className="text-gray-500 hover:bg-blue-50 hover:text-blue-700"
                            >
                              <Pencil size={16} />
                            </ActionIconButton>
                            <ActionIconButton
                              label="Reset password"
                              onClick={() => openAction(member, 'password')}
                              className="text-gray-500 hover:bg-amber-50 hover:text-amber-700"
                            >
                              <KeyRound size={16} />
                            </ActionIconButton>
                            <ActionIconButton
                              label="Send email"
                              onClick={() => openAction(member, 'email')}
                              className="text-gray-500 hover:bg-primary/10 hover:text-primary"
                            >
                              <Mail size={16} />
                            </ActionIconButton>
                            <ActionIconButton
                              label={member.status === 'Active' ? 'Deactivate account' : 'Activate account'}
                              onClick={() => handleStatusToggle(member)}
                              className={
                                member.status === 'Active'
                                  ? 'text-gray-500 hover:bg-red-50 hover:text-red-600'
                                  : 'text-gray-500 hover:bg-emerald-50 hover:text-emerald-700'
                              }
                            >
                              <Power size={16} />
                            </ActionIconButton>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isAgencyOwner && (
        <>
          <CreateHrStaffDrawer
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            onSuccess={loadData}
          />
          <EditHrStaffDrawer
            open={editOpen}
            onClose={closeDrawers}
            member={selectedMember}
            onSuccess={loadData}
          />
          <SetHrPasswordDrawer
            open={passwordOpen}
            onClose={closeDrawers}
            member={selectedMember}
          />
          <SendHrEmailDrawer
            open={emailOpen}
            onClose={closeDrawers}
            member={selectedMember}
          />
        </>
      )}
    </div>
  );
}
