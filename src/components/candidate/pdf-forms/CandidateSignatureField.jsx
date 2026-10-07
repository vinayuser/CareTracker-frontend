import DigitalSignaturePad from '../../ui/DigitalSignaturePad';
import { fieldInputErr, fieldInputOk } from '../../../utils/candidateFormPrefill';

function FieldError({ message }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-600">{message}</p>;
}

/**
 * Shared candidate hiring signature: draw pad + signature date (defaults to today).
 */
export default function CandidateSignatureField({
  label = 'Signature *',
  dateLabel = 'Signature Date *',
  dateValue = '',
  onDateChange,
  signatureDataUrl = '',
  onSignatureChange,
  dateError,
  signatureError,
  dateReadOnly = false,
  showDate = true,
}) {
  return (
    <div className="space-y-4">
      {showDate ? (
        <div className="max-w-xs">
          <label className="mb-1 block text-sm font-medium text-gray-700">{dateLabel}</label>
          <input
            type="date"
            value={dateValue || ''}
            onChange={(e) => onDateChange?.(e.target.value)}
            readOnly={dateReadOnly}
            className={`${dateError ? fieldInputErr : fieldInputOk}${dateReadOnly ? ' bg-slate-50' : ''}`}
          />
          <FieldError message={dateError} />
        </div>
      ) : null}

      <div className={signatureError ? 'rounded-xl ring-2 ring-red-400' : ''}>
        <DigitalSignaturePad
          label={label}
          value={signatureDataUrl || ''}
          onChange={onSignatureChange}
        />
      </div>
      <FieldError message={signatureError} />
    </div>
  );
}
