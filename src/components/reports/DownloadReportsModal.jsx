import { useEffect, useMemo, useState } from 'react';
import { Download, X } from 'lucide-react';
import { toast } from 'react-toastify';
import axiosInstance from '../../api/axiosInstance';
import API_ROUTES from '../../api/apiRoutes';

function today() {
  return new Date().toISOString().slice(0, 10);
}

function daysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

export default function DownloadReportsModal({
  open,
  onClose,
  scope = 'agency',
  agencies = [],
  initialAgencyId = '',
}) {
  const isAdmin = scope === 'admin';
  const catalogUrl = isAdmin ? API_ROUTES.ADMIN.REPORTS.OPERATIONS : API_ROUTES.AGENCY.REPORTS.OPERATIONS;
  const [catalog, setCatalog] = useState([]);
  const [key, setKey] = useState('');
  const [agencyId, setAgencyId] = useState(initialAgencyId || '');
  const [from, setFrom] = useState(daysAgo(30));
  const [to, setTo] = useState(today());
  const [month, setMonth] = useState(today().slice(5, 7));
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    setAgencyId(initialAgencyId || (isAdmin ? 'all' : agencies[0]?.id || ''));
    let active = true;
    axiosInstance
      .get(catalogUrl)
      .then((res) => {
        if (!active) return;
        const reports = res.data?.data?.reports || [];
        setCatalog(reports);
        if (reports[0]) setKey(reports[0].key);
      })
      .catch(() => toast.error('Could not load report types'));
    return () => {
      active = false;
    };
    // Reset fields only when the modal opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, catalogUrl]);

  const selected = useMemo(() => catalog.find((item) => item.key === key), [catalog, key]);

  if (!open) return null;

  const download = async () => {
    if (!key) {
      toast.error('Select a report type');
      return;
    }
    if (isAdmin && !agencyId) {
      toast.error('Select an agency');
      return;
    }
    setDownloading(true);
    try {
      const params = new URLSearchParams();
      if (isAdmin) params.set('agencyId', agencyId);
      if (selected?.needsRange) {
        params.set('from', from);
        params.set('to', to);
      }
      if (selected?.needsMonth) params.set('month', month);
      const query = params.toString();
      const res = await axiosInstance.get(
        `${catalogUrl}/export/${key}${query ? `?${query}` : ''}`,
        { responseType: 'blob' },
      );
      const url = URL.createObjectURL(res.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${key}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      onClose();
    } catch {
      toast.error('Could not download this report');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Download Reports</h2>
            <p className="mt-0.5 text-sm text-slate-500">Choose a report type, then download the file.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-700">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 px-5 py-5">
          {isAdmin ? (
            <label className="block text-sm font-medium text-slate-700">
              Agency
              <select
                value={agencyId}
                onChange={(event) => setAgencyId(event.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-primary"
              >
                <option value="all">All agencies</option>
                {agencies.map((agency) => (
                  <option key={agency.id} value={agency.id}>
                    {agency.name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <label className="block text-sm font-medium text-slate-700">
            Report type
            <select
              value={key}
              onChange={(event) => setKey(event.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-primary"
            >
              {catalog.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.group} — {item.title}
                </option>
              ))}
            </select>
          </label>

          {selected?.description ? (
            <p className="rounded-lg bg-[#f5f7fb] px-3 py-2 text-sm text-slate-600">{selected.description}</p>
          ) : null}

          {selected?.needsRange ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700">
                From
                <input
                  type="date"
                  value={from}
                  max={to || undefined}
                  onChange={(event) => setFrom(event.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-primary"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                To
                <input
                  type="date"
                  value={to}
                  min={from || undefined}
                  onChange={(event) => setTo(event.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-primary"
                />
              </label>
            </div>
          ) : null}

          {selected?.needsMonth ? (
            <label className="block text-sm font-medium text-slate-700">
              Month
              <input
                type="month"
                value={`${today().slice(0, 4)}-${month}`}
                onChange={(event) => setMonth(event.target.value.slice(5, 7))}
                className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
            </label>
          ) : null}
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={download}
            disabled={downloading || !key || (isAdmin && !agencyId)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-50"
          >
            <Download size={16} />
            {downloading ? 'Downloading…' : 'Download'}
          </button>
        </div>
      </div>
    </div>
  );
}
