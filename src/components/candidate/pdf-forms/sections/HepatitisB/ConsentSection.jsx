import React from 'react';
import CandidateSignatureField from '../../CandidateSignatureField';
import { fieldInputErr, fieldInputOk } from '../../../../../utils/candidateFormPrefill';

const PROOF_KEY = 'Medical proof of vaccination  Proof of immunity Attach results';

function FieldError({ message }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-600">{message}</p>;
}

const ConsentSection = ({
  formData,
  errors = {},
  onInputChange,
  onCheckboxChange,
  signatureDataUrl,
  onSignatureChange,
}) => {
  const cls = (field) => (errors[field] ? fieldInputErr : fieldInputOk);

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4">Hepatitis B Vaccine Consent</h3>

      <div className="mb-6 p-4 border border-gray-300 rounded bg-gray-50">
        <h4 className="text-md font-semibold text-gray-800 mb-2">Important Information:</h4>
        <p className="text-sm text-gray-700 mb-3">
          I understand that due to my occupational exposure to blood or other potentially infectious materials,
          I may be at risk of acquiring hepatitis B virus (HBV) infection. I have been given the opportunity
          to be vaccinated with Hepatitis B vaccine, at no charge to myself.
        </p>
      </div>

      <div className={`space-y-6 ${errors.consentChoice ? 'rounded-md ring-2 ring-red-400 p-3' : ''}`}>
        <FieldError message={errors.consentChoice} />

        <div className="p-4 border border-gray-300 rounded">
          <div className="flex items-start">
            <input
              type="checkbox"
              id="consent-to-vaccine"
              checked={formData['I elect to receive the Hepatitis B vaccine']}
              onChange={(e) => onCheckboxChange('I elect to receive the Hepatitis B vaccine', e.target.checked)}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="consent-to-vaccine" className="ml-3 block">
              <span className="text-sm font-medium text-gray-700">I elect to receive the Hepatitis B vaccine.</span>
              <p className="mt-1 text-sm text-gray-600">
                Select this option if you consent to receive the Hepatitis B vaccine series.
              </p>
            </label>
          </div>
        </div>

        <div className="p-4 border border-gray-300 rounded">
          <div className="flex items-start">
            <input
              type="checkbox"
              id="already-vaccinated"
              checked={formData['I have received the Hepatitis B Vaccine Series']}
              onChange={(e) => onCheckboxChange('I have received the Hepatitis B Vaccine Series', e.target.checked)}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="already-vaccinated" className="ml-3 block">
              <span className="text-sm font-medium text-gray-700">I have received the Hepatitis B Vaccine Series.</span>
              <p className="mt-1 text-sm text-gray-600">
                Select this option if you have already completed the Hepatitis B vaccine series.
              </p>
            </label>
          </div>

          {formData['I have received the Hepatitis B Vaccine Series'] && (
            <div className="mt-4 pl-7">
              <label className="block text-sm font-medium text-gray-700 mb-2">Vaccination Dates *</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {['Dates1', 'Dates2', 'Dates3'].map((field, idx) => (
                  <div key={field}>
                    <label className="block text-xs text-gray-500 mb-1">{`Date #${idx + 1}`}</label>
                    <input
                      type="date"
                      value={formData[field] || ''}
                      onChange={(e) => onInputChange(field, e.target.value)}
                      className={cls(field === 'Dates1' ? 'Dates1' : field)}
                    />
                    {field === 'Dates1' ? <FieldError message={errors.Dates1} /> : null}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-3 pl-7">
            <div className="flex items-start">
              <input
                type="checkbox"
                id="proof-of-immunity"
                checked={formData[PROOF_KEY]}
                onChange={(e) => onCheckboxChange(PROOF_KEY, e.target.checked)}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="proof-of-immunity" className="ml-3 block">
                <span className="text-sm font-medium text-gray-700">
                  Medical proof of vaccination / Proof of immunity (Attach results.)
                </span>
                <p className="mt-1 text-sm text-gray-600">
                  Check this box if you have attached proof of immunity or vaccination records.
                </p>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h4 className="text-md font-semibold text-gray-800 mb-4">Signature & Date *</h4>
        <CandidateSignatureField
          label="Employee Signature *"
          dateLabel="Date *"
          dateValue={formData.Date || ''}
          onDateChange={(v) => onInputChange('Date', v)}
          signatureDataUrl={signatureDataUrl}
          onSignatureChange={onSignatureChange}
          dateError={errors.Date}
          signatureError={errors['Signature124_es_:signer:signature'] || errors.Signature}
        />
      </div>
    </div>
  );
};

export default ConsentSection;
