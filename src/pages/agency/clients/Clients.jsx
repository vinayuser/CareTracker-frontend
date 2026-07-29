import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Search, Pencil, Trash2, HeartHandshake, Users, UserX, Download } from 'lucide-react';
import AgencyKpiCard from '../../../components/agency/dashboard/AgencyKpiCard';
import ClientFormsExportModal from '../../../components/agency/clients/ClientFormsExportModal';
import { AssessorDetailCell } from '../../../components/ui/AssessorPhotoUpload';
import { fetchClients, fetchClientStats, deleteClient } from '../../../redux/slices/clientsSlice';
import { ROUTES } from '../../../routes/routes';
import { confirmAlert } from '../../../utils/swal';

const actionBtn = 'inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-sm font-semibold shadow-sm transition-colors';
const actionBtnNeutral = `${actionBtn} border-gray-200 bg-white text-gray-700 hover:border-primary/30 hover:bg-gray-50 hover:text-primary`;
const actionBtnDanger = `${actionBtn} border-red-200 bg-white text-red-600 hover:bg-red-50`;

function StatusBadge({ status }) {
  const styles = {
    Active: 'bg-emerald-100 text-emerald-700',
    Inactive: 'bg-gray-100 text-gray-600',
    Pending: 'bg-amber-100 text-amber-700',
  };
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] || styles.Inactive}`}>{status}</span>;
}

const formatDate = (value) => {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString();
  } catch {
    return String(value);
  }
};

const clientSubtitle = (client) => {
  const parts = [
    client.clientCode,
    client.age != null ? `Age ${client.age}` : '',
    client.gender || '',
  ].filter(Boolean);
  return parts.join(' · ') || 'Client';
};

export default function Clients() {
  const dispatch = useDispatch();
  const { list, stats, loading } = useSelector((state) => state.clients);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [exportClient, setExportClient] = useState(null);

  const load = () => {
    dispatch(fetchClients());
    dispatch(fetchClientStats());
  };

  useEffect(() => { load(); }, [dispatch]);

  const filtered = useMemo(() => list.filter((client) => {
    const matchesStatus = statusFilter === 'All' || client.status === statusFilter;
    const q = search.trim().toLowerCase();
    if (!q) return matchesStatus;
    const haystack = [client.fullName, client.email, client.phone, client.clientCode, client.address].join(' ').toLowerCase();
    return matchesStatus && haystack.includes(q);
  }), [list, search, statusFilter]);

  const handleDelete = async (client) => {
    const confirmed = await confirmAlert({
      title: 'Delete client?',
      text: `Delete ${client.fullName}? This cannot be undone.`,
      confirmText: 'Delete',
      danger: true,
    });
    if (!confirmed) return;
    await dispatch(deleteClient(client.id));
    dispatch(fetchClientStats());
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Clients</h1>
        <p className="mt-1 text-sm text-gray-500">View client profiles and manage care assignments.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <AgencyKpiCard label="Total Clients" value={String(stats.total)} icon={Users} iconBg="bg-blue-100 text-blue-600" />
        <AgencyKpiCard label="Active" value={String(stats.active)} icon={HeartHandshake} iconBg="bg-emerald-100 text-emerald-600" />
        <AgencyKpiCard label="Inactive" value={String(stats.inactive)} icon={UserX} iconBg="bg-gray-100 text-gray-600" />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
          <div className="relative min-w-[220px] flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search clients..." className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700">
            <option value="All">All statuses</option>
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        {loading && list.length === 0 ? (
          <div className="p-12 text-center text-sm text-gray-500">Loading clients...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <h3 className="text-base font-semibold text-gray-900">
              {list.length === 0 ? 'No clients yet' : 'No clients found'}
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              {list.length === 0
                ? 'Clients appear here after they are onboarded through assessments.'
                : 'Try adjusting your search or status filter.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  <th className="px-5 py-3">Client</th>
                  <th className="px-5 py-3">Contact</th>
                  <th className="px-5 py-3">Location</th>
                  <th className="px-5 py-3">Last updated</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4">
                      <AssessorDetailCell
                        name={client.fullName}
                        title={clientSubtitle(client)}
                        photo={client.profilePic}
                        fallbackTitle="Client"
                      />
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-gray-900">{client.phone || client.phoneHome || '—'}</p>
                      <p className="text-xs text-gray-500">{client.email || '—'}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="max-w-[220px] truncate text-gray-700" title={client.address || ''}>
                        {client.address || '—'}
                      </p>
                      {(client.city || client.state) && (
                        <p className="text-xs text-gray-500">
                          {[client.city, client.state].filter(Boolean).join(', ')}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-4 text-gray-700">{formatDate(client.updatedAt)}</td>
                    <td className="px-5 py-4"><StatusBadge status={client.status} /></td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          title="Download assessment, care plan, insurance, and documents as ZIP"
                          onClick={() => setExportClient(client)}
                          className={actionBtnNeutral}
                        >
                          <Download size={16} /> Forms
                        </button>
                        <Link
                          to={ROUTES.AGENCY_CLIENTS_EDIT.replace(':id', client.id)}
                          className={actionBtnNeutral}
                        >
                          <Pencil size={16} /> Edit
                        </Link>
                        <button type="button" onClick={() => handleDelete(client)} className={actionBtnDanger}>
                          <Trash2 size={16} /> Delete
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

      <ClientFormsExportModal
        open={Boolean(exportClient)}
        client={exportClient}
        onClose={() => setExportClient(null)}
      />
    </div>
  );
}
