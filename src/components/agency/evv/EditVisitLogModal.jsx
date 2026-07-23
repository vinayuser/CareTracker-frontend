import { useEffect, useState } from 'react';
import { Pencil, X } from 'lucide-react';
import { formatTimezoneAbbr, toDateTimeLocalValue } from '../../../utils/visitTimezone';

const inputClass = 'w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15';
const labelClass = 'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500';

export default function EditVisitLogModal({
  open,
  row,
  saving = false,
  onClose,
  onSave,
}) {
  const [checkInAt, setCheckInAt] = useState('');
  const [checkOutAt, setCheckOutAt] = useState('');
  const [notes, setNotes] = useState('');
  const [approve, setApprove] = useState(false);
  const [clearLate, setClearLate] = useState(false);

  useEffect(() => {
    if (!open || !row) return;
    const tz = row.timezone;
    setCheckInAt(
      toDateTimeLocalValue(row.checkIn?.at || row.scheduledStartAt, tz),
    );
    setCheckOutAt(
      toDateTimeLocalValue(row.checkOut?.at || row.scheduledEndAt, tz),
    );
    setNotes(row.notes || '');
    setApprove(row.visitStatus === 'Missed' || row.approvalStatus === 'Pending' || row.canApprove);
    setClearLate(false);
  }, [open, row]);

  if (!open || !row) return null;

  const tzLabel = formatTimezoneAbbr(row.scheduledStartAt || row.checkIn?.at, row.timezone)
    || row.timezone
    || 'local';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!checkInAt || !checkOutAt) return;
    onSave?.({
      check_in_at: checkInAt,
      check_out_at: checkOutAt,
      notes,
      approve,
      clear_late: clearLate,
    });
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-5 py-4">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Edit visit log</h3>
            <p className="mt-0.5 text-sm text-gray-500">
              {row.client} · {row.caregiver} · {row.date}
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Times use schedule timezone ({tzLabel}). Missed visits can be corrected with actual times.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Check-in</label>
              <input
                type="datetime-local"
                required
                className={inputClass}
                value={checkInAt}
                onChange={(e) => setCheckInAt(e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Check-out</label>
              <input
                type="datetime-local"
                required
                className={inputClass}
                value={checkOutAt}
                onChange={(e) => setCheckOutAt(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Notes</label>
            <textarea
              rows={2}
              className={inputClass}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Reason for correction (optional)"
            />
          </div>

          <label className="flex items-start gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              className="mt-1 rounded border-gray-300 text-primary"
              checked={approve}
              onChange={(e) => setApprove(e.target.checked)}
            />
            <span>
              Approve after save
              <span className="block text-xs text-gray-500">
                Marks the corrected log as approved for billing / compliance.
              </span>
            </span>
          </label>

          {row.lateCheckIn || row.visitStatus === 'Exception' ? (
            <label className="flex items-start gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                className="mt-1 rounded border-gray-300 text-primary"
                checked={clearLate}
                onChange={(e) => setClearLate(e.target.checked)}
              />
              <span>
                Clear late / exception flag
                <span className="block text-xs text-gray-500">
                  Use when the corrected times are within the grace window.
                </span>
              </span>
            </label>
          ) : null}

          <div className="flex flex-wrap justify-end gap-2 border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !checkInAt || !checkOutAt}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-50"
            >
              <Pencil size={14} />
              {saving ? 'Saving…' : approve ? 'Save & Approve' : 'Save Log'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
