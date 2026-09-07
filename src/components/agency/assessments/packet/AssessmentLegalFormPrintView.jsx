import { formatAgencyStreetLine } from '../../../../utils/agencyBranding';
import {
  agencyDisplayName,
  getForm324Copy,
  getForm325Copy,
  getForm350Copy,
  getForm410Copy,
  getForm610Copy,
  getForm800Copy,
  parseLegalNoticeBlocks,
  parseConsentAgreementSections,
  replaceAgencyBrand,
} from '../../../../utils/assessmentPacketAgencyCopy';
import legalBodies from '../../../../utils/assessmentLegalBodies.json';
import '../assessmentPrint.css';
import './assessmentLegalPrint.css';

function Sig({ label, sig = {} }) {
  const isImage = sig.signature?.startsWith?.('data:image');
  return (
    <div className="al-sig">
      <div className="al-sig-line">
        {isImage ? <img src={sig.signature} alt="" /> : null}
      </div>
      <div className="al-sig-label">{label}</div>
      {sig.printedName || sig.date ? (
        <div className="al-sig-meta">
          {sig.printedName ? <span>Print: {sig.printedName}</span> : null}
          {sig.date ? <span>Date: {sig.date}</span> : null}
        </div>
      ) : null}
    </div>
  );
}

function CheckMark({ checked }) {
  return <span className={`al-box ${checked ? 'al-box-on' : ''}`}>{checked ? '✓' : ''}</span>;
}

function IdRow({ clientName = '', dob = '' }) {
  return (
    <p className="al-id-row">
      <span className="al-field">
        <strong>Client Name:</strong>
        <span className="al-field-line">{clientName || '\u00A0'}</span>
      </span>
      <span className="al-field al-field-dob">
        <strong>DOB:</strong>
        <span className="al-field-line">{dob || '\u00A0'}</span>
      </span>
    </p>
  );
}

function InitLine({ checked, label }) {
  return (
    <p className="al-init-line">
      <span className="al-init-blank">{checked ? 'X' : '\u00A0'}</span>
      <span>{label}</span>
    </p>
  );
}

