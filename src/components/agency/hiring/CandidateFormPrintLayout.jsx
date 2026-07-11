function Field({ label, value }) {
  if (!value) return null;
  return (
    <div className="cf-print-field">
      <span className="cf-print-label">{label}</span>
      <span className="cf-print-value">{value}</span>
    </div>
  );
}

function EmploymentPrint({ formData }) {
  const p = formData?.personalInfo || {};
  return (
    <>
      <section className="cf-print-section">
        <h2>Personal Information</h2>
        <Field label="Full name" value={p.fullName} />
        <Field label="Address" value={[p.address, p.city, p.state, p.zip].filter(Boolean).join(', ')} />
        <Field label="Phone" value={p.phone} />
        <Field label="Email" value={p.email} />
        <Field label="Date of birth" value={p.dob} />
        <Field label="Position applied" value={p.positionApplied} />
      </section>
      {(formData?.workHistory || []).map((row, i) => (
        <section key={i} className="cf-print-section">
          <h2>Work History {i + 1}</h2>
          <Field label="Employer" value={row.employer} />
          <Field label="Title" value={row.title} />
          <Field label="Dates" value={[row.from, row.to].filter(Boolean).join(' – ')} />
          <Field label="Reason for leaving" value={row.reasonLeaving} />
        </section>
      ))}
      <section className="cf-print-section">
        <h2>Education</h2>
        <p className="cf-print-block">{formData?.education}</p>
      </section>
      {(formData?.references || []).map((row, i) => (
        <section key={i} className="cf-print-section">
          <h2>Reference {i + 1}</h2>
          <Field label="Name" value={row.name} />
          <Field label="Phone" value={row.phone} />
          <Field label="Relationship" value={row.relationship} />
        </section>
      ))}
      <section className="cf-print-section">
        <h2>Authorization</h2>
        {formData?.authorization?.signature?.startsWith('data:image') && (
          <img src={formData.authorization.signature} alt="Signature" className="cf-print-signature" />
        )}
        <Field label="Date" value={formData?.authorization?.date} />
      </section>
    </>
  );
}

function GenericPrint({ formData }) {
  return (
    <>
      <section className="cf-print-section">
        <h2>Acknowledgment</h2>
        <Field label="Acknowledged" value={formData?.acknowledged ? 'Yes' : 'No'} />
        <Field label="Candidate name" value={formData?.candidateName} />
        <Field label="Notes" value={formData?.notes} />
        {formData?.signature?.startsWith('data:image') && (
          <img src={formData.signature} alt="Signature" className="cf-print-signature" />
        )}
        <Field label="Date" value={formData?.date} />
      </section>
    </>
  );
}

export default function CandidateFormPrintLayout({ data }) {
  const { submission, form_type, document_name, candidate, job, stage, agency_name } = data || {};
  const formData = submission?.form_data || {};

  return (
    <div className="cf-print-root">
      <header className="cf-print-header">
        <h1>{document_name}</h1>
        <p>{agency_name}</p>
        <p>
          {candidate ? `${candidate.first_name} ${candidate.last_name}` : ''}
          {job?.job_title ? ` · ${job.job_title}` : ''}
          {stage?.name ? ` · ${stage.name}` : ''}
        </p>
        {submission?.submitted_at && (
          <p className="cf-print-meta">Submitted {new Date(submission.submitted_at).toLocaleString()}</p>
        )}
      </header>
      {form_type === 'employment_application'
        ? <EmploymentPrint formData={formData} />
        : <GenericPrint formData={formData} />}
    </div>
  );
}
