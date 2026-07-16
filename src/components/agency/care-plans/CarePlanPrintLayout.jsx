import {
  User, Utensils, Footprints, Pill, Home, Heart, ClipboardList,
} from 'lucide-react';
import { CARE_NEED_AREAS, RISK_LEVELS, REVIEW_FREQUENCIES } from '../../../utils/carePlanForm';

const AREA_ICONS = {
  User, Utensils, Footprints, Pill, Home, Heart, ClipboardList,
};

function val(v) { return v === null || v === undefined || v === '' ? '' : String(v); }
function disp(v) { return val(v) || '\u00A0'; }

function Field({ label, value, className = '' }) {
  return (
    <div className={`cp-field ${className}`}>
      <span className="cp-label">{label}</span>
      <span className="cp-value">{disp(value)}</span>
    </div>
  );
}

function Check({ label, on }) {
  return <span className="cp-check"><span className={`cp-box${on ? ' on' : ''}`} />{label}</span>;
}

function YesNo({ label, value }) {
  return (
    <div className="cp-yn-row">
      <span className="cp-label">{label}</span>
      <span className="cp-yn-options">
        <Check label="Yes" on={value === true} />
        <Check label="No" on={value === false} />
      </span>
    </div>
  );
}

function Section({ n, title, children, className = '' }) {
  return (
    <div className={`cp-section ${className}`}>
      <div className="cp-section-head">{n}. {title}</div>
      <div className="cp-section-body">{children}</div>
    </div>
  );
}

function SigBlock({ label, block }) {
  const sig = block || {};
  const isImage = sig.signature?.startsWith?.('data:image');
  return (
    <div className="cp-sig-block">
      <div className="cp-sig-title">{label}</div>
      <div className="cp-row"><Field label="Name:" value={sig.name} className="w100" /></div>
      <div className="cp-sig-line-wrap">
        <span className="cp-label">Signature:</span>
        {isImage ? (
          <div className="cp-sig-img"><img src={sig.signature} alt="signature" /></div>
        ) : (
          <div className="cp-sig-line" />
        )}
      </div>
      <div className="cp-row"><Field label="Date:" value={sig.date} className="w100" /></div>
    </div>
  );
}

function BrandLogo() {
  return (
    <div className="cp-brand">
      <svg className="cp-brand-mark" viewBox="0 0 48 48" aria-hidden>
        <defs>
          <linearGradient id="cp-logo-bg" x1="8" y1="4" x2="40" y2="44" gradientUnits="userSpaceOnUse">
            <stop stopColor="#6b4fd4" />
            <stop offset="1" stopColor="#4b2c82" />
          </linearGradient>
        </defs>
        <rect width="48" height="48" rx="10" fill="url(#cp-logo-bg)" />
        <path
          d="M24 10 L34 18 V30 C34 34 24 38 24 38 C24 38 14 34 14 30 V18 Z"
          fill="none"
          stroke="#fff"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M20 24 C20 21.5 21.8 20 24 20 C26.2 20 28 21.5 28 24 C28 27 24 31 24 31 C24 31 20 27 20 24 Z"
          fill="#fff"
          opacity="0.95"
        />
      </svg>
      <div>
        <div className="cp-brand-name">CareTraker</div>
        <div className="cp-brand-tag">Compassionate Care. Trusted Support.</div>
      </div>
    </div>
  );
}

function AreaIcon({ name }) {
  const Icon = AREA_ICONS[name] || User;
  return (
    <span className="cp-area-icon">
      <Icon size={11} strokeWidth={2.2} />
    </span>
  );
}

function dispDate(v) {
  if (!v) return '\u00A0';
  const d = new Date(v);
  if (!Number.isNaN(d.getTime())) {
    return d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
  }
  return disp(v);
}

function AssessorLine({ label, value }) {
  return (
    <div className="cp-assessor-line">
      <span className="cp-assessor-line-label">{label}:</span>
      <span className="cp-assessor-line-value">{disp(value)}</span>
    </div>
  );
}

function AssessorPhotoPlaceholder() {
  return (
    <svg className="cp-assessor-placeholder-icon" viewBox="0 0 64 80" aria-hidden>
      <circle cx="32" cy="24" r="14" fill="#c4b3e0" />
      <path d="M10 72c4-16 14-24 22-24s18 8 22 24" fill="#c4b3e0" />
    </svg>
  );
}

