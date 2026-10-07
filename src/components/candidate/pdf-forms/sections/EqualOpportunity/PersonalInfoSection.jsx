import React from 'react';

const inputOk =
  'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500';
const inputErr =
  'w-full px-3 py-2 border border-red-400 rounded-md focus:outline-none focus:ring-2 focus:ring-red-200';

function FieldError({ message }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-600">{message}</p>;
}

const PersonalInfoSection = ({ formData, errors = {}, onInputChange }) => {
  const cls = (field) => (errors[field] ? inputErr : inputOk);

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Position Applied For *</label>
          <input
            type="text"
            value={formData['Position Applied For'] || ''}
            onChange={(e) => onInputChange('Position Applied For', e.target.value)}
            maxLength={40}
            className={cls('Position Applied For')}
          />
          <FieldError message={errors['Position Applied For']} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date of Application *</label>
          <input
            type="date"
            value={formData['Date of Application'] || ''}
            onChange={(e) => onInputChange('Date of Application', e.target.value)}
            className={cls('Date of Application')}
          />
          <FieldError message={errors['Date of Application']} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
          <input
            type="date"
            value={formData['Date of Birth'] || ''}
            onChange={(e) => onInputChange('Date of Birth', e.target.value)}
            max={(() => {
              const d = new Date();
              d.setFullYear(d.getFullYear() - 18);
              return d.toISOString().slice(0, 10);
            })()}
            className={cls('Date of Birth')}
          />
          <FieldError message={errors['Date of Birth']} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
          <input
            type="text"
            value={formData['First Name'] || ''}
            onChange={(e) => onInputChange('First Name', e.target.value)}
            maxLength={40}
            className={cls('First Name')}
          />
          <FieldError message={errors['First Name']} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
          <input
            type="text"
            value={formData['Last Name'] || ''}
            onChange={(e) => onInputChange('Last Name', e.target.value)}
            maxLength={40}
            className={cls('Last Name')}
          />
          <FieldError message={errors['Last Name']} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Middle Name</label>
          <input
            type="text"
            value={formData['Middle Name'] || ''}
            onChange={(e) => onInputChange('Middle Name', e.target.value)}
            maxLength={40}
            className={inputOk}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address (if applicable)</label>
          <input
            type="text"
            value={formData.Address || ''}
            onChange={(e) => onInputChange('Address', e.target.value)}
            maxLength={100}
            className={inputOk}
            placeholder="Enter address"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
          <input
            type="text"
            value={formData.City || ''}
            onChange={(e) => onInputChange('City', e.target.value)}
            maxLength={40}
            className={cls('City')}
          />
          <FieldError message={errors.City} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
          <input
            type="text"
            value={formData.State || ''}
            onChange={(e) => onInputChange('State', e.target.value)}
            maxLength={2}
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
            value={formData.Zip || ''}
            onChange={(e) => onInputChange('Zip', e.target.value)}
            maxLength={5}
            className={cls('Zip')}
            placeholder="77001"
          />
          <FieldError message={errors.Zip} />
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoSection;
