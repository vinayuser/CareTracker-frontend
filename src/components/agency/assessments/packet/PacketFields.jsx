import DigitalSignaturePad from '../../../ui/DigitalSignaturePad';

export const inputClass =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20';

export function Field({ label, children, className = '' }) {
  return (
    <label className={`block ${className}`}>
      {label ? <span className="mb-1 block text-xs font-medium text-gray-600">{label}</span> : null}
      {children}
    </label>
  );
}

export function SectionCard({ title, children, subtitle }) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 border-b border-gray-100 pb-3">
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        {subtitle ? <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p> : null}
      </div>
      {children}
    </section>
  );
}

export function CheckboxRow({ options, value = [], onChange, columns = 2 }) {
  const selected = Array.isArray(value) ? value : [];
  const toggle = (opt) => {
    if (selected.includes(opt)) onChange(selected.filter((v) => v !== opt));
    else onChange([...selected, opt]);
  };
  return (
    <div className={`grid gap-2 ${columns === 3 ? 'sm:grid-cols-3' : columns === 1 ? 'grid-cols-1' : 'sm:grid-cols-2'}`}>
      {options.map((opt) => (
        <label key={opt} className="flex items-start gap-2 text-sm text-gray-700">
          <input type="checkbox" className="mt-0.5" checked={selected.includes(opt)} onChange={() => toggle(opt)} />
          <span>{opt}</span>
        </label>
      ))}
    </div>
  );
}

export function RadioRow({ options, value, onChange, name }) {
  return (
    <div className="flex flex-wrap gap-3">
      {options.map((opt) => (
        <label key={opt} className="inline-flex items-center gap-1.5 text-sm text-gray-700">
          <input type="radio" name={name} checked={value === opt} onChange={() => onChange(opt)} />
          {opt}
        </label>
      ))}
    </div>
  );
}

export function YnRRow({ label, value, onChange }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-50 py-1.5 text-sm">
      <span className="text-gray-700">{label}</span>
      <div className="flex gap-3">
        {['Y', 'N', 'R'].map((opt) => (
          <label key={opt} className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600">
            <input type="radio" checked={value === opt} onChange={() => onChange(opt)} />
            {opt}
          </label>
        ))}
      </div>
    </div>
  );
}

export function SignatureBlock({
  title = 'Signature',
  value = {},
  onChange,
  showRelationship = false,
}) {
  const patch = (p) => onChange({ ...value, ...p });
  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50/60 p-3">
      <p className="mb-2 text-sm font-semibold text-gray-800">{title}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <DigitalSignaturePad
            label="Signature"
            value={value.signature || ''}
            onChange={(signature) => patch({ signature })}
          />
        </div>
        <Field label="Print Name">
          <input className={inputClass} value={value.printedName || ''} onChange={(e) => patch({ printedName: e.target.value })} />
        </Field>
        <Field label="Date">
          <input type="date" className={inputClass} value={value.date || ''} onChange={(e) => patch({ date: e.target.value })} />
        </Field>
        {showRelationship ? (
          <Field label="Relationship" className="sm:col-span-2">
            <input className={inputClass} value={value.relationship || ''} onChange={(e) => patch({ relationship: e.target.value })} />
          </Field>
        ) : null}
      </div>
    </div>
  );
}

export function LegalText({ children }) {
  return <div className="space-y-2 text-sm leading-relaxed text-gray-700">{children}</div>;
}
