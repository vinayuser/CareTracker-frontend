import {
  PRIMARY_INSURANCE_TYPES, GENDERS, MARITAL_STATUSES, RELATIONSHIPS,
  MEDICARE_TYPES, AUTH_STATUSES, REQUIRED_DOCUMENTS,
} from '../../../utils/insuranceIntakeForm';

function val(v) { return v === null || v === undefined || v === '' ? '' : String(v); }
function disp(v) { return val(v) || '\u00A0'; }

function Field({ label, value, className = '' }) {
  return (
    <div className={`ii-field ${className}`}>
      <span className="ii-label">{label}</span>
      <span className="ii-value">{disp(value)}</span>
    </div>
  );
}

function Check({ label, on }) {
  return <span className="ii-check"><span className={`ii-box${on ? ' on' : ''}`} />{label}</span>;
}

function YesNo({ label, value }) {
  return (
    <span className="ii-inline-yn">
      <span className="ii-label">{label}</span>
      <Check label="Yes" on={value === true} /><Check label="No" on={value === false} />
    </span>
  );
}

function Section({ n, title, children, className = '' }) {
  return (
    <div className={`ii-section ${className}`}>
      <div className="ii-section-head"><span className="ii-section-num">{n}</span> {title}</div>
      <div className="ii-section-body">{children}</div>
    </div>
  );
}

