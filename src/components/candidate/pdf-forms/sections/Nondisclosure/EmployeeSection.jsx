import CandidateSignatureField from '../../CandidateSignatureField';
import { fieldInputErr, fieldInputOk } from '../../../../../utils/candidateFormPrefill';

function FieldError({ message }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-600">{message}</p>;
}

const EmployeeSection = ({
  formData,
  errors = {},
  onInputChange,
  signatureDataUrl,
  onSignatureChange,
}) => {
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;
    const date = new Date(dateString);
    if (!Number.isNaN(date.getTime())) return date.toISOString().split('T')[0];
    return dateString;
  };

  const cls = (field) => (errors[field] ? fieldInputErr : fieldInputOk);
  const sigError = errors['Signature146_es_:signer:signature'];

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4">Employee Information & Signature</h3>

      <div className="mb-6 rounded border border-yellow-300 bg-yellow-50 p-4">
        <h4 className="mb-2 text-md font-semibold text-yellow-800">Important Notice:</h4>
        <p className="mb-3 text-sm text-yellow-700">
          This Nondisclosure and Noncompete Agreement contains important restrictions. Please read carefully before signing.
        </p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Employee Name (Full Legal Name) *
            </label>
            <input
              type="text"
              value={formData.Employee || ''}
              onChange={(e) => onInputChange('Employee', e.target.value)}
              maxLength={40}
              className={cls('Employee')}
              placeholder="Enter your full name"
            />
            <FieldError message={errors.Employee} />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Employee Address *
            </label>
            <input
              type="text"
              value={formData['Employee Address'] || ''}
              onChange={(e) => onInputChange('Employee Address', e.target.value)}
              maxLength={100}
              className={cls('Employee Address')}
              placeholder="Enter your address"
            />
            <FieldError message={errors['Employee Address']} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Effective Date of Agreement *
            </label>
            <input
              type="date"
              value={formatDateForInput(formData['Effective Date'])}
              onChange={(e) => onInputChange('Effective Date', e.target.value)}
              className={cls('Effective Date')}
            />
            <FieldError message={errors['Effective Date']} />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Date of Signature *
            </label>
            <input
              type="date"
              value={formatDateForInput(formData.Date)}
              onChange={(e) => onInputChange('Date', e.target.value)}
              className={cls('Date')}
            />
            <FieldError message={errors.Date} />
          </div>
        </div>
      </div>

      <div className="mt-8">
        <CandidateSignatureField
          label="Employee Signature *"
          showDate={false}
          signatureDataUrl={signatureDataUrl}
          onSignatureChange={onSignatureChange}
          signatureError={sigError}
        />
      </div>
    </div>
  );
};

export default EmployeeSection;
