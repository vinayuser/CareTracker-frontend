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

function maxDobDate() {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 18);
  return d.toISOString().split('T')[0];
}

const NewHireSection = ({ formData, errors = {}, onInputChange, onCheckboxChange }) => {
  const max = epafFieldMaxLength;
  const maxDob = maxDobDate();

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
      <h3 className="text-lg font-semibold mb-4">New Hire Information</h3>

      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-700 mb-3 border-b pb-2">Personal Information</h4>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
            <input
              type="text"
              value={formData['First Name']}
              onChange={(e) => onInputChange('First Name', e.target.value)}
              maxLength={max('First Name')}
              className={cls('First Name')}
            />
            <FieldError message={errors['First Name']} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
            <input
              type="text"
              value={formData['Last Name']}
              onChange={(e) => onInputChange('Last Name', e.target.value)}
              maxLength={max('Last Name')}
              className={cls('Last Name')}
            />
            <FieldError message={errors['Last Name']} />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Mailing Address *</label>
          <input
            type="text"
            value={formData.Mail}
            onChange={(e) => onInputChange('Mail', e.target.value)}
            maxLength={max('Mail')}
            className={cls('Mail')}
            placeholder="Street Address, City, State ZIP"
          />
          <FieldError message={errors.Mail} />
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
            <input
              type="text"
              value={formData.State}
              onChange={(e) => onInputChange('State', e.target.value)}
              maxLength={max('State')}
              className={cls('State')}
              placeholder="TX"
            />
            <FieldError message={errors.State} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code *</label>
            <input
              type="text"
              inputMode="numeric"
              value={formData.zipcode}
              onChange={(e) => onInputChange('zipcode', e.target.value)}
              maxLength={max('zipcode')}
              className={cls('zipcode')}
              placeholder="77001"
            />
            <FieldError message={errors.zipcode} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
            <input
              type="date"
              value={formatDateForInput(formData['Date of Birth'])}
              onChange={(e) => onInputChange('Date of Birth', e.target.value)}
              max={maxDob}
              className={cls('Date of Birth')}
            />
            <FieldError message={errors['Date of Birth']} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            <select
              value={formData['Gender identified as'] || ''}
              onChange={(e) => onInputChange('Gender identified as', e.target.value)}
              className={cls('Gender identified as')}
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            <FieldError message={errors['Gender identified as']} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SSN *</label>
            <input
              type="text"
              value={formData.ssn}
              onChange={(e) => onInputChange('ssn', e.target.value)}
              maxLength={max('ssn')}
              className={cls('ssn')}
              placeholder="XXX-XX-XXXX"
            />
            <FieldError message={errors.ssn} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Marital Status *</label>
            <div className={`flex flex-wrap gap-4 mt-2 rounded-md p-2 ${errors.maritalStatus ? 'border border-red-400' : ''}`}>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.checkbox_married}
                  onChange={(e) => onCheckboxChange('checkbox_married', e.target.checked)}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <span className="ml-2 text-sm">Married</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.checkbox_divorced}
                  onChange={(e) => onCheckboxChange('checkbox_divorced', e.target.checked)}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <span className="ml-2 text-sm">Divorced</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.checkbox_single}
                  onChange={(e) => onCheckboxChange('checkbox_single', e.target.checked)}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <span className="ml-2 text-sm">Single</span>
              </label>
            </div>
            <FieldError message={errors.maritalStatus} />
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-700 mb-3 border-b pb-2">Employment Information</h4>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Hire *</label>
            <input
              type="date"
              value={formatDateForInput(formData['Date of Hire'])}
              onChange={(e) => onInputChange('Date of Hire', e.target.value)}
              className={cls('Date of Hire')}
            />
            <FieldError message={errors['Date of Hire']} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Position *</label>
            <input
              type="text"
              value={formData.Position}
              onChange={(e) => onInputChange('Position', e.target.value)}
              maxLength={max('Position')}
              className={cls('Position')}
            />
            <FieldError message={errors.Position} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pay Rate ($/hr)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="text"
                inputMode="decimal"
                value={formData['Pay Rate']}
                onChange={(e) => onInputChange('Pay Rate', e.target.value)}
                maxLength={max('Pay Rate')}
                className={`pl-8 pr-3 ${cls('Pay Rate')}`}
                placeholder="0.00"
              />
            </div>
            <FieldError message={errors['Pay Rate']} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Verify I-9 Date</label>
            <input
              type="date"
              value={formatDateForInput(typeof formData['Verify I-9'] === 'string' ? formData['Verify I-9'] : '')}
              onChange={(e) => onInputChange('Verify I-9', e.target.value)}
              className={inputOk}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hours Per Week</label>
            <input
              type="text"
              inputMode="decimal"
              value={formData['Hours Per Week']}
              onChange={(e) => onInputChange('Hours Per Week', e.target.value)}
              className={cls('Hours Per Week')}
            />
            <FieldError message={errors['Hours Per Week']} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Resident of (State)</label>
            <input
              type="text"
              value={formData['Resident of']}
              onChange={(e) => onInputChange('Resident of', e.target.value)}
              maxLength={max('Resident of')}
              className={inputOk}
              placeholder="TX"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">W-4 Status</label>
            <input
              type="text"
              value={formData['W-4 Status']}
              onChange={(e) => onInputChange('W-4 Status', e.target.value)}
              maxLength={max('W-4 Status')}
              className={inputOk}
              placeholder="e.g., Single-2"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Reports To</label>
          <input
            type="text"
            value={formData['Reports To']}
            onChange={(e) => onInputChange('Reports To', e.target.value)}
            maxLength={max('Reports To')}
            className={inputOk}
            placeholder="Supervisor's Name"
          />
        </div>
      </div>

      <div>
        <h4 className="text-md font-medium text-gray-700 mb-3 border-b pb-2">Payroll Information</h4>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Send Paychecks to: *</label>
          <div className={`flex gap-6 rounded-md p-2 ${errors.paycheckDelivery ? 'border border-red-400' : ''}`}>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.checkbox_PickupatOffice}
                onChange={(e) => onCheckboxChange('checkbox_PickupatOffice', e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <span className="ml-2 text-sm">Pick up at Office</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.checkbox_DirectDeposit}
                onChange={(e) => onCheckboxChange('checkbox_DirectDeposit', e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <span className="ml-2 text-sm">Direct Deposit</span>
            </label>
          </div>
          <FieldError message={errors.paycheckDelivery} />
        </div>

        {formData.checkbox_DirectDeposit && (
          <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
            <h5 className="text-sm font-medium text-gray-700 mb-3">Direct Deposit Information</h5>

            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Type: *</label>
              <div className={`flex gap-4 rounded-md p-2 ${errors.accountType ? 'border border-red-400' : ''}`}>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.checkbox_checking}
                    onChange={(e) => onCheckboxChange('checkbox_checking', e.target.checked)}
                    className="h-4 w-4 text-blue-600 rounded"
                  />
                  <span className="ml-2 text-sm">Checking</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.checkbox_savings}
                    onChange={(e) => onCheckboxChange('checkbox_savings', e.target.checked)}
                    className="h-4 w-4 text-blue-600 rounded"
                  />
                  <span className="ml-2 text-sm">Savings</span>
                </label>
              </div>
              <FieldError message={errors.accountType} />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name *</label>
                <input
                  type="text"
                  value={formData['Bank Name']}
                  onChange={(e) => onInputChange('Bank Name', e.target.value)}
                  maxLength={max('Bank Name')}
                  className={cls('Bank Name')}
                />
                <FieldError message={errors['Bank Name']} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Routing # *</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={formData.Routing}
                  onChange={(e) => onInputChange('Routing', e.target.value)}
                  maxLength={max('Routing')}
                  className={cls('Routing')}
                  placeholder="9 digits"
                />
                <FieldError message={errors.Routing} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account # *</label>
              <input
                type="text"
                inputMode="numeric"
                value={formData.Account}
                onChange={(e) => onInputChange('Account', e.target.value)}
                maxLength={max('Account')}
                className={cls('Account')}
                placeholder="Account number"
              />
              <FieldError message={errors.Account} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewHireSection;