export default function InsuranceIntakePrintLayout({ form }) {
  const d = form?.formData || {};
  const ci = d.clientInfo || {};
  const pri = d.primaryInsurance || {};
  const sec = d.secondaryInsurance || {};
  const rx = d.prescriptionCoverage || {};
  const med = d.medicare || {};
  const mcd = d.medicaid || {};
  const add = d.additionalCoverage || {};
  const auth = d.authorization || {};
  const docs = d.requiredDocuments || {};
  const office = d.officeUse || {};

  return (
    <div className="ii-page">
      <header className="ii-header">
        <div className="ii-brand">
          <div className="ii-logo">♥</div>
          <div>
            <div className="ii-brand-name">CareTraker</div>
            <div className="ii-brand-tag">Home Care Management</div>
          </div>
        </div>
        <div className="ii-title-block">
          <div className="ii-main-title">CLIENT INSURANCE INTAKE FORM</div>
          <div className="ii-subtitle">Please complete all information to help us verify your insurance and maximize your benefits.</div>
        </div>
        <div className="ii-meta-box">
          <Field label="Intake Date:" value={form?.intakeDate} className="w100" />
          <Field label="Intake ID:" value={form?.intakeCode} className="w100" />
        </div>
      </header>

      <div className="ii-body">
        <Section n="1" title="CLIENT INFORMATION" className="ii-section-full">
          <div className="ii-grid-2">
            <div className="ii-col-stack">
              <Field label="Client Full Name:" value={ci.clientFullName} className="w100" />
              <div className="ii-row">
                <Field label="Date of Birth:" value={ci.dob} className="w50" />
                <div className="ii-checks"><span className="ii-label">Gender:</span>{GENDERS.map((g) => <Check key={g} label={g} on={ci.gender === g} />)}</div>
              </div>
              <Field label="Address:" value={ci.address} className="w100" />
              <div className="ii-row">
                <Field label="City:" value={ci.city} className="w33" />
                <Field label="State:" value={ci.state} className="w33" />
                <Field label="ZIP:" value={ci.zip} className="w33" />
              </div>
              <div className="ii-row">
                <Field label="Phone (Home):" value={ci.phoneHome} className="w50" />
                <Field label="Phone (Mobile):" value={ci.phoneMobile} className="w50" />
              </div>
              <Field label="Email:" value={ci.email} className="w100" />
            </div>
            <div className="ii-col-stack">
              <div className="ii-checks"><span className="ii-label">Marital Status:</span>{MARITAL_STATUSES.map((m) => <Check key={m} label={m} on={ci.maritalStatus === m} />)}</div>
              <Field label="SSN (Last 4):" value={ci.ssnLast4 ? `XXX-XX-${ci.ssnLast4}` : ''} className="w100" />
              <Field label="Preferred Language:" value={ci.preferredLanguage} className="w100" />
              <Field label="Emergency Contact Name:" value={ci.emergencyContactName} className="w100" />
              <div className="ii-row">
                <Field label="Relationship:" value={ci.emergencyRelationship} className="w50" />
                <Field label="Phone:" value={ci.emergencyPhone} className="w50" />
              </div>
            </div>
          </div>
        </Section>

        <Section n="2" title="PRIMARY INSURANCE INFORMATION" className="ii-section-full">
          <div className="ii-checks wrap">
            <span className="ii-label">Insurance Type:</span>
            {PRIMARY_INSURANCE_TYPES.map((t) => <Check key={t} label={t} on={(pri.types || []).includes(t)} />)}
            {pri.otherType && <span> — {pri.otherType}</span>}
          </div>
          <div className="ii-grid-2">
            <div className="ii-col-stack">
              <Field label="Insurance Company Name:" value={pri.companyName} className="w100" />
              <Field label="Member ID / Policy #:" value={pri.memberId} className="w100" />
              <Field label="Policy Holder Name:" value={pri.policyHolderName} className="w100" />
              <div className="ii-checks"><span className="ii-label">Relationship:</span>{RELATIONSHIPS.map((r) => <Check key={r} label={r} on={pri.policyHolderRelationship === r} />)}{pri.policyHolderRelationshipOther && <span> ({pri.policyHolderRelationshipOther})</span>}</div>
              <Field label="Insurance Phone:" value={pri.insurancePhone} className="w100" />
            </div>
            <div className="ii-col-stack">
              <Field label="Plan Name:" value={pri.planName} className="w100" />
              <Field label="Group #:" value={pri.groupNumber} className="w100" />
              <Field label="Policy Holder DOB:" value={pri.policyHolderDob} className="w100" />
              <Field label="Effective Date:" value={pri.effectiveDate} className="w100" />
              <Field label="Claims Address:" value={pri.claimsAddress} className="w100" />
            </div>
          </div>
        </Section>

        <div className="ii-row-pair">
          <Section n="3" title="SECONDARY INSURANCE (IF APPLICABLE)">
            <Field label="Insurance Company:" value={sec.companyName} className="w100" />
            <Field label="Member ID / Policy #:" value={sec.memberId} className="w100" />
            <Field label="Group #:" value={sec.groupNumber} className="w100" />
            <Field label="Policy Holder Name:" value={sec.policyHolderName} className="w100" />
            <Field label="Date of Birth:" value={sec.dob} className="w100" />
            <div className="ii-checks"><span className="ii-label">Relationship:</span>{RELATIONSHIPS.map((r) => <Check key={r} label={r} on={sec.relationship === r} />)}</div>
          </Section>
          <Section n="4" title="PRESCRIPTION COVERAGE">
            <Field label="Rx Insurance Company:" value={rx.companyName} className="w100" />
            <Field label="Rx Member ID:" value={rx.memberId} className="w100" />
            <Field label="Rx Group #:" value={rx.groupNumber} className="w100" />
            <Field label="Rx BIN #:" value={rx.bin} className="w100" />
            <Field label="Rx PCN:" value={rx.pcn} className="w100" />
            <Field label="Rx Phone:" value={rx.phone} className="w100" />
            <Field label="Copay Structure:" value={rx.copayStructure} className="w100" />
          </Section>
        </div>

        <div className="ii-row-pair">
          <Section n="5" title="MEDICARE INFORMATION (IF APPLICABLE)">
            <Field label="Medicare Number:" value={med.number} className="w100" />
            <div className="ii-checks col">{MEDICARE_TYPES.map((t) => <Check key={t} label={t} on={(med.types || []).includes(t)} />)}</div>
            <Field label="Part A Effective Date:" value={med.partAEffectiveDate} className="w100" />
            <Field label="Part B Effective Date:" value={med.partBEffectiveDate} className="w100" />
            <Field label="Advantage Plan Name:" value={med.advantagePlanName} className="w100" />
            <Field label="Plan ID Number:" value={med.planIdNumber} className="w100" />
          </Section>
          <Section n="6" title="MEDICAID INFORMATION (IF APPLICABLE)">
            <Field label="Medicaid Number:" value={mcd.number} className="w100" />
            <Field label="State:" value={mcd.state} className="w100" />
            <Field label="Managed Care Plan:" value={mcd.managedCarePlan} className="w100" />
            <Field label="Member ID:" value={mcd.memberId} className="w100" />
            <Field label="Effective Date:" value={mcd.effectiveDate} className="w100" />
            <Field label="Case Worker Name:" value={mcd.caseWorkerName} className="w100" />
            <Field label="Case Worker Phone:" value={mcd.caseWorkerPhone} className="w100" />
          </Section>
        </div>

        <div className="ii-row-pair">
          <Section n="7" title="ADDITIONAL COVERAGE">
            <YesNo label="Veteran Benefits (VA):" value={add.vaBenefits} />
            <Field label="VA Claim #:" value={add.vaClaimNumber} className="w100" />
            <YesNo label="Long Term Care Insurance:" value={add.longTermCare} />
            <Field label="Policy / Claim #:" value={add.ltcPolicyClaimNumber} className="w100" />
            <Field label="Insurance Company:" value={add.ltcCompany} className="w100" />
          </Section>
          <Section n="8" title="ASSIGNMENT & AUTHORIZATION">
            <p className="ii-auth-text">I authorize CareTraker to verify my insurance benefits, submit claims, communicate with my insurance company, and release information as necessary to process payment for services.</p>
            <Field label="Print Name:" value={auth.printName} className="w100" />
            {auth.signature?.startsWith?.('data:image') ? (
              <div className="ii-sig-img"><img src={auth.signature} alt="signature" /></div>
            ) : (
              <div className="ii-sig-line" />
            )}
            <Field label="Date:" value={auth.date} className="w100" />
          </Section>
        </div>

        <Section n="9" title="REQUIRED DOCUMENTS" className="ii-section-docs">
          <p className="ii-muted">(Please check which you have provided)</p>
          <div className="ii-docs-grid">
            {REQUIRED_DOCUMENTS.map(({ key, label }) => (
              <div key={key} className="ii-doc-item">
                <div className="ii-doc-icon">📄</div>
                <div className="ii-doc-label">{label}</div>
                <Check label="" on={docs[key]} />
              </div>
            ))}
          </div>
        </Section>

        <Section n="10" title="FOR OFFICE USE ONLY" className="ii-section-office">
          <div className="ii-grid-2">
            <div className="ii-col-stack">
              <Field label="Insurance Verified By:" value={office.verifiedBy} className="w100" />
              <Field label="Date:" value={office.date} className="w100" />
              <YesNo label="Coverage Confirmed:" value={office.coverageConfirmed} />
              <Field label="Notes:" value={office.notes} className="w100 multiline" />
            </div>
            <div className="ii-col-stack">
              <div className="ii-row">
                <Field label="Copay $:" value={office.copay} className="w33" />
                <Field label="Deductible $:" value={office.deductible} className="w33" />
                <Field label="Coinsurance %:" value={office.coinsurance} className="w33" />
              </div>
              <YesNo label="Authorization Required:" value={office.authorizationRequired} />
              <div className="ii-checks"><span className="ii-label">Auth Status:</span>{AUTH_STATUSES.map((s) => <Check key={s} label={s} on={office.authStatus === s} />)}</div>
              <Field label="Next Review Date:" value={office.nextReviewDate} className="w100" />
            </div>
          </div>
        </Section>
      </div>

      <footer className="ii-footer">
        <div className="ii-footer-brand">
          <strong>CareTraker</strong>
          <div>Thank you for choosing CareTraker. We are committed to your care and comfort.</div>
        </div>
        <div className="ii-footer-contact">
          <div>Phone: (888) 123-4567</div>
          <div>Email: support@caretraker.com</div>
          <div>Web: www.caretraker.com</div>
        </div>
      </footer>
    </div>
  );
}
