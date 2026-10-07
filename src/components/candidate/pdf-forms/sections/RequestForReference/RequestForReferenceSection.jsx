import React from 'react';
import { fieldInputErr, fieldInputOk } from '../../../../../utils/candidateFormPrefill';
import { formatUsPhone } from '../../../../../utils/hiringPdfFormValidation';

function FieldError({ message }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-600">{message}</p>;
}

const RequestForReferenceSection = ({ formData, errors = {}, onInputChange, onCheckboxChange }) => {
  const cls = (field) => (errors[field] ? fieldInputErr : fieldInputOk);

  const handleNoticeChange = (selectedOption) => {
    onCheckboxChange('Notice Yes', selectedOption === 'Yes');
    onCheckboxChange('Notice No', selectedOption === 'No');
  };

  const handleReferenceChange = (fieldKey, selectedOption) => {
    onCheckboxChange(`${fieldKey} Yes`, selectedOption === 'Yes');
    onCheckboxChange(`${fieldKey} No`, selectedOption === 'No');
  };

  const handlePhoneChange = (value) => {
    onInputChange('Phone Number', formatUsPhone(value));
  };

  const handleSalaryChange = (value) => {
    const cleanedValue = value.replace(/[^\d.]/g, '');
    onInputChange('Salary', cleanedValue);
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

  return (
    <div className="mb-8">
      <div className="mb-6">
        <div className="flex items-center mb-4 w-1/3">
          <span className="font-medium mr-2">Please reply by:</span>
          <input
            type="date"
            value={formatDateForInput(formData['Please reply by'])}
            onChange={(e) => onInputChange('Please reply by', e.target.value)}
            className="flex-1 border-b border-gray-300 px-2 py-1 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
            <input
              type="text"
              value={formData['Company Name 1']}
              onChange={(e) => onInputChange('Company Name 1', e.target.value)}
              className={fieldInputOk}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="text"
              value={formData['Phone Number']}
              onChange={(e) => handlePhoneChange(e.target.value)}
              className={cls('Phone Number')}
              placeholder="(123) 456-7890"
            />
            <FieldError message={errors['Phone Number']} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employee Name *</label>
            <input
              type="text"
              value={formData['Employee Name']}
              onChange={(e) => onInputChange('Employee Name', e.target.value)}
              className={cls('Employee Name')}
            />
            <FieldError message={errors['Employee Name']} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
            <input
              type="date"
              value={formatDateForInput(formData['Date of Birth'])}
              onChange={(e) => onInputChange('Date of Birth', e.target.value)}
              className={cls('Date of Birth')}
            />
            <FieldError message={errors['Date of Birth']} />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <input
            type="text"
            value={formData['Address 1']}
            onChange={(e) => onInputChange('Address 1', e.target.value)}
            className={fieldInputOk}
            placeholder="Enter full address"
          />
        </div>
      </div>

      <div className="mb-6 p-4 border border-gray-300 rounded">
        <div className="flex items-center">
          <span>I,</span>
          <input
            type="text"
            value={formData.I}
            onChange={(e) => onInputChange('I', e.target.value)}
            className={`flex-1 mx-2 border-b px-2 py-1 focus:outline-none ${errors.I ? 'border-red-400' : 'border-gray-300 focus:border-blue-500'}`}
          />
          <span>, hereby give my permission for the release of information to CareTraker regarding my employment and earnings.</span>
        </div>
        <FieldError message={errors.I} />
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 border-b pb-2">Employment Verification</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dates of Employment</label>
            <div className="flex gap-2">
              <div className="flex-1">
                <span className="text-xs text-gray-500">From:</span>
                <input
                  type="date"
                  value={formatDateForInput(formData.From)}
                  onChange={(e) => onInputChange('From', e.target.value)}
                  className={fieldInputOk}
                />
              </div>
              <div className="flex-1">
                <span className="text-xs text-gray-500">To:</span>
                <input
                  type="date"
                  value={formatDateForInput(formData.To)}
                  onChange={(e) => onInputChange('To', e.target.value)}
                  className={fieldInputOk}
                />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Leaving</label>
            <input
              type="text"
              value={formData['Reason for Leaving']}
              onChange={(e) => onInputChange('Reason for Leaving', e.target.value)}
              className={fieldInputOk}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Salary</label>
            <input
              type="text"
              value={formData.Salary}
              onChange={(e) => handleSalaryChange(e.target.value)}
              className={fieldInputOk}
              placeholder="e.g., 50000.00"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Was Notice Provided?</label>
          <div className="flex gap-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData['Notice Yes']}
                onChange={(e) => {
                  if (e.target.checked) handleNoticeChange('Yes');
                }}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
              />
              YES
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData['Notice No']}
                onChange={(e) => {
                  if (e.target.checked) handleNoticeChange('No');
                }}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
              />
              NO
            </label>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 border-b pb-2">Reference Verification</h3>
        <p className="text-sm text-gray-600 mb-4 italic">For your convenience you may choose to answer with a yes or no.</p>

        <div className="space-y-4">
          {[
            { key: 'Knowledgeable', label: 'Knowledgeable of Position' },
            { key: 'Dependable', label: 'Dependable' },
            { key: 'Rehire', label: 'Eligible for Rehire' },
            { key: 'Recommend', label: 'Would You Recommend' },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-3 border border-gray-200 rounded">
              <span className="font-medium">{item.label}</span>
              <div className="flex gap-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData[`${item.key} Yes`]}
                    onChange={(e) => {
                      if (e.target.checked) handleReferenceChange(item.key, 'Yes');
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                  />
                  Yes
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData[`${item.key} No`]}
                    onChange={(e) => {
                      if (e.target.checked) handleReferenceChange(item.key, 'No');
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                  />
                  No
                </label>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Additional Information:</label>
          <textarea
            value={formData['Additional InformationRow1']}
            onChange={(e) => onInputChange('Additional InformationRow1', e.target.value)}
            rows={3}
            className={fieldInputOk}
          />
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 border-b pb-2">Information provided by:</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={formData.Name}
              onChange={(e) => onInputChange('Name', e.target.value)}
              className={fieldInputOk}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={formData.Title}
              onChange={(e) => onInputChange('Title', e.target.value)}
              className={fieldInputOk}
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
        </div>
      </div>

      <div className="border-t pt-6">
        <p className="text-sm italic mb-4">Thank you for your time, consideration, and cooperation.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Agency Representative</label>
            <input
              type="text"
              value={formData['Mastercare Representative'] || formData['Agency Representative'] || ''}
              onChange={(e) => onInputChange('Mastercare Representative', e.target.value)}
              className={fieldInputOk}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={formatDateForInput(formData.Date_3)}
              onChange={(e) => onInputChange('Date_3', e.target.value)}
              className={fieldInputOk}
            />
          </div>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <label className="block text-sm font-medium text-gray-700 mb-1">Please return references to:</label>
          <input
            type="text"
            value={formData['Mastercare Office Address'] || formData['Agency Office Address'] || ''}
            onChange={(e) => onInputChange('Mastercare Office Address', e.target.value)}
            placeholder="(Enter Agency Office Address)"
            className={fieldInputOk}
          />
        </div>
      </div>
    </div>
  );
};

export default RequestForReferenceSection;
