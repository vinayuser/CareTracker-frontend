const labelClass = 'mb-1.5 block text-sm font-medium text-gray-700';
const MAX_BYTES = 2 * 1024 * 1024;

export default function AssessorPhotoUpload({
  label = 'Assessor Photo',
  value = '',
  onChange,
  className = '',
  shape = 'circle',
}) {
  const isSquare = shape === 'square';
  const photoClass = isSquare
    ? 'h-28 w-24 shrink-0 rounded-sm border-2 border-violet-200 object-cover shadow-sm'
    : 'h-20 w-20 shrink-0 rounded-full border-2 border-gray-200 object-cover shadow-sm';
  const emptyClass = isSquare
    ? 'flex h-28 w-24 shrink-0 items-center justify-center rounded-sm border-2 border-dashed border-violet-300 bg-violet-50 text-center text-[10px] leading-tight text-violet-400'
    : 'flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-gray-300 bg-gray-50 text-center text-[10px] leading-tight text-gray-400';

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    if (file.size > MAX_BYTES) {
      window.alert('Image must be smaller than 2 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className={className}>
      {label && <p className={labelClass}>{label}</p>}
      <div className={`flex items-center ${isSquare ? 'flex-col gap-2' : 'gap-4'}`}>
        {value ? (
          <img src={value} alt="Assessor" className={photoClass} />
        ) : (
          <div className={emptyClass}>
            {isSquare ? 'Photo' : 'No photo'}
          </div>
        )}
        <div className={`flex flex-col gap-2 ${isSquare ? 'w-full' : ''}`}>
          <label className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Upload photo
            <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleFile} />
          </label>
          {value && (
            <button type="button" onClick={() => onChange('')} className="text-left text-xs font-medium text-red-600 hover:underline">
              Remove photo
            </button>
          )}
        </div>
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
