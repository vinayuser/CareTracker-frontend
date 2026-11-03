import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Inbox, Search } from 'lucide-react';
import { toast } from 'react-toastify';
import axiosInstance from '../../api/axiosInstance';
import API_ROUTES from '../../api/apiRoutes';

const PAGE_SIZE = 10;

function pageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) pages.push('…');
  for (let i = start; i <= end; i += 1) pages.push(i);
  if (end < total - 1) pages.push('…');
  pages.push(total);
  return pages;
}

function formatWhen(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function Enquiries() {
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 1,
    from: 0,
    to: 0,
  });

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      limit: String(PAGE_SIZE),
    });
    if (appliedSearch) params.set('search', appliedSearch);

    axiosInstance.get(`${API_ROUTES.ADMIN.ENQUIRIES.LIST}?${params.toString()}`)
      .then((res) => {
        if (cancelled) return;
        const data = res.data?.data || {};
        setItems(data.list || []);
        setPagination(data.pagination || {
          page, limit: PAGE_SIZE, total: 0, totalPages: 1, from: 0, to: 0,
        });
        if (data.pagination?.page && data.pagination.page !== page) {
          setPage(data.pagination.page);
        }
      })
      .catch(() => {
        if (!cancelled) toast.error('Failed to load enquiries');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [page, appliedSearch]);

  const pages = useMemo(
    () => pageNumbers(pagination.page || page, pagination.totalPages || 1),
    [pagination.page, pagination.totalPages, page],
  );

  const applySearch = (event) => {
    event.preventDefault();
    setPage(1);
    setAppliedSearch(search.trim());
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Enquiries</h1>
          <p className="mt-1 text-sm text-gray-500">
            Demo requests submitted from the public website.
          </p>
        </div>
        <form onSubmit={applySearch} className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, phone"
              className="h-10 w-64 rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-primary"
            />
          </div>
          <button
            type="submit"
            className="h-10 cursor-pointer rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            Search
          </button>
        </form>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Phone</th>
                <th className="px-5 py-3">Preferred time</th>
                <th className="px-5 py-3">Address</th>
                <th className="px-5 py-3">Submitted</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-gray-500">Loading…</td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-gray-500">
                    <Inbox size={22} className="mx-auto mb-2 text-slate-300" />
                    No demo enquiries yet.
                  </td>
                </tr>
              ) : items.map((row) => (
                <tr key={row.id} className="align-top hover:bg-slate-50/70">
                  <td className="px-5 py-3.5 font-semibold text-slate-900">{row.fullName || `${row.firstName} ${row.lastName}`}</td>
                  <td className="px-5 py-3.5 text-slate-600">{row.email}</td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-slate-600">
                    {[row.dialCode, row.phone].filter(Boolean).join(' ')}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-slate-600">
                    {row.scheduleDate} · {row.scheduleTime}
                    {row.timezone ? <span className="mt-0.5 block text-[11px] text-slate-400">{row.timezone}</span> : null}
                  </td>
                  <td className="max-w-[220px] px-5 py-3.5 text-slate-600">
                    <span className="line-clamp-2">{row.address}</span>
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-slate-500">{formatWhen(row.createdAt)}</td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-semibold text-sky-700">
                      {row.status || 'New'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
          <span>
            Showing {pagination.from} to {pagination.to} of {Number(pagination.total || 0).toLocaleString()} enquiries
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="cursor-pointer rounded p-1 hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-300"
            >
              <ChevronLeft size={14} />
            </button>
            {pages.map((item, idx) => (
              item === '…' ? <span key={`e-${idx}`} className="px-1">…</span> : (
                <button
                  key={item}
                  type="button"
                  onClick={() => setPage(item)}
                  className={`min-w-[28px] cursor-pointer rounded px-2 py-1 ${item === page ? 'bg-primary text-white' : 'hover:bg-slate-100'}`}
                >
                  {item}
                </button>
              )
            ))}
            <button
              type="button"
              disabled={page >= (pagination.totalPages || 1)}
              onClick={() => setPage((p) => p + 1)}
              className="cursor-pointer rounded p-1 hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-300"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
