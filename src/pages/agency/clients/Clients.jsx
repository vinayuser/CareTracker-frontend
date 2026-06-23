import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Plus, Search, Pencil, Trash2, HeartHandshake, Users, UserX } from 'lucide-react';
import AgencyKpiCard from '../../../components/agency/dashboard/AgencyKpiCard';
import ClientFormDrawer from '../../../components/agency/clients/ClientFormDrawer';
import { fetchClients, fetchClientStats, deleteClient } from '../../../redux/slices/clientsSlice';
import { ROUTES } from '../../../routes/routes';
import { confirmAlert } from '../../../utils/swal';

function StatusBadge({ status }) {
  const styles = { Active: 'bg-emerald-100 text-emerald-700', Inactive: 'bg-gray-100 text-gray-600' };
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] || styles.Inactive}`}>{status}</span>;
}

export default function Clients() {
  const dispatch = useDispatch();
  const { list, stats, loading } = useSelector((state) => state.clients);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

  const load = () => {
    dispatch(fetchClients());
    dispatch(fetchClientStats());
  };

  useEffect(() => { load(); }, [dispatch]);

  const filtered = useMemo(() => list.filter((client) => {
    const matchesStatus = statusFilter === 'All' || client.status === statusFilter;
    const q = search.trim().toLowerCase();
    if (!q) return matchesStatus;
    const haystack = [client.fullName, client.email, client.phone, client.clientCode].join(' ').toLowerCase();
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
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Clients</h1>
          <p className="mt-1 text-sm text-gray-500">Manage client profiles and care assignments.</p>
        </div>
        <button type="button" onClick={() => { setEditingClient(null); setDrawerOpen(true); }} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-hover">
          <Plus size={16} /> Add Client
        </button>
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
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        {loading && list.length === 0 ? (
          <div className="p-12 text-center text-sm text-gray-500">Loading clients...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <h3 className="text-base font-semibold text-gray-900">No clients yet</h3>
            <p className="mt-2 text-sm text-gray-500">Add your first client to start creating care plans.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  <th className="px-5 py-3">Client</th>
                  <th className="px-5 py-3">Client ID</th>
                  <th className="px-5 py-3">Phone</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-900">{client.fullName}</p>
                      <p className="text-xs text-gray-500">{client.email || '—'}</p>
                    </td>
                    <td className="px-5 py-4 text-gray-700">{client.clientCode}</td>
                    <td className="px-5 py-4 text-gray-700">{client.phone || '—'}</td>
                    <td className="px-5 py-4"><StatusBadge status={client.status} /></td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Link to={`${ROUTES.AGENCY_CARE_PLANS_CREATE}?clientId=${client.id}`} className="text-sm font-medium text-primary hover:underline">Care Plan</Link>
                        <button type="button" onClick={() => { setEditingClient(client); setDrawerOpen(true); }} className="text-gray-500 hover:text-primary"><Pencil size={15} /></button>
                        <button type="button" onClick={() => handleDelete(client)} className="text-gray-500 hover:text-red-600"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ClientFormDrawer open={drawerOpen} onClose={() => { setDrawerOpen(false); setEditingClient(null); }} client={editingClient} onSuccess={load} />
    </div>
  );
}
