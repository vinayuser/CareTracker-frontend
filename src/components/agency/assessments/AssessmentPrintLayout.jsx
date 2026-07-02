import {
  ADL_ITEMS, ADL_SCORES, ALLERGY_TYPES, AMBULATION_TYPES, ASSESSMENT_TYPES,
  CLIENT_GOALS, CONTACT_METHODS, DECISION_LEVELS, DIET_TYPES, GENDERS, HOME_SAFETY_ITEMS,
  INSURANCE_TYPES, MARITAL_STATUSES, MEDICAL_HISTORY_ITEMS, MEMORY_LEVELS,
  ORIENTATION_LEVELS, REQUESTED_SERVICES, RISK_LEVELS, TRANSFER_TYPES, WEEK_DAYS,
} from '../../../constants/assessmentOptions';

const IADL_ASSISTANCE = ['Shopping', 'Meal Preparation', 'Laundry', 'Transportation', 'Housekeeping'];

function val(v) {
  if (v === null || v === undefined || v === '') return '';
  return String(v);
}

function Field({ label, value, className = '' }) {
  return (
    <div className={`ap-field ${className}`}>
      <span className="ap-label">{label}</span>
      <span className="ap-value">{val(value) || '\u00A0'}</span>
    </div>
  );
}

function Check({ label, on }) {
  return (
    <span className="ap-check">
      <span className={`ap-box${on ? ' on' : ''}`} />
      {label}
    </span>
  );
}

function Checks({ options, selected, single, cols }) {
  const sel = single ? [selected].filter(Boolean) : (selected || []);
  const cls = cols ? `ap-checks cols-${cols}` : 'ap-checks';
  return (
    <div className={cls}>
      {options.map((opt) => (
        <Check key={opt} label={opt} on={sel.includes(opt)} />
      ))}
    </div>
  );
}

function YesNo({ label, value }) {
  return (
    <span className="ap-inline-yn">
      <span className="ap-label">{label}</span>
      <Check label="Yes" on={value === true} />
      <Check label="No" on={value === false} />
    </span>
  );
}

function Section({ n, title, children }) {
  return (
    <div className="ap-section">
      <div className="ap-section-head">{n}. {title}</div>
      <div className="ap-section-body">{children}</div>
    </div>
  );
}

function SigBlock({ label, signature, date }) {
  const isImage = signature?.startsWith?.('data:image');
  return (
    <div className="ap-sig-block">
      <div className="ap-sig-label">{label}</div>
      {isImage ? (
        <div className="ap-sig-img"><img src={signature} alt={label} /></div>
      ) : (
        <div className="ap-sig-line" />
      )}
      <div className="ap-sig-date">Date: {val(date) || '\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0'}</div>
    </div>
  );
}

/* ── Section components ── */

function S01({ ci }) {
  return (
    <Section n="1" title="CLIENT INFORMATION">
      <div className="ap-row"><Field label="Client Name:" value={ci.clientName} className="w100" /></div>
      <div className="ap-row tight">
        <Field label="DOB:" value={ci.dob} className="w33" />
        <Field label="Age:" value={ci.age} className="w33" />
        <div className="ap-checks" style={{ flex: 1 }}>
          <span className="ap-label">Gender:</span>
          {GENDERS.map((g) => <Check key={g} label={g} on={ci.gender === g} />)}
        </div>
      </div>
      <div className="ap-row tight">
        <Field label="SSN (Optional):" value={ci.ssn} className="w50" />
        <Field label="Primary Language:" value={ci.primaryLanguage} className="w50" />
      </div>
      <div className="ap-checks">
        <YesNo label="Interpreter Needed?" value={ci.interpreterNeeded} />
      </div>
      <div className="ap-checks">
        <span className="ap-label">Marital Status:</span>
        {MARITAL_STATUSES.map((m) => <Check key={m} label={m} on={ci.maritalStatus === m} />)}
      </div>
      <div className="ap-row tight">
        <Field label="Religion:" value={ci.religion} className="w33" />
        <Field label="Height:" value={ci.height} className="w33" />
        <Field label="Weight:" value={ci.weight} className="w33" />
      </div>
      <div className="ap-row"><Field label="Primary Diagnosis:" value={ci.primaryDiagnosis} className="w100" /></div>
      <div className="ap-row"><Field label="Secondary Diagnoses:" value={ci.secondaryDiagnoses} className="w100" /></div>
    </Section>
  );
}