function LegalShell({
  code,
  title,
  subtitle,
  agencyBranding = {},
  children,
  headerVariant = 'brand',
  effectiveDate = '',
  className = '',
}) {
  const name = agencyDisplayName(agencyBranding);
  const logo = agencyBranding.logoUrl || '';
  const address = formatAgencyStreetLine(agencyBranding);
  const phone = agencyBranding.phone ? `Phone: ${agencyBranding.phone}` : '';
  const fax = agencyBranding.fax ? `Fax: ${agencyBranding.fax}` : '';
  const email = agencyBranding.email ? `Email: ${agencyBranding.email}` : '';
  const website = String(agencyBranding.website || '').replace(/^https?:\/\//i, '').replace(/\/$/, '');
  const mid = [phone, fax].filter(Boolean).join('    ');

  return (
    <div className={`ap-page al-page ${headerVariant === 'notice' ? 'al-page-notice' : ''} ${className}`.trim()}>
      {headerVariant === 'notice' ? (
        <header className="al-header al-header-notice">
          <div className="al-effective">
            {effectiveDate ? `Effective Date: ${effectiveDate}` : 'Effective Date: 01/01/2016'}
          </div>
          {logo ? (
            <img src={logo} alt="" className="al-logo al-logo-notice" />
          ) : (
            <div className="al-agency-mark">{name}</div>
          )}
        </header>
      ) : (
        <header className="al-header">
          {logo ? <img src={logo} alt="" className="al-logo" /> : null}
        </header>
      )}
      <div className="al-rule" />
      <h1 className="al-title">{title}</h1>
      {subtitle ? <p className="al-subtitle">{subtitle}</p> : null}
      <div className="al-body">{children}</div>
      <footer className="al-footer">
        <div className="al-footer-row">
          <span>{address || '\u00A0'}</span>
          <span>{mid || '\u00A0'}</span>
          <span>{email || '\u00A0'}</span>
        </div>
        <div className="al-footer-row">
          <span>Form {code}</span>
          <span>©{name} All Rights Reserved</span>
          <span>{website || '\u00A0'}</span>
        </div>
      </footer>
    </div>
  );
}

function RequestsBlock({ agencyBranding = {} }) {
  const name = agencyDisplayName(agencyBranding);
  const address = formatAgencyStreetLine(agencyBranding);
  const fax = agencyBranding.fax ? `Fax: ${agencyBranding.fax}` : '';
  return (
    <div className="al-requests">
      <p className="al-p"><strong>Send all written requests to:</strong></p>
      <p className="al-p al-requests-addr">
        {name}
        {address ? <><br />{address}</> : null}
        {fax ? <><br />{fax}</> : null}
      </p>
    </div>
  );
}

function LongBody({ code, agencyName, agencyBranding = {} }) {
  const raw = legalBodies[code] || '';
  const blocks = parseLegalNoticeBlocks(raw, agencyName);
  return (
    <>
      {blocks.map((block, i) => {
        if (block.type === 'h') {
          return <p key={i} className="al-section-h">{block.text}</p>;
        }
        if (block.type === 'ul') {
          return (
            <ul key={i} className="al-bullets">
              {block.items.map((item) => <li key={item.slice(0, 48)}>{item}</li>)}
            </ul>
          );
        }
        if (block.type === 'lead') {
          return (
            <p key={i} className="al-p">
              <strong>{block.heading}</strong>{' '}
              {block.text}
            </p>
          );
        }
        if (block.type === 'requests') {
          return <RequestsBlock key={i} agencyBranding={agencyBranding} />;
        }
        return <p key={i} className="al-p">{block.text}</p>;
      })}
    </>
  );
}

function Form1009Print({ data = {}, agencyBranding = {} }) {
  const name = agencyDisplayName(agencyBranding);
  const d = data || {};
  const sections = parseConsentAgreementSections(legalBodies['1009'] || '', name);
  const nonMed = d.nonMedical || [];
  const pdn = d.privateDutyNursing || [];
  const agencyLabel = name;

  const sectionExtras = {
    'II. Payment for Services Rendered': (
      <>
        <p className="al-p al-service-line">
          <strong>The services that I agree to receive are:</strong>
        </p>
        <p className="al-check-row">
          <strong>Non-Medical:</strong>
          {['Chore', 'PA', 'CNA', 'Companion', 'Respite'].map((opt) => (
            <span key={opt} className="al-check-item">
              <CheckMark checked={nonMed.includes(opt)} /> {opt}
            </span>
          ))}
        </p>
        <p className="al-check-row">
          <strong>Private Duty Nursing:</strong>
          {['RN', 'LPN'].map((opt) => (
            <span key={opt} className="al-check-item">
              <CheckMark checked={pdn.includes(opt)} /> {opt}
            </span>
          ))}
        </p>
        <p className="al-p">
          <strong>Frequency by Discipline:</strong>
          <span className="al-inline-blank">{d.frequencyByDiscipline || '\u00A0'}</span>
        </p>
      </>
    ),
    'VI. Advance Directive Verification': (
      <>
        <p className="al-check-row al-check-row-wrap">
          <span className="al-check-item">
            <CheckMark checked={/do not have|none/i.test(d.advancedDirective || '')} /> I do not have an Advanced Directive
          </span>
          <span className="al-check-item">
            <CheckMark checked={/have an Advance|yes/i.test(d.advancedDirective || '') && !/will give/i.test(d.advancedDirective || '')} /> I have an Advance Directive
          </span>
          <span className="al-check-item">
            <CheckMark checked={/will give/i.test(d.advancedDirective || '')} /> I will give a copy to {agencyLabel}
          </span>
        </p>
        <p className="al-p al-field-row">
          <span className="al-field">
            <strong>Name:</strong>
            <span className="al-field-line">{d.advancedDirectiveHolder || '\u00A0'}</span>
          </span>
          <span className="al-field al-field-dob">
            <strong>Relationship:</strong>
            <span className="al-field-line">{d.advancedDirectiveRelationship || '\u00A0'}</span>
          </span>
        </p>
      </>
    ),
  };

  return (
    <div className="ap-packet-print">
      <LegalShell
        code="1009"
        title="Consent for Homecare Services & Client Agreement"
        agencyBranding={agencyBranding}
        className="al-page-consent"
      >
        <IdRow clientName={d.clientName} dob={d.dob} />
        {sections.map((section) => (
          <section key={section.heading} className="al-consent-section">
            <h2 className="al-roman-h">{section.heading}</h2>
            {/II\.\s+Payment/i.test(section.heading) ? sectionExtras[section.heading] : null}
            {section.paragraphs.map((p) => {
              const showBilling = /sole responsibility to maintain/i.test(p)
                || /refused by Medicaid/i.test(p);
              const isPayTemplate = /private medical insurance|private pay:|2 week deposit|2-week deposit|other sources of payment/i.test(p);
              if (isPayTemplate) return null;
              return (
                <div key={p.slice(0, 48)}>
                  <p className="al-p al-p-justify">{p}</p>
                  {showBilling ? (
                    <p className="al-check-row">
                      <strong>Billing Cycle:</strong>
                      {['Weekly', 'Bi-Weekly', 'Monthly'].map((opt) => (
                        <span key={opt} className="al-check-item">
                          <CheckMark checked={d.billingCycle === opt} /> {opt}
                        </span>
                      ))}
                    </p>
                  ) : null}
                </div>
              );
            })}
            {/VI\.\s+Advance/i.test(section.heading) ? sectionExtras[section.heading] : null}
            {/II\.\s+Payment/i.test(section.heading) ? (
              <div className="al-pay-options">
                <p className="al-pay-option">
                  <CheckMark checked={!!d.privateInsurancePays} />
                  <span>
                    Private Medical Insurance, Managed Care Company, or other Third-Party Payor or Long Term Care will
                    pay {agencyLabel} for Homecare services provided, with a co-payment or deductible from me estimated at:
                    {' '}<span className="al-money">${d.copayEstimate || '__________'}</span>
                  </span>
                </p>
                <p className="al-pay-option">
                  <CheckMark checked={!!d.privatePay} />
                  <span>
                    Private Pay: I am responsible for the total amount due to {agencyLabel} for services rendered to me.
                    Charges are based on type and frequency of service. Charges are:
                    {' '}<span className="al-money">${d.privatePayCharges || '__________'}</span>
                  </span>
                </p>
                <p className="al-pay-option">
                  <CheckMark checked={!!(d.otherPayment || d.otherPaymentAmount)} />
                  <span>
                    Other sources of payment: {d.otherPayment || '____________________'}
                    {' '}<span className="al-money">${d.otherPaymentAmount || '__________'}</span>
                  </span>
                </p>
                <p className="al-pay-option">
                  <CheckMark checked={!!(d.depositHours || d.depositAmount)} />
                  <span>
                    2 Week Deposit based on {d.depositHours || '______'}/hrs.
                    {' '}<span className="al-money">${d.depositAmount || '__________'}</span>
                  </span>
                </p>
              </div>
            ) : null}
          </section>
        ))}
        <div className="al-sigs">
          <Sig label="Client / Representative Signature" sig={d.client} />
          <Sig label="Agency Representative Signature" sig={d.agency} />
        </div>
      </LegalShell>
    </div>
  );
}

function Form1081Print({ data = {}, agencyBranding = {} }) {
  const name = agencyDisplayName(agencyBranding);
  const d = data || {};
  const releaseObtain = d.releaseObtain || [];
  const parties = Array.from({ length: 4 }, (_, i) => d.parties?.[i] ?? '');
  const t = (s) => replaceAgencyBrand(s, name);

  return (
    <div className="ap-packet-print">
      <LegalShell
        code="1081"
        title="Consent To Release / Obtain Information"
        agencyBranding={agencyBranding}
        className="al-page-release"
      >
        <IdRow clientName={d.clientName} dob={d.dob} />

        <p className="al-p al-p-justify">
          {t('I understand that, under the Health Insurance Portability & Accountability Act of 1996 (HIPAA), I have certain rights to privacy regarding my protected health information (PHI). I understand that this information can and will be used to:')}
        </p>
        <ul className="al-bullets">
          <li>Conduct, plan and direct my treatment and follow-up among providers who may be involved in that treatment directly and indirectly.</li>
          <li>Obtain payment from third-party payers.</li>
          <li>Conduct normal agency operations like quality reviews.</li>
        </ul>
        <p className="al-p al-p-justify">
          I have been given the right to review {name}’s <em>Notice of Privacy Practices</em> prior to signing this
          consent. I understand that {name} has the right to change its Notice of Privacy Practice from time to
          time and that I may contact {name} at any time and obtain a current copy of the Notice of Privacy
          Practices.
        </p>
        <p className="al-p al-p-justify">
          I understand that I have the right to request a restriction of how my protected health information is used.
          I also understand that {name} is not required to agree to this request. If {name} agrees to my
          requested restrictions, they must follow those restrictions.
        </p>
        <p className="al-p al-p-justify">
          I understand that I may revoke this consent at any time, by making a request in writing, except for
          information already used or disclosed.
        </p>

        <p className="al-p al-auth-line">
          <strong>1.</strong>{' '}
          I authorize {name} to
          <span className="al-check-item">
            <CheckMark checked={releaseObtain.some((x) => /release/i.test(x))} /> <strong>Release</strong>
          </span>
          <span className="al-check-item">
            <CheckMark checked={releaseObtain.some((x) => /obtain/i.test(x))} /> <strong>Obtain</strong>
          </span>
          the following information about me:
        </p>

        <div className="al-auth-block">
          <div className="al-auth-main">
            <CheckMark checked={!!d.entireMedicalRecords} />
            <span>
              Entire Medical Records, including billing records, insurance records, records from other health
              care providers, and the following information if selected below:
            </span>
          </div>
          <p className="al-include-label">Include: <em>(Indicate by initialing)</em></p>
          <InitLine checked={!!d.includeMentalHealth} label="Mental Health Records" />
          <InitLine checked={!!d.includeAlcoholDrug} label="Alcohol / Drug Treatment" />
          <InitLine checked={!!d.includeCommunicable} label="Communicable Diseases (Including HIV & AIDS)" />

          <div className="al-auth-main">
            <CheckMark checked={!!d.medicalRecordsFrom} />
            <span className="al-auth-with-line">
              Medical Records from
              <span className="al-field-line al-field-line-inline">{d.medicalRecordsFrom || '\u00A0'}</span>
            </span>
          </div>
          <p className="al-p al-indent">
            All past, present, and future periods of health care information may be shared.
          </p>
          <div className="al-auth-main">
            <CheckMark checked={!!d.other} />
            <span className="al-auth-with-line">
              Other:
              <span className="al-field-line al-field-line-inline">{d.other || '\u00A0'}</span>
            </span>
          </div>
        </div>

        <p className="al-p">
          <strong>2.</strong> This information may be released from/to the following persons/agency/organization:
        </p>
        <div className="al-party-list">
          {parties.map((party, i) => (
            <p key={i} className="al-party-row">
              <strong>{String.fromCharCode(97 + i)}.</strong>
              <span className="al-field-line">{party || '\u00A0'}</span>
            </p>
          ))}
        </div>

        <div className="al-sig-split">
          <div className="al-sig-split-main">
            <div className="al-sig-line">
              {d.client?.signature?.startsWith?.('data:image')
                ? <img src={d.client.signature} alt="" />
                : null}
            </div>
            <div className="al-sig-split-labels">
              <span>Signature of Person Giving Consent</span>
              <span>Date: {d.client?.date || '____________'}</span>
            </div>
          </div>
          <div className="al-sig-split-main">
            <div className="al-sig-line">{d.client?.printedName || '\u00A0'}</div>
            <div className="al-sig-split-labels">
              <span>Print Name of Person Giving Consent</span>
              <span>Relationship: {d.client?.relationship || '____________'}</span>
            </div>
          </div>
        </div>
      </LegalShell>
    </div>
  );
}

function Form1083Print({ data = {}, agencyBranding = {} }) {
  const name = agencyDisplayName(agencyBranding);
  const d = data || {};
  const line = (value) => value || '\u00A0';

  return (
    <div className="ap-packet-print">
      <LegalShell
        code="1083"
        title="Assignment of Benefits"
        agencyBranding={agencyBranding}
        className="al-page-aob"
      >
        <div className="al-aob-grid">
          <div className="al-aob-col">
            <p className="al-aob-col-title">Client Information</p>
            <p className="al-aob-field">
              <strong>First Name:</strong>
              <span className="al-field-line">{line(d.firstName)}</span>
            </p>
            <p className="al-aob-field">
              <strong>Last Name:</strong>
              <span className="al-field-line">{line(d.lastName)}</span>
            </p>
            <p className="al-aob-field">
              <strong>DOB:</strong>
              <span className="al-field-line">{line(d.dob)}</span>
            </p>
            <p className="al-aob-field al-aob-address">
              <strong>Address:</strong>
              <span className="al-aob-address-lines">
                <span className="al-field-line">{line(d.address)}</span>
                <span className="al-field-line">{'\u00A0'}</span>
                <span className="al-field-line">{'\u00A0'}</span>
              </span>
            </p>
            <p className="al-aob-field">
              <strong>Phone Number:</strong>
              <span className="al-field-line">{line(d.phone)}</span>
            </p>
            <p className="al-aob-field">
              <strong>Client Pays For:</strong>
              <span className="al-field-line al-field-pct">{line(d.clientPaysPercent)}</span>
              <strong>%</strong>
            </p>
          </div>
          <div className="al-aob-col">
            <p className="al-aob-col-title">Long Term Care/Insurance Information</p>
            <p className="al-aob-field">
              <strong>Insurance Carrier:</strong>
              <span className="al-field-line">{line(d.insuranceCarrier)}</span>
            </p>
            <p className="al-check-row al-aob-checks">
              <span className="al-check-item">
                <CheckMark checked={!!d.triWest} /> TriWest
              </span>
              <span className="al-check-item">
                <CheckMark checked={!!d.vaReferral} /> VA Referral
              </span>
            </p>
            <p className="al-aob-field al-aob-address">
              <strong>Address:</strong>
              <span className="al-aob-address-lines">
                <span className="al-field-line">{line(d.insuranceAddress)}</span>
                <span className="al-field-line">{'\u00A0'}</span>
                <span className="al-field-line">{'\u00A0'}</span>
              </span>
            </p>
            <p className="al-aob-field">
              <strong>Phone Number:</strong>
              <span className="al-field-line">{line(d.insurancePhone)}</span>
            </p>
            <p className="al-aob-field">
              <strong>Policy Number:</strong>
              <span className="al-field-line">{line(d.policyNumber)}</span>
            </p>
            <p className="al-aob-field">
              <strong>Claim Number:</strong>
              <span className="al-field-line">{line(d.claimNumber)}</span>
            </p>
            <p className="al-aob-field">
              <strong>Insurance Pays For:</strong>
              <span className="al-field-line al-field-pct">{line(d.insurancePaysPercent)}</span>
              <strong>%</strong>
            </p>
          </div>
        </div>

        <section className="al-aob-section">
          <h2 className="al-aob-h">Long-Term Care Insurance</h2>
          <p className="al-p al-p-justify">
            I understand that {name} only accepts assignment of certain select Long-Term Care Insurance
            Policies. I have been advised that {name} will not initiate a claim with my Long-Term Care Insurer.
            Moreover, I understand that {name} does not accept assignment of Medicaid benefits. Acceptance of the
            Assignment of Benefits by {name} and the receipt of any pre-approval or pre-certification from an
            insurance company is not a guaranty of payment. Payment for services rendered by {name} is due at the
            time an invoice is rendered as set forth in the Client Service Agreement.
          </p>
        </section>

        <section className="al-aob-section">
          <h2 className="al-aob-h">Assignment of Benefits</h2>
          <p className="al-p al-p-justify">
            I hereby assign all Long-Term Care benefits to which I am entitled to {name} and I direct my insurance carrier(s)
            to issue payment check(s) directly to {name}. I understand that I am responsible for any amount not covered
            by insurance.
          </p>
        </section>

        <section className="al-aob-section">
          <h2 className="al-aob-h">Authorization to Release Information</h2>
          <p className="al-p al-p-justify">
            I hereby authorize {name} to: (a) release any information necessary to insurance carriers regarding my illness
            and treatments; (b) process insurance claims generated in the course of services rendered; and (c) allow a
            photocopy of my signature to be used to process insurance claims for the period of the lifetime of the Client Service
            Agreement. I authorize my insurance carrier(s) to release any insurance related information to {name} as may
            be necessary to process such claims. This order will remain in effect until revoked by me in writing.
          </p>
        </section>

        <section className="al-aob-section">
          <h2 className="al-aob-h">Financial Responsibility</h2>
          <p className="al-p al-p-justify">
            I have requested homecare and/or home health services from {name} and understand that by making this
            request, I become fully financially responsible for any and all charges incurred in the course of the treatment
            authorized or services rendered. I further understand that fees are due and payable as set forth in the Client
            Service Agreement and agree to pay such charges incurred in full immediately upon presentation of an invoice. A
            copy of this assignment is to be considered as valid as the original.
          </p>
        </section>

        <div className="al-sig-split">
          <div className="al-sig-split-main">
            <div className="al-sig-line">
              {d.client?.signature?.startsWith?.('data:image')
                ? <img src={d.client.signature} alt="" />
                : null}
            </div>
            <div className="al-sig-split-labels">
              <span>Signature of Client or Legal Representative</span>
              <span>Date: {d.client?.date || '____________'}</span>
            </div>
          </div>
          <div className="al-sig-split-main">
            <div className="al-sig-line">{d.client?.printedName || '\u00A0'}</div>
            <div className="al-sig-split-labels">
              <span>Print Name of Client or Legal Representative</span>
              <span>Relationship: {d.client?.relationship || '____________'}</span>
            </div>
          </div>
        </div>

        <p className="al-aob-note">
          If you sign this form on behalf of the Client, you must attach a copy of the Power of Attorney or Court
          Order appointing you Client’s legal guardian.
        </p>

        <div className="al-sig-split">
          <div className="al-sig-split-main">
            <div className="al-sig-line">
              {d.agency?.signature?.startsWith?.('data:image')
                ? <img src={d.agency.signature} alt="" />
                : null}
            </div>
            <div className="al-sig-split-labels">
              <span>Signature of {name} Representative</span>
              <span>Date: {d.agency?.date || '____________'}</span>
            </div>
          </div>
          <div className="al-sig-split-main">
            <div className="al-sig-line">{d.agency?.printedName || '\u00A0'}</div>
            <div className="al-sig-split-labels">
              <span>Print Name of {name} Representative</span>
              <span />
            </div>
          </div>
        </div>
      </LegalShell>
    </div>
  );
}

export function AssessmentLegalFormPrintView({
  code,
  data = {},
  agencyBranding = {},
}) {
  const name = agencyDisplayName(agencyBranding);
  const d = data || {};

  if (code === '324') {
    const copy = getForm324Copy(name);
    return (
      <div className="ap-packet-print">
        <LegalShell code={code} title={copy.title} agencyBranding={agencyBranding}>
          <p className="al-p"><strong>{copy.intro}</strong></p>
          <ul className="al-bullets">
            {copy.bullets.map((b) => <li key={b}>{b}</li>)}
          </ul>
          <p className="al-p al-ack">{copy.acknowledgement}</p>
          <div className="al-sigs">
            <Sig label="Client / Client Representative Signature" sig={d.client} />
            <Sig label="Agency Representative Signature" sig={d.agency} />
          </div>
        </LegalShell>
      </div>
    );
  }

  if (code === '325') {
    const copy = getForm325Copy(name);
    return (
      <div className="ap-packet-print">
        <LegalShell code={code} title={copy.title} subtitle={copy.subtitle} agencyBranding={agencyBranding}>
          {copy.paragraphs.map((p) => <p key={p.slice(0, 40)} className="al-p">{p}</p>)}
          <ol className="al-numbered">
            {copy.numbered.map((n) => <li key={n.slice(0, 40)}>{n}</li>)}
          </ol>
          {copy.paragraphsAfter.map((p) => <p key={p.slice(0, 40)} className="al-p">{p}</p>)}
          <div className="al-print-name">
            <div className="al-print-line">{d.printName || d.client?.printedName || '\u00A0'}</div>
            <div className="al-print-label">Print Name</div>
            <p className="al-p">{copy.printNameLeadIn}</p>
          </div>
          <div className="al-sigs">
            <Sig label="Client Signature" sig={d.client} />
            <div className="al-sig">
              <div className="al-sig-line">{d.client?.date || '\u00A0'}</div>
              <div className="al-sig-label">Date</div>
            </div>
          </div>
        </LegalShell>
      </div>
    );
  }

  if (code === '350') {
    const copy = getForm350Copy(name);
    const printName = d.printName || d.client?.printedName || '';
    return (
      <div className="ap-packet-print">
        <LegalShell code={code} title={copy.title} agencyBranding={agencyBranding}>
          <p className="al-p al-inline-name-row">
            <span>{copy.leadInBefore}</span>
            <span className="al-inline-name">
              <span className="al-inline-name-value">{printName || '\u00A0'}</span>
            </span>
            <span>, {copy.leadInAfter}</span>
          </p>
          {copy.paragraphs.map((p) => <p key={p.slice(0, 40)} className="al-p">{p}</p>)}
          <div className="al-sigs">
            <Sig label="Client / Legal Guardian Signature" sig={d.client} />
            <Sig label="Agency Representative Signature" sig={d.agency} />
          </div>
        </LegalShell>
      </div>
    );
  }

  if (code === '410') {
    const copy = getForm410Copy(name);
    const printName = d.printName || d.client?.printedName || '';
    return (
      <div className="ap-packet-print">
        <LegalShell code={code} title={copy.title} agencyBranding={agencyBranding}>
          <p className="al-p al-inline-name-row">
            <span>{copy.leadInBefore}</span>
            <span className="al-inline-name">
              <span className="al-inline-name-value">{printName || '\u00A0'}</span>
            </span>
            <span>, {copy.leadInAfter}</span>
          </p>
          {copy.paragraphs.map((p) => <p key={p.slice(0, 40)} className="al-p">{p}</p>)}
          <p className="al-p al-field-row">
            <span className="al-field">
              <strong>Client Name:</strong>
              <span className="al-field-line">{d.clientName || '\u00A0'}</span>
            </span>
            <span className="al-field al-field-dob">
              <strong>DOB:</strong>
              <span className="al-field-line">{d.dob || '\u00A0'}</span>
            </span>
          </p>
          <div className="al-comments">
            <strong>Comments:</strong>
            <div className="al-comments-body">{d.comments || '\u00A0'}</div>
          </div>
          <div className="al-sigs">
            <Sig label="Employee Signature" sig={d.employee} />
            <Sig label="Client Signature" sig={d.client} />
            <Sig label="Agency Representative Signature" sig={d.agency} />
          </div>
        </LegalShell>
      </div>
    );
  }

  if (code === '610') {
    const copy = getForm610Copy(name);
    return (
      <div className="ap-packet-print">
        <LegalShell code={code} title={copy.title} agencyBranding={agencyBranding}>
          <p className="al-p">{copy.greeting}</p>
          {copy.paragraphs.map((p) => <p key={p.slice(0, 40)} className="al-p">{p}</p>)}
          <p className="al-p al-ack">{copy.acknowledgement}</p>
          <div className="al-sigs">
            <Sig label="Client / Legal Representative Signature" sig={d.client} />
          </div>
        </LegalShell>
      </div>
    );
  }

  if (code === '800') {
    const copy = getForm800Copy(name);
    return (
      <div className="ap-packet-print">
        <LegalShell code={code} title={copy.title} agencyBranding={agencyBranding}>
          {copy.paragraphs.map((p) => <p key={p.slice(0, 40)} className="al-p">{p}</p>)}
          <ul className="al-bullets">
            {copy.bullets.map((b) => <li key={b.slice(0, 40)}>{b}</li>)}
          </ul>
          {copy.paragraphsAfter.map((p) => <p key={p.slice(0, 40)} className="al-p">{p}</p>)}
        </LegalShell>
      </div>
    );
  }

  if (code === '1009') {
    return <Form1009Print data={d} agencyBranding={agencyBranding} />;
  }

  if (code === '1081') {
    return <Form1081Print data={d} agencyBranding={agencyBranding} />;
  }

  if (code === '1083') {
    return <Form1083Print data={d} agencyBranding={agencyBranding} />;
  }

  if (code === '1082') {
    return (
      <div className="ap-packet-print">
        <LegalShell
          code={code}
          title="HIPAA Notice of Privacy"
          agencyBranding={agencyBranding}
          headerVariant="notice"
          effectiveDate={d.effectiveDate || '01/01/2016'}
        >
          <LongBody code={code} agencyName={name} agencyBranding={agencyBranding} />
          <div className="al-sigs">
            <Sig label="Client / Representative Signature" sig={d.client} />
            {d.agency ? <Sig label="Agency Representative Signature" sig={d.agency} /> : null}
          </div>
        </LegalShell>
      </div>
    );
  }

  return null;
}
