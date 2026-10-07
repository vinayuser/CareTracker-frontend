// components/forms/sections/BackgroundCheck/PersonalInfoSection.jsx
import React from 'react';
import { fieldInputErr, fieldInputOk } from '../../../../../utils/candidateFormPrefill';
import { formatUsPhone, sanitizeSsn } from '../../../../../utils/hiringPdfFormValidation';

function FieldError({ message }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-600">{message}</p>;
}

const PersonalInfoSection = ({ formData, errors = {}, onInputChange }) => {
  const cls = (field) => (errors[field] ? fieldInputErr : fieldInputOk);

  const handleSSNChange = (value) => {
    onInputChange('Social Security', sanitizeSsn(value));
  };

  const handlePhoneChange = (value) => {
    onInputChange('Phone', formatUsPhone(value));
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
    return dateString;
  };

  const nameParts = (formData['Last First Middle'] || '').split(' ');
  const last = nameParts[0] || '';
  const first = nameParts[1] || '';
  const middle = nameParts.slice(2).join(' ') || '';

  const setNamePart = (part, value) => {
    const parts = [last, first, middle];
    if (part === 'last') parts[0] = value;
    if (part === 'first') parts[1] = value;
    if (part === 'middle') parts[2] = value;
    onInputChange('Last First Middle', parts.filter((p, i) => i < 2 || p).join(' ').replace(/\s+/g, ' ').trim());
  };

  const dlKey = formData["Driver's License"] != null && formData["Driver's License"] !== ''
    ? "Driver's License"
    : "Driver’s License";

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4">Personal Information</h3>

      <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
        <p className="text-sm text-gray-600 mb-3">
          <strong>Important:</strong> Each employee or volunteer to be screened must sign this authorization/waiver/indemnity form, giving approval for CareTraker Homecare, Inc. to perform an investigative background check.
        </p>
      </div>

      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-700 mb-3">Applicant Printed Name *</h4>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last</label>
            <input
              type="text"
              value={last}
              onChange={(e) => setNamePart('last', e.target.value)}
              className={cls('Last First Middle')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First</label>
            <input
              type="text"
              value={first}
              onChange={(e) => setNamePart('first', e.target.value)}
              className={cls('Last First Middle')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Middle</label>
            <input
              type="text"
              value={middle}
              onChange={(e) => setNamePart('middle', e.target.value)}
              className={cls('Last First Middle')}
            />
          </div>
        </div>
        <FieldError message={errors['Last First Middle']} />
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Maiden Name</label>
          <input
            type="text"
            value={formData.Maiden}
            onChange={(e) => onInputChange('Maiden', e.target.value)}
            className={fieldInputOk}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Other Names Used</label>
          <input
            type="text"
            value={formData['Other Names Used']}
            onChange={(e) => onInputChange('Other Names Used', e.target.value)}
            className={fieldInputOk}
            placeholder="List any other names you've used"
          />
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Social Security Number *</label>
          <input
            type="text"
            value={formData['Social Security']}
            onChange={(e) => handleSSNChange(e.target.value)}
            className={cls('Social Security')}
            placeholder="XXX-XX-XXXX"
            maxLength={11}
          />
          <FieldError message={errors['Social Security']} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
          <input
            type="date"
            value={formatDateForInput(formData.DOB)}
            onChange={(e) => onInputChange('DOB', e.target.value)}
            className={cls('DOB')}
          />
          <FieldError message={errors.DOB} />
        </div>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
          <input
            type="text"
            value={formData.Phone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            className={cls('Phone')}
            placeholder="(XXX) XXX-XXXX"
            maxLength={14}
          />
          <FieldError message={errors.Phone} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Driver’s License #</label>
          <input
            type="text"
            value={formData[dlKey] || formData["Driver’s License"] || formData["Driver's License"] || ''}
            onChange={(e) => onInputChange("Driver’s License", e.target.value.toUpperCase())}
            className={fieldInputOk}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
          <input
            type="text"
            value={formData.State}
            onChange={(e) => onInputChange('State', e.target.value.toUpperCase())}
            className={fieldInputOk}
            placeholder="TX"
            maxLength={2}
          />
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoSection;
