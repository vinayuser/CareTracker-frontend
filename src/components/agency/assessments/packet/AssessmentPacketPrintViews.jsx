import {
  ASSESSMENT_PACKET_FORMS,
  CARE_INSTRUCTION_GROUPS,
  SAFETY_ITEMS,
} from '../../../../utils/assessmentPacket';
import { formatAgencyStreetLine } from '../../../../utils/agencyBranding';
import '../assessmentPrint.css';

const CARE_GROUP_TITLES = {
  assessment: 'Assessment',
  activityComfort: 'Activity / Comfort',
  elimination: 'Elimination',
  personalCare: 'Personal Care',
  medications: 'Medications',
  housekeeping: 'Housekeeping',
  mobility: 'Mobility',
  nutrition: 'Nutrition',
  specialty: 'Specialty',
  safety: 'Safety',
  records: 'Records',
};

const PRIORITY_LABELS = {
  '1': '1: High Priority = Uninterrupted Service',
  '2': '2: Moderate Priority = Phone Call Required',
  '3': '3: Low Priority Stable = Can Miss a Visit',
  '4': '4: Lowest Priority = May Be Postponed for 3 Days',
};

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

function Checks({ options, selected }) {
  const sel = selected || [];
  return (
    <div className="ap-checks cols-2">
      {(options || []).map((opt) => (
        <Check key={opt} label={opt} on={sel.includes(opt)} />
      ))}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="ap-section">
      <div className="ap-section-head">{title}</div>
      <div className="ap-section-body">{children}</div>
    </div>
  );
}

function SigBlock({ label, sig = {} }) {
  const isImage = sig.signature?.startsWith?.('data:image');
  return (
    <div className="ap-sig-block">
      <div className="ap-sig-label">{label}</div>
      {isImage ? (
        <div className="ap-sig-img"><img src={sig.signature} alt={label} /></div>
      ) : (
        <div className="ap-sig-line" />
      )}
      <div className="ap-sig-date">
        Print: {val(sig.printedName) || '____________'} · Date: {val(sig.date) || '________'}
        {sig.relationship ? ` · Rel: ${sig.relationship}` : ''}
      </div>
    </div>
  );
}

