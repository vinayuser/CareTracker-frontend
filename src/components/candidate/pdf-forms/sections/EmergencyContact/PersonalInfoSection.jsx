import { fieldInputErr, fieldInputOk } from '../../../../../utils/candidateFormPrefill';

function FieldError({ message }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-600">{message}</p>;
}

const PersonalInfoSection = ({ formData, errors = {}, onInputChange }) => {
  const personalFields = [
    { id: 'First Name', label: 'First Name *', type: 'text', placeholder: 'Enter your first name' },
    { id: 'Middle Name', label: 'Middle Name', type: 'text', placeholder: 'Enter your middle name' },
    { id: 'Last Name', label: 'Last Name *', type: 'text', placeholder: 'Enter your last name' },
    { id: 'Nickname', label: 'Nickname', type: 'text', placeholder: 'Enter your preferred nickname' },
    { id: 'Address', label: 'Address *', type: 'text', placeholder: 'Enter your full address' },
    { id: 'Home Phone', label: 'Home Phone', type: 'tel', placeholder: '(555) 123-4567', maxLength: 14 },
    { id: 'Cellular Phone', label: 'Cellular Phone *', type: 'tel', placeholder: '(555) 123-4567', maxLength: 14 },
    { id: 'Email Address', label: 'Email Address *', type: 'email', placeholder: 'your.email@example.com' },
    {
      id: 'Drivers LicenseState ID Number',
      label: "Driver's License / State ID Number",
      type: 'text',
      placeholder: 'Enter your license/ID number',
    },
  ];

  return (
    <div className="mb-8">
      <h3 className="mb-4 text-lg font-semibold">Personal Information</h3>

      <div className="mb-6 rounded border border-gray-300 bg-gray-50 p-4">
        <h4 className="mb-2 text-md font-semibold text-gray-800">Instructions:</h4>
        <p className="text-sm text-gray-700">
          Please provide accurate personal information. This information will be used for emergency contact
          purposes and must be kept up to date.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {personalFields.map((field) => {
          const hasError = Boolean(errors[field.id]);
          return (
            <div key={field.id} className="mb-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">{field.label}</label>
              <input
                type={field.type}
                value={formData[field.id] || ''}
                onChange={(e) => onInputChange(field.id, e.target.value)}
                className={hasError ? fieldInputErr : fieldInputOk}
                placeholder={field.placeholder}
                maxLength={field.maxLength}
              />
              <FieldError message={errors[field.id]} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PersonalInfoSection;