function S02({ ct }) {
  return (
    <Section n="2" title="CONTACT INFORMATION">
      <div className="ap-row"><Field label="Home Address:" value={ct.homeAddress} className="w100" /></div>
      <div className="ap-row tight">
        <Field label="City:" value={ct.city} className="w33" />
        <Field label="State:" value={ct.state} className="w33" />
        <Field label="ZIP:" value={ct.zip} className="w33" />
      </div>
      <div className="ap-row tight">
        <Field label="Home Phone:" value={ct.homePhone} className="w50" />
        <Field label="Mobile:" value={ct.mobile} className="w50" />
      </div>
      <div className="ap-row"><Field label="Email:" value={ct.email} className="w100" /></div>
      <div className="ap-checks">
        <span className="ap-label">Preferred Contact Method:</span>
        {CONTACT_METHODS.map((m) => <Check key={m} label={m} on={(ct.preferredContactMethods || []).includes(m)} />)}
      </div>
    </Section>
  );
}

function S03({ rp }) {
  return (
    <Section n="3" title="RESPONSIBLE PARTY">
      <div className="ap-row"><Field label="Primary Contact:" value={rp.name} className="w100" /></div>
      <div className="ap-row tight">
        <Field label="Relationship:" value={rp.relationship} className="w50" />
        <Field label="Phone:" value={rp.phone} className="w50" />
      </div>
      <div className="ap-row"><Field label="Email:" value={rp.email} className="w100" /></div>
      <div className="ap-checks">
        <YesNo label="Power of Attorney" value={rp.powerOfAttorney} />
        <YesNo label="Medical POA" value={rp.medicalPoa} />
        <YesNo label="Guardian" value={rp.guardian} />
      </div>
    </Section>
  );
}

function S04({ ph }) {
  return (
    <Section n="4" title="PHYSICIAN INFORMATION">
      <div className="ap-row tight">
        <Field label="Primary Care Physician:" value={ph.primaryPhysician} className="w50" />
        <Field label="Phone:" value={ph.primaryPhysicianPhone} className="w50" />
      </div>
      <div className="ap-row"><Field label="Specialists:" value={ph.specialists} className="w100" /></div>
      <div className="ap-row"><Field label="Preferred Hospital:" value={ph.preferredHospital} className="w100" /></div>
      <div className="ap-row tight">
        <Field label="Pharmacy:" value={ph.pharmacy} className="w50" />
        <Field label="Phone:" value={ph.pharmacyPhone} className="w50" />
      </div>
    </Section>
  );
}

function S05({ ins }) {
  return (
    <Section n="5" title="INSURANCE">
      <Checks options={INSURANCE_TYPES} selected={ins.types} cols={3} />
      <div className="ap-row tight">
        <Field label="Policy Number:" value={ins.policyNumber} className="w50" />
        <Field label="Authorization #:" value={ins.authorizationNumber} className="w50" />
      </div>
      <div className="ap-row tight">
        <Field label="Hours Authorized:" value={ins.hoursAuthorized} className="w50" />
        <Field label="Start Date:" value={ins.startDate} className="w50" />
      </div>
    </Section>
  );
}

function S06({ em }) {
  return (
    <Section n="6" title="EMERGENCY INFORMATION">
      <div className="ap-row tight">
        <Field label="Emergency Contact:" value={em.primaryName} className="w33" />
        <Field label="Relationship:" value={em.primaryRelationship} className="w33" />
        <Field label="Phone:" value={em.primaryPhone} className="w33" />
      </div>
      <div className="ap-row tight">
        <Field label="Backup Contact:" value={em.backupName} className="w33" />
        <Field label="Relationship:" value={em.backupRelationship} className="w33" />
        <Field label="Phone:" value={em.backupPhone} className="w33" />
      </div>
    </Section>
  );
}

function S07({ d }) {
  return (
    <Section n="7" title="MEDICAL HISTORY">
      <Checks options={MEDICAL_HISTORY_ITEMS} selected={d.medicalHistory} cols={4} />
      <div className="ap-row"><Field label="Other:" value={d.medicalHistoryOther} className="w100" /></div>
    </Section>
  );
}

function S08({ allergies }) {
  return (
    <Section n="8" title="ALLERGIES">
      <Checks options={ALLERGY_TYPES} selected={allergies?.types} />
      <div className="ap-row"><Field label="Details:" value={allergies?.details} className="w100" /></div>
    </Section>
  );
}

