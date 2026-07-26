import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Download, Loader2, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { fetchClientRelatedForms } from '../../../redux/slices/clientsSlice';
import { exportClientFormsZip } from '../../../utils/clientFormsExport';

function errorMessage(err) {
  if (!err) return 'Failed to export client forms';
  if (typeof err === 'string') return err;
  return err.message || err.payload?.message || 'Failed to export client forms';
}

export default function ClientFormsExportModal({ open, client, onClose }) {
  const dispatch = useDispatch();
  const agencyName = useSelector((state) => state.auth.user?.agencyName || '');
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Starting…');
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');
  const startedForId = useRef(null);
  const onCloseRef = useRef(onClose);
  const agencyNameRef = useRef(agencyName);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    agencyNameRef.current = agencyName;
  }, [agencyName]);

  useEffect(() => {
    if (!open || !client?.id) return undefined;
    if (startedForId.current === client.id) return undefined;
    startedForId.current = client.id;

    let cancelled = false;
    const run = async () => {
      setRunning(true);
      setError('');
      setProgress(2);
      setStatus('Gathering related forms…');
      try {
        const meta = await dispatch(fetchClientRelatedForms(client.id)).unwrap();
        if (cancelled) return;
        setProgress(5);
        const result = await exportClientFormsZip(meta, agencyNameRef.current, (pct, label) => {
          if (cancelled) return;
          setProgress(Math.max(0, Math.min(100, pct)));
          if (label) setStatus(label);
        });
        if (cancelled) return;
        if (result?.warnings?.length) {
          toast.warn(result.warnings[0]);
        }
        toast.success('Client forms ZIP downloaded');
        onCloseRef.current?.();
      } catch (err) {
        if (cancelled) return;
        const message = errorMessage(err);
        setError(message);
        setStatus('Export failed');
        toast.error(message);
      } finally {
        if (!cancelled) setRunning(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [open, client?.id, dispatch]);

  useEffect(() => {
    if (!open) {
      startedForId.current = null;
      setProgress(0);
      setStatus('Starting…');
      setError('');
      setRunning(false);
    }
  }, [open]);

  if (!open || !client) return null;

  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Preparing client forms</h2>
            <p className="mt-1 text-sm text-gray-500">
              {client.fullName || 'Client'}
              {client.clientCode ? ` · ${client.clientCode}` : ''}
            </p>
          </div>
          {!running && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          )}
        </div>

        <div className="flex flex-col items-center py-4">
          <div className="relative h-36 w-36">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 128 128" aria-hidden>
              <circle cx="64" cy="64" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="10" />
              <circle
                cx="64"
                cy="64"
                r={radius}
                fill="none"
                stroke="#2563eb"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                style={{ transition: 'stroke-dashoffset 0.35s ease' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-gray-900">{Math.round(progress)}%</span>
              {running && <Loader2 size={16} className="mt-1 animate-spin text-primary" />}
            </div>
          </div>
          <p className="mt-4 text-center text-sm font-medium text-gray-700">{status}</p>
          {error ? (
            <p className="mt-2 text-center text-sm text-red-600">{error}</p>
          ) : (
            <p className="mt-2 text-center text-xs text-gray-500">
              Includes assessment, care plan, insurance intake, EVV (if any), and insurance documents.
            </p>
          )}
        </div>

        <div className="mt-2 flex justify-end gap-2">
          {error ? (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover"
            >
              Close
            </button>
          ) : (
            <button
              type="button"
              disabled={running}
              onClick={onClose}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              <Download size={16} />
              {running ? 'Working…' : 'Cancel'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