function Page({
  code,
  title,
  agencyName,
  agencyLogo,
  agencyBranding = {},
  assessmentDate,
  children,
}) {
  const name = val(agencyName || agencyBranding.name) || 'Agency';
  const logo = agencyLogo || agencyBranding.logoUrl || '';
  const address = formatAgencyStreetLine(agencyBranding);
  const phone = agencyBranding.phone ? `Phone: ${agencyBranding.phone}` : '';
  const fax = agencyBranding.fax ? `Fax: ${agencyBranding.fax}` : '';
  const email = agencyBranding.email ? `Email: ${agencyBranding.email}` : '';
  const website = String(agencyBranding.website || '')
    .replace(/^https?:\/\//i, '')
    .replace(/\/$/, '');
  const midContact = [phone, fax].filter(Boolean).join('    ');

  return (
    <div className="ap-page ap-agency-branded" style={{ height: 'auto', maxHeight: 'none', overflow: 'visible' }}>
      <header className="ap-header ap-header-branded">
        <div className="ap-brand-center">
          {logo ? (
            <img src={logo} alt="" className="ap-agency-logo-lg" />
          ) : null}
          <div className="ap-agency-name-lg">{name}</div>
          <div className="ap-main-title">{title}</div>
          <div className="ap-assess-date">
            Form {code}
            {assessmentDate ? ` · Assessment date: ${val(assessmentDate)}` : ''}
          </div>
        </div>
      </header>
      <div className="ap-body" style={{ display: 'flex', flexDirection: 'column', gridTemplateColumns: 'none' }}>
        {children}
      </div>
      <footer className="ap-footer ap-footer-branded">
        <div className="ap-footer-row">
          <span>{address || '\u00A0'}</span>
          <span>{midContact || '\u00A0'}</span>
          <span>{email || '\u00A0'}</span>
        </div>
        <div className="ap-footer-row">
          <span>Form {code}</span>
          <span>©{name} All Rights Reserved</span>
          <span>{website || '\u00A0'}</span>
        </div>
      </footer>
    </div>
  );
}

function YnR({ label, value }) {
  return (
    <div className="ap-row tight" style={{ justifyContent: 'space-between' }}>
      <span style={{ flex: 1 }}>{label}</span>
      <span className="ap-checks">
        {['Y', 'N', 'R'].map((o) => (
          <Check key={o} label={o} on={value === o} />
        ))}
      </span>
    </div>
  );
}

function Print110({ d }) {
  const neuro = d.neuro || {};
  const skin = d.skin || {};
  const enabledFlags = [
    neuro.perrla && 'PERRLA',
    neuro.movesExtremities && 'Moves extremities OK',
    neuro.paralysis && 'Paralysis',
    neuro.weakness && `Weakness${neuro.weaknessSide ? ` (${neuro.weaknessSide})` : ''}`,
    neuro.abnormalGait && 'Abnormal gait',
    neuro.painScore && `Pain ${neuro.painScore}/10`,
  ].filter(Boolean);
  return (
    <>
      <Section title="CLIENT INFORMATION">
        <div className="ap-row"><Field label="Client:" value={d.clientName} className="w50" /><Field label="Date:" value={d.date} className="w25" /><Field label="DOB:" value={d.dob} className="w25" /></div>
        <div className="ap-row"><Field label="Code Status:" value={d.codeStatus} className="w50" /><Field label="Sex:" value={d.sex} className="w50" /></div>
        <div className="ap-row"><Field label="Address:" value={d.address} className="w100" /></div>
        <div className="ap-row"><Field label="Phone:" value={d.phone} className="w50" /><Field label="Cell:" value={d.cellPhone} className="w50" /></div>
        <div className="ap-row"><Field label="Emergency:" value={[d.emergencyContact, d.emergencyPhone, d.emergencyRelationship].filter(Boolean).join(' / ')} className="w100" /></div>
        <div className="ap-row"><Field label="Caregiver:" value={[d.primaryCaregiver, d.primaryCaregiverPhone, d.primaryCaregiverRelationship].filter(Boolean).join(' / ')} className="w100" /></div>
        <div className="ap-row"><Field label="PCP:" value={[d.primaryCarePhysician, d.pcpPhone, d.pcpAddress].filter(Boolean).join(' / ')} className="w100" /></div>
        <div className="ap-row"><Field label="Pharmacy:" value={[d.pharmacy, d.pharmacyPhone, d.pharmacyAddress].filter(Boolean).join(' / ')} className="w100" /></div>
        <div className="ap-subhead">Source</div>
        <Checks options={['Client', 'Family', 'Other']} selected={d.sourceInfo} />
        {d.sourceOther ? <Field label="Other:" value={d.sourceOther} className="w100" /> : null}
      </Section>
      <Section title="VITALS / DIET">
        <div className="ap-row">
          <Field label="Temp:" value={d.vitals?.temperature} />
          <Field label="BP:" value={d.vitals?.bp} />
          <Field label="HR:" value={d.vitals?.hr} />
          <Field label="Resp:" value={d.vitals?.respirations} />
          <Field label="O2:" value={d.vitals?.o2sat} />
        </div>
        <Field label="Special Diet:" value={d.specialDiet} className="w100" />
      </Section>
      <Section title="DIAGNOSES / MEDICATIONS / ALLERGIES">
        <div className="ap-subhead">Diagnoses</div>
        {(d.diagnoses || []).filter(Boolean).map((x, i) => <div key={i}>{i + 1}. {x}</div>)}
        <table className="ap-table" style={{ marginTop: '0.04in' }}>
          <thead><tr><th>Medication</th><th>Dose</th><th>Frequency</th></tr></thead>
          <tbody>
            {(d.medications || []).filter((m) => m.name).map((m, i) => (
              <tr key={i}><td>{m.name}</td><td>{m.dose}</td><td>{m.frequency}</td></tr>
            ))}
          </tbody>
        </table>
        <div className="ap-row"><Field label="Allergic Reactions:" value={d.allergicReactions} className="w50" /></div>
        {(d.allergies || []).filter((a) => a.allergy).map((a, i) => (
          <div key={i}>{a.allergy}{a.reaction ? ` — ${a.reaction}` : ''}</div>
        ))}
        <div className="ap-row"><Field label="Pertinent info:" value={d.pertinentInfoYesNo} className="w33" /></div>
        {d.pertinentInfoDetails ? <div>{d.pertinentInfoDetails}</div> : null}
      </Section>
      <Section title="SYSTEMS REVIEW">
        <div className="ap-subhead">Neuro LOC</div>
        <Checks options={neuro.loc || []} selected={neuro.loc || []} />
        {enabledFlags.length ? <div>{enabledFlags.join(' · ')}</div> : null}
        <div className="ap-subhead">Skin</div>
        <Checks options={skin.items || []} selected={skin.items || []} />
        {skin.edemaWhere ? <Field label="Edema where:" value={skin.edemaWhere} className="w100" /> : null}
        <Checks options={skin.color || []} selected={skin.color || []} />
        <div className="ap-subhead">Cardiovascular</div>
        <Checks options={d.cardiovascular?.items || []} selected={d.cardiovascular?.items || []} />
        <div className="ap-subhead">GI</div>
        <Checks options={d.gastrointestinal?.items || []} selected={d.gastrointestinal?.items || []} />
        <div className="ap-subhead">GU</div>
        <Checks options={d.genitourinary?.items || []} selected={d.genitourinary?.items || []} />
        <div className="ap-subhead">Respiratory</div>
        <Checks options={d.respiratory?.items || []} selected={d.respiratory?.items || []} />
        <div className="ap-row">
          <Field label="Abn sounds:" value={d.respiratory?.abnormalSounds} />
          <Field label="O2 L:" value={d.respiratory?.o2Liters} />
          <Field label="COPD:" value={d.respiratory?.copd} />
          <Check label="Smoker" on={!!d.respiratory?.smoker} />
        </div>
        <div className="ap-subhead">Endocrine / MSK / Psych</div>
        <Checks options={d.endocrine?.items || []} selected={d.endocrine?.items || []} />
        <Checks options={d.musculoskeletal?.items || []} selected={d.musculoskeletal?.items || []} />
        <Checks options={d.psychological?.items || []} selected={d.psychological?.items || []} />
      </Section>
      <Section title="HISTORY / ADLs / SOCIAL">
        <Field label="Hospital admissions:" value={d.hospitalAdmissions} className="w100" />
        <Field label="Surgeries:" value={d.surgeries} className="w100" />
        <Field label="Ongoing problems:" value={d.ongoingProblems} className="w100" />
        <Field label="Eating:" value={d.eating} className="w100" />
        <Field label="Bathing:" value={d.bathing} className="w100" />
        <Field label="Toileting:" value={d.toileting} className="w100" />
        <Field label="Dressing:" value={d.dressing} className="w100" />
        <Field label="Ambulation:" value={[d.ambulation, d.ambulationDevice].filter(Boolean).join(' — ')} className="w100" />
        <div className="ap-subhead">Equipment</div>
        <Checks options={d.equipment || []} selected={d.equipment || []} />
        <Checks options={d.dentures || []} selected={d.dentures || []} />
        {d.equipmentOther ? <Field label="Other:" value={d.equipmentOther} className="w100" /> : null}
        <div className="ap-row">
          <Field label="Language:" value={d.primaryLanguage} />
          <Field label="Schooling:" value={d.schooling} />
          <Field label="Occupation:" value={d.formerOccupation} />
        </div>
        <Field label="Hobbies:" value={d.hobbies} className="w100" />
        <Field label="Lives:" value={[d.livesWith, d.livesWithOther].filter(Boolean).join(' — ')} className="w100" />
      </Section>
      <Section title="QUOTE HELPERS">
        <div className="ap-row">
          <Field label="First:" value={d.firstName} />
          <Field label="Last:" value={d.lastName} />
          <Field label="Email:" value={d.email} />
        </div>
        <div className="ap-row">
          <Field label="City:" value={d.city} />
          <Field label="State:" value={d.state} />
          <Field label="ZIP:" value={d.zip} />
        </div>
        <div className="ap-row">
          <Field label="Weekly Hrs:" value={d.recommendedWeeklyHours} />
          <Field label="SOC:" value={d.startOfCareDate} />
          <Field label="Risk:" value={d.riskLevel} />
        </div>
        <Checks options={d.requestedServices || []} selected={d.requestedServices || []} />
      </Section>
      <Section title="ASSESSOR SIGNATURE">
        <SigBlock
          label="Assessor"
          sig={{ signature: d.assessorSignature, printedName: d.assessorPrintName, date: d.assessorDate }}
        />
      </Section>
    </>
  );
}

function PrintAck({ d, legal, showAgency }) {
  return (
    <>
      <Section title="ACKNOWLEDGEMENT">
        <p style={{ marginBottom: '0.06in' }}>{legal}</p>
        {d.acknowledged != null ? <Check label="Acknowledged" on={!!d.acknowledged} /> : null}
        {d.printName ? <Field label="Print Name:" value={d.printName} className="w100" /> : null}
      </Section>
      <div className="ap-sigs">
        <SigBlock label="Client / Representative" sig={d.client} />
        {showAgency ? <SigBlock label="Agency Representative" sig={d.agency} /> : null}
      </div>
    </>
  );
}

function Print400({ d }) {
  const tasks = d.tasks || {};
  return (
    <>
      <Section title="CLIENT">
        <div className="ap-row"><Field label="Client:" value={d.clientName} className="w50" /><Field label="DOB:" value={d.dob} className="w50" /></div>
      </Section>
      {Object.entries(CARE_INSTRUCTION_GROUPS).map(([key, labels]) => {
        const rows = labels.filter((l) => tasks[l]?.enabled);
        if (!rows.length) return null;
        return (
          <Section key={key} title={CARE_GROUP_TITLES[key] || key}>
            {rows.map((l) => (
              <div key={l} className="ap-row tight">
                <Check label={l} on />
                <Field label="Freq:" value={tasks[l]?.frequency} className="w33" />
              </div>
            ))}
          </Section>
        );
      })}
    </>
  );
}

function Print410({ d }) {
  return (
    <>
      <Section title="CARE PLAN ACKNOWLEDGEMENT">
        <p>I have been informed of the current Service Plan / Individual Care Plan and understand the services identified.</p>
        <div className="ap-row">
          <Field label="Print Name:" value={d.printName} className="w50" />
          <Field label="Client:" value={d.clientName} className="w50" />
        </div>
        <Field label="DOB:" value={d.dob} className="w50" />
        <Field label="Comments:" value={d.comments} className="w100" />
      </Section>
      <div className="ap-sigs">
        <SigBlock label="Employee" sig={d.employee} />
        <SigBlock label="Client" sig={d.client} />
        <SigBlock label="Agency" sig={d.agency} />
      </div>
    </>
  );
}

function Print790({ d }) {
  return (
    <>
      <Section title="CASE NOTES HEADER">
        <div className="ap-row">
          <Field label="Client ID:" value={d.clientId} />
          <Field label="Client:" value={d.clientName} />
          <Field label="DOB:" value={d.clientDob} />
        </div>
        <div className="ap-row">
          <Field label="Representative:" value={d.representativeName} />
          <Field label="Title:" value={d.representativeTitle} />
        </div>
      </Section>
      <Section title="ENTRIES">
        <table className="ap-table">
          <thead><tr><th>Date</th><th>Time</th><th>Notes</th></tr></thead>
          <tbody>
            {(d.entries || []).filter((e) => e.date || e.time || e.notes).map((e, i) => (
              <tr key={i}><td>{e.date}</td><td>{e.time}</td><td>{e.notes}</td></tr>
            ))}
          </tbody>
        </table>
      </Section>
    </>
  );
}

function Print1009({ d }) {
  return (
    <>
      <Section title="CONSENT FOR HOMECARE SERVICES">
        <div className="ap-row"><Field label="Client:" value={d.clientName} className="w50" /><Field label="DOB:" value={d.dob} className="w50" /></div>
        <p>Consent to Plan of Care services, release of information for care/payment, and financial responsibility as stated in the Client Service Agreement.</p>
        <div className="ap-subhead">Non-Medical</div>
        <Checks options={d.nonMedical || []} selected={d.nonMedical || []} />
        <div className="ap-subhead">Private Duty Nursing</div>
        <Checks options={d.privateDutyNursing || []} selected={d.privateDutyNursing || []} />
        <Field label="Billing Cycle:" value={d.billingCycle} className="w50" />
        <div className="ap-row">
          <Check label="Insurance pays" on={!!d.privateInsurancePays} />
          <Field label="Co-pay est:" value={d.copayEstimate} />
          <Check label="Private Pay" on={!!d.privatePay} />
          <Field label="Charges:" value={d.privatePayCharges} />
        </div>
        <div className="ap-row">
          <Field label="Other:" value={d.otherPayment} />
          <Field label="Amt:" value={d.otherPaymentAmount} />
          <Field label="Deposit hrs:" value={d.depositHours} />
          <Field label="Deposit $:" value={d.depositAmount} />
        </div>
        <Field label="Advance Directive:" value={d.advancedDirective} className="w100" />
        <Field label="Holder:" value={[d.advancedDirectiveHolder, d.advancedDirectiveRelationship].filter(Boolean).join(' / ')} className="w100" />
      </Section>
      <div className="ap-sigs">
        <SigBlock label="Client" sig={d.client} />
        <SigBlock label="Agency" sig={d.agency} />
      </div>
    </>
  );
}

function Print1081({ d }) {
  return (
    <>
      <Section title="CONSENT TO RELEASE / OBTAIN INFORMATION">
        <div className="ap-row"><Field label="Client:" value={d.clientName} className="w50" /><Field label="DOB:" value={d.dob} className="w50" /></div>
        <p>HIPAA authorization for treatment, payment, and agency operations. Restrictions may be requested; consent may be revoked in writing except for prior disclosures.</p>
        <Checks options={d.releaseObtain || []} selected={d.releaseObtain || []} />
        <div className="ap-checks">
          <Check label="Entire Medical Records" on={!!d.entireMedicalRecords} />
          <Check label="Mental Health" on={!!d.includeMentalHealth} />
          <Check label="Alcohol/Drug" on={!!d.includeAlcoholDrug} />
          <Check label="Communicable" on={!!d.includeCommunicable} />
        </div>
        <Field label="Medical records from:" value={d.medicalRecordsFrom} className="w100" />
        <Field label="Other:" value={d.other} className="w100" />
        <div className="ap-subhead">Parties</div>
        {(d.parties || []).filter(Boolean).map((p, i) => <div key={i}>{String.fromCharCode(97 + i)}. {p}</div>)}
      </Section>
      <SigBlock label="Person Giving Consent" sig={d.client} />
    </>
  );
}

function Print1082({ d }) {
  return (
    <>
      <Section title="HIPAA NOTICE OF PRIVACY PRACTICES">
        <div className="ap-row">
          <Field label="Client:" value={d.clientName} />
          <Field label="DOB:" value={d.dob} />
          <Field label="Effective:" value={d.effectiveDate} />
        </div>
        <p>
          Summary: PHI may be used for treatment, payment, and agency operations; special situations include emergencies,
          workers&apos; compensation, public health, law enforcement, and duty-to-warn. Rights include inspect/copy,
          paper notice, breach notice, amend, request restrictions, and confidential communications.
        </p>
        <Check label="Acknowledged receipt of HIPAA Notice" on={!!d.acknowledged} />
      </Section>
      <SigBlock label="Client / Representative" sig={d.client} />
    </>
  );
}

function Print1083({ d }) {
  return (
    <>
      <Section title="ASSIGNMENT OF BENEFITS">
        <div className="ap-row">
          <Field label="First:" value={d.firstName} />
          <Field label="Last:" value={d.lastName} />
          <Field label="DOB:" value={d.dob} />
        </div>
        <Field label="Address:" value={d.address} className="w100" />
        <Field label="Phone:" value={d.phone} className="w50" />
        <div className="ap-row">
          <Field label="Carrier:" value={d.insuranceCarrier} />
          <Check label="TriWest" on={!!d.triWest} />
          <Check label="VA Referral" on={!!d.vaReferral} />
        </div>
        <div className="ap-row">
          <Field label="Ins. Address:" value={d.insuranceAddress} />
          <Field label="Ins. Phone:" value={d.insurancePhone} />
        </div>
        <div className="ap-row">
          <Field label="Policy #:" value={d.policyNumber} />
          <Field label="Claim #:" value={d.claimNumber} />
          <Field label="Client %:" value={d.clientPaysPercent} />
          <Field label="Ins %:" value={d.insurancePaysPercent} />
        </div>
        <p>Assignment of LTC benefits to the agency; client remains responsible for uncovered amounts. Authorization to release information for claims processing. Financial responsibility per Client Service Agreement.</p>
      </Section>
      <div className="ap-sigs">
        <SigBlock label="Client / Legal Representative" sig={d.client} />
        <SigBlock label="Agency Representative" sig={d.agency} />
      </div>
    </>
  );
}

function Print7000({ d }) {
  return (
    <>
      <Section title="EMERGENCY PLAN">
        <div className="ap-row">
          <Field label="Date:" value={d.date} />
          <Field label="Reassessment:" value={d.reassessmentDate} />
          <Field label="Client:" value={d.clientName} />
          <Field label="DOB:" value={d.dob} />
        </div>
        <Field label="Address:" value={d.address} className="w100" />
        <div className="ap-row"><Field label="Phone:" value={d.phone} /><Field label="Cell:" value={d.cell} /><Field label="Crossroads:" value={d.majorCrossroads} /></div>
        <div className="ap-row">
          <Field label="Emergency:" value={d.emergencyContact} />
          <Field label="Phone:" value={d.emergencyPhone} />
          <Field label="Rel:" value={d.emergencyRelationship} />
          <Field label="Cell:" value={d.emergencyCell} />
        </div>
        <div className="ap-subhead">Physicians</div>
        {(d.physicians || []).map((p, i) => (
          p.name || p.phone ? <div key={i}>{p.name} — {p.phone}</div> : null
        ))}
        <div className="ap-row"><Field label="Hospital:" value={d.hospital} /><Field label="Phone:" value={d.hospitalPhone} /><Field label="Pharmacy:" value={d.pharmacy} /></div>
        <Field label="Evacuation:" value={d.evacuationPlan} className="w100" />
        <div className="ap-row"><Field label="Relocation:" value={d.relocationName} /><Field label="Phone:" value={d.relocationPhone} /></div>
        <div className="ap-row"><Field label="Electric:" value={d.electricCompany} /><Field label="Gas:" value={d.gasCompany} /></div>
        <Field label="Priority:" value={PRIORITY_LABELS[d.priorityLevel] || d.priorityLevel} className="w100" />
      </Section>
      <div className="ap-sigs">
        <SigBlock label="Client" sig={d.client} />
        <SigBlock label="Agency" sig={d.agency} />
      </div>
    </>
  );
}

function Print7050({ d }) {
  const checks = d.checks || {};
  return (
    <>
      <Section title="HOME ENVIRONMENT SAFETY CHECKLIST">
        <div className="ap-row">
          <Field label="Performed By:" value={d.performedBy} />
          <Field label="Date:" value={d.date} />
          <Field label="Client:" value={d.clientName} />
        </div>
        <div className="ap-row">
          <Field label="Address:" value={d.address} className="w50" />
          <Field label="Tel:" value={d.telephone} />
          <Field label="Emergency:" value={d.emergencyContact} />
        </div>
        {SAFETY_ITEMS.map((item) => (
          <YnR key={item} label={item} value={checks[item]} />
        ))}
        <Field label="Other problems:" value={d.otherProblems} className="w100" />
        <Field label="List:" value={d.otherProblemsList} className="w100" />
        <Field label="Comments:" value={d.comments} className="w100" />
        <Field label="Advice:" value={d.adviceGiven} className="w100" />
      </Section>
      <div className="ap-sigs">
        <SigBlock label="Client" sig={d.client} />
        <SigBlock label="Agency" sig={d.agency} />
      </div>
    </>
  );
}

function renderFormBody(code, d) {
  switch (code) {
    case '110': return <Print110 d={d} />;
    case '324':
      return (
        <PrintAck
          d={d}
          showAgency
          legal="Personal Assistants may not perform tasks outside the Care Plan including invasive procedures, wound care, tube feeding, restraints, financial handling, gifts, driving without approval, and other prohibited acts listed on Form 324. Client acknowledges understanding."
        />
      );
    case '325':
      return (
        <PrintAck
          d={d}
          legal="Participant Agreement Release: items may be unintentionally broken or misplaced; caregivers use household products/equipment. Client releases the agency from property claims and must report intentional misuse within 24 hours."
        />
      );
    case '350':
      return (
        <PrintAck
          d={d}
          showAgency
          legal="Client acknowledges receipt of the Client Handbook covering privacy practices, rights/responsibilities, grievance procedures, contacts, home safety, emergency planning, and advance directives."
        />
      );
    case '400': return <Print400 d={d} />;
    case '410': return <Print410 d={d} />;
    case '610':
      return (
        <PrintAck
          d={d}
          legal="Client Concerns & Grievance: right to file grievances without retaliation; investigation within 48 hours; resolution attempted within 14 days. Client received Grievance Policy and Forms."
        />
      );
    case '790': return <Print790 d={d} />;
    case '800':
      return (
        <PrintAck
          d={d}
          legal="Nondiscrimination Notice: the agency complies with Federal civil rights laws and provides free disability and language assistance. Grievances may be filed with the Civil Rights Coordinator or HHS OCR."
        />
      );
    case '1009': return <Print1009 d={d} />;
    case '1081': return <Print1081 d={d} />;
    case '1082': return <Print1082 d={d} />;
    case '1083': return <Print1083 d={d} />;
    case '7000': return <Print7000 d={d} />;
    case '7050': return <Print7050 d={d} />;
    default: return <Section title="UNKNOWN"><p>Unknown form {code}</p></Section>;
  }
}

export function AssessmentPacketFormPrintView({
  code,
  data = {},
  agencyName,
  agencyLogo,
  agencyBranding,
  assessmentDate,
}) {
  const meta = ASSESSMENT_PACKET_FORMS.find((f) => f.code === code);
  const title = meta?.title || `Form ${code}`;
  return (
    <div className="ap-packet-print">
      <Page
        code={code}
        title={title}
        agencyName={agencyName}
        agencyLogo={agencyLogo}
        agencyBranding={agencyBranding}
        assessmentDate={assessmentDate}
      >
        {renderFormBody(code, data)}
      </Page>
    </div>
  );
}

export function AssessmentPacketPrintView({
  forms = {},
  agencyName,
  agencyLogo,
  agencyBranding,
  assessmentDate,
  codes,
}) {
  const list = Array.isArray(codes) && codes.length
    ? ASSESSMENT_PACKET_FORMS.filter((f) => codes.includes(f.code))
    : ASSESSMENT_PACKET_FORMS;

  return (
    <div className="ap-packet-print">
      {list.map(({ code, title }) => (
        <Page
          key={code}
          code={code}
          title={title}
          agencyName={agencyName}
          agencyLogo={agencyLogo}
          agencyBranding={agencyBranding}
          assessmentDate={assessmentDate}
        >
          {renderFormBody(code, forms[code] || {})}
        </Page>
      ))}
    </div>
  );
}
