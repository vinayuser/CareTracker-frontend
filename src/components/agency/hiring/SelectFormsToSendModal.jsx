import { useEffect, useState } from 'react';
import { CheckSquare, Square, X } from 'lucide-react';

/**
 * Let HR / agency owner pick which stage forms to email the candidate.
 * documents: [{ code, name, is_required }]
 */
export default function SelectFormsToSendModal({
  open,
  onClose,
  onConfirm,
  title = 'Select forms to send',
  stageName = '',
  candidateName = '',
  documents = [],
  confirmLabel = 'Send & continue',
  allowSkip = true,
  submitting = false,
}) {
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    if (!open) return;
    setSelected((documents || []).map((d) => d.code));
  }, [open, documents]);

  if (!open) return null;

  const allSelected = documents.length > 0 && selected.length === documents.length;
  const toggle = (code) => {
    setSelected((prev) => (prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]));
  };
  const toggleAll = () => {
    setSelected(allSelected ? [] : documents.map((d) => d.code));
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <button type="button" aria-label="Close" className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="mt-0.5 text-xs text-gray-500">
              {candidateName && <span>{candidateName}</span>}
              {candidateName && stageName && <span> · </span>}
              {stageName && <span>Stage: {stageName}</span>}
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <p className="mb-3 text-sm text-gray-600">
            Choose which forms the candidate should fill. Only selected forms will appear in their email link.
          </p>

          {documents.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-500">No forms configured for this stage.</p>
          ) : (
            <>
              <button
                type="button"
                onClick={toggleAll}
                className="mb-3 flex items-center gap-2 text-xs font-medium text-primary hover:underline"
              >
                {allSelected ? <CheckSquare size={14} /> : <Square size={14} />}
                {allSelected ? 'Deselect all' : 'Select all'}
              </button>
              <div className="space-y-2">
                {documents.map((doc) => {
                  const checked = selected.includes(doc.code);
                  return (
                    <label
                      key={doc.code}
                      className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 transition-colors ${
                        checked ? 'border-primary/40 bg-primary/5' : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        checked={checked}
                        onChange={() => toggle(doc.code)}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-gray-900">{doc.name}</span>
                        <span className="text-xs text-gray-500">
                          {doc.is_required ? 'Required on stage' : 'Optional on stage'}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-gray-200 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          {allowSkip && documents.length > 0 && (
            <button
              type="button"
              disabled={submitting}
              onClick={() => onConfirm([])}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            >
              Continue without forms
            </button>
          )}
          <button
            type="button"
            disabled={submitting || (documents.length > 0 && selected.length === 0)}
            onClick={() => onConfirm(selected)}
            className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
          >
            {submitting ? 'Working...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
