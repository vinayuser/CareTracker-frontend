import { useState } from 'react';
import { ImagePlus, Trash2 } from 'lucide-react';
import { getImageUploadError, IMAGE_UPLOAD_HINT } from '../../utils/imageUploadValidation';

const labelClass = 'mb-1.5 block text-sm font-medium text-gray-700';

export default function AssessorPhotoUpload({
  label = 'Assessor Photo',
  value = '',
  onChange,
  className = '',
  shape = 'circle',
  /** `stack` = photo above controls (narrow columns); `row` = side-by-side */
  layout = 'row',
  readOnly = false,
  uploadLabel,
  hint = '',
}) {
  const [error, setError] = useState('');
  const isSquare = shape === 'square';
  const isStack = layout === 'stack';
  const actionLabel = uploadLabel || (value ? 'Change photo' : 'Upload photo');

  const previewShell = isSquare
    ? 'relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50'
    : 'relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-50';

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const message = getImageUploadError(file);
    if (message) {
      setError(message);
      return;
    }
    setError('');
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result);
    reader.readAsDataURL(file);
  };

  return (
    <div className={className}>
      {label ? <p className={labelClass}>{label}</p> : null}

      <div className={isStack ? 'flex flex-col items-center gap-3' : 'flex flex-wrap items-start gap-4'}>
        <div className={previewShell}>
          {value ? (
            <img
              src={value}
              alt={label || 'Uploaded'}
              className={isSquare ? 'h-full w-full object-contain p-1.5' : 'h-full w-full object-cover'}
            />
          ) : (
            <div className="flex flex-col items-center gap-1 text-slate-400">
              <ImagePlus size={isSquare ? 22 : 18} strokeWidth={1.5} />
              <span className="text-[10px] font-medium">{isSquare ? 'Logo' : 'Photo'}</span>
            </div>
          )}
        </div>

        {!readOnly ? (
          <div className={isStack ? 'w-full text-center' : 'min-w-[12rem] flex-1 pt-0.5'}>
            <div className={`flex flex-wrap items-center gap-2 ${isStack ? 'justify-center' : ''}`}>
              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50">
                <ImagePlus size={15} className="text-slate-500" />
                {actionLabel}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={handleFile}
                />
              </label>
              {value ? (
                <button
                  type="button"
                  onClick={() => {
                    setError('');
                    onChange('');
                  }}
                  className="inline-flex items-center gap-1 rounded-lg px-2.5 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                >
                  <Trash2 size={14} />
                  Remove
                </button>
              ) : null}
            </div>
            <p className={`mt-2 text-xs text-slate-500 ${isStack ? 'leading-snug' : ''}`}>{IMAGE_UPLOAD_HINT}</p>
            {hint ? <p className="mt-0.5 text-xs text-slate-500">{hint}</p> : null}
            {error ? <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p> : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function AssessorDetailCell({ name, title, photo, fallbackTitle = 'Care Assessment Specialist' }) {
  const displayName = name?.trim() || '—';
  const displayTitle = title?.trim() || fallbackTitle;
  return (
    <div className="flex items-center gap-3">
      {photo ? (
        <img src={photo} alt={displayName} className="h-10 w-10 shrink-0 rounded-full border border-gray-200 object-cover" />
      ) : (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-400">
          {displayName !== '—' ? displayName.charAt(0).toUpperCase() : '?'}
        </div>
      )}
      <div className="min-w-0">
        <p className="truncate font-medium text-gray-900">{displayName}</p>
        <p className="truncate text-xs text-gray-500">{displayTitle}</p>
      </div>
    </div>
  );
}
