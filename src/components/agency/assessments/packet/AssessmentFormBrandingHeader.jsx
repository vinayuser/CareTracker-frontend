export default function AssessmentFormBrandingHeader({
  agencyName = '',
  agencyLogo = '',
  assessmentDate = '',
  formCode = '',
  formTitle = '',
}) {
  return (
    <header className="mb-6 border-b-2 border-[#1a3a6c] pb-5 text-center">
      <div className="flex flex-col items-center gap-2">
        {agencyLogo ? (
          <img
            src={agencyLogo}
            alt=""
            className="h-20 max-w-[220px] object-contain"
          />
        ) : (
          <div className="flex h-16 w-28 items-center justify-center rounded border border-dashed border-gray-300 bg-gray-50 text-[10px] text-gray-400">
            Agency logo
          </div>
        )}
        <p className="text-xl font-extrabold leading-tight text-[#1a3a6c]">
          {agencyName || 'Agency'}
        </p>
        {formTitle ? (
          <p className="text-sm font-extrabold uppercase tracking-wide text-[#1a3a6c]">
            {formTitle}
          </p>
        ) : null}
        <p className="text-xs font-semibold text-[#1a3a6c]/80">
          {formCode ? `Form ${formCode}` : null}
          {formCode && assessmentDate ? ' · ' : null}
          {assessmentDate ? `Assessment date: ${assessmentDate}` : null}
        </p>
      </div>
    </header>
  );
}
