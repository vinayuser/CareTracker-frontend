import CandidateSignatureField from '../../CandidateSignatureField';

const SignatureSection = ({
  formData,
  errors = {},
  onInputChange,
  careAssociateSignature,
  agencySignature,
  onCareAssociateSignatureChange,
  onAgencySignatureChange,
}) => {
  const careSigKey = 'Signature41_es_:signer:signature';

  return (
    <div className="mb-8">
      <h3 className="mb-4 text-lg font-semibold">Signatures</h3>

      <div className="mb-6 rounded border border-gray-300 bg-gray-50 p-4">
        <p className="text-sm text-gray-700">
          Care associate signature is required. Agency representative signature is optional.
        </p>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded border border-gray-300 p-4">
          <h4 className="mb-4 text-md font-semibold text-gray-800">Care Associate Signature</h4>
          <CandidateSignatureField
            label="Care Associate Signature *"
            dateLabel="Date *"
            dateValue={formData.Date || ''}
            onDateChange={(v) => onInputChange('Date', v)}
            signatureDataUrl={careAssociateSignature}
            onSignatureChange={onCareAssociateSignatureChange}
            dateError={errors.Date}
            signatureError={errors[careSigKey]}
          />
        </div>

        <div className="rounded border border-gray-300 p-4">
          <h4 className="mb-4 text-md font-semibold text-gray-800">Agency Representative Signature</h4>
          <CandidateSignatureField
            label="Agency Representative Signature (optional)"
            dateLabel="Date"
            dateValue={formData.Date_2 || ''}
            onDateChange={(v) => onInputChange('Date_2', v)}
            signatureDataUrl={agencySignature}
            onSignatureChange={onAgencySignatureChange}
          />
        </div>
      </div>

      <div className="mt-6 border-t border-gray-200 p-3">
        <p className="text-center text-xs text-gray-500">© CareTraker. All Rights Reserved.</p>
      </div>
    </div>
  );
};

export default SignatureSection;
