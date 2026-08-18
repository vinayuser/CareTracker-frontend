import { useEffect, useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
  Heart,
  MoreVertical,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { toast } from 'react-toastify';
import axiosInstance from '../../api/axiosInstance';
import API_ROUTES from '../../api/apiRoutes';
import ActionIconButton from '../ui/ActionIconButton';
import Drawer from '../ui/Drawer';
import { confirmAlert } from '../../utils/swal';

const PAGE_SIZE = 5;
const CATEGORIES = ['Onboarding', 'Billing', 'Operations', 'Compliance', 'Review', 'Other'];
const TAG_OPTIONS = ['Client', 'Caregivers', 'Follow-up', 'Meeting', 'Reminder'];

const CATEGORY_TONE = {
  Onboarding: 'bg-sky-50 text-sky-700',
  Billing: 'bg-blue-50 text-blue-700',
  Operations: 'bg-violet-50 text-violet-700',
  Compliance: 'bg-teal-50 text-teal-700',
  Review: 'bg-slate-100 text-slate-600',
  Other: 'bg-slate-100 text-slate-600',
};

const TAG_TONE = {
  Client: 'bg-emerald-50 text-emerald-700',
  Caregivers: 'bg-violet-50 text-violet-700',
  'Follow-up': 'bg-orange-50 text-orange-700',
  Meeting: 'bg-sky-50 text-sky-700',
  Reminder: 'bg-amber-50 text-amber-700',
};

function formatDateTime(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  const date = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  return `${date} ${time}`;
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

const EMPTY = {
  list: [],
  pagination: { page: 1, limit: PAGE_SIZE, total: 0, totalPages: 1, from: 0, to: 0 },
  categories: { total: 0, items: CATEGORIES.map((name) => ({ name, count: 0 })) },
  tags: [],
};

const EMPTY_FORM = { title: '', body: '', category: 'Onboarding', tags: [] };

export default function AgencyNotesTab({ agencyId }) {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [tag, setTag] = useState('');
  const [favorites, setFavorites] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(EMPTY);
  const [menuId, setMenuId] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewNote, setViewNote] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [agencyId, debouncedSearch, category, tag, favorites]);

  const load = async () => {
    if (!agencyId) return;
    setLoading(true);
    try {
      const response = await axiosInstance.get(`${API_ROUTES.ADMIN.AGENCY.NOTES}/${agencyId}/notes`, {
        params: {
          page,
          limit: PAGE_SIZE,
          search: debouncedSearch || undefined,
          category: category === 'All' ? undefined : category,
          tag: tag || undefined,
          favorites: favorites || undefined,
        },
      });
      setData({ ...EMPTY, ...(response.data?.data || {}) });
    } catch {
      setData(EMPTY);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [agencyId, page, debouncedSearch, category, tag, favorites]);

  const pages = useMemo(
    () => pageNumbers(data.pagination.page || page, data.pagination.totalPages || 1),
    [data.pagination.page, data.pagination.totalPages, page],
  );

  const toggleTag = (value) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(value) ? prev.tags.filter((t) => t !== value) : [...prev.tags, value],
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error('Note title is required');
      return;
    }
    setSaving(true);
    try {
      await axiosInstance.post(`${API_ROUTES.ADMIN.AGENCY.NOTES}/${agencyId}/notes`, form);
      toast.success('Note added');
      setDrawerOpen(false);
      setForm(EMPTY_FORM);
      setPage(1);
      load();
    } finally {
      setSaving(false);
    }
  };

  const toggleFavorite = async (note) => {
    await axiosInstance.put(`${API_ROUTES.ADMIN.AGENCY.NOTES}/${agencyId}/notes/${note.id}`, {
      isFavorite: !note.isFavorite,
    });
    load();
  };

  const handleDelete = async (note) => {
    const confirmed = await confirmAlert({
      title: 'Delete note?',
      text: `${note.title} will be removed.`,
      confirmButtonText: 'Delete',
      confirmButtonColor: '#dc2626',
    });
    if (!confirmed) return;
    await axiosInstance.delete(`${API_ROUTES.ADMIN.AGENCY.NOTES}/${agencyId}/notes/${note.id}`);
    toast.success('Note deleted');
    load();
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Notes</h2>
          <p className="mt-1 text-sm text-slate-500">Add and manage notes related to this agency.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notes..."
              className="w-56 rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <button
            type="button"
            onClick={() => setFavorites((v) => !v)}
            className={`rounded-lg border p-2 ${favorites ? 'border-rose-200 bg-rose-50 text-rose-600' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
            title="Favorites"
          >
            <Heart size={16} fill={favorites ? 'currentColor' : 'none'} />
          </button>
          <div className="relative">
            <button
              type="button"
              onClick={() => setFilterOpen((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <Filter size={14} /> Filter
            </button>
            {filterOpen ? (
              <div className="absolute right-0 z-20 mt-1 w-44 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
                <button type="button" onClick={() => { setTag(''); setFilterOpen(false); }} className="block w-full rounded-lg px-2 py-1.5 text-left text-sm text-slate-600 hover:bg-slate-50">
                  All tags
                </button>
                {TAG_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => { setTag(opt); setFilterOpen(false); }}
                    className={`block w-full rounded-lg px-2 py-1.5 text-left text-sm ${tag === opt ? 'bg-primary/10 font-semibold text-primary' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => { setForm(EMPTY_FORM); setDrawerOpen(true); }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            <Plus size={14} /> Add Note
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm xl:col-span-3">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3">Note Title</th>
                  <th className="px-4 py-3">Note By</th>
                  <th className="px-4 py-3">Created On</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Tags</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="px-5 py-12 text-center text-slate-500">Loading notes…</td></tr>
                ) : data.list.length === 0 ? (
                  <tr><td colSpan={6} className="px-5 py-12 text-center text-slate-500">No notes yet. Add the first internal note for this agency.</td></tr>
                ) : (
                  data.list.map((note) => (
                    <tr key={note.id} className="border-b border-slate-50 last:border-0">
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-slate-900">{note.title}</p>
                        <p className="mt-0.5 max-w-xs truncate text-[12px] text-slate-500">{note.preview || '—'}</p>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600">{note.createdByName}</td>
                      <td className="px-4 py-3.5 text-slate-600">{formatDateTime(note.createdOn)}</td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${CATEGORY_TONE[note.category] || CATEGORY_TONE.Other}`}>
                          {note.category}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex flex-wrap gap-1.5">
                          {note.tags.length ? note.tags.map((item) => (
                            <span key={item} className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${TAG_TONE[item] || 'bg-slate-100 text-slate-600'}`}>
                              {item}
                            </span>
                          )) : <span className="text-slate-400">—</span>}
                        </div>
                      </td>
                      <td className="relative px-5 py-3.5">
                        <div className="flex items-center justify-end gap-0.5">
                          <ActionIconButton label="View" className="text-primary hover:bg-primary/10" onClick={() => setViewNote(note)}>
                            <Eye size={15} />
                          </ActionIconButton>
                          <ActionIconButton label="More" className="text-slate-500 hover:bg-slate-100" onClick={() => setMenuId((id) => (id === note.id ? '' : note.id))}>
                            <MoreVertical size={15} />
                          </ActionIconButton>
                        </div>
                        {menuId === note.id ? (
                          <div className="absolute right-5 z-10 mt-1 w-40 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                            <button type="button" onClick={() => { setMenuId(''); toggleFavorite(note); }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50">
                              <Heart size={14} /> {note.isFavorite ? 'Unfavorite' : 'Favorite'}
                            </button>
                            <button type="button" onClick={() => { setMenuId(''); handleDelete(note); }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50">
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        ) : null}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
            <span>Showing {data.pagination.from} to {data.pagination.to} of {Number(data.pagination.total || 0).toLocaleString()} notes</span>
            <div className="flex items-center gap-1">
              <button type="button" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="rounded p-1 hover:bg-slate-100 disabled:text-slate-300">
                <ChevronLeft size={14} />
              </button>
              {pages.map((item, idx) => (
                item === '…' ? <span key={`e-${idx}`} className="px-1">…</span> : (
                  <button key={item} type="button" onClick={() => setPage(item)} className={`min-w-[28px] rounded px-2 py-1 ${item === page ? 'bg-primary text-white' : 'hover:bg-slate-100'}`}>
                    {item}
                  </button>
                )
              ))}
              <button type="button" disabled={page >= (data.pagination.totalPages || 1)} onClick={() => setPage((p) => p + 1)} className="rounded p-1 hover:bg-slate-100 disabled:text-slate-300">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">Note Categories</h3>
            <div className="mt-3 space-y-1">
              <button
                type="button"
                onClick={() => setCategory('All')}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm ${category === 'All' ? 'bg-primary/10 font-semibold text-primary' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <span>All Notes</span>
                <span>{data.categories.total || 0}</span>
              </button>
              {(data.categories.items || []).map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => setCategory(item.name)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm ${category === item.name ? 'bg-primary/10 font-semibold text-primary' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <span>{item.name}</span>
                  <span>{item.count}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">Popular Tags</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {(data.tags || []).length ? data.tags.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => setTag(item.name === tag ? '' : item.name)}
                  className={`rounded-full px-2.5 py-1 text-[12px] font-semibold ${TAG_TONE[item.name] || 'bg-slate-100 text-slate-600'} ${tag === item.name ? 'ring-2 ring-primary/30' : ''}`}
                >
                  {item.name} ({item.count})
                </button>
              )) : <p className="text-sm text-slate-400">No tags yet.</p>}
            </div>
          </div>
        </div>
      </div>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Add Note"
        footer={(
          <div className="flex gap-3">
            <button type="button" onClick={() => setDrawerOpen(false)} className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-700">Cancel</button>
            <button type="submit" form="add-agency-note" disabled={saving} className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-50">
              {saving ? 'Saving…' : 'Save Note'}
            </button>
          </div>
        )}
      >
        <form id="add-agency-note" onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Title *</label>
            <input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Note</label>
            <textarea rows={5} value={form.body} onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Category</label>
            <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary">
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Tags</label>
            <div className="flex flex-wrap gap-2">
              {TAG_OPTIONS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleTag(item)}
                  className={`rounded-full px-2.5 py-1 text-[12px] font-semibold ${form.tags.includes(item) ? `${TAG_TONE[item]} ring-2 ring-primary/20` : 'bg-slate-100 text-slate-600'}`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </form>
      </Drawer>

      <Drawer open={Boolean(viewNote)} onClose={() => setViewNote(null)} title={viewNote?.title || 'Note'}>
        {viewNote ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${CATEGORY_TONE[viewNote.category] || CATEGORY_TONE.Other}`}>{viewNote.category}</span>
              {viewNote.tags.map((item) => (
                <span key={item} className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${TAG_TONE[item] || 'bg-slate-100 text-slate-600'}`}>{item}</span>
              ))}
            </div>
            <p className="text-sm text-slate-500">{viewNote.createdByName} · {formatDateTime(viewNote.createdOn)}</p>
            <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{viewNote.body || 'No additional details.'}</p>
          </div>
        ) : null}
      </Drawer>
    </div>
  );
}
