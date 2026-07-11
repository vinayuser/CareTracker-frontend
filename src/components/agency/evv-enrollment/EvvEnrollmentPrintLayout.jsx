import {
  GENDERS, RELATIONSHIPS, EVV_METHODS, SMARTPHONE_TYPES, PHONE_TYPES,
} from '../../../utils/evvEnrollmentForm';

function disp(v) { return v === null || v === undefined || v === '' ? '\u00A0' : String(v); }

function Field({ label, value, className = '' }) {
  return (
    <div className={`ev-field ${className}`}>
      <span className="ev-label">{label}</span>
      <span className="ev-value">{disp(value)}</span>
    </div>
  );
}

function Check({ label, on }) {
  return <span className="ev-check"><span className={`ev-box${on ? ' on' : ''}`} />{label}</span>;
}

function Section({ n, title, subtitle, children, className = '' }) {
  return (
    <div className={`ev-section ${className}`}>
      <div className="ev-section-head">
        <span className="ev-section-num">{n}</span>
        <span>{title}</span>
        {subtitle && <span className="ev-section-head-sub">{subtitle}</span>}
      </div>
      <div className="ev-section-body">{children}</div>
    </div>
  );
}

function SigBlock({ label, signature, date }) {
  return (
    <div className="ev-sig-block">
      <div className="ev-sig-label">{label}</div>
      {signature?.startsWith?.('data:image') ? (
        <div className="ev-sig-img"><img src={signature} alt="signature" /></div>
      ) : (
        <div className="ev-sig-line" />
      )}
      <div className="ev-sig-date">
        <span className="ev-label">Date:</span>
        <span className="ev-value">{disp(date)}</span>
      </div>
    </div>
  );
}

