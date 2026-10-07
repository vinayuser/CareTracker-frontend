import CandidateSignatureField from '../../CandidateSignatureField';
import { fieldInputErr, fieldInputOk } from '../../../../../utils/candidateFormPrefill';

function FieldError({ message }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-600">{message}</p>;
}

const SignatureSection = ({
  formData,
  errors = {},
  onInputChange,
  signatureDataUrl,
  onSignatureChange,
}) => {
  const sigKey = 'Signature30_es_:signer:signature';

  return (
    <div className="mb-8">
      <h3 className="mb-4 text-lg font-semibold">Signature & Verification</h3>

      <div className="mb-6">
        <CandidateSignatureField
          label="Employee Signature *"
          dateLabel="Date *"
          dateValue={formData.Date || ''}
          onDateChange={(v) => onInputChange('Date', v)}
          signatureDataUrl={signatureDataUrl}
          onSignatureChange={onSignatureChange}
          dateError={errors.Date}
          signatureError={errors[sigKey]}
        />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Print Name *</label>
          <input
            type="text"
            value={formData['Print Name'] || ''}
            onChange={(e) => onInputChange('Print Name', e.target.value)}
            className={errors['Print Name'] ? fieldInputErr : fieldInputOk}
            placeholder="Type your full name"
          />
          <FieldError message={errors['Print Name']} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Position with Company *</label>
          <input
            type="text"
            value={formData['Position with Company'] || ''}
            onChange={(e) => onInputChange('Position with Company', e.target.value)}
            className={errors['Position with Company'] ? fieldInputErr : fieldInputOk}
            placeholder="Your position/title"
          />
          <FieldError message={errors['Position with Company']} />
        </div>
      </div>

      <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
        <h4 className="mb-3 font-medium text-gray-700">Verification (Optional)</h4>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Verified by</label>
            <input
              type="text"
              value={formData['Verified by'] || ''}
              onChange={(e) => onInputChange('Verified by', e.target.value)}
              className={fieldInputOk}
              placeholder="Manager or HR representative name"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              value={formData.Date_2 || ''}
              onChange={(e) => onInputChange('Date_2', e.target.value)}
              className={fieldInputOk}
            />
          </div>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          This section is typically completed by management or HR during the onboarding process.
        </p>
      </div>

      <div className="mt-6 border-t border-gray-200 p-3">
        <p className="text-xs text-gray-500">1201/MC-Rev.0623 ©CareTraker All Rights Reserved</p>
      </div>
    </div>
  );
};

export default SignatureSection;
