import { fieldInputErr, fieldInputOk } from '../../../../../utils/candidateFormPrefill';

function FieldError({ message }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-600">{message}</p>;
}

const EmergencyContactsSection = ({ formData, errors = {}, onInputChange, contactNumber }) => {
  const fieldPrefix = contactNumber === 1 ? '' : `_${contactNumber}`;
  const required = contactNumber === 1;

  const contactFields = [
    {
      id: `Emergency Contact Name${fieldPrefix}`,
      label: required ? 'Full Name *' : 'Full Name',
      type: 'text',
      placeholder: 'Enter full name',
    },
    {
      id: `Relationship${fieldPrefix}`,
      label: required ? 'Relationship *' : 'Relationship',
      type: 'text',
      placeholder: 'e.g., Spouse, Parent, Sibling, Friend',
    },
    {
      id: contactNumber === 1 ? 'Address_2' : contactNumber === 2 ? 'Address_3' : 'Address_4',
      label: 'Address',
      type: 'text',
      placeholder: "Enter contact's address",
    },
    {
      id: contactNumber === 1 ? 'Phone Numbers' : contactNumber === 2 ? 'Phone Numbers_2' : 'Phone Numbers_3',
      label: required ? 'Phone Number(s) *' : 'Phone Number(s)',
      type: 'tel',
      placeholder: '(555) 123-4567',
      maxLength: 14,
    },
  ];

  const getTitle = () => {
    switch (contactNumber) {
      case 1: return 'Primary Emergency Contact';
      case 2: return 'Secondary Emergency Contact';
      case 3: return 'Tertiary Emergency Contact';
      default: return 'Emergency Contact';
    }
  };

  return (
    <div className="mb-8">
      <h3 className="mb-4 text-lg font-semibold">{getTitle()}</h3>

      <div className="mb-6 rounded border border-gray-300 bg-gray-50 p-4">
        <h4 className="mb-2 text-md font-semibold text-gray-800">Instructions:</h4>
        <p className="text-sm text-gray-700">
          Please provide contact information for someone we can reach in case of an emergency. This should be
          someone who is typically available and can make decisions on your behalf if necessary.
        </p>
      </div>

      <div className="space-y-4">
        {contactFields.map((field) => {
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

export default EmergencyContactsSection;