function AssessorBox({ assessor }) {
  const hasPhoto = assessor.photo?.startsWith?.('data:image');
  return (
    <div className="cp-assessor-box">
      <div className="cp-assessor-head">CARE PLAN ASSESSOR</div>
      <div className="cp-assessor-body">
        <div className="cp-assessor-photo-wrap">
          {hasPhoto ? (
            <img src={assessor.photo} alt="Assessor" className="cp-assessor-photo" />
          ) : (
            <div className="cp-assessor-photo cp-assessor-photo-empty">
              <AssessorPhotoPlaceholder />
            </div>
          )}
        </div>
        <div className="cp-assessor-fields">
          <AssessorLine label="Name" value={assessor.name} />
          <AssessorLine label="Title" value={assessor.title} />
          <AssessorLine label="Phone" value={assessor.phone} />
          <AssessorLine label="Email" value={assessor.email} />
          <AssessorLine label="Date Assessed" value={dispDate(assessor.dateAssessed)} />
        </div>
      </div>
    </div>
  );
}

function FooterContactIcon({ type }) {
  const paths = {
    phone: 'M6.5 3h3l1.2 3.2a1 1 0 0 0 .95.69h2.1a1 1 0 0 1 .98 1.2l-.8 4a1 1 0 0 1-.98.8H11a8 8 0 0 1-8-8v-1.2a1 1 0 0 1 .8-.98L6.5 3z',
    mail: 'M3 6l9 6 9-6v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6zm0 0l9 6 9-6',
    web: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm0 0v18M3 12h18',
    pin: 'M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10z M12 11.5a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6z',
  };
  return (
    <svg className="cp-footer-svg" viewBox="0 0 24 24" aria-hidden>
      <path d={paths[type]} fill="none" stroke="#4b2c82" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function CarePlanPrintLayout({
  form,
  agencyName = 'Your Agency Name',
  agencyContact = {},
}) {
  const d = form?.formData || {};
  const ci = d.clientInfo || {};
  const med = d.medicalInfo || {};
  const sup = d.supplementary || {};
  const assessor = d.assessor || {};
  const risk = d.riskAssessment || {};
  const review = d.carePlanReview || {};
  const auth = d.authorization || {};
  const sig = d.signatures || {};

  return (
    <div className="cp-page">
      <header className="cp-header">
        <BrandLogo />
        <div className="cp-title-block">
          <div className="cp-main-title">CARE PLAN</div>
          <div className="cp-subtitle">Person-Centered. Compassionate. Consistent.</div>
        </div>
        <AssessorBox assessor={assessor} />
      </header>

      <div className="cp-meta">
        <Field label="Plan ID:" value={form?.planCode} />
        <Field label="Effective Date:" value={form?.effectiveDate} />
        <Field label="Review Date:" value={form?.reviewDate} />
        <Field label="Client ID:" value={ci.clientId} />
        <Field label="Version:" value={form?.version} />
      </div>

      <div className="cp-body">
        <Section n="1" title="CLIENT INFORMATION" className="cp-section-full">
          <div className="cp-grid-2">
            <div className="cp-col-stack">
              <Field label="Client Name:" value={ci.clientName} className="w100" />
              <Field label="Date of Birth:" value={ci.dob} className="w100" />
              <Field label="Address:" value={ci.address} className="w100" />
              <div className="cp-row">
                <Field label="City:" value={ci.city} className="w33" />
                <Field label="State:" value={ci.state} className="w33" />
                <Field label="ZIP:" value={ci.zip} className="w33" />
              </div>
              <div className="cp-row">
                <Field label="Phone:" value={ci.phone} className="w50" />
                <Field label="Email:" value={ci.email} className="w50" />
              </div>
              <Field label="Primary Language:" value={ci.primaryLanguage} className="w100" />
            </div>
            <div className="cp-col-stack">
              <div className="cp-checks">
                <span className="cp-label">Gender:</span>
                {['Male', 'Female', 'Other'].map((g) => <Check key={g} label={g} on={ci.gender === g} />)}
              </div>
              <Field label="Marital Status:" value={ci.maritalStatus} className="w100" />
              <Field label="Emergency Contact:" value={ci.emergencyContact} className="w100" />
              <div className="cp-row">
                <Field label="Relationship:" value={ci.emergencyRelationship} className="w50" />
                <Field label="Emergency Phone:" value={ci.emergencyPhone} className="w50" />
              </div>
            </div>
          </div>
        </Section>

        <div className="cp-grid-3 cp-row-triple">
          <Section n="2" title="MEDICAL INFORMATION">
            <div className="cp-col-stack">
              <Field label="Primary Diagnosis / Condition:" value={med.primaryDiagnosis} className="w100" />
              <Field label="Other Diagnoses / Conditions:" value={med.otherDiagnoses} className="w100" />
              <Field label="Allergies:" value={med.allergies} className="w100" />
              <Field label="Physician / Provider:" value={med.physician} className="w100" />
              <Field label="Physician Phone:" value={med.physicianPhone} className="w100" />
              <Field label="Special Instructions / Precautions:" value={med.specialInstructions} className="w100" />
            </div>
          </Section>

          <Section n="3" title="CLIENT GOALS" className="cp-section-goals">
            <p className="cp-muted">(What matters most)</p>
            <ol className="cp-goals-list">
              {(d.clientGoals || ['', '', '', '', '']).map((g, i) => <li key={i}>{disp(g)}</li>)}
            </ol>
          </Section>

          <Section n="4" title="SUPPLEMENTARY ITEMS" className="cp-section-compact">
            <div className="cp-col-stack tight">
              <YesNo label="Advance Directives on File:" value={sup.advanceDirectives} />
              <YesNo label="DNR / POLST:" value={sup.dnrPolst} />
              <Field label="Preferred Hospital:" value={sup.preferredHospital} className="w100" />
              <Field label="Household Members / Caregivers:" value={sup.householdMembers} className="w100" />
              <Field label="Preferred Pharmacy:" value={sup.preferredPharmacy} className="w100" />
              <YesNo label="Transportation Needs:" value={sup.transportationNeeds} />
              <YesNo label="Interpreter Needed:" value={sup.interpreterNeeded} />
              <Field label="Health Insurance:" value={sup.healthInsurance} className="w100" />
              <Field label="Policy / ID #:" value={sup.policyId} className="w100" />
              <Field label="Cultural / Spiritual Considerations:" value={sup.culturalSpiritual} className="w100" />
              <Field label="Other Notes:" value={sup.otherNotes} className="w100" />
            </div>
          </Section>
        </div>

        <Section n="5" title="CARE NEEDS & INTERVENTIONS" className="cp-section-table">
          <table className="cp-table">
            <thead>
              <tr>
                <th className="cp-th-area">Area of Need</th>
                <th>Goals / Expected Outcomes</th>
                <th className="cp-th-interventions">Interventions / Services (Check all that apply)</th>
                <th className="cp-th-freq">Frequency</th>
                <th className="cp-th-staff">Responsible Staff</th>
              </tr>
            </thead>
            <tbody>
              {(d.careNeeds || []).map((row) => {
                const areaDef = CARE_NEED_AREAS.find((a) => a.key === row.areaKey);
                return (
                  <tr key={row.areaKey}>
                    <td>
                      <div className="cp-area">
                        <AreaIcon name={row.icon} />
                        <span>{row.areaLabel}</span>
                      </div>
                    </td>
                    <td><div className="cp-cell-box">{disp(row.goalsOutcomes)}</div></td>
                    <td>
                      <div className="cp-intervention-grid">
                        {areaDef?.interventions.map((int) => (
                          <Check key={int.key} label={int.label} on={row.interventions?.[int.key]} />
                        ))}
                      </div>
                      {row.interventions?.otherText ? (
                        <div className="cp-other-text">Other: {row.interventions.otherText}</div>
                      ) : null}
                    </td>
                    <td><div className="cp-cell-box sm">{disp(row.frequency)}</div></td>
                    <td><div className="cp-cell-box sm">{disp(row.responsibleStaff)}</div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Section>

        <div className="cp-grid-3 cp-row-triple">
          <Section n="6" title="RISK ASSESSMENT">
            <div className="cp-col-stack tight">
              {[{ k: 'fallRisk', l: 'Fall Risk' }, { k: 'skinRisk', l: 'Skin Risk' }, { k: 'elopementRisk', l: 'Elopement Risk' }].map(({ k, l }) => (
                <div key={k} className="cp-risk-row">
                  <span className="cp-label">{l}:</span>
                  {RISK_LEVELS.map((r) => <Check key={r} label={r} on={risk[k] === r} />)}
                </div>
              ))}
              <Field label="Other Risk(s):" value={risk.otherRisks} className="w100" />
              <Field label="Risk Notes / Plan:" value={risk.riskNotes} className="w100 multiline" />
            </div>
          </Section>

          <Section n="7" title="CARE PLAN REVIEW">
            <div className="cp-col-stack tight">
              <div className="cp-checks wrap">
                <span className="cp-label">This care plan will be reviewed:</span>
                {REVIEW_FREQUENCIES.map((f) => <Check key={f} label={f} on={(review.frequencies || []).includes(f)} />)}
              </div>
              {review.frequencyOther ? <div className="cp-other-text">Other: {review.frequencyOther}</div> : null}
              <Field label="Next Review Date:" value={review.nextReviewDate} className="w100" />
              <Field label="Reason for Review:" value={review.reasonForReview} className="w100" />
            </div>
          </Section>

          <Section n="8" title="AUTHORIZATION">
            <div className="cp-col-stack tight">
              <p className="cp-auth-text">
                I have reviewed this care plan and agree with the goals and interventions.
              </p>
              <Field label="Client / Legal Representative Name:" value={auth.representativeName} className="w100" />
              <div className="cp-sig-line-wrap">
                <span className="cp-label">Signature:</span>
                {auth.signature?.startsWith?.('data:image') ? (
                  <div className="cp-sig-img"><img src={auth.signature} alt="auth" /></div>
                ) : (
                  <div className="cp-sig-line" />
                )}
              </div>
              <Field label="Date:" value={auth.date} className="w100" />
            </div>
          </Section>
        </div>

        <Section n="9" title="SIGNATURES" className="cp-section-sigs">
          <div className="cp-sigs">
            <SigBlock label="Client / Legal Representative" block={sig.clientRep} />
            <SigBlock label="Agency Staff / Care Coordinator" block={sig.agencyStaff} />
            <SigBlock label="Supervisor / Manager" block={sig.supervisor} />
          </div>
        </Section>
      </div>

      <footer className="cp-footer">
        <div className="cp-footer-agency">
          <svg className="cp-footer-shield" viewBox="0 0 24 24" aria-hidden>
            <path
              d="M12 2 L20 6 V11 C20 16 16.5 19.5 12 22 C7.5 19.5 4 16 4 11 V6 Z"
              fill="#ede5f7"
              stroke="#4b2c82"
              strokeWidth="1.5"
            />
            <path d="M9 12 L11 14 L15 10" fill="none" stroke="#4b2c82" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <div>
            <strong>{agencyName}</strong>
            <div className="cp-footer-tag">Quality Care. Peace of Mind.</div>
          </div>
        </div>
        <div className="cp-footer-contact">
          {agencyContact.phone && (
            <div><FooterContactIcon type="phone" />{agencyContact.phone}</div>
          )}
          {agencyContact.email && (
            <div><FooterContactIcon type="mail" />{agencyContact.email}</div>
          )}
          {agencyContact.website && (
            <div><FooterContactIcon type="web" />{agencyContact.website}</div>
          )}
          {agencyContact.address && (
            <div><FooterContactIcon type="pin" />{agencyContact.address}</div>
          )}
        </div>
        <div className="cp-footer-brand">
          <div className="cp-footer-powered">Powered by:</div>
          <div className="cp-footer-brand-row">
            <svg className="cp-footer-mark" viewBox="0 0 48 48" aria-hidden>
              <rect width="48" height="48" rx="10" fill="#4b2c82" />
              <path d="M24 10 L34 18 V30 C34 34 24 38 24 38 C24 38 14 34 14 30 V18 Z" fill="none" stroke="#fff" strokeWidth="2" />
              <path d="M20 24 C20 21.5 21.8 20 24 20 C26.2 20 28 21.5 28 24 C28 27 24 31 24 31 C24 31 20 27 20 24 Z" fill="#fff" />
            </svg>
            <strong>CareTraker</strong>
          </div>
        </div>
      </footer>
    </div>
  );
}
