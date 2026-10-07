import React from 'react';
import CandidateSignatureField from '../../CandidateSignatureField';

function FieldError({ message }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-600">{message}</p>;
}

const DeclinationSection = ({
  formData,
  errors = {},
  onInputChange,
  onCheckboxChange,
  signatureDataUrl,
  onSignatureChange,
}) => {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4">Hepatitis B Vaccine Declination</h3>

      <div className="mb-6 p-4 border border-gray-300 rounded bg-gray-50">
        <h4 className="text-md font-semibold text-gray-800 mb-2">Declaration Statement:</h4>
        <p className="text-sm text-gray-700 mb-3">
          I understand that due to my occupational exposure to blood or other potentially infectious materials
          I may be at risk of acquiring hepatitis B virus (HBV) infection. I have been given the opportunity
          to be vaccinated with Hepatitis B vaccine, at no charge to myself. However, I elect to decline the
          Hepatitis B vaccination at this time.
        </p>
        <p className="text-sm text-gray-700">
          I understand that if in the future I continue to have occupational exposure to blood or other
          potentially infectious materials and I want to be vaccinated with Hepatitis B vaccine, I can receive
          the vaccination series at no charge to me.
        </p>
      </div>

      <div className={`p-4 border border-gray-300 rounded ${errors.consentChoice ? 'ring-2 ring-red-400' : ''}`}>
        <div className="flex items-start">
          <input
            type="checkbox"
            id="decline-vaccine"
            checked={formData['I decline the Hepatitis B Vaccine and understand I can receive it at any time in the future']}
            onChange={(e) => onCheckboxChange(
              'I decline the Hepatitis B Vaccine and understand I can receive it at any time in the future',
              e.target.checked,
            )}
            className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="decline-vaccine" className="ml-3 block">
            <span className="text-sm font-medium text-gray-700">
              I decline the Hepatitis B Vaccine and understand I can receive it at any time in the future.
            </span>
            <p className="mt-1 text-sm text-gray-600">
              By checking this box, you acknowledge that you are declining the vaccine now but can choose
              to receive it later at no cost.
            </p>
          </label>
        </div>
        <FieldError message={errors.consentChoice} />
      </div>

      <div className="mt-8">
        <h4 className="text-md font-semibold text-gray-800 mb-4">Signature & Date *</h4>
        <CandidateSignatureField
          label="Employee Signature *"
          dateLabel="Date *"
          dateValue={formData.Date_2 || ''}
          onDateChange={(v) => onInputChange('Date_2', v)}
          signatureDataUrl={signatureDataUrl}
          onSignatureChange={onSignatureChange}
          dateError={errors.Date_2}
          signatureError={errors['Signature125_es_:signer:signature'] || errors.Signature}
        />
      </div>
    </div>
  );
};

export default DeclinationSection;
