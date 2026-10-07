import React from 'react';
import CandidateSignatureField from '../../CandidateSignatureField';
import DigitalSignaturePad from '../../../../ui/DigitalSignaturePad';
import { fieldInputErr, fieldInputOk } from '../../../../../utils/candidateFormPrefill';

function FieldError({ message }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-600">{message}</p>;
}

const IssuanceSection = ({
  formData,
  errors = {},
  onInputChange,
  employeeSignatureUrl,
  managerSignatureUrl,
  onEmployeeSignatureChange,
  onManagerSignatureChange,
}) => {
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
    return dateString;
  };

  const getAgreementText = () => {
    const name = formData.EmployeeNameBlank || '[Employee Name]';
    return (
      <div className="text-sm text-gray-700 space-y-3">
        <p>
          I, <span className="font-semibold text-blue-600">{name}</span>, agree to accept this I.D. badge which is provided to me by CareTraker.
          I agree to maintain my I.D. badge in a well-kept condition.
        </p>
        <p>
          I also agree, that in the event that I leave my employment with CareTraker within 30 days,
          I will return my I.D. badge within one (1) week after my last day of employment.
        </p>
        <p>
          In the event I do not return my I.D. badge, I understand that the cost of the I.D. badge is $5.00,
          which if I have not returned, will be deducted from my final paycheck.
        </p>
      </div>
    );
  };

  const nameError = errors['Employee Name'] || errors.EmployeeNameBlank;

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4">ID Badge Issuance</h3>

      <div className="mb-6 p-4 border border-gray-300 rounded bg-gray-50">
        <h4 className="text-md font-semibold text-gray-800 mb-3">Agreement Terms:</h4>
        {getAgreementText()}
        <div className="mb-2 mt-4 p-3 border border-blue-200 rounded bg-blue-50">
          <label className="block text-sm font-medium text-blue-800 mb-2">
            Your Name for Agreement *
          </label>
          <input
            type="text"
            value={formData.EmployeeNameBlank || ''}
            onChange={(e) => {
              onInputChange('EmployeeNameBlank', e.target.value);
              if (!formData['Employee Name']) {
                onInputChange('Employee Name', e.target.value);
              }
            }}
            className={nameError ? fieldInputErr : fieldInputOk}
            placeholder="Enter your name"
          />
          <FieldError message={nameError} />
        </div>
      </div>

      <div className="mb-6 p-4 border border-gray-300 rounded">
        <h4 className="text-md font-semibold text-gray-800 mb-4">ID Badge Issuance Record</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Issued</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity Issued</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-3 text-sm text-gray-900">I.D. Badge</td>
                <td className="px-4 py-3">
                  <input
                    type="date"
                    value={formatDateForInput(formData['Date IssuedID Badge'])}
                    onChange={(e) => onInputChange('Date IssuedID Badge', e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="text"
                    value={formData['Quantity IssuedID Badge']}
                    onChange={(e) => onInputChange('Quantity IssuedID Badge', e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    placeholder="1"
                  />
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">$5.00</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
          <h4 className="text-md font-semibold text-blue-800 mb-4">Employee Section</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employee Name *</label>
              <input
                type="text"
                value={formData['Employee Name'] || ''}
                onChange={(e) => onInputChange('Employee Name', e.target.value)}
                className={nameError ? fieldInputErr : fieldInputOk}
                placeholder="Enter employee name"
              />
              <FieldError message={errors['Employee Name']} />
            </div>

            <CandidateSignatureField
              label="Employee Signature *"
              dateLabel="Date *"
              dateValue={formData.Date || ''}
              onDateChange={(v) => onInputChange('Date', v)}
              signatureDataUrl={employeeSignatureUrl}
              onSignatureChange={onEmployeeSignatureChange}
              dateError={errors.Date}
              signatureError={errors['Signature136_es_:signer:signature']}
            />
          </div>
        </div>

        <div className="p-4 border border-green-200 rounded-lg bg-green-50">
          <h4 className="text-md font-semibold text-green-800 mb-4">Manager Section (Optional)</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Manager Name</label>
              <input
                type="text"
                value={formData['Manager Name'] || ''}
                onChange={(e) => onInputChange('Manager Name', e.target.value)}
                className={fieldInputOk}
                placeholder="Enter manager name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={formatDateForInput(formData.Date_2)}
                onChange={(e) => onInputChange('Date_2', e.target.value)}
                className={fieldInputOk}
              />
            </div>
            <DigitalSignaturePad
              label="Manager Signature"
              value={managerSignatureUrl || ''}
              onChange={onManagerSignatureChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssuanceSection;
