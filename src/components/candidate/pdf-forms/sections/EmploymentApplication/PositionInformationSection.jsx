import React from 'react';

const inputOk =
  'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500';
const inputErr =
  'w-full px-3 py-2 border border-red-400 rounded-md focus:outline-none focus:ring-2 focus:ring-red-200';

function FieldError({ message }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-600">{message}</p>;
}

const PositionInformationSection = ({ formData, errors = {}, onInputChange }) => {
  const fields = [
    { key: 'Position', label: 'Position Applied For *', type: 'text', required: true, fullWidth: true, maxLength: 40 },
    { key: 'Location Preference', label: 'Location Preference', type: 'text', required: false, fullWidth: false, maxLength: 40 },
    { key: 'Salary Desired', label: 'Desired Salary', type: 'salary', required: false, fullWidth: false, maxLength: 15 },
    { key: 'How many hours can you work weekly', label: 'Hours Available Per Week', type: 'hours', required: false, fullWidth: false, maxLength: 3 },
    { key: 'When would you be available to begin work', label: 'Available Start Date', type: 'date', required: false, fullWidth: false },
  ];

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4">Position Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map((field) => {
          const hasError = Boolean(errors[field.key]);
          return (
            <div key={field.key} className={field.fullWidth ? 'md:col-span-2' : ''}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field.label}
              </label>
              <input
                type={field.type === 'date' ? 'date' : 'text'}
                value={formData[field.key] || ''}
                onChange={(e) => onInputChange(field.key, e.target.value)}
                className={hasError ? inputErr : inputOk}
                inputMode={field.type === 'salary' || field.type === 'hours' ? 'decimal' : 'text'}
                maxLength={field.maxLength}
                placeholder={field.type === 'salary' ? '0.00' : field.type === 'hours' ? '40' : undefined}
              />
              <FieldError message={errors[field.key]} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PositionInformationSection;
