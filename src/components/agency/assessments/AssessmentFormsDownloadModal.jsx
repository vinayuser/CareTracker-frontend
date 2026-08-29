import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Download, Loader2, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { fetchAssessment } from '../../../redux/slices/assessmentsSlice';
import { mergePacketForms } from '../../../utils/assessmentPacket';
import { downloadAssessmentPacketZip } from '../../../utils/assessmentPacketDownload';

function errorMessage(err) {
  if (!err) return 'Failed to download assessment forms';
  if (typeof err === 'string') return err;
  return err.message || err.payload?.message || 'Failed to download assessment forms';
}

export default function AssessmentFormsDownloadModal({ open, assessment, onClose }) {
  const dispatch = useDispatch();
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Starting…');
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');
  const startedForKey = useRef(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open || !assessment) return undefined;

    const runKey = assessment.id || assessment.assessmentCode || 'draft';
    if (startedForKey.current === runKey) return undefined;
    startedForKey.current = runKey;

    let cancelled = false;
    const run = async () => {
      setRunning(true);
      setError('');
      setProgress(2);
      setStatus('Loading assessment data…');

      try {
        let forms = assessment.formData?.forms;
        if (!forms && assessment.id) {
          const data = await dispatch(fetchAssessment(assessment.id)).unwrap();
          forms = data.formData?.forms;
        }
        if (cancelled) return;

        setProgress(5);
        setStatus('Preparing official PDF templates…');

        const basename = assessment.assessmentCode
          || (assessment.id ? `assessment-${assessment.id}` : 'assessment-packet');

        await downloadAssessmentPacketZip(
          mergePacketForms(forms || {}),
          basename,
          (pct, label) => {
            if (cancelled) return;
            setProgress(Math.max(0, Math.min(100, pct)));
            if (label) setStatus(label);
          },
        );

        if (cancelled) return;
        toast.success('Assessment forms downloaded');
        onCloseRef.current?.();
      } catch (err) {
        if (cancelled) return;
        const message = errorMessage(err);
        setError(message);
        setStatus('Download failed');
        toast.error(message);
      } finally {
        if (!cancelled) setRunning(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [open, assessment, dispatch]);

  useEffect(() => {
    if (!open) {
      startedForKey.current = null;
      setProgress(0);
      setStatus('Starting…');
      setError('');
      setRunning(false);
    }
  }, [open]);

  if (!open || !assessment) return null;

  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;
  const subtitle = [
    assessment.clientName,
    assessment.assessmentCode,
  ].filter(Boolean).join(' · ') || 'Assessment packet';

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Preparing assessment forms</h2>
            <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
            <p className="mt-1 text-xs text-gray-400">
              Filled official PDF templates for every form in the packet.
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
              Includes each form as a separate PDF plus one combined file in a ZIP.
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
