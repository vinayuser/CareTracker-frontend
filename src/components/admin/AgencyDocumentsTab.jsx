import { useEffect, useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  Heart,
  MoreVertical,
  Plus,
  Search,
  Trash2,
  Upload,
} from 'lucide-react';
import { toast } from 'react-toastify';
import axiosInstance from '../../api/axiosInstance';
import API_ROUTES from '../../api/apiRoutes';
import ActionIconButton from '../ui/ActionIconButton';
import Drawer from '../ui/Drawer';
import { confirmAlert } from '../../utils/swal';

const PAGE_SIZE = 7;
const CATEGORIES = ['Legal', 'Insurance', 'Tax', 'Policy', 'Finance', 'HR', 'Other'];
const STATUS_OPTIONS = ['All', 'Active', 'Expired', 'Archived'];

function formatLongDate(value) {
  if (!value) return '—';
  const raw = String(value);
  const d = raw.includes('T') ? new Date(raw) : new Date(`${raw.slice(0, 10)}T12:00:00`);
  if (Number.isNaN(d.getTime())) return raw;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatBytes(bytes) {
  const n = Number(bytes || 0);
  if (n >= 1024 * 1024 * 1024) return `${(n / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  if (n >= 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(2)} MB`;
  if (n >= 1024) return `${Math.round(n / 1024)} KB`;
  return `${n} B`;
}

function fileKind(name = '', mime = '') {
  const lower = `${name} ${mime}`.toLowerCase();
  if (lower.includes('pdf')) return 'pdf';
  if (lower.includes('sheet') || lower.includes('excel') || lower.includes('xls') || lower.includes('csv')) return 'sheet';
  if (lower.includes('word') || lower.includes('doc')) return 'word';
  return 'file';
}

function FileIcon({ name, mime }) {
  const kind = fileKind(name, mime);
  const tone = kind === 'pdf'
    ? 'bg-rose-50 text-rose-600'
    : kind === 'sheet'
      ? 'bg-emerald-50 text-emerald-600'
      : kind === 'word'
        ? 'bg-sky-50 text-sky-600'
        : 'bg-slate-100 text-slate-500';
  const Icon = kind === 'sheet' ? FileSpreadsheet : FileText;
  return (
    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${tone}`}>
      <Icon size={16} />
    </span>
  );
}

function StatusPill({ status }) {
  const tone = status === 'Active'
    ? 'bg-emerald-50 text-emerald-700'
    : status === 'Expired'
      ? 'bg-amber-50 text-amber-700'
      : 'bg-slate-100 text-slate-600';
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${tone}`}>
      {status || '—'}
    </span>
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

const EMPTY = {
  list: [],
  pagination: { page: 1, limit: PAGE_SIZE, total: 0, totalPages: 1, from: 0, to: 0 },
  categories: { total: 0, items: CATEGORIES.map((name) => ({ name, count: 0 })) },
  storage: { used: 0, limit: 10 * 1024 * 1024 * 1024, percent: 0 },
};

export default function AgencyDocumentsTab({ agencyId }) {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('All');
  const [favorites, setFavorites] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(EMPTY);
  const [menuId, setMenuId] = useState('');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [form, setForm] = useState({ name: '', category: 'Legal', expiryDate: '', file: null });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [agencyId, debouncedSearch, category, status, favorites]);

  const load = async () => {
    if (!agencyId) return;
    setLoading(true);
    try {
      const response = await axiosInstance.get(`${API_ROUTES.ADMIN.AGENCY.DOCUMENTS}/${agencyId}/documents`, {
        params: {
          page,
          limit: PAGE_SIZE,
          search: debouncedSearch || undefined,
          category: category === 'All' ? undefined : category,
          status: status === 'All' ? undefined : status,
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
  }, [agencyId, page, debouncedSearch, category, status, favorites]);

  const pages = useMemo(
    () => pageNumbers(data.pagination.page || page, data.pagination.totalPages || 1),
    [data.pagination.page, data.pagination.totalPages, page],
  );

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!form.file) {
      toast.error('Choose a file to upload');
      return;
    }
    setSaving(true);
    try {
      const payload = new FormData();
      payload.append('file', form.file);
      payload.append('name', form.name || form.file.name);
      payload.append('category', form.category);
      if (form.expiryDate) payload.append('expiryDate', form.expiryDate);
      await axiosInstance.post(`${API_ROUTES.ADMIN.AGENCY.DOCUMENTS}/${agencyId}/documents`, payload);
      toast.success('Document uploaded');
      setUploadOpen(false);
      setForm({ name: '', category: 'Legal', expiryDate: '', file: null });
      setPage(1);
      load();
    } finally {
      setSaving(false);
    }
  };

  const toggleFavorite = async (doc) => {
    await axiosInstance.put(`${API_ROUTES.ADMIN.AGENCY.DOCUMENTS}/${agencyId}/documents/${doc.id}`, {
      isFavorite: !doc.isFavorite,
    });
    load();
  };

  const handleDelete = async (doc) => {
    const confirmed = await confirmAlert({
      title: 'Delete document?',
      text: `${doc.name} will be removed from this agency.`,
      confirmButtonText: 'Delete',
      confirmButtonColor: '#dc2626',
    });
    if (!confirmed) return;
    await axiosInstance.delete(`${API_ROUTES.ADMIN.AGENCY.DOCUMENTS}/${agencyId}/documents/${doc.id}`);
    toast.success('Document deleted');
    load();
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Documents</h2>
          <p className="mt-1 text-sm text-slate-500">Store and manage all important documents related to this agency.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search documents..."
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
                <p className="px-2 pb-1 text-[11px] font-semibold uppercase text-slate-400">Status</p>
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => { setStatus(opt); setFilterOpen(false); }}
                    className={`block w-full rounded-lg px-2 py-1.5 text-left text-sm ${status === opt ? 'bg-primary/10 font-semibold text-primary' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    {opt === 'All' ? 'All Status' : opt}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => setUploadOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            <Plus size={14} /> Upload
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm xl:col-span-3">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3">Document Name</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Uploaded By</th>
                  <th className="px-4 py-3">Upload Date</th>
                  <th className="px-4 py-3">Expiry Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="px-5 py-12 text-center text-slate-500">Loading documents…</td></tr>
                ) : data.list.length === 0 ? (
                  <tr><td colSpan={7} className="px-5 py-12 text-center text-slate-500">No documents yet. Upload the first file for this agency.</td></tr>
                ) : (
                  data.list.map((doc) => (
                    <tr key={doc.id} className="border-b border-slate-50 last:border-0">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <FileIcon name={doc.name} mime={doc.mimeType} />
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-900">{doc.name}</p>
                            <p className="text-[11px] text-slate-400">{formatBytes(doc.fileSize)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600">{doc.category}</td>
                      <td className="px-4 py-3.5 text-slate-600">{doc.uploadedByName}</td>
                      <td className="px-4 py-3.5 text-slate-600">{formatLongDate(doc.uploadDate)}</td>
                      <td className="px-4 py-3.5 text-slate-600">{formatLongDate(doc.expiryDate)}</td>
                      <td className="px-4 py-3.5"><StatusPill status={doc.status} /></td>
                      <td className="relative px-5 py-3.5">
                        <div className="flex items-center justify-end gap-0.5">
                          <ActionIconButton label="View" className="text-primary hover:bg-primary/10" onClick={() => window.open(doc.fileUrl, '_blank', 'noopener')}>
                            <Eye size={15} />
                          </ActionIconButton>
                          <ActionIconButton label="Download" className="text-slate-500 hover:bg-slate-100" onClick={() => {
                            const a = document.createElement('a');
                            a.href = doc.fileUrl;
                            a.download = doc.name;
                            a.target = '_blank';
                            a.rel = 'noopener';
                            a.click();
                          }}>
                            <Download size={15} />
                          </ActionIconButton>
                          <ActionIconButton label="More" className="text-slate-500 hover:bg-slate-100" onClick={() => setMenuId((id) => (id === doc.id ? '' : doc.id))}>
                            <MoreVertical size={15} />
                          </ActionIconButton>
                        </div>
                        {menuId === doc.id ? (
                          <div className="absolute right-5 z-10 mt-1 w-40 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                            <button type="button" onClick={() => { setMenuId(''); toggleFavorite(doc); }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50">
                              <Heart size={14} /> {doc.isFavorite ? 'Unfavorite' : 'Favorite'}
                            </button>
                            <button type="button" onClick={() => { setMenuId(''); handleDelete(doc); }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50">
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
            <span>Showing {data.pagination.from} to {data.pagination.to} of {Number(data.pagination.total || 0).toLocaleString()} documents</span>
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
            <h3 className="text-sm font-semibold text-slate-900">Document Categories</h3>
            <div className="mt-3 space-y-1">
              <button
                type="button"
                onClick={() => setCategory('All')}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm ${category === 'All' ? 'bg-primary/10 font-semibold text-primary' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <span>All Documents</span>
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
            <h3 className="text-sm font-semibold text-slate-900">Storage Usage</h3>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, data.storage.percent || 0)}%` }} />
            </div>
            <div className="mt-2 flex items-center justify-between text-[12px] text-slate-500">
              <span>{formatBytes(data.storage.used)} of {formatBytes(data.storage.limit)} used</span>
              <span>{data.storage.percent || 0}%</span>
            </div>
          </div>
        </div>
      </div>

      <Drawer
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        title="Upload Document"
        footer={(
          <div className="flex gap-3">
            <button type="button" onClick={() => setUploadOpen(false)} className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-700">Cancel</button>
            <button type="submit" form="upload-agency-doc" disabled={saving} className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-50">
              {saving ? 'Uploading…' : 'Upload'}
            </button>
          </div>
        )}
      >
        <form id="upload-agency-doc" onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">File *</label>
            <label className="flex cursor-pointer flex-col items-center rounded-lg border border-dashed border-slate-300 px-4 py-6 text-center hover:bg-slate-50">
              <Upload size={18} className="text-slate-400" />
              <span className="mt-2 text-sm text-slate-600">{form.file ? form.file.name : 'PDF, Word, Excel, or image'}</span>
              <input type="file" className="hidden" onChange={(e) => setForm((prev) => ({ ...prev, file: e.target.files?.[0] || null, name: prev.name || e.target.files?.[0]?.name || '' }))} />
            </label>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Document Name</label>
            <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Category</label>
            <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary">
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Expiry Date</label>
            <input type="date" value={form.expiryDate} onChange={(e) => setForm((p) => ({ ...p, expiryDate: e.target.value }))} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary" />
          </div>
        </form>
      </Drawer>
    </div>
  );
}
