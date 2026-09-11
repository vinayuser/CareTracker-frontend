import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Archive, ArchiveRestore, Building2, Search, Trash2 } from 'lucide-react';
import StatCard from '../../components/ui/StatCard';
import AgencyStatusBadge from '../../components/ui/AgencyStatusBadge';
import {
  archiveAgency,
  deleteAgency,
  fetchAgencyLifecycle,
  restoreAgency,
} from '../../redux/slices/agencySlice';
import { confirmAlert } from '../../utils/swal';

const FILTERS = [
  { key: 'All', label: 'All' },
  { key: 'Active', label: 'Visible' },
  { key: 'Archived', label: 'Archived' },
];

function formatLongDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function AgencyLifecycle() {
  const dispatch = useDispatch();
  const { lifecycleItems, lifecycleStats, lifecycleStatus } = useSelector((state) => state.agencies);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState(null);

  const load = (nextFilter = filter, nextSearch = search) => {
    dispatch(
      fetchAgencyLifecycle({
        status: nextFilter,
        search: nextSearch.trim() || undefined,
      }),
    );
  };

  useEffect(() => {
    load('All', '');
  }, [dispatch]);

  const handleFilter = (key) => {
    setFilter(key);
    load(key, search);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    load(filter, search);
  };

  const handleArchive = async (agency) => {
    const confirmed = await confirmAlert({
      title: 'Archive this agency?',
      text: `${agency.name} will keep its data, but owners, staff, caregivers, and clients will not be able to log in. It will also disappear from admin operational lists.`,
      confirmText: 'Archive',
      danger: true,
    });
    if (!confirmed) return;
    setBusyId(agency.id);
    try {
      await dispatch(archiveAgency(agency.id)).unwrap();
      load(filter, search);
    } catch {
      // toast in slice
    } finally {
      setBusyId(null);
    }
  };

  const handleRestore = async (agency) => {
    const confirmed = await confirmAlert({
      title: 'Restore this agency?',
      text: `${agency.name} will become visible again and users can log in once more.`,
      confirmText: 'Restore',
    });
    if (!confirmed) return;
    setBusyId(agency.id);
    try {
      await dispatch(restoreAgency(agency.id)).unwrap();
      load(filter, search);
    } catch {
      // toast in slice
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (agency) => {
    const confirmed = await confirmAlert({
      title: 'Permanently delete agency?',
      text: `This permanently deletes ${agency.name} and all related records (users, clients, schedules, EVV, invoices, documents, hiring data, and more). This cannot be undone.`,
      confirmText: 'Delete forever',
      danger: true,
    });
    if (!confirmed) return;
    setBusyId(agency.id);
    try {
      await dispatch(deleteAgency(agency.id)).unwrap();
      load(filter, search);
    } catch {
      // toast in slice
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Agency Lifecycle</h1>
        <p className="mt-1 text-sm text-gray-500">
          Archive agencies to revoke portal access while keeping records, or permanently delete all
          agency data.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Agencies" value={lifecycleStats.total} />
        <StatCard label="Visible" value={lifecycleStats.active} colorClass="text-success" />
        <StatCard label="Archived" value={lifecycleStats.archived} colorClass="text-warning" />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg border border-gray-200 bg-white p-1">
          {FILTERS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => handleFilter(item.key)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                filter === item.key
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <form onSubmit={handleSearch} className="relative min-w-[220px] flex-1 sm:max-w-xs">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search agencies..."
            className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </form>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                <th className="px-6 py-3">Agency</th>
                <th className="px-6 py-3">Owner / Email</th>
                <th className="px-6 py-3">Location</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Archived</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {lifecycleStatus === 'loading' ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    Loading agencies...
                  </td>
                </tr>
              ) : lifecycleItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <Building2 className="mx-auto mb-2 text-gray-300" size={28} />
                    No agencies match this filter.
                  </td>
                </tr>
              ) : (
                lifecycleItems.map((agency) => {
                  const isArchived = agency.status === 'Archived';
                  const busy = busyId === agency.id;
                  return (
                    <tr key={agency.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{agency.name}</p>
                        <p className="text-xs text-gray-500">{agency.agencyType || 'Agency'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-900">{agency.ownerName || '—'}</p>
                        <p className="text-xs text-gray-500">{agency.email}</p>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {[agency.city, agency.state].filter(Boolean).join(', ') || '—'}
                      </td>
                      <td className="px-6 py-4">
                        <AgencyStatusBadge status={agency.status} />
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {formatLongDate(agency.archivedAt)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap items-center gap-2">
                          {isArchived ? (
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => handleRestore(agency)}
                              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            >
                              <ArchiveRestore size={14} />
                              Restore
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => handleArchive(agency)}
                              className="inline-flex items-center gap-1 rounded-lg border border-amber-200 px-2.5 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-50 disabled:opacity-50"
                            >
                              <Archive size={14} />
                              Archive
                            </button>
                          )}
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => handleDelete(agency)}
                            className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
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
    </div>
  );
}
