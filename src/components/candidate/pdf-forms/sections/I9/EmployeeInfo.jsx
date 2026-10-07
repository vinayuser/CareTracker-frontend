import React from 'react';
import CandidateSignatureField from '../../CandidateSignatureField';
import { fieldInputErr, fieldInputOk } from '../../../../../utils/candidateFormPrefill';
import { maxDobIso } from '../../../../../utils/hiringPdfFormValidation';

function FieldError({ message }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-600">{message}</p>;
}

const EmployeeInfo = ({
  formData,
  errors = {},
  onInputChange,
  onCheckboxChange,
  signatureDataUrl,
  onSignatureChange,
  formatDateForInput,
  usStates,
}) => {
  const cls = (field) => (errors[field] ? fieldInputErr : fieldInputOk);

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4">Section 1: Employee Information and Attestation</h3>

      <div className="mb-6 p-4 border border-gray-300 rounded bg-gray-50">
        <h4 className="text-md font-semibold text-gray-800 mb-2">Instructions:</h4>
        <p className="text-sm text-gray-700 mb-2">
          Complete this section no later than the first day of employment, but not before accepting a job offer.
        </p>
        <p className="text-sm text-gray-700 mb-2 font-semibold">
          I am aware that federal law provides for imprisonment and/or fines for false statements,
          or the use of false documents, in connection with the completion of this form.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Last Name (Family Name) *</label>
          <input
            type="text"
            value={formData['Last Name (Family Name)'] || ''}
            onChange={(e) => onInputChange('Last Name (Family Name)', e.target.value)}
            className={cls('Last Name (Family Name)')}
          />
          <FieldError message={errors['Last Name (Family Name)']} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">First Name (Given Name) *</label>
          <input
            type="text"
            value={formData['First Name (Given Name)'] || ''}
            onChange={(e) => onInputChange('First Name (Given Name)', e.target.value)}
            className={cls('First Name (Given Name)')}
          />
          <FieldError message={errors['First Name (Given Name)']} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Middle Initial (if any)</label>
          <input
            type="text"
            value={formData['Employee Middle Initial (if any)'] || ''}
            onChange={(e) => onInputChange('Employee Middle Initial (if any)', e.target.value)}
            className={fieldInputOk}
            maxLength="1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Other Last Names Used (if any)</label>
          <input
            type="text"
            value={formData['Employee Other Last Names Used (if any)'] || ''}
            onChange={(e) => onInputChange('Employee Other Last Names Used (if any)', e.target.value)}
            className={fieldInputOk}
          />
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Address (Street Number and Name) *</label>
        <input
          type="text"
          value={formData['Address Street Number and Name'] || ''}
          onChange={(e) => onInputChange('Address Street Number and Name', e.target.value)}
          className={cls('Address Street Number and Name')}
        />
        <FieldError message={errors['Address Street Number and Name']} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Apt Number (if any)</label>
          <input
            type="text"
            value={formData['Apt Number (if any)'] || ''}
            onChange={(e) => onInputChange('Apt Number (if any)', e.target.value)}
            className={fieldInputOk}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">City or Town *</label>
          <input
            type="text"
            value={formData['City or Town'] || ''}
            onChange={(e) => onInputChange('City or Town', e.target.value)}
            className={cls('City or Town')}
          />
          <FieldError message={errors['City or Town']} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
          <select
            value={formData.State || ''}
            onChange={(e) => onInputChange('State', e.target.value)}
            className={cls('State')}
          >
            <option value="">Select State</option>
            {usStates.map((state) => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
          <FieldError message={errors.State} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code *</label>
          <input
            type="text"
            value={formData['ZIP Code'] || ''}
            onChange={(e) => onInputChange('ZIP Code', e.target.value)}
            className={cls('ZIP Code')}
          />
          <FieldError message={errors['ZIP Code']} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
          <input
            type="date"
            value={formatDateForInput(formData['Date of Birth mmddyyyy'])}
            onChange={(e) => onInputChange('Date of Birth mmddyyyy', e.target.value)}
            max={maxDobIso(18)}
            className={cls('Date of Birth mmddyyyy')}
          />
          <FieldError message={errors['Date of Birth mmddyyyy']} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">U.S. Social Security Number *</label>
          <input
            type="text"
            value={formData['US Social Security Number'] || ''}
            onChange={(e) => onInputChange('US Social Security Number', e.target.value)}
            className={cls('US Social Security Number')}
            placeholder="XXX-XX-XXXX"
            maxLength={11}
          />
          <FieldError message={errors['US Social Security Number']} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">E-mail Address</label>
          <input
            type="email"
            value={formData['Employees E-mail Address'] || ''}
            onChange={(e) => onInputChange('Employees E-mail Address', e.target.value)}
            className={cls('Employees E-mail Address')}
          />
          <FieldError message={errors['Employees E-mail Address']} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Telephone Number</label>
          <input
            type="tel"
            value={formData['Telephone Number'] || ''}
            onChange={(e) => onInputChange('Telephone Number', e.target.value)}
            className={cls('Telephone Number')}
            placeholder="(XXX) XXX-XXXX"
          />
          <FieldError message={errors['Telephone Number']} />
        </div>
      </div>

      {/* Citizenship/Immigration Status */}
      <div className={`mb-6 ${errors.citizenship ? 'rounded-md ring-2 ring-red-400 p-3' : ''}`}>
        <h4 className="text-md font-semibold text-gray-800 mb-3">Citizenship/Immigration Status *</h4>
        <FieldError message={errors.citizenship} />
        <div className="space-y-3 mt-2">
          <div className="flex items-start">
            <input
              type="checkbox"
              id="citizen"
              checked={formData.CB_1}
              onChange={(e) => onCheckboxChange('CB_1', e.target.checked)}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="citizen" className="ml-3 block">
              <span className="text-sm font-medium text-gray-700">A citizen of the United States</span>
            </label>
          </div>

          <div className="flex items-start">
            <input
              type="checkbox"
              id="noncitizen-national"
              checked={formData.CB_2}
              onChange={(e) => onCheckboxChange('CB_2', e.target.checked)}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="noncitizen-national" className="ml-3 block">
              <span className="text-sm font-medium text-gray-700">A noncitizen national of the United States</span>
            </label>
          </div>

          <div className="flex items-start">
            <input
              type="checkbox"
              id="lawful-permanent"
              checked={formData.CB_3}
              onChange={(e) => onCheckboxChange('CB_3', e.target.checked)}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="lawful-permanent" className="ml-3 block">
              <span className="text-sm font-medium text-gray-700">A lawful permanent resident</span>
              {formData.CB_3 && (
                <div className="mt-2">
                  <input
                    type="text"
                    value={formData['3 A lawful permanent resident Enter USCIS or ANumber'] || ''}
                    onChange={(e) => onInputChange('3 A lawful permanent resident Enter USCIS or ANumber', e.target.value)}
                    className={cls('3 A lawful permanent resident Enter USCIS or ANumber')}
                    placeholder="Enter USCIS or A-Number"
                  />
                  <FieldError message={errors['3 A lawful permanent resident Enter USCIS or ANumber']} />
                </div>
              )}
            </label>
          </div>

          <div className="flex items-start">
            <input
              type="checkbox"
              id="authorized-noncitizen"
              checked={formData.CB_4}
              onChange={(e) => onCheckboxChange('CB_4', e.target.checked)}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="authorized-noncitizen" className="ml-3 block">
              <span className="text-sm font-medium text-gray-700">A noncitizen authorized to work</span>
              {formData.CB_4 && (
                <div className="mt-2 space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                      <input
                        type="text"
                        value={formData['USCIS ANumber'] || ''}
                        onChange={(e) => onInputChange('USCIS ANumber', e.target.value)}
                        className={cls('USCIS ANumber')}
                        placeholder="USCIS A-Number"
                      />
                      <FieldError message={errors['USCIS ANumber']} />
                    </div>
                    <input
                      type="text"
                      value={formData['Form I94 Admission Number'] || ''}
                      onChange={(e) => onInputChange('Form I94 Admission Number', e.target.value)}
                      className={cls('Form I94 Admission Number')}
                      placeholder="Form I-94 Admission Number"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={formData['Foreign Passport Number and Country of IssuanceRow1'] || ''}
                      onChange={(e) => onInputChange('Foreign Passport Number and Country of IssuanceRow1', e.target.value)}
                      className={cls('Foreign Passport Number and Country of IssuanceRow1')}
                      placeholder="Foreign Passport Number & Country"
                    />
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Expiration Date (mm/dd/yyyy) *</label>
                      <input
                        type="date"
                        value={formatDateForInput(formData['Exp Date mmddyyyy'])}
                        onChange={(e) => onInputChange('Exp Date mmddyyyy', e.target.value)}
                        className={cls('Exp Date mmddyyyy')}
                      />
                      <FieldError message={errors['Exp Date mmddyyyy']} />
                    </div>
                  </div>
                </div>
              )}
            </label>
          </div>
        </div>
      </div>

      {/* Employee Signature */}
      <div className="mt-8 border-t pt-6">
        <h4 className="text-md font-semibold text-gray-800 mb-4">Employee Signature & Date *</h4>
        <CandidateSignatureField
          label="Employee Signature *"
          dateLabel="Today's Date *"
          dateValue={formatDateForInput(formData["Today's Date mmddyyy"])}
          onDateChange={(v) => onInputChange("Today's Date mmddyyy", v)}
          signatureDataUrl={signatureDataUrl}
          onSignatureChange={onSignatureChange}
          dateError={errors["Today's Date mmddyyy"]}
          signatureError={errors['Signature of Employee']}
        />
      </div>
    </div>
  );
};

export default EmployeeInfo;
