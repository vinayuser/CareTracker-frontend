import { fieldInputErr, fieldInputOk } from '../../../../../utils/candidateFormPrefill';

function FieldError({ message }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-600">{message}</p>;
}

const PersonalInfoSection = ({ formData, errors = {}, onInputChange }) => {
  const fields = [
    { key: 'Name', label: 'Name *', type: 'text' },
    { key: 'Position', label: 'Position *', type: 'text' },
    { key: 'Address', label: 'Address *', type: 'text', fullWidth: true },
    { key: 'Cell Phone', label: 'Cell Phone *', type: 'tel', placeholder: '(555) 123-4567', maxLength: 14 },
    { key: 'Home Phone', label: 'Home Phone', type: 'tel', placeholder: '(555) 123-4567', maxLength: 14 },
    { key: 'Email', label: 'Email *', type: 'email', fullWidth: true },
  ];

  return (
    <div className="mb-8">
      <h3 className="mb-4 text-lg font-semibold">Personal Information</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {fields.map((field) => {
          const hasError = Boolean(errors[field.key]);
          return (
            <div key={field.key} className={field.fullWidth ? 'md:col-span-2' : ''}>
              <label className="mb-1 block text-sm font-medium text-gray-700">{field.label}</label>
              <input
                type={field.type}
                value={formData[field.key] || ''}
                onChange={(e) => onInputChange(field.key, e.target.value)}
                className={hasError ? fieldInputErr : fieldInputOk}
                placeholder={field.placeholder}
                maxLength={field.maxLength}
              />
              <FieldError message={errors[field.key]} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PersonalInfoSection;
