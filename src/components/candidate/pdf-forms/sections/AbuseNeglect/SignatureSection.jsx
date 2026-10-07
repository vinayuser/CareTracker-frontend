import CandidateSignatureField from '../../CandidateSignatureField';

const SignatureSection = ({
  formData,
  errors = {},
  signatureDataUrl,
  onSignatureChange,
  onInputChange,
}) => {
  const sigKey = 'Signature107_es_:signer:signature';

  return (
    <div className="mb-8">
      <h3 className="mb-4 text-lg font-semibold">Signature & Date</h3>

      <div className="mb-6 rounded border border-gray-300 bg-gray-50 p-4">
        <h4 className="mb-2 text-md font-semibold text-gray-800">Acknowledgment Statement:</h4>
        <p className="text-sm italic text-gray-700">
          &quot;I, {formData.I || '[Your Name]'}, have read and understand the above policy on abuse and neglect
          and I agree to abide by these policies.&quot;
        </p>
      </div>

      <div className="mb-6">
        <CandidateSignatureField
          label="Employee Signature *"
          dateLabel="Date *"
          dateValue={formData.Date || ''}
          onDateChange={(v) => onInputChange('Date', v)}
          signatureDataUrl={signatureDataUrl}
          onSignatureChange={onSignatureChange}
          dateError={errors.Date}
          signatureError={errors[sigKey]}
        />
      </div>

      <div className="mt-6 border-t border-gray-200 p-3">
        <p className="text-center text-xs text-gray-500">1220/MC-Rev.0320 ©CareTraker All Rights Reserved</p>
      </div>
    </div>
  );
};

export default SignatureSection;