function S09({ meds }) {
  return (
    <Section n="9" title="CURRENT MEDICATIONS">
      <table className="ap-table">
        <thead>
          <tr>
            <th>Medication</th>
            <th>Dosage</th>
            <th>Frequency</th>
            <th>Purpose</th>
            <th>Self Managed</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 6 }, (_, i) => meds[i] || {}).map((med, i) => (
            <tr key={i}>
              <td>{val(med.name) || '\u00A0'}</td>
              <td>{val(med.dosage) || '\u00A0'}</td>
              <td>{val(med.frequency) || '\u00A0'}</td>
              <td>{val(med.purpose) || '\u00A0'}</td>
              <td>
                <Check label="Yes" on={med.selfManaged === true} />
                {' '}
                <Check label="No" on={med.selfManaged === false} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Section>
  );
}

function S10({ d }) {
  return (
    <Section n="10" title="ACTIVITIES OF DAILY LIVING (ADLs)">
      <div className="ap-adl-legend">
        0=Independent &nbsp; 1=Supervision &nbsp; 2=Limited Assistance &nbsp; 3=Extensive Assistance &nbsp; 4=Total Dependence
      </div>
      <table className="ap-adl-table">
        <thead>
          <tr>
            <th />
            {ADL_SCORES.map((s) => <th key={s}>{s}</th>)}
          </tr>
        </thead>
        <tbody>
          {ADL_ITEMS.map((item) => (
            <tr key={item}>
              <td>{item}</td>
              {ADL_SCORES.map((s) => (
                <td key={s}>{d.adls?.[item] === s ? <span className="ap-adl-mark">✓</span> : ''}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="ap-row" style={{ marginTop: '0.02in' }}>
        <Field label="Comments:" value={d.adlComments} className="w100" />
      </div>
    </Section>
  );
}

function S11({ d }) {
  return (
    <Section n="11" title="INSTRUMENTAL ACTIVITIES OF DAILY LIVING (IADLs)">
      <div className="ap-iadl-2col">
        {IADL_ASSISTANCE.map((item) => (
          <div key={item} className="ap-iadl-row">
            <span className="ap-iadl-name">{item}</span>
            <span className="ap-iadl-opts">
              <Check label="Independent" on={d.iadls?.[item] === 'Independent'} />
              <Check label="Assistance" on={d.iadls?.[item] === 'Assistance'} />
            </span>
          </div>
        ))}
        <div className="ap-iadl-row">
          <span className="ap-iadl-name">Medication Reminder</span>
          <span className="ap-iadl-opts">
            <Check label="Needed" on={d.medicationReminder === 'Needed'} />
            <Check label="Not Needed" on={d.medicationReminder === 'Not Needed'} />
          </span>
        </div>
        <div className="ap-iadl-row">
          <span className="ap-iadl-name">Financial Management</span>
          <span className="ap-iadl-opts">
            <Check label="Needed" on={d.iadls?.['Financial Management'] === 'Needed'} />
            <Check label="Not Needed" on={d.iadls?.['Financial Management'] === 'Not Needed'} />
          </span>
        </div>
      </div>
    </Section>
  );
}

function S12({ mob }) {
  return (
    <Section n="12" title="MOBILITY">
      <div className="ap-checks">
        <span className="ap-label">Ambulates:</span>
        {AMBULATION_TYPES.map((t) => <Check key={t} label={t} on={(mob.ambulation || []).includes(t)} />)}
      </div>
      <div className="ap-checks">
        <span className="ap-label">Transfer Assistance:</span>
        {TRANSFER_TYPES.map((t) => <Check key={t} label={t} on={(mob.transferAssistance || []).includes(t)} />)}
      </div>
      <div className="ap-checks">
        <YesNo label="History of Falls" value={mob.fallHistory} />
        <Field label="Number of Falls:" value={mob.fallCount} />
      </div>
    </Section>
  );
}

function S13({ cog }) {
  return (
    <Section n="13" title="COGNITIVE STATUS">
      <div className="ap-checks">
        <span className="ap-label">Alert &amp; Oriented:</span>
        {ORIENTATION_LEVELS.map((o) => <Check key={o} label={o} on={cog.orientation === o} />)}
      </div>
      <div className="ap-checks">
        <span className="ap-label">Memory:</span>
        {MEMORY_LEVELS.map((m) => <Check key={m} label={m} on={cog.memory === m} />)}
      </div>
      <div className="ap-checks">
        <span className="ap-label">Decision Making:</span>
        {DECISION_LEVELS.map((d) => <Check key={d} label={d} on={cog.decisionMaking === d} />)}
      </div>
      <div className="ap-checks">
        <YesNo label="Confusion" value={cog.confusion} />
        <YesNo label="Wandering" value={cog.wandering} />
      </div>
      <div className="ap-subhead">Behavior Concerns</div>
      <div className="ap-textarea xs">{val(cog.behaviorConcerns) || '\u00A0'}</div>
    </Section>
  );
}

function S14({ homeSafety }) {
  return (
    <Section n="14" title="HOME SAFETY">
      <div className="ap-safety-2col">
        {HOME_SAFETY_ITEMS.map((item) => (
          <div key={item} className="ap-safety-row">
            <span>{item}</span>
            <span>
              <Check label="Yes" on={homeSafety?.[item] === true} />
              <Check label="No" on={homeSafety?.[item] === false} />
            </span>
          </div>
        ))}
      </div>
    </Section>
  );
}

function S15({ nut }) {
  return (
    <Section n="15" title="NUTRITION">
      <div className="ap-checks cols-2">
        {DIET_TYPES.map((t) => <Check key={t} label={t} on={(nut.dietTypes || []).includes(t)} />)}
      </div>
      <div className="ap-checks">
        <YesNo label="Weight Loss" value={nut.weightLoss} />
        <YesNo label="Meal Assistance" value={nut.mealAssistance} />
        <YesNo label="Fluid Restrictions" value={nut.fluidRestrictions} />
      </div>
    </Section>
  );
}

function S16({ pain }) {
  return (
    <Section n="16" title="PAIN ASSESSMENT">
      <YesNo label="Pain Today" value={pain.painToday} />
      <div className="ap-row tight">
        <Field label="Pain Score (0-10):" value={pain.painScore} className="w50" />
        <Field label="Location:" value={pain.location} className="w50" />
      </div>
      <div className="ap-row"><Field label="Pain Medication:" value={pain.painMedication} className="w100" /></div>
    </Section>
  );
}

function S17({ mh }) {
  return (
    <Section n="17" title="MENTAL HEALTH">
      <div className="ap-checks">
        <YesNo label="Depression" value={mh.depression} />
        <YesNo label="Anxiety" value={mh.anxiety} />
      </div>
      <div className="ap-subhead">Behavioral Concerns</div>
      <div className="ap-textarea xs">{val(mh.behavioralConcerns) || '\u00A0'}</div>
    </Section>
  );
}

function S18({ d }) {
  return (
    <Section n="18" title="CLIENT GOALS">
      <Checks options={CLIENT_GOALS} selected={d.clientGoals} cols={2} />
      <div className="ap-row"><Field label="Other:" value={d.clientGoalsOther} className="w100" /></div>
    </Section>
  );
}

function S19({ d }) {
  return (
    <Section n="19" title="REQUESTED SERVICES">
      <Checks options={REQUESTED_SERVICES} selected={d.requestedServices} cols={2} />
    </Section>
  );
}

function S20({ sch }) {
  return (
    <Section n="20" title="SCHEDULE">
      <Checks options={WEEK_DAYS} selected={sch.daysNeeded} cols={4} />
      <div className="ap-row tight">
        <Field label="Preferred Hours Start:" value={sch.preferredStart} className="w50" />
        <Field label="End:" value={sch.preferredEnd} className="w50" />
      </div>
    </Section>
  );
}

function S21({ notes }) {
  return (
    <Section n="21" title="CARE COORDINATOR NOTES">
      <div className="ap-textarea md">{val(notes) || '\u00A0'}</div>
    </Section>
  );
}

function S22({ cps }) {
  return (
    <Section n="22" title="CARE PLAN SUMMARY">
      <div className="ap-row"><Field label="Primary Needs:" value={cps.primaryNeeds} className="w100" /></div>
      <div className="ap-checks">
        <span className="ap-label">Risk Level:</span>
        {RISK_LEVELS.map((r) => <Check key={r} label={r} on={cps.riskLevel === r} />)}
      </div>
      <div className="ap-row tight">
        <Field label="Recommended Weekly Hours:" value={cps.recommendedWeeklyHours} className="w50" />
        <Field label="Start of Care:" value={cps.startOfCareDate} className="w50" />
      </div>
    </Section>
  );
}

function S23({ sig }) {
  return (
    <Section n="23" title="ELECTRONIC SIGNATURES">
      <div className="ap-sigs">
        <SigBlock label="Client Signature" signature={sig.clientSignature} date={sig.clientDate} />
        <SigBlock label="Responsible Party Signature" signature={sig.responsiblePartySignature} date={sig.responsiblePartyDate} />
        <SigBlock label="Care Coordinator Signature" signature={sig.coordinatorSignature} date={sig.coordinatorDate} />
      </div>
    </Section>
  );
}

/* ── Main layout ── */

export default function AssessmentPrintLayout({ form, agencyName = 'CareTraker Agency' }) {
  const d = form?.formData || {};

  return (
    <div className="ap-page">
      {/* Header */}
      <header className="ap-header">
        <div className="ap-agency">
          <div className="ap-logo">♥</div>
          <div className="ap-agency-block">
            <div className="ap-agency-label">AGENCY NAME:</div>
            <div className="ap-agency-name">{agencyName}</div>
          </div>
        </div>
        <div className="ap-title-block">
          <div className="ap-main-title">CLIENT ASSESSMENT FORM</div>
          <div className="ap-assess-date">ASSESSMENT DATE: {val(form?.assessmentDate) || '________________'}</div>
        </div>
        <div className="ap-assessor">
          {form?.assessorPhoto?.startsWith?.('data:image') ? (
            <img src={form.assessorPhoto} alt="Assessor" className="ap-assessor-photo" />
          ) : (
            <div className="ap-assessor-photo ap-assessor-photo-empty" />
          )}
          <div>
            <span className="ap-assessor-label">ASSESSOR NAME: </span>
            <span className="ap-assessor-name">{val(form?.assessorName) || '________________'}</span>
          </div>
          <div className="ap-assessor-role">{val(form?.assessorTitle) || 'Care Assessment Specialist'}</div>
        </div>
      </header>

      {/* Assessment type */}
      <div className="ap-type-row">
        <span className="ap-type-label">ASSESSMENT TYPE:</span>
        {ASSESSMENT_TYPES.map((t) => (
          <Check key={t} label={t} on={(form?.assessmentTypes || []).includes(t)} />
        ))}
      </div>

      {/* Body grid — matches PDF column placement */}
      <div className="ap-body">
        {/* LEFT column: 1, 4, 6, 8, 9, 11, 13 */}
        <div className="ap-col">
          <S01 ci={d.clientInfo || {}} />
          <S04 ph={d.physicianInfo || {}} />
          <S06 em={d.emergencyInfo || {}} />
          <S08 allergies={d.allergies} />
          <S09 meds={d.medications || []} />
          <S11 d={d} />
          <S13 cog={d.cognitiveStatus || {}} />
        </div>

        {/* RIGHT column: 2, 3, 5, 7, 10, 12, 14 */}
        <div className="ap-col">
          <S02 ct={d.contactInfo || {}} />
          <S03 rp={d.responsibleParty || {}} />
          <S05 ins={d.insurance || {}} />
          <S07 d={d} />
          <S10 d={d} />
          <S12 mob={d.mobility || {}} />
          <S14 homeSafety={d.homeSafety} />
        </div>

        {/* Triple row: 15, 16, 17 */}
        <div className="ap-triple">
          <S15 nut={d.nutrition || {}} />
          <S16 pain={d.painAssessment || {}} />
          <S17 mh={d.mentalHealth || {}} />
        </div>

        {/* Triple row: 18, 19, 20 */}
        <div className="ap-triple">
          <S18 d={d} />
          <S19 d={d} />
          <S20 sch={d.schedule || {}} />
        </div>

        {/* Full width: 21, 22, 23 */}
        <div className="ap-full"><S21 notes={d.coordinatorNotes} /></div>
        <div className="ap-full"><S22 cps={d.carePlanSummary || {}} /></div>
        <div className="ap-full"><S23 sig={d.signatures || {}} /></div>
      </div>

      <footer className="ap-footer">
        Powered by: <strong>CareTraker</strong> <span className="ap-footer-logo">♥</span>
      </footer>
    </div>
  );
}
