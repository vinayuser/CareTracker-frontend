import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  ChevronLeft,
  ChevronRight,
  KeyRound,
  Pencil,
  Plus,
  Search,
  Shield,
  Trash2,
  UserCheck,
  UserCog,
  Users,
  UserX,
} from 'lucide-react';
import ActionIconButton from '../../components/ui/ActionIconButton';
import CreateTeamMemberDrawer from '../../components/admin/CreateTeamMemberDrawer';
import EditTeamMemberDrawer from '../../components/admin/EditTeamMemberDrawer';
import SetTeamPasswordDrawer from '../../components/admin/SetTeamPasswordDrawer';
import {
  deleteTeamMember,
  fetchTeamMembers,
  fetchTeamStats,
  setTeamMemberStatus,
} from '../../redux/slices/adminTeamSlice';
import { ROLE_LABELS } from '../../constants/roles';
import { isSuperAdminRole } from '../../constants/adminModules';
import { getAuthUser, getHomeRouteForRole, getUserRole } from '../../utils/auth';
import { isPlatformSuperAdmin } from '../../utils/adminModuleAccess';
import { confirmAlert } from '../../utils/swal';

const PAGE_SIZE = 10;
const STATUS_OPTIONS = ['All Status', 'Active', 'Inactive'];
const ROLE_OPTIONS = ['All Roles', 'Super Admin', 'Platform Admin'];

function formatLongDate(value) {
  if (!value) return '—';
  const raw = String(value);
  const d = raw.includes('T') ? new Date(raw) : new Date(`${raw.slice(0, 10)}T12:00:00`);
  if (Number.isNaN(d.getTime())) return raw;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function initials(name = '') {
  return String(name)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || '')
    .join('') || 'TM';
}

function StatusPill({ status }) {
  const active = status === 'Active';
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
      active ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
    }`}
    >
      {status || '—'}
    </span>
  );
}

function KpiCard({ icon: Icon, label, value, tone }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[12px] font-medium text-slate-500">{label}</p>
          <p className="mt-1.5 text-2xl font-bold tracking-tight text-slate-900">
            {Number(value || 0).toLocaleString()}
          </p>
        </div>
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone}`}>
          <Icon size={18} />
        </span>
      </div>
    </div>
  );
}

function pageNumbers(current, total) {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) pages.push('…');
  for (let i = start; i <= end; i += 1) pages.push(i);
  if (end < total - 1) pages.push('…');
  pages.push(total);
  return pages;
}

