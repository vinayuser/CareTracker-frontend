const REC_LABELS = {
  strong_hire: 'Strong Hire',
  hire: 'Hire',
  hold: 'Hold',
  reject: 'Reject',
};

function Detail({ label, value }) {
  if (value == null || value === '') return null;
  return (
    <div>
      <div className="label">{label}</div>
      <div className="value">{value}</div>
    </div>
  );
}

export default function InterviewFeedbackPrintLayout({ data }) {
  const form = data?.form || {};
  const skills = data?.options?.skills || Object.keys(form.skillRatings || {});
  const rounds = data?.pipeline_rounds || [];
  const stageName = data?.stage?.name || form.stageName || 'Stage';
  const agencyName = data?.agency_name || 'CareTraker';

  return (
    <div className="if-print-root">
      <header className="if-print-header">
        <h1>Caregiver Interview Assessment</h1>
        <p>{agencyName}</p>
        <p>
          Round / Stage: <strong>{stageName}</strong>
          {data?.feedback_status ? ` · ${data.feedback_status}` : ''}
        </p>
      </header>

      <div className="if-print-grid">
        <Detail label="Candidate Name" value={form.candidateName} />
        <Detail label="Position Applied" value={form.positionApplied} />
        <Detail label="Interview Date" value={form.interviewDate} />
        <Detail label="Experience" value={form.experience} />
        <Detail label="Recruiter" value={form.recruiter} />
        <Detail label="Location" value={form.location} />
        <Detail label="Current CTC" value={form.currentCtc} />
        <Detail label="Expected CTC" value={form.expectedCtc} />
        <Detail label="Notice Period" value={form.noticePeriod} />
        <Detail label="Joining Availability" value={form.joiningAvailability} />
      </div>

      <section className="if-print-section">
        <h2>Skill / Competency ratings</h2>
        <p className="if-muted" style={{ marginBottom: '0.5rem' }}>
          Rating: 1-Poor · 2-Basic · 3-Competent · 4-Good · 5-Excellent
        </p>
        <table className="if-print-table">
          <thead>
            <tr>
              <th>Skill / Competency</th>
              {[1, 2, 3, 4, 5].map((n) => (
                <th key={n} className="center">{n}</th>
              ))}
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {skills.map((skill) => {
              const row = form.skillRatings?.[skill] || {};
              return (
                <tr key={skill}>
                  <td>{skill}</td>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <td key={n} className="center">
                      {Number(row.rating) === n ? '●' : ''}
                    </td>
                  ))}
                  <td>{row.remarks || ''}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <section className="if-print-section">
        <h2>Pipeline round remarks</h2>
        <table className="if-print-table">
          <thead>
            <tr>
              <th>Round</th>
              <th>Stage</th>
              <th>Status</th>
              <th>Remarks</th>
              <th>Signature</th>
            </tr>
          </thead>
          <tbody>
            {rounds.map((round) => {
              const isCurrent = round.stage_id === data?.stage?.id;
              const remarks = isCurrent ? (form.stageRemarks || round.remarks) : round.remarks;
              const signature = isCurrent
                ? (form.authorizedSignature || round.signature)
                : round.signature;
              return (
                <tr key={round.stage_id}>
                  <td>{round.round}</td>
                  <td>
                    {round.stage_name}
                    {isCurrent ? ' (current)' : ''}
                  </td>
                  <td>{round.status || (isCurrent ? data?.feedback_status : null) || 'Pending'}</td>
                  <td>{remarks || '—'}</td>
                  <td>
                    {signature?.startsWith('data:image') ? (
                      <img src={signature} alt="" className="if-sig" />
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              );
            })}
            {rounds.length === 0 && (
              <tr>
                <td colSpan={5}>
                  {form.stageRemarks || 'No round remarks'}
                  {form.authorizedSignature?.startsWith('data:image') && (
                    <div>
                      <img src={form.authorizedSignature} alt="" className="if-sig" />
                    </div>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <section className="if-print-section">
        <h2>Final recommendation</h2>
        <div className="if-print-grid">
          <Detail label="Overall Score" value={form.overallScore} />
          <Detail
            label="Final Recommendation"
            value={REC_LABELS[form.finalRecommendation] || form.finalRecommendation}
          />
          <Detail label="Recommended Client Type" value={form.recommendedClientType} />
          <Detail label="Shift" value={form.shift} />
          <Detail label="Training Required" value={form.trainingRequired} />
          <Detail label="Expected Joining" value={form.expectedJoining} />
        </div>
        {form.finalComments && (
          <div style={{ marginTop: '0.5rem' }}>
            <div className="label">Final Comments</div>
            <div className="value" style={{ fontWeight: 400, whiteSpace: 'pre-wrap' }}>
              {form.finalComments}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
