import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  Plus, Search, Pencil, Trash2, Eye, Flame, UserPlus, ClipboardList,
} from 'lucide-react';
import AgencyKpiCard from '../../../components/agency/dashboard/AgencyKpiCard';
import {
  deleteLead,
  fetchLeads,
  fetchLeadStats,
} from '../../../redux/slices/leadsSlice';
import { ROUTES } from '../../../routes/routes';
import { confirmAlert } from '../../../utils/swal';
import { LEAD_PRIORITIES, LEAD_STAGES } from '../../../utils/leadForm';

const STAGE_STYLES = {
  'New Lead': 'bg-blue-100 text-blue-700',
  Contacted: 'bg-indigo-100 text-indigo-700',
  'Assessment Scheduled': 'bg-amber-100 text-amber-800',
  'Proposal Sent': 'bg-violet-100 text-violet-700',
  Converted: 'bg-emerald-100 text-emerald-700',
};

const PRIORITY_STYLES = {
  Hot: 'bg-orange-100 text-orange-800',
  High: 'bg-red-100 text-red-700',
  Medium: 'bg-amber-100 text-amber-700',
  Low: 'bg-gray-100 text-gray-600',
};

const actionBtn = 'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold shadow-sm transition-colors';
const actionBtnNeutral = `${actionBtn} border-gray-200 bg-white text-gray-700 hover:border-primary/30 hover:bg-gray-50 hover:text-primary`;
const actionBtnDanger = `${actionBtn} border-red-200 bg-white text-red-600 hover:bg-red-50`;

export default function Leads() {
  const dispatch = useDispatch();
  const { list, stats, loading } = useSelector((s) => s.leads);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  useEffect(() => {
    dispatch(fetchLeads());
    dispatch(fetchLeadStats());
  }, [dispatch]);

  const filtered = useMemo(() => list.filter((item) => {
    if (stageFilter !== 'All' && item.stage !== stageFilter) return false;
    if (priorityFilter !== 'All' && item.priority !== priorityFilter) return false;
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return [item.leadCode, item.fullName, item.recipientName, item.phone, item.email, item.leadSource]
      .join(' ')
      .toLowerCase()
      .includes(q);
  }), [list, search, stageFilter, priorityFilter]);

  const handleDelete = async (item) => {
    const ok = await confirmAlert({
      title: 'Delete lead?',
      text: `Remove ${item.fullName || item.leadCode}?`,
      confirmText: 'Delete',
      danger: true,
    });
    if (!ok) return;
    await dispatch(deleteLead(item.id));
    dispatch(fetchLeadStats());
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Leads</h1>
          <p className="mt-1 text-sm text-gray-500">
            Capture inquiries before assessment. Convert qualified leads into clients.
          </p>
        </div>
        <Link
          to={ROUTES.AGENCY_LEADS_CREATE}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
        >
          <Plus size={16} /> Create Lead
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <AgencyKpiCard label="Total Leads" value={String(stats.total || 0)} icon={ClipboardList} iconBg="bg-blue-100 text-blue-600" />
        <AgencyKpiCard label="Open" value={String(stats.open || 0)} icon={UserPlus} iconBg="bg-indigo-100 text-indigo-600" />
        <AgencyKpiCard label="Hot / High" value={String(stats.hot || 0)} icon={Flame} iconBg="bg-orange-100 text-orange-600" />
        <AgencyKpiCard label="Converted" value={String(stats.converted || 0)} icon={UserPlus} iconBg="bg-emerald-100 text-emerald-600" />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 px-5 py-4">
          <div className="relative min-w-[220px] flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search leads..."
              className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700"
          >
            <option value="All">All stages</option>
            {LEAD_STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700"
          >
            <option value="All">All priorities</option>
            {LEAD_PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                <th className="px-5 py-3">Lead</th>
                <th className="px-5 py-3">Recipient</th>
                <th className="px-5 py-3">Source</th>
                <th className="px-5 py-3">Stage</th>
                <th className="px-5 py-3">Priority</th>
                <th className="px-5 py-3">Assigned</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-gray-500">Loading leads…</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-gray-500">
                    No leads yet. Create your first lead to begin.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-900">{item.fullName || '—'}</p>
                      <p className="text-xs text-gray-500">{item.leadCode}</p>
                      <p className="text-xs text-gray-400">{item.phone || item.email || ''}</p>
                    </td>
                    <td className="px-5 py-4 text-gray-700">{item.recipientName || '—'}</td>
                    <td className="px-5 py-4 text-gray-700">{item.leadSource || '—'}</td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STAGE_STYLES[item.stage] || STAGE_STYLES['New Lead']}`}>
                        {item.stage}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${PRIORITY_STYLES[item.priority] || PRIORITY_STYLES.Medium}`}>
                        {(item.priority === 'Hot' || item.priority === 'High') ? <Flame size={11} /> : null}
                        {item.priority}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-700">{item.assignedToName || '—'}</td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        <Link to={ROUTES.AGENCY_LEADS_DETAIL.replace(':id', item.id)} className={actionBtnNeutral}>
                          <Eye size={13} /> View
                        </Link>
                        <Link to={ROUTES.AGENCY_LEADS_EDIT.replace(':id', item.id)} className={actionBtnNeutral}>
                          <Pencil size={13} /> Edit
                        </Link>
                        {item.stage !== 'Converted' ? (
                          <button type="button" onClick={() => handleDelete(item)} className={actionBtnDanger}>
                            <Trash2 size={13} /> Delete
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
