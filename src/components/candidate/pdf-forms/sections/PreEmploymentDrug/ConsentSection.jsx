import React from 'react';
import SignatureCanvas from 'react-signature-canvas';
import CandidateSignatureField from '../../CandidateSignatureField';
import { fieldInputErr, fieldInputOk } from '../../../../../utils/candidateFormPrefill';

function FieldError({ message }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-600">{message}</p>;
}

const ConsentSection = ({
  formData,
  errors = {},
  onInputChange,
  applicantSignatureUrl,
  witnessSignatureUrl,
  onApplicantSignatureChange,
  onWitnessSignatureEnd,
  onClearWitnessSignature,
  witnessSigCanvasRef,
  activeSignature,
  setActiveSignature,
}) => {
  const cls = (field) => (errors[field] ? fieldInputErr : fieldInputOk);

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4">Consent & Release Form</h3>

      <div className="mb-6 p-4 border border-gray-300 rounded bg-gray-50 max-h-60 overflow-y-auto">
        <h4 className="text-md font-semibold text-gray-800 mb-3">Consent Statement:</h4>
        <div className="text-sm text-gray-700 space-y-3">
          <p>
            I hereby consent to submit to a drug or alcohol test and to furnish a sample of my urine,
            mouth swab, breath, and/or blood for analysis, as shall be determined by <strong>CareTraker</strong>,
            in order to meet with their policy regarding the selection of applicants for employment.
          </p>
          <p>
            I further authorize and give full permission to have <strong>CareTraker</strong> and/or its authorized
            agents and physicians to send the specimen or specimens so collected to a laboratory for a screening
            test for the presence of any prohibited substances under the policy, and for the laboratory or other
            testing facility to release any and all documentation relating to such test to the Company.
            I further agree to and hereby authorize the release of the results of said tests to the Company.
          </p>
          <p>
            I understand that it is the current use of illegal drugs that would prohibit me from being
            employed at CareTraker.
          </p>
          <p>
            I further agree to hold harmless <strong>CareTraker</strong>, and its agents and physicians from any
            liability arising in whole or part, out of the collection of specimens, testing, and use of the
            information from said testing in connection with <strong>CareTraker</strong>, consideration of my
            application of employment.
          </p>
          <p>
            I further agree that a reproduced copy of this pre-employment consent and release form shall have
            the same force and effect as the original.
          </p>
          <p>
            I have carefully read the foregoing and fully understand its contents. I acknowledge that my
            signing of this consent and release form is a voluntary act on my part and that I have not been
            coerced into signing this document by anyone.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
          <h4 className="text-md font-semibold text-blue-800 mb-4">Applicant Information</h4>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Print Name *</label>
              <input
                type="text"
                value={formData['Print Name'] || ''}
                onChange={(e) => onInputChange('Print Name', e.target.value)}
                className={cls('Print Name')}
                placeholder="Enter your printed name"
              />
              <FieldError message={errors['Print Name']} />
            </div>

            <CandidateSignatureField
              label="Applicant Signature *"
              dateLabel="Date *"
              dateValue={formData.Date || ''}
              onDateChange={(v) => onInputChange('Date', v)}
              signatureDataUrl={applicantSignatureUrl}
              onSignatureChange={onApplicantSignatureChange}
              dateError={errors.Date}
              signatureError={errors['Signature134_es_:signer:signature']}
            />
          </div>
        </div>

        <div className="p-4 border border-green-200 rounded-lg bg-green-50">
          <h4 className="text-md font-semibold text-green-800 mb-4">Witness Information</h4>
          <p className="text-xs text-gray-600 mb-3">Optional — may be completed at the testing site.</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Print Name</label>
              <input
                type="text"
                value={formData['Print Name_2'] || ''}
                onChange={(e) => onInputChange('Print Name_2', e.target.value)}
                className={fieldInputOk}
                placeholder="Enter witness printed name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={formData['Date_2'] || ''}
                onChange={(e) => onInputChange('Date_2', e.target.value)}
                className={fieldInputOk}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">Signature</label>
                <button
                  type="button"
                  onClick={onClearWitnessSignature}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Clear Signature
                </button>
              </div>
              <div
                className={`border rounded-md overflow-hidden bg-white cursor-pointer ${activeSignature === 'witness' ? 'ring-2 ring-green-500' : ''}`}
                onClick={() => setActiveSignature('witness')}
              >
                <SignatureCanvas
                  ref={witnessSigCanvasRef}
                  canvasProps={{
                    className: 'w-full h-32 bg-white',
                    style: { cursor: 'crosshair' },
                  }}
                  onEnd={onWitnessSignatureEnd}
                />
              </div>
              {witnessSignatureUrl && (
                <p className="mt-2 text-xs text-green-600">✓ Signature captured. Click canvas to edit.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 border border-gray-300 rounded">
        <h4 className="text-md font-semibold text-gray-800 mb-4">Test Information (For Office Use Only)</h4>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Results</label>
          <textarea
            value={formData.Results || ''}
            onChange={(e) => onInputChange('Results', e.target.value)}
            className={fieldInputOk}
            placeholder="Test results will be entered by authorized personnel"
            rows="3"
          />
        </div>
      </div>
    </div>
  );
};

export default ConsentSection;
