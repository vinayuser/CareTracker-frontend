import React from 'react';
import { epafFieldMaxLength } from '../../../../../utils/epafFormValidation';

const inputBase =
  'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2';
const inputOk = `${inputBase} border-gray-300 focus:ring-blue-500`;
const inputErr = `${inputBase} border-red-400 focus:ring-red-200`;

function FieldError({ message }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-600">{message}</p>;
}

const SeparationSection = ({ formData, errors = {}, onInputChange, onCheckboxChange }) => {
  const max = epafFieldMaxLength;

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;

    const date = new Date(dateString);
    if (!Number.isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }

    return dateString;
  };

  const cls = (field) => (errors[field] ? inputErr : inputOk);

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4">Employee Separation Information</h3>

      <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
        <p className="text-sm text-gray-600">
          <strong>Note:</strong> Complete this section only if documenting a separation.
          Employees who quit will receive their final pay on the regular scheduled payday.
        </p>
      </div>

      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-700 mb-3 border-b pb-2">Employee Information</h4>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employee Name</label>
            <input
              type="text"
              value={formData['Employee Name']}
              onChange={(e) => onInputChange('Employee Name', e.target.value)}
              maxLength={max('Employee Name')}
              className={cls('Employee Name')}
            />
            <FieldError message={errors['Employee Name']} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
            <input
              type="text"
              value={formData.ESIPosition}
              onChange={(e) => onInputChange('ESIPosition', e.target.value)}
              maxLength={max('ESIPosition')}
              className={inputOk}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Day Worked</label>
            <input
              type="date"
              value={formatDateForInput(formData['Last Day Worked'])}
              onChange={(e) => onInputChange('Last Day Worked', e.target.value)}
              className={cls('Last Day Worked')}
            />
            <FieldError message={errors['Last Day Worked']} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Immediate Supervisor</label>
            <input
              type="text"
              value={formData['Immediate Supervisor']}
              onChange={(e) => onInputChange('Immediate Supervisor', e.target.value)}
              maxLength={max('Immediate Supervisor')}
              className={inputOk}
            />
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-700 mb-3 border-b pb-2">Separation Details</h4>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Separation Code:</label>
          <div className={`grid grid-cols-2 md:grid-cols-4 gap-3 rounded-md p-1 ${errors.separationCode ? 'border border-red-400' : ''}`}>
            <label className="flex items-center p-2 border border-gray-300 rounded hover:bg-gray-50">
              <input
                type="checkbox"
                checked={formData.checkbox_QuitWNotice}
                onChange={(e) => onCheckboxChange('checkbox_QuitWNotice', e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <span className="ml-2 text-sm">Quit w/ Notice</span>
            </label>
            <label className="flex items-center p-2 border border-gray-300 rounded hover:bg-gray-50">
              <input
                type="checkbox"
                checked={formData.checkbox_QuitNONotice}
                onChange={(e) => onCheckboxChange('checkbox_QuitNONotice', e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <span className="ml-2 text-sm">Quit NO Notice</span>
            </label>
            <label className="flex items-center p-2 border border-gray-300 rounded hover:bg-gray-50">
              <input
                type="checkbox"
                checked={formData.checkbox_Terminated}
                onChange={(e) => onCheckboxChange('checkbox_Terminated', e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <span className="ml-2 text-sm">Terminated</span>
            </label>
            <label className="flex items-center p-2 border border-gray-300 rounded hover:bg-gray-50">
              <input
                type="checkbox"
                checked={formData['checkbox_Job Abandonment']}
                onChange={(e) => onCheckboxChange('checkbox_Job Abandonment', e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <span className="ml-2 text-sm">Job Abandonment</span>
            </label>
          </div>
          <FieldError message={errors.separationCode} />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Separation</label>
          <textarea
            value={formData.ESIReason}
            onChange={(e) => onInputChange('ESIReason', e.target.value)}
            maxLength={max('ESIReason')}
            className={`${cls('ESIReason')} min-h-[80px]`}
            placeholder="Provide detailed reason for separation..."
          />
          <FieldError message={errors.ESIReason} />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">If Terminated, Who Was the Witness?</label>
          <input
            type="text"
            value={formData['If Terminated Who Was the Witness']}
            onChange={(e) => onInputChange('If Terminated Who Was the Witness', e.target.value)}
            maxLength={max('If Terminated Who Was the Witness')}
            className={inputOk}
            placeholder="Witness name"
          />
        </div>
      </div>

      <div>
        <h4 className="text-md font-medium text-gray-700 mb-3 border-b pb-2">Final Details</h4>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Hours Owed at Termination</label>
            <input
              type="text"
              inputMode="decimal"
              value={formData['Total Number of Hours Employee is Owed at Termination']}
              onChange={(e) => onInputChange('Total Number of Hours Employee is Owed at Termination', e.target.value)}
              className={cls('Total Number of Hours Employee is Owed at Termination')}
              placeholder="0.0"
            />
            <FieldError message={errors['Total Number of Hours Employee is Owed at Termination']} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Inactive Date Entered</label>
            <input
              type="date"
              value={formatDateForInput(formData['Inactive Date Entered'])}
              onChange={(e) => onInputChange('Inactive Date Entered', e.target.value)}
              className={inputOk}
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Completed By</label>
          <input
            type="text"
            value={formData['Completed By']}
            onChange={(e) => onInputChange('Completed By', e.target.value)}
            maxLength={max('Completed By')}
            className={inputOk}
            placeholder="Name of person completing this form"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Manager/HR</label>
          <input
            type="text"
            value={formData.ManagerHR}
            onChange={(e) => onInputChange('ManagerHR', e.target.value)}
            maxLength={max('ManagerHR')}
            className={inputOk}
            placeholder="Manager or HR representative name"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Is Employee Eligible for Rehire?</label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData['checkbox_Eligible RehireYes']}
                onChange={(e) => onCheckboxChange('checkbox_Eligible RehireYes', e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <span className="ml-2 text-sm">Yes</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.checkbox_EligibleRehireNo}
                onChange={(e) => onCheckboxChange('checkbox_EligibleRehireNo', e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <span className="ml-2 text-sm">No</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeparationSection;
