import React from 'react';
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
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-4">Signature & Date</h3>

      <div className="mb-4 max-w-md">
        <label className="block text-sm font-medium text-gray-700 mb-1">Print Name *</label>
        <input
          type="text"
          value={formData['Print Name'] || ''}
          onChange={(e) => onInputChange('Print Name', e.target.value)}
          className={errors['Print Name'] ? fieldInputErr : fieldInputOk}
          placeholder="Type your full name"
        />
        <FieldError message={errors['Print Name']} />
      </div>

      <CandidateSignatureField
        label="Employee Signature *"
        dateLabel="Date *"
        dateValue={formData.Date || ''}
        onDateChange={(v) => onInputChange('Date', v)}
        signatureDataUrl={signatureDataUrl}
        onSignatureChange={onSignatureChange}
        dateError={errors.Date}
        signatureError={errors['Signature131_es_:signer:signature']}
      />

      <div className="mt-6 p-3 bg-gray-50 rounded-md text-sm">
        <p className="text-gray-700 mb-2">
          <strong>Confirmation:</strong> By signing, I confirm that the information I have checked and provided is correct.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="font-medium">Print Name:</span>
            <span className="ml-2 text-blue-600">{formData['Print Name'] || 'Not set'}</span>
          </div>
          <div>
            <span className="font-medium">Date:</span>
            <span className="ml-2 text-blue-600">{formData.Date || 'Not set'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignatureSection;
