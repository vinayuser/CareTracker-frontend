import { useEffect, useMemo, useState } from 'react';
import {
  Building2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Columns3,
  Download,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Trash2,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import axiosInstance from '../../../api/axiosInstance';
import API_ROUTES from '../../../api/apiRoutes';
import ActionIconButton from '../../../components/ui/ActionIconButton';
import Drawer from '../../../components/ui/Drawer';
import { confirmAlert } from '../../../utils/swal';

const TYPES = ['National', 'Religious', 'Optional', 'Organizational'];
const ALL_COLUMNS = [
  { key: 'index', label: '#' },
  { key: 'name', label: 'Holiday Name' },
  { key: 'date', label: 'Date' },
  { key: 'day', label: 'Day' },
  { key: 'type', label: 'Holiday Type' },
  { key: 'applicableTo', label: 'Applicable To' },
  { key: 'status', label: 'Status' },
  { key: 'createdBy', label: 'Created By' },
  { key: 'actions', label: 'Actions' },
];

const yearBounds = (year = new Date().getFullYear()) => ({
  from: `${year}-01-01`,
  to: `${year}-12-31`,
});

const typeTone = {
  National: 'bg-sky-50 text-sky-700',
  Religious: 'bg-violet-50 text-violet-700',
  Optional: 'bg-amber-50 text-amber-800',
  Organizational: 'bg-slate-100 text-slate-700',
};

const EMPTY_FORM = {
  name: '',
  date: '',
  type: 'National',
  status: 'Active',
  blocksWork: true,
  notes: '',
};

function TypeBadge({ type }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${typeTone[type] || 'bg-slate-100 text-slate-600'}`}>
      {type}
    </span>
  );
}

export default function HolidayMaster() {
  const user = useSelector((state) => state.auth.user);
  const agencyName = user?.agencyName || user?.agency?.name || 'This agency';
  const defaults = yearBounds();

  const [filters, setFilters] = useState({ search: '', from: defaults.from, to: defaults.to, status: 'All' });
  const [applied, setApplied] = useState(filters);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [list, setList] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, from: 0, to: 0 });
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('asc');
  const [columnsOpen, setColumnsOpen] = useState(false);
  const [visible, setVisible] = useState(() => Object.fromEntries(ALL_COLUMNS.map((c) => [c.key, true])));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = async (nextPage = page) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(API_ROUTES.AGENCY.HOLIDAYS, {
        params: {
          search: applied.search || undefined,
          from: applied.from || undefined,
          to: applied.to || undefined,
          status: applied.status !== 'All' ? applied.status : undefined,
          page: nextPage,
          limit,
          sort,
        },
      });
      const data = res.data?.data || {};
      setList(Array.isArray(data.list) ? data.list : []);
      setPagination(data.pagination || { total: 0, totalPages: 1, from: 0, to: 0 });
    } catch {
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(page); }, [applied, page, limit, sort]);

  const pages = useMemo(() => {
    const total = pagination.totalPages || 1;
    return Array.from({ length: total }, (_, i) => i + 1).slice(0, 7);
  }, [pagination.totalPages]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM, blocksWork: true });
    setDrawerOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm({
      name: row.name,
      date: row.date,
      type: row.type,
      status: row.status,
      blocksWork: row.blocksWork !== false,
      notes: row.notes || '',
    });
    setDrawerOpen(true);
  };

  const save = async () => {
    if (!form.name.trim() || !form.date) {
      toast.error('Holiday name and date are required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        blocksWork: form.type === 'National' ? true : form.blocksWork,
      };
      if (editing) {
        await axiosInstance.put(`${API_ROUTES.AGENCY.HOLIDAYS}/${editing.id}`, payload);
        toast.success('Holiday updated');
      } else {
        await axiosInstance.post(API_ROUTES.AGENCY.HOLIDAYS, payload);
        toast.success('Holiday added');
      }
      setDrawerOpen(false);
      load(page);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (row) => {
    const ok = await confirmAlert({
      title: 'Delete holiday?',
      text: `${row.name} on ${row.dateDisplay} will be removed and related leave marks on the schedule will be cleared.`,
      confirmText: 'Delete',
      danger: true,
    });
    if (!ok) return;
    await axiosInstance.delete(`${API_ROUTES.AGENCY.HOLIDAYS}/${row.id}`);
    toast.success('Holiday deleted');
    load(page);
  };

  const exportCsv = () => {
    const header = ['Holiday Name', 'Date', 'Day', 'Type', 'Applicable To', 'Status', 'Created By'];
    const rows = list.map((row) => [row.name, row.dateDisplay, row.day, row.type, row.applicableTo, row.status, row.createdBy]);
    const csv = [header, ...rows].map((line) => line.map((cell) => `"${String(cell || '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'holiday-master.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const inputClass = 'w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary';

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-bold tracking-tight text-slate-900">Holiday Master</h1>
          <p className="mt-1 text-sm text-slate-500">Manage and maintain holidays for your organization.</p>
        </div>
        <button type="button" onClick={openCreate} className="inline-flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover">
          <Plus size={16} /> Add Holiday
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <div>
            <label className="mb-1 block text-[11px] font-medium text-slate-500">Organization / Agency</label>
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-700">
              <Building2 size={14} className="text-slate-400" /> {agencyName}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-medium text-slate-500">Holiday Name</label>
            <div className="relative">
              <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={filters.search} onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))} placeholder="Search holiday name." className={`${inputClass} pl-9`} />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-medium text-slate-500">Date Range</label>
            <div className="grid grid-cols-2 gap-2">
              <input type="date" value={filters.from} onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))} className={inputClass} />
              <input type="date" value={filters.to} onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))} className={inputClass} />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-medium text-slate-500">Status</label>
            <select value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))} className={inputClass}>
              <option>All</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>
          <div className="flex items-end gap-2">
            <button type="button" onClick={() => { setPage(1); setApplied(filters); }} className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2.5 text-sm font-semibold text-white">
              <Search size={14} /> Search
            </button>
            <button
              type="button"
              onClick={() => {
                const next = { search: '', from: defaults.from, to: defaults.to, status: 'All' };
                setFilters(next);
                setApplied(next);
                setPage(1);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700"
            >
              <RotateCcw size={14} /> Reset
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-slate-600">Total Holidays: {Number(pagination.total || 0).toLocaleString()}</p>
        <div className="relative flex gap-2">
          <button type="button" onClick={exportCsv} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700">
            <Download size={14} /> Export
          </button>
          <button type="button" onClick={() => setColumnsOpen((v) => !v)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700">
            <Columns3 size={14} /> Columns
          </button>
          {columnsOpen ? (
            <div className="absolute right-0 top-11 z-20 w-48 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
              {ALL_COLUMNS.filter((c) => c.key !== 'actions').map((col) => (
                <label key={col.key} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-50">
                  <input type="checkbox" checked={visible[col.key]} onChange={() => setVisible((v) => ({ ...v, [col.key]: !v[col.key] }))} />
                  {col.label}
                </label>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                {visible.index ? <th className="px-4 py-3">#</th> : null}
                {visible.name ? <th className="px-4 py-3">Holiday Name</th> : null}
                {visible.date ? (
                  <th className="px-4 py-3">
                    <button type="button" onClick={() => setSort((s) => (s === 'asc' ? 'desc' : 'asc'))} className="inline-flex items-center gap-1">
                      Date <Calendar size={12} />
                    </button>
                  </th>
                ) : null}
                {visible.day ? <th className="px-4 py-3">Day</th> : null}
                {visible.type ? <th className="px-4 py-3">Holiday Type</th> : null}
                {visible.applicableTo ? <th className="px-4 py-3">Applicable To</th> : null}
                {visible.status ? <th className="px-4 py-3">Status</th> : null}
                {visible.createdBy ? <th className="px-4 py-3">Created By</th> : null}
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="px-4 py-16 text-center text-slate-500">Loading holidays…</td></tr>
              ) : list.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-16 text-center text-slate-500">No holidays found.</td></tr>
              ) : list.map((row, idx) => (
                <tr key={row.id} className={`border-b border-slate-50 ${idx % 2 ? 'bg-slate-50/60' : 'bg-white'}`}>
                  {visible.index ? <td className="px-4 py-3 text-slate-500">{pagination.from + idx}</td> : null}
                  {visible.name ? <td className="px-4 py-3 font-semibold text-slate-800">{row.name}</td> : null}
                  {visible.date ? <td className="px-4 py-3 text-slate-600">{row.dateDisplay}</td> : null}
                  {visible.day ? <td className="px-4 py-3 text-slate-600">{row.day}</td> : null}
                  {visible.type ? <td className="px-4 py-3"><TypeBadge type={row.type} /></td> : null}
                  {visible.applicableTo ? (
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 text-slate-600"><Building2 size={13} className="text-slate-400" /> {row.applicableTo || 'All Caregivers'}</span>
                    </td>
                  ) : null}
                  {visible.status ? (
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${row.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${row.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        {row.status}
                      </span>
                    </td>
                  ) : null}
                  {visible.createdBy ? <td className="px-4 py-3 text-slate-600">{row.createdBy}</td> : null}
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <ActionIconButton label="Edit" className="border border-sky-100 text-sky-600 hover:bg-sky-50" onClick={() => openEdit(row)}>
                        <Pencil size={14} />
                      </ActionIconButton>
                      <ActionIconButton label="Delete" className="border border-rose-100 text-rose-600 hover:bg-rose-50" onClick={() => remove(row)}>
                        <Trash2 size={14} />
                      </ActionIconButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 text-sm text-slate-500">
          <label className="flex items-center gap-2">
            Show
            <select value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }} className="rounded-lg border border-slate-200 px-2 py-1 text-sm">
              {[10, 25, 50].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
            entries
          </label>
          <div className="flex items-center gap-1">
            <button type="button" disabled={page <= 1} onClick={() => setPage(1)} className="rounded p-1 disabled:text-slate-300"><ChevronLeft size={14} /><ChevronLeft size={14} className="-ml-2" /></button>
            <button type="button" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="rounded p-1 disabled:text-slate-300"><ChevronLeft size={14} /></button>
            {pages.map((n) => (
              <button key={n} type="button" onClick={() => setPage(n)} className={`min-w-[28px] rounded px-2 py-1 ${n === page ? 'bg-primary text-white' : 'hover:bg-slate-100'}`}>{n}</button>
            ))}
            <button type="button" disabled={page >= (pagination.totalPages || 1)} onClick={() => setPage((p) => p + 1)} className="rounded p-1 disabled:text-slate-300"><ChevronRight size={14} /></button>
            <button type="button" disabled={page >= (pagination.totalPages || 1)} onClick={() => setPage(pagination.totalPages || 1)} className="rounded p-1 disabled:text-slate-300"><ChevronRight size={14} /><ChevronRight size={14} className="-ml-2" /></button>
          </div>
        </div>
      </div>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editing ? 'Edit Holiday' : 'Add Holiday'}
        footer={(
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setDrawerOpen(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium">Cancel</button>
            <button type="button" onClick={save} disabled={saving} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{saving ? 'Saving…' : 'Save'}</button>
          </div>
        )}
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Holiday Name</label>
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className={inputClass} placeholder="New Year's Day" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Date</label>
            <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} className={inputClass} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Holiday Type</label>
            <select
              value={form.type}
              onChange={(e) => {
                const type = e.target.value;
                setForm((f) => ({ ...f, type, blocksWork: type === 'National' ? true : (type === 'Optional' ? false : true) }));
              }}
              className={inputClass}
            >
              {TYPES.map((type) => <option key={type}>{type}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Status</label>
            <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} className={inputClass}>
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>
          <label className="flex items-start gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.type === 'National' ? true : form.blocksWork}
              disabled={form.type === 'National'}
              onChange={(e) => setForm((f) => ({ ...f, blocksWork: e.target.checked }))}
              className="mt-0.5"
            />
            Caregivers cannot work on this day (schedules are marked Leave)
          </label>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={3} className={inputClass} />
          </div>
        </div>
      </Drawer>
    </div>
  );
}