export default function EvvEnrollmentPrintLayout({ form }) {
  const d = form?.formData || {};
  const ci = d.clientInfo || {};
  const cg = d.caregiverInfo || {};
  const svc = d.serviceInfo || {};
  const methods = d.evvMethods || {};
  const mobile = d.mobileEnrollment || {};
  const land = d.landlineEnrollment || {};
  const auth = d.authorization || {};
  const training = d.trainingAck || {};
  const office = d.officeUse || {};

  return (
    <div className="ev-page">
      <header className="ev-header">
        <div className="ev-brand">
          <div className="ev-logo">♥</div>
          <div>
            <div className="ev-brand-domain">caretraker.com</div>
            <div className="ev-brand-tag">Powering Better Care. Together.</div>
          </div>
        </div>
        <div className="ev-title-block">
          <div className="ev-main-title">EVV ENROLLMENT FORM</div>
          <div className="ev-subtitle">Electronic Visit Verification</div>
        </div>
        <div className="ev-meta-box">
          <Field label="Date:" value={form?.enrollmentDate} className="w100" />
          <Field label="Client ID (if known):" value={ci.clientId} className="w100" />
        </div>
      </header>

      <div className="ev-body">
        <Section n="1" title="CLIENT INFORMATION">
          <div className="ev-row">
            <Field label="Client Full Name:" value={ci.clientFullName} className="w50" />
            <Field label="Date of Birth:" value={ci.dob} className="w25" />
            <div className="ev-checks">
              <span className="ev-label">Gender:</span>
              {GENDERS.map((g) => <Check key={g} label={g} on={ci.gender === g} />)}
            </div>
          </div>
          <div className="ev-row">
            <Field label="Address:" value={ci.address} className="w70" />
            <Field label="Apt / Suite:" value={ci.aptSuite} className="w25" />
          </div>
          <div className="ev-row">
            <Field label="City:" value={ci.city} className="w33" />
            <Field label="State:" value={ci.state} className="w25" />
            <Field label="Zip Code:" value={ci.zip} className="w25" />
            <Field label="Phone:" value={ci.phone} className="w33" />
          </div>
          <div className="ev-row">
            <Field label="Email (if any):" value={ci.email} className="w50" />
            <Field label="Preferred Language:" value={ci.preferredLanguage} className="w50" />
          </div>
        </Section>

        <Section n="2" title="CAREGIVER / EMPLOYEE INFORMATION" subtitle="— If Self, check here">
          <div className="ev-checks">
            <Check label="Self" on={cg.relationship === 'Self' || cg.isSelf} />
          </div>
          <div className="ev-row">
            <Field label="Caregiver Full Name:" value={cg.fullName || form?.caregiverName} className="w60" />
            <Field label="Employee ID (if applicable):" value={cg.employeeId} className="w33" />
          </div>
          <div className="ev-row">
            <Field label="Phone:" value={cg.phone} className="w33" />
            <Field label="Email (if any):" value={cg.email} className="w33" />
            <Field label="Date of Birth:" value={cg.dob} className="w33" />
          </div>
          <div className="ev-row">
            <Field label="Address:" value={cg.address} className="w70" />
            <Field label="Apt / Suite:" value={cg.aptSuite} className="w25" />
          </div>
          <div className="ev-row">
            <Field label="City:" value={cg.city} className="w33" />
            <Field label="State:" value={cg.state} className="w25" />
            <Field label="Zip Code:" value={cg.zip} className="w25" />
          </div>
          <div className="ev-checks">
            <span className="ev-label">Relationship to Client:</span>
            {RELATIONSHIPS.map((r) => <Check key={r} label={r} on={cg.relationship === r} />)}
            {cg.relationship === 'Other' && (
              <Field label="Other:" value={cg.relationshipOther} className="w25" />
            )}
          </div>
        </Section>

        <Section n="3" title="SERVICE / AGENCY INFORMATION">
          <div className="ev-row">
            <Field label="Agency Name:" value={svc.agencyName} className="w50" />
            <Field label="Agency Phone:" value={svc.agencyPhone} className="w50" />
          </div>
          <div className="ev-row">
            <Field label="EVV Vendor (if applicable):" value={svc.evvVendor} className="w50" />
            <Field label="Medicaid / Program (if applicable):" value={svc.medicaidProgram} className="w50" />
          </div>
        </Section>

        <Section n="4" title="EVV METHOD PREFERENCE" subtitle="(Select all that apply)">
          <div className="ev-checks">
            {EVV_METHODS.map((m) => <Check key={m} label={m} on={(methods.methods || []).includes(m)} />)}
            <Field label="Other:" value={methods.other} className="w25" />
          </div>
          <p className="ev-note">The available options may vary based on your program and agency.</p>
        </Section>

        <Section n="5" title="MOBILE APP ENROLLMENT" subtitle="(Complete if using Mobile App)">
          <div className="ev-row">
            <div className="ev-checks">
              <span className="ev-label">Smartphone Type:</span>
              {SMARTPHONE_TYPES.map((t) => <Check key={t} label={t} on={mobile.smartphoneType === t} />)}
            </div>
            <Field label="Mobile Number:" value={mobile.mobileNumber} className="w33" />
            <Field label="Email for App Registration:" value={mobile.email} className="w40" />
          </div>
        </Section>

        <Section n="6" title="LANDLINE / IVR ENROLLMENT" subtitle="(Complete if using Landline or IVR)">
          <div className="ev-row">
            <Field label="Primary Phone Number for EVV:" value={land.primaryPhone} className="w50" />
            <div className="ev-checks">
              <span className="ev-label">Phone Type:</span>
              {PHONE_TYPES.map((t) => <Check key={t} label={t} on={land.phoneType === t} />)}
            </div>
          </div>
          <div className="ev-row">
            <Field label="Alternate Phone Number (optional):" value={land.alternatePhone} className="w50" />
          </div>
        </Section>

        <Section n="7" title="AUTHORIZATION & CONSENT">
          <p className="ev-auth-text">
            I consent to the use of Electronic Visit Verification (EVV) for the purpose of recording service visits,
            supporting billing and claims, and complying with program requirements. I understand that EVV may collect
            date, time, and location information. I authorize the release of information as necessary for program
            participation, billing, and compliance.
          </p>
          <div className="ev-sig-row">
            <SigBlock label="Client / Representative Signature" signature={auth.clientSignature} date={auth.clientDate} />
            <SigBlock label="Caregiver / Employee Signature" signature={auth.caregiverSignature} date={auth.caregiverDate} />
          </div>
        </Section>

        <Section n="8" title="ACKNOWLEDGEMENT OF TRAINING">
          <p className="ev-auth-text">
            I acknowledge that I have received training on how to use the EVV system and understand my responsibilities.
          </p>
          <div className="ev-sig-row ev-sig-row-single">
            <SigBlock label="Caregiver / Employee Signature" signature={training.caregiverSignature} date={training.date} />
          </div>
        </Section>

        <Section n="9" title="FOR OFFICE USE ONLY" className="ev-section-office">
          <div className="ev-row">
            <Field label="EVV System:" value={office.evvSystem} className="w33" />
            <Field label="Enrollment Date:" value={office.enrollmentDate} className="w33" />
            <Field label="Staff Initials:" value={office.staffInitials} className="w33" />
          </div>
          <div className="ev-row">
            <Field label="Method Set Up By:" value={office.methodSetUpBy} className="w33" />
            <Field label="Verified By:" value={office.verifiedBy} className="w33" />
            <Field label="Verification Date:" value={office.verificationDate} className="w33" />
          </div>
          <div className="ev-notes-wrap">
            <span className="ev-label">Notes:</span>
            <div className="ev-notes-box">{disp(office.notes)}</div>
          </div>
        </Section>
      </div>

      <footer className="ev-footer">
        <div className="ev-footer-help">
          <span className="ev-footer-item"><span className="ev-footer-icon">📞</span> Need Help? (888) 123-4567</span>
          <span className="ev-footer-item"><span className="ev-footer-icon">✉</span> support@caretraker.com</span>
          <span className="ev-footer-item"><span className="ev-footer-icon">🌐</span> www.caretraker.com</span>
        </div>
        <div className="ev-rev">REV. 05/2024</div>
      </footer>
    </div>
  );
}
