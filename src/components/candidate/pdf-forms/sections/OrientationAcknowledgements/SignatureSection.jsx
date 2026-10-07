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
  const sigKey = 'Signature31_es_:signer:signature';

  return (
    <div className="mb-8">
      <h3 className="mb-4 text-lg font-semibold">Signature & Information</h3>

      <div className="mb-6">
        <CandidateSignatureField
          label="Employee Signature *"
          showDate={false}
          signatureDataUrl={signatureDataUrl}
          onSignatureChange={onSignatureChange}
          signatureError={errors[sigKey]}
        />
      </div>

      <div className="mb-6">
        <h4 className="mb-3 font-medium text-gray-700">Employee Information</h4>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Printed Name *</label>
            <input
              type="text"
              value={formData['Printed Name'] || ''}
              onChange={(e) => onInputChange('Printed Name', e.target.value)}
              className={errors['Printed Name'] ? fieldInputErr : fieldInputOk}
              placeholder="Type your full name"
            />
            <FieldError message={errors['Printed Name']} />
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
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Today&apos;s Date *</label>
            <input
              type="date"
              value={formData['Todays Date'] || ''}
              onChange={(e) => onInputChange('Todays Date', e.target.value)}
              className={errors['Todays Date'] ? fieldInputErr : fieldInputOk}
            />
            <FieldError message={errors['Todays Date']} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Start Date (if known)</label>
            <input
              type="date"
              value={formData['Start Date'] || ''}
              onChange={(e) => onInputChange('Start Date', e.target.value)}
              className={fieldInputOk}
            />
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-gray-200 bg-blue-50 p-3">
        <p className="text-sm text-blue-700">
          <strong>Note:</strong> All 23 orientation topics and their corresponding initials are shown in the
          &quot;Content &amp; Initials&quot; section. Please provide initials for all topics before proceeding.
        </p>
      </div>

      <div className="mt-6 border-t border-gray-200 p-3">
        <p className="text-xs text-gray-500">1202/MC-Rev.0118 ©CareTraker All Rights Reserved</p>
      </div>
    </div>
  );
};

export default SignatureSection;
