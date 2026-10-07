import DigitalSignaturePad from '../../../../ui/DigitalSignaturePad';

const inputOk =
  'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500';
const inputErr =
  'w-full px-3 py-2 border border-red-400 rounded-md focus:outline-none focus:ring-2 focus:ring-red-200';

function FieldError({ message }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-600">{message}</p>;
}

const SignatureSection = ({
  formData,
  errors = {},
  signatureDataUrl,
  onInputChange,
  onSignatureChange,
}) => {
  const handleDateChange = (dateValue) => {
    onInputChange('Date_2', dateValue);
    onInputChange('Date_3', dateValue);
  };

  const sigError = errors['Signature1_es_:signer:signature'] || errors.Signature;

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-4">Signature</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Signature Date *</label>
          <input
            type="date"
            value={formData.Date_2 || ''}
            onChange={(e) => handleDateChange(e.target.value)}
            className={errors.Date_2 ? inputErr : inputOk}
          />
          <FieldError message={errors.Date_2} />
        </div>
      </div>

      <div className={sigError ? 'rounded-xl ring-2 ring-red-400' : ''}>
        <DigitalSignaturePad
          label="Applicant Signature *"
          value={signatureDataUrl || ''}
          onChange={onSignatureChange}
        />
      </div>
      <FieldError message={sigError} />
    </div>
  );
};

export default SignatureSection;