export default function Team() {
  const dispatch = useDispatch();
  const { list, stats, pagination, loading, actionLoading } = useSelector((state) => state.adminTeam);
  const currentUser = getAuthUser();
  const role = getUserRole();

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState('All Status');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [page, setPage] = useState(1);

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  const loadData = () => {
    dispatch(fetchTeamStats());
    dispatch(fetchTeamMembers({
      page,
      limit: PAGE_SIZE,
      search: debouncedSearch || undefined,
      status: status === 'All Status' ? undefined : status,
      role: roleFilter === 'All Roles' ? undefined : roleFilter === 'Super Admin' ? 'SUPER_ADMIN' : 'ADMIN',
    }));
  };

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, roleFilter]);

  useEffect(() => {
    if (!isPlatformSuperAdmin(role)) return;
    loadData();
  }, [dispatch, page, debouncedSearch, status, roleFilter, role]);

  const pages = useMemo(
    () => pageNumbers(pagination.page || page, pagination.totalPages || 1),
    [pagination.page, pagination.totalPages, page],
  );

  if (!isPlatformSuperAdmin(role)) {
    return <Navigate to={getHomeRouteForRole(role)} replace />;
  }

  const openAction = (member, action) => {
    setSelectedMember(member);
    if (action === 'edit') setEditOpen(true);
    if (action === 'password') setPasswordOpen(true);
  };

  const handleStatusToggle = async (member) => {
    const nextStatus = member.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await dispatch(setTeamMemberStatus({ id: member.id, status: nextStatus })).unwrap();
      loadData();
    } catch {
      // toast in slice
    }
  };

  const handleDelete = async (member) => {
    const confirmed = await confirmAlert({
      title: 'Delete team member?',
      text: `${member.name} will lose access to the super admin panel.`,
      confirmButtonText: 'Delete',
      confirmButtonColor: '#dc2626',
    });
    if (!confirmed) return;
    try {
      await dispatch(deleteTeamMember(member.id)).unwrap();
      loadData();
    } catch {
      // toast in slice
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-bold tracking-tight text-slate-900">Team</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage super admin team members, roles, and module permissions.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover"
        >
          <Plus size={16} />
          Add Team Member
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard icon={Users} label="Total Team" value={stats.total} tone="bg-sky-50 text-sky-600" />
        <KpiCard icon={UserCheck} label="Active" value={stats.active} tone="bg-emerald-50 text-emerald-600" />
        <KpiCard icon={UserX} label="Inactive" value={stats.inactive} tone="bg-rose-50 text-rose-600" />
        <KpiCard icon={Shield} label="Super Admins" value={stats.superAdmins} tone="bg-indigo-50 text-indigo-600" />
        <KpiCard icon={UserCog} label="Platform Admins" value={stats.platformAdmins} tone="bg-violet-50 text-violet-600" />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <h2 className="text-sm font-semibold text-slate-900">Team Members</h2>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search team members..."
                className="w-56 rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            >
              {ROLE_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            >
              {STATUS_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-5 py-3">Member</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Permissions</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Joined</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-500">Loading team members…</td>
                </tr>
              ) : list.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-500">
                    No team members found. Add your first platform admin to get started.
                  </td>
                </tr>
              ) : (
                list.map((member) => {
                  const isSelf = member.id === currentUser?.id;
                  return (
                    <tr key={member.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                            {initials(member.name)}
                          </span>
                          <div>
                            <p className="font-semibold text-slate-900">
                              {member.name}
                              {isSelf ? <span className="ml-2 text-[11px] font-medium text-slate-400">(You)</span> : null}
                            </p>
                            <p className="text-xs text-slate-500">{member.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-700">{ROLE_LABELS[member.role] || member.role}</td>
                      <td className="px-5 py-4">
                        {isSuperAdminRole(member.role) ? (
                          <span className="text-xs font-medium text-slate-500">Full access</span>
                        ) : (
                          <span className="text-xs font-medium text-slate-600">
                            {member.moduleAccess?.length || 0} modules
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4"><StatusPill status={member.status} /></td>
                      <td className="px-5 py-4 text-slate-600">{formatLongDate(member.joinedOn || member.createdAt)}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-0.5">
                          <ActionIconButton
                            icon={Pencil}
                            label="Edit"
                            onClick={() => openAction(member, 'edit')}
                          />
                          <ActionIconButton
                            icon={KeyRound}
                            label="Set password"
                            onClick={() => openAction(member, 'password')}
                          />
                          {!isSelf ? (
                            <>
                              <ActionIconButton
                                icon={member.status === 'Active' ? UserX : UserCheck}
                                label={member.status === 'Active' ? 'Deactivate' : 'Activate'}
                                onClick={() => handleStatusToggle(member)}
                                disabled={actionLoading}
                              />
                              <ActionIconButton
                                icon={Trash2}
                                label="Delete"
                                onClick={() => handleDelete(member)}
                                disabled={actionLoading}
                              />
                            </>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-4">
          <p className="text-sm text-slate-500">
            Showing {pagination.from || 0}-{pagination.to || 0} of {pagination.total || 0}
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            {pages.map((p, idx) => (
              p === '…' ? (
                <span key={`ellipsis-${idx}`} className="px-2 text-slate-400">…</span>
              ) : (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  className={`min-w-[34px] rounded-lg px-2 py-1.5 text-sm font-medium ${
                    p === page ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {p}
                </button>
              )
            ))}
            <button
              type="button"
              disabled={page >= (pagination.totalPages || 1)}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <CreateTeamMemberDrawer
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={loadData}
      />
      <EditTeamMemberDrawer
        open={editOpen}
        member={selectedMember}
        onClose={() => {
          setEditOpen(false);
          setSelectedMember(null);
        }}
        onSuccess={loadData}
      />
      <SetTeamPasswordDrawer
        open={passwordOpen}
        member={selectedMember}
        onClose={() => {
          setPasswordOpen(false);
          setSelectedMember(null);
        }}
        onSuccess={loadData}
      />
    </div>
  );
}
