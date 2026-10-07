import React from 'react';

const inputOk =
  'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500';
const inputErr =
  'w-full px-3 py-2 border border-red-400 rounded-md focus:outline-none focus:ring-2 focus:ring-red-200';

function FieldError({ message }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-600">{message}</p>;
}

const PersonalInformationSection = ({ formData, errors = {}, onInputChange }) => {
  const fields = [
    { key: 'Name', label: 'Full Name *', type: 'text', required: true, fullWidth: false, maxLength: 40 },
    { key: 'Date', label: 'Date *', type: 'date', required: true, fullWidth: false },
    { key: 'Address', label: 'Address *', type: 'text', required: true, fullWidth: true, maxLength: 100 },
    { key: 'City', label: 'City *', type: 'text', required: true, fullWidth: false, maxLength: 40 },
    { key: 'State', label: 'State *', type: 'state', required: true, fullWidth: false, maxLength: 2 },
    { key: 'Zip', label: 'ZIP Code *', type: 'zip', required: true, fullWidth: false, maxLength: 5 },
    { key: 'Email Address', label: 'Email *', type: 'email', required: true, fullWidth: false, maxLength: 100 },
    { key: 'Phone', label: 'Phone *', type: 'phone', required: true, fullWidth: false, maxLength: 14 },
  ];

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map((field) => {
          const hasError = Boolean(errors[field.key]);
          return (
            <div key={field.key} className={field.fullWidth ? 'md:col-span-2' : ''}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field.label}
              </label>
              <input
                type={field.type === 'date' ? 'date' : field.type === 'email' ? 'email' : 'text'}
                value={formData[field.key] || ''}
                onChange={(e) => onInputChange(field.key, e.target.value)}
                className={hasError ? inputErr : inputOk}
                inputMode={
                  field.type === 'zip' || field.type === 'phone'
                    ? 'numeric'
                    : field.type === 'email'
                      ? 'email'
                      : 'text'
                }
                maxLength={field.maxLength}
                placeholder={
                  field.type === 'phone'
                    ? '(555) 123-4567'
                    : field.type === 'state'
                      ? 'TX'
                      : field.type === 'zip'
                        ? '77001'
                        : undefined
                }
              />
              <FieldError message={errors[field.key]} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PersonalInformationSection;
