import { formatAgencyStreetLine } from '../../../../utils/agencyBranding';
import {
  agencyDisplayName,
  getForm324Copy,
  getForm325Copy,
  getForm350Copy,
  getForm410Copy,
  getForm610Copy,
  getForm800Copy,
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

function LegalShell({
  code,
  title,
  subtitle,
  agencyBranding = {},
  children,
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
    <div className="ap-page al-page">
      <header className="al-header">
        {logo ? <img src={logo} alt="" className="al-logo" /> : null}
      </header>
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

function LongBody({ code, agencyName }) {
  const raw = legalBodies[code] || '';
  const text = replaceAgencyBrand(raw, agencyName);
  const blocks = text.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  return (
    <>
      {blocks.map((block, i) => (
        <p key={i} className="al-p" style={{ whiteSpace: 'pre-wrap' }}>{block}</p>
      ))}
    </>
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
    return (
      <div className="ap-packet-print">
        <LegalShell code={code} title={copy.title} agencyBranding={agencyBranding}>
          <div className="al-print-name">
            <div className="al-print-line">{d.printName || d.client?.printedName || '\u00A0'}</div>
            <div className="al-print-label">Print First and Last Name</div>
          </div>
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
    return (
      <div className="ap-packet-print">
        <LegalShell code={code} title={copy.title} agencyBranding={agencyBranding}>
          <div className="al-print-name">
            <div className="al-print-line">{d.printName || '\u00A0'}</div>
            <div className="al-print-label">Print First and Last Name</div>
          </div>
          {copy.paragraphs.map((p) => <p key={p.slice(0, 40)} className="al-p">{p}</p>)}
          <p className="al-p"><strong>Client Name:</strong> {d.clientName || '____________________'} &nbsp;&nbsp; <strong>DOB:</strong> {d.dob || '____________'}</p>
          {d.comments ? <p className="al-p"><strong>Comments:</strong> {d.comments}</p> : null}
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

  if (['1009', '1081', '1082', '1083'].includes(code)) {
    const titles = {
      '1009': 'Consent for Homecare Services Agreement',
      '1081': 'Consent to Release / Obtain Information',
      '1082': 'HIPAA Notice of Privacy Practices',
      '1083': 'Assignment of Benefits',
    };
    return (
      <div className="ap-packet-print">
        <LegalShell code={code} title={titles[code]} agencyBranding={agencyBranding}>
          <LongBody code={code} agencyName={name} />
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
