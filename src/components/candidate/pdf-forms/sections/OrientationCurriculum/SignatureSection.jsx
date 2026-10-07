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
  const sigKey = 'Signature1_es_:signer:signature';

  return (
    <div className="mb-8">
      <h3 className="mb-4 text-lg font-semibold">Signature & Employee Information</h3>

      <div className="mb-6 rounded border border-gray-300 bg-gray-50 p-4">
        <h4 className="mb-2 text-md font-semibold text-gray-800">Orientation Completion Summary:</h4>
        <p className="text-sm text-gray-700">
          By signing below, you acknowledge completion of all required orientation topics and videos as indicated
          in the previous sections.
        </p>
      </div>

      <div className="mb-6">
        <h4 className="mb-3 text-md font-semibold text-gray-800">Employee Information</h4>
        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Print Name *</label>
            <input
              type="text"
              value={formData['Print Name'] || ''}
              onChange={(e) => onInputChange('Print Name', e.target.value)}
              className={errors['Print Name'] ? fieldInputErr : fieldInputOk}
              placeholder="Your full name"
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
              placeholder="e.g., Care Associate, CNA"
            />
            <FieldError message={errors['Position with Company']} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Start Date</label>
            <input
              type="date"
              value={formData['Start Date'] || ''}
              onChange={(e) => onInputChange('Start Date', e.target.value)}
              className={fieldInputOk}
            />
          </div>
        </div>
      </div>

      <div className="mb-6">
        <CandidateSignatureField
          label="Employee Signature *"
          dateLabel="Signature Date *"
          dateValue={formData.Date || ''}
          onDateChange={(v) => onInputChange('Date', v)}
          signatureDataUrl={signatureDataUrl}
          onSignatureChange={onSignatureChange}
          dateError={errors.Date}
          signatureError={errors[sigKey]}
        />
      </div>

      <div className="mt-6 border-t border-gray-200 p-3">
        <p className="text-center text-xs text-gray-500">1203MC-Rev.0323-TX ©CareTraker All Rights Reserved</p>
      </div>
    </div>
  );
};

export default SignatureSection;
