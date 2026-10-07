import { useRef, useState } from 'react';
import { toast } from 'react-toastify';
import DigitalSignaturePad from '../../../ui/DigitalSignaturePad';
import { uploadAssessmentSignature } from '../../../../utils/assessmentSignatures';
import { RELATIONSHIPS } from '../../../../utils/leadForm';

export const inputClass =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20';

export const readOnlyInputClass =
  'w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700';

/** Max length for single-line text fields across assessment packet forms. */
export const PACKET_MAX_INPUT = 40;
/** Max length for description / textarea fields across assessment packet forms. */
export const PACKET_MAX_TEXTAREA = 100;

const SKIP_MAX_TYPES = new Set(['date', 'time', 'datetime-local', 'checkbox', 'radio', 'file', 'hidden', 'number']);

/** Single-line packet input — defaults to max 40 characters (except date/time/checkbox). */
export function PacketInput({
  type = 'text',
  maxLength,
  className = inputClass,
  ...rest
}) {
  const skipMax = SKIP_MAX_TYPES.has(type);
  const limit = skipMax ? undefined : (maxLength ?? PACKET_MAX_INPUT);
  return <input type={type} className={className} maxLength={limit} {...rest} />;
}

/** Multi-line packet field — defaults to max 100 characters. */
export function PacketTextarea({
  maxLength = PACKET_MAX_TEXTAREA,
  className = inputClass,
  ...rest
}) {
  return <textarea className={className} maxLength={maxLength} {...rest} />;
}

export function ReadOnlyClientGrid({
  clientName = '',
  dob = '',
  className = '',
}) {
  return (
    <div className={`grid gap-3 sm:grid-cols-2 ${className}`}>
      <Field label="Client Name">
        <input readOnly disabled className={readOnlyInputClass} value={clientName} tabIndex={-1} />
      </Field>
      <Field label="DOB">
        <input readOnly disabled type="date" className={readOnlyInputClass} value={dob} tabIndex={-1} />
      </Field>
    </div>
  );
}

export function ReadOnlyClientFields({
  clientName = '',
  dob = '',
  subtitle = 'Auto-filled from the client record. Client details cannot be edited on assessment forms.',
}) {
  return (
    <SectionCard title="Client Information" subtitle={subtitle}>
      <ReadOnlyClientGrid clientName={clientName} dob={dob} />
    </SectionCard>
  );
}

export function Field({ label, children, className = '', error }) {
  // Use a div (not <label>) so nested radios/checkboxes with their own labels work correctly.
  return (
    <div className={`block ${className}`}>
      {label ? <span className="mb-1 block text-xs font-medium text-gray-600">{label}</span> : null}
      {children}
      {error ? <span className="mt-1 block text-xs text-red-600">{error}</span> : null}
    </div>
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
  lockPrintedName = false,
}) {
  const patch = (p) => onChange({ ...value, ...p });
  const [uploading, setUploading] = useState(false);
  const uploadToken = useRef(0);

  const onSignature = async (signature) => {
    const token = uploadToken.current + 1;
    uploadToken.current = token;
    if (!signature?.startsWith?.('data:image')) {
      patch({ signature: signature || '' });
      return;
    }
    setUploading(true);
    try {
      const url = await uploadAssessmentSignature(signature);
      if (uploadToken.current !== token) return;
      patch({ signature: url });
    } catch {
      if (uploadToken.current !== token) return;
      toast.error('Could not upload signature. Try again before saving.');
      patch({ signature });
    } finally {
      if (uploadToken.current === token) setUploading(false);
    }
  };

  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50/60 p-3">
      <p className="mb-2 text-sm font-semibold text-gray-800">{title}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <DigitalSignaturePad
            label="Signature"
            value={value.signature || ''}
            onChange={onSignature}
          />
          {uploading ? <p className="mt-1 text-xs text-gray-500">Uploading signature…</p> : null}
        </div>
        <Field label="Print Name">
          <PacketInput
            readOnly={lockPrintedName}
            disabled={lockPrintedName}
            className={lockPrintedName ? readOnlyInputClass : inputClass}
            value={value.printedName || ''}
            onChange={(e) => patch({ printedName: e.target.value })}
            tabIndex={lockPrintedName ? -1 : undefined}
          />
        </Field>
        <Field label="Date">
          <PacketInput type="date" className={inputClass} value={value.date || ''} onChange={(e) => patch({ date: e.target.value })} />
        </Field>
        {showRelationship ? (
          <Field label="Relationship" className="sm:col-span-2">
            <select
              className={inputClass}
              value={value.relationship || ''}
              onChange={(e) => patch({ relationship: e.target.value })}
            >
              <option value="">Select relationship</option>
              {RELATIONSHIPS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
              {value.relationship && !RELATIONSHIPS.includes(value.relationship) ? (
                <option value={value.relationship}>{value.relationship}</option>
              ) : null}
            </select>
          </Field>
        ) : null}
      </div>
    </div>
  );
}

export function LegalText({ children }) {
  return <div className="space-y-2 text-sm leading-relaxed text-gray-700">{children}</div>;
}
