/**
 * Replace Mastercare brand strings with the logged-in agency name in legal copy.
 */
export function agencyDisplayName(brandingOrName = '') {
  if (typeof brandingOrName === 'string') return brandingOrName.trim() || 'the Agency';
  return String(brandingOrName?.name || '').trim() || 'the Agency';
}

export function replaceAgencyBrand(text, agencyName) {
  const name = agencyDisplayName(agencyName);
  return String(text || '')
    .replace(/Mastercare Homecare and Healthcare/gi, name)
    .replace(/Mastercare Homecare & Healthcare/gi, name)
    .replace(/Mastercare Homecare Representative/gi, `${name} Representative`)
    .replace(/Mastercare Homecare/gi, name)
    .replace(/Mastercare, Inc\./gi, `${name}`)
    .replace(/Mastercare Inc\./gi, `${name}`)
    .replace(/Mastercare['’]s/gi, `${name}'s`)
    .replace(/Mastercare Representative/gi, 'Agency Representative')
    .replace(/Mastercare Staff/gi, `${name} staff`)
    .replace(/Mastercare office/gi, 'the agency office')
    .replace(/Mastercare Client Handbook/gi, `${name} Client Handbook`)
    .replace(/Mastercare Consent/gi, `${name} Consent`)
    .replace(/Mastercare nurses/gi, `${name} caregivers`)
    .replace(/Mastercare Dallas:?/gi, name)
    .replace(/a Mastercare /gi, `a ${name} `)
    .replace(/A Mastercare /gi, `A ${name} `)
    .replace(/from Mastercare/gi, `from ${name}`)
    .replace(/with Mastercare/gi, `with ${name}`)
    .replace(/by Mastercare/gi, `by ${name}`)
    .replace(/to Mastercare/gi, `to ${name}`)
    .replace(/of Mastercare/gi, `of ${name}`)
    .replace(/\bMastercare\b/gi, name)
    .replace(/support@mastercare\.care/gi, '')
    .replace(/civilrights@gomastercare\.com/gi, '')
    .replace(/www\.mastercare\.care/gi, '')
    .replace(/gomastercare\.com/gi, '');
}

/** Codes whose PDFs have Mastercare in body copy — render as agency HTML letters. */
export const AGENCY_TEXT_FORM_CODES = [
  '324', '325', '350', '410', '610', '800',
  '1009', '1081', '1082', '1083',
];

export function isAgencyTextForm(code) {
  return AGENCY_TEXT_FORM_CODES.includes(String(code));
}

export function getForm324Copy(agencyName) {
  const name = agencyDisplayName(agencyName);
  return {
    title: 'What Our Personal Assistants May NOT Do',
    intro: 'Personal Assistants DO NOT:',
    bullets: [
      'Perform tasks not on the Care Plan',
      'Give enemas or remove impactions',
      'Foley catheter irrigation',
      'Super pubic irrigation',
      'Colostomy irrigation',
      'Decubitus care or any type of wound care',
      'Care of tracheotomy tubes / Suctioning',
      'Vaginal irrigation / Insertion of tampons',
      'Tube feeding',
      'Massage or rub legs',
      'Cut fingernails or toenails',
      'Restrain clients',
      'Change sterile dressings',
      'Give medical or legal advice',
      'Heavy lifting that does not pertain to client care',
      'Household repairs',
      'Provide care for a client’s family members',
      'Handle checkbook or financial issues',
      'Accept gifts or extra pay from client',
      'Landscaping / yard work',
      'Smoke while on shift at a client’s home',
      'Eat client’s food',
      'Text or talk on the phone while on shift with a client',
      'Drive client without prior approval from the agency office',
      'Enter house without client present',
      'Call clients directly and cancel services or reschedule shifts',
    ],
    acknowledgement: `I have read and understand what a ${name} Personal Assistant may not do. If I have any questions about my service, I will contact my Service Supervisor.`,
    showAgencySig: true,
  };
}

export function getForm325Copy(agencyName) {
  const name = agencyDisplayName(agencyName);
  return {
    title: 'Participant Agreement Release',
    subtitle: '***READ BEFORE SIGNING***',
    paragraphs: [
      `In consideration of the Homecare program that I am participating in with ${name}, I understand, it is never the intent of any of the caregivers who work in my home to harm, destruct, or in any way damage client belongings, their homes, or personal property. I further understand that it is common that during the process of the Activities of Daily Living and caring for our clients in their homes:`,
    ],
    numbered: [
      'Items in my home may be unintentionally broken.',
      'Items in my home may be unintentionally misplaced.',
      'Caregivers will be using my cleaning products such as dish soap, laundry detergent, furniture polish, window cleaners etc., and it is my responsibility to replace those items as they are used by the caregiver to care for myself and my home.',
      'Caregivers will be using my household equipment i.e., vacuum cleaner, all kitchenware, appliances, and kitchen products, washing machine and dryer.',
    ],
    paragraphsAfter: [
      `I, hereby release, indemnify, and hold harmless ${name}, its owners, officers, officials, employees, and if applicable, agents or sponsors that may conduct business for myself in my home, from any and all claims, demands, losses, and liability arising out of any damage to my personal property, use of my personal property whether negligent or not, in the execution of the aforementioned duties.`,
      `I understand that if I observe any unusual or significant misuse, mistreatment, or intentional destruction of any of my personal property during care or treatment by any representative or caregiver of ${name}, that it is my responsibility to notify ${name}, within 24 hours. I further understand that I have the right to file a grievance to obtain a resolution to the reported issue and failure to do so may result in an investigation that yields an inability to validate the claim.`,
    ],
    printNameLeadIn: 'acknowledges that he/she has read and understands this agreement and voluntarily accepts the obligations of the Participant Agreement Release.',
    showAgencySig: false,
  };
}

export function getForm350Copy(agencyName) {
  const name = agencyDisplayName(agencyName);
  return {
    title: 'Client Handbook Acknowledgement',
    leadInBefore: 'I,',
    leadInAfter: 'acknowledge that I have',
    paragraphs: [
      `received a copy of the ${name} Client Handbook, which describes important information about ${name}, Notice of Privacy Practices (HIPAA), a Statement of Client’s Rights and Responsibilities, Grievance Reporting Procedures, Agency Contact Information, Home Safety and Emergency Planning Information and Advance Directives Information. I understand that I am expected to read and abide with the terms outlined in the Handbook. I also understand that if I have questions concerning any of the terms of ${name} I should contact my Service Supervisor for clarification.`,
    ],
    showAgencySig: true,
  };
}

export function getForm410Copy(agencyName) {
  const name = agencyDisplayName(agencyName);
  return {
    title: 'Care Plan Acknowledgement',
    leadInBefore: 'I,',
    leadInAfter: 'have been informed of the current Service Plan / Individual Care Plan by',
    paragraphs: [
      `${name} for the following client and have carefully read and understand the services identified for this client.`,
    ],
    showAgencySig: true,
    showEmployeeSig: true,
  };
}

export function getForm610Copy(agencyName) {
  const name = agencyDisplayName(agencyName);
  return {
    title: 'Client Concerns & Grievance Process Acknowledgement',
    greeting: 'Dear Client and Family Member:',
    paragraphs: [
      `While it is the philosophy of ${name} to consistently provide quality Homecare and Healthcare to all our clients, we understand that from time to time, situations or concerns may arise. All our clients have the right to file a complaint or a grievance at any time and the right to continuation of care without the fear of retaliation when filing a grievance, as well as the peace of mind knowing that all the information provided will be kept in strict confidence.`,
      `${name} will be there every step of the way to ensure your issues are resolved in a timely manner. We have a formal grievance procedure and process that ensures that your concerns shall be reviewed and investigation started within 48 hours. Every attempt shall be made to resolve grievances within 14 days. You have been provided with our Grievance Policy and Procedure as well as Client Grievance Forms.`,
    ],
    acknowledgement: 'I have been informed of the grievance process and have received a copy of the Grievance Policy and Procedure.',
    showAgencySig: false,
  };
}

export function getForm800Copy(agencyName) {
  const name = agencyDisplayName(agencyName);
  return {
    title: 'Nondiscrimination Notice',
    paragraphs: [
      `${name} complies with applicable Federal civil rights laws and does not exclude, deny benefits to, or otherwise discriminate against any individual on the basis of race, color, national origin, age, sex, sexual orientation, gender identity and expression or, disability in employment, admission or access to, treatment or participation in, or receipt of the services and benefits.`,
      `${name}:`,
    ],
    bullets: [
      'Provides free aids and services to people with disabilities to communicate effectively with us, such as qualified sign language interpreters and written information in other formats (large print, audio, accessible electronic formats).',
      'Provides free language services to people whose primary language is not English, such as qualified interpreters and information written in other languages.',
    ],
    paragraphsAfter: [
      `If you believe that ${name} has failed to provide these services or discriminated in another way on the basis of race, color, national origin, age, disability, or sex, you can file a grievance with the agency Civil Rights Coordinator using the contact information on file with the agency.`,
      'You can also file a civil rights complaint with the U.S. Department of Health and Human Services, Office for Civil Rights, electronically through the Office for Civil Rights Complaint Portal, or by mail or phone at: U.S. Department of Health and Human Services, 200 Independence Avenue, SW, Room 509F, HHH Building, Washington, D.C. 20201, 1-800-368-1019 / 1-800-537-7697 (TDD).',
    ],
    showAgencySig: false,
  };
}

/** Long consent / HIPAA texts — brandify Mastercare placeholders. */
export function getLongFormBody(code, agencyName, rawFallback = '') {
  const branded = replaceAgencyBrand(rawFallback, agencyName);
  return branded
    .split(/\n{2,}/)
    .map((p) => p.replace(/\s+/g, ' ').trim())
    .filter((p) => p
      && !/^7920 Belt Line/i.test(p)
      && !/All Rights Reserved/i.test(p)
      && !/^www\./i.test(p)
      && !/MC-Rev\./i.test(p)
      && !/^Email:/i.test(p));
}

const SECTION_HEADING_RE = /^(How We May Use and Disclose Your Health Information|Special Situations|Your Rights|Changes to This Notice)(:)?$/i;
const INLINE_HEADING_RE = /^([A-Z][\w/'’&\s/-]{1,60}\.)\s+([A-Z\d].+)$/;
const INLINE_HEADING_ALLOW = /^(Plan of Care\/Treatment|Payment|Agency Operations|Notifications|Workers['’]? Compensation|Public Health|Law Enforcement|Charges Against|Duty to Warn|Right to )/i;

function joinSoftWrappedLines(lines) {
  let out = '';
  for (const line of lines) {
    const t = String(line || '').trim();
    if (!t) continue;
    if (!out) {
      out = t;
      continue;
    }
    if (/[A-Za-z]$/.test(out) && /^[a-z]/.test(t)) {
      const lastWord = out.split(/\s+/).pop() || '';
      const commonShort = /^(a|an|and|as|at|be|by|do|for|if|in|is|it|no|not|of|on|or|so|to|up|us|we|ask|may|the|you|all|any|can|has|had|her|his|how|its|our|out|own|too|was|who|are|but|did|use|used)$/i;
      // Glue only true mid-word wraps (e.g. "Rig"+"ht"), not "ask"+"us"
      if (lastWord.length <= 3 && !commonShort.test(lastWord)) out += t;
      else out += ` ${t}`;
    } else {
      out += ` ${t}`;
    }
  }
  return out.replace(/\s+/g, ' ').trim();
}

function isInlineHeadingLine(line, agencyName = '') {
  const m = String(line || '').match(INLINE_HEADING_RE);
  if (!m) return false;
  const heading = m[1].replace(/\.\s*$/, '');
  if (agencyName && heading.toLowerCase() === String(agencyName).toLowerCase()) return false;
  return INLINE_HEADING_ALLOW.test(heading);
}

function pushParagraph(blocks, lines, agencyName = '') {
  const text = joinSoftWrappedLines(lines);
  if (!text) return;
  if (agencyName && text.toLowerCase() === String(agencyName).toLowerCase()) return;
  if (isInlineHeadingLine(text, agencyName)) {
    const inline = text.match(INLINE_HEADING_RE);
    blocks.push({ type: 'lead', heading: inline[1], text: inline[2] });
  } else {
    blocks.push({ type: 'p', text });
  }
}

/**
 * Parse long legal notice text into structured blocks for print layout
 * (paragraphs, bullets, section headings, bold lead-ins).
 */
export function parseLegalNoticeBlocks(rawText, agencyName) {
  const name = agencyDisplayName(agencyName);
  const branded = replaceAgencyBrand(rawText, name)
    .replace(/\f/g, '\n')
    .replace(/\r\n/g, '\n')
    .replace(/\u00a0/g, ' ');

  const lines = branded.split('\n');
  const blocks = [];
  let para = [];
  let bullets = [];

  const flushPara = () => {
    if (!para.length) return;
    pushParagraph(blocks, para, name);
    para = [];
  };

  const flushBullets = () => {
    if (!bullets.length) return;
    blocks.push({ type: 'ul', items: bullets.map((b) => b.replace(/\s+/g, ' ').trim()) });
    bullets = [];
  };

  for (const rawLine of lines) {
    const trimmed = String(rawLine || '').trim();
    const isIndented = /^\s{3,}/.test(rawLine || '');

    if (!trimmed) {
      flushPara();
      flushBullets();
      continue;
    }

    if (/^Effective Date:/i.test(trimmed)) continue;
    if (/^HIPAA Notice of Privacy$/i.test(trimmed)) continue;
    if (/^Consent for Homecare Services/i.test(trimmed) && trimmed.length < 80) continue;
    if (/^Consent To Release/i.test(trimmed) && trimmed.length < 80) continue;
    if (/All Rights Reserved/i.test(trimmed)) continue;
    if (/^MC-Rev\./i.test(trimmed)) continue;
    if (/^www\./i.test(trimmed)) continue;
    if (/^7920 Belt Line/i.test(trimmed)) continue;
    if (/^Email:/i.test(trimmed) && trimmed.length < 60) continue;
    if (/^Dallas,? TX/i.test(trimmed)) continue;
    if (/^Fax:\s*\(/i.test(trimmed) && trimmed.length < 40) continue;
    if (name && trimmed.toLowerCase() === name.toLowerCase()) continue;

    if (/^Send all written requests/i.test(trimmed)) {
      flushPara();
      flushBullets();
      blocks.push({ type: 'requests' });
      continue;
    }

    if (/^[•·●\u2022]\s*/.test(trimmed)) {
      flushPara();
      bullets.push(trimmed.replace(/^[•·●\u2022]\s*/, ''));
      continue;
    }

    if (bullets.length && isIndented && !SECTION_HEADING_RE.test(trimmed) && !isInlineHeadingLine(trimmed, name)) {
      bullets[bullets.length - 1] = `${bullets[bullets.length - 1]} ${trimmed}`;
      continue;
    }

    if (SECTION_HEADING_RE.test(trimmed)) {
      flushPara();
      flushBullets();
      const heading = /:\s*$/.test(trimmed) ? trimmed : `${trimmed}:`;
      blocks.push({ type: 'h', text: heading });
      continue;
    }

    if (bullets.length) flushBullets();

    if (isInlineHeadingLine(trimmed, name) && para.length) {
      flushPara();
    }

    para.push(trimmed);
  }

  flushPara();
  flushBullets();
  return blocks;
}

const ROMAN_SECTION_RE = /^\s*((?:I{1,3}|IV|V|VI{0,3}|IX|X)\.)\s+(.+)$/i;

/**
 * Split consent agreement body (form 1009) into Roman-numeral sections
 * for print layout. Keeps current copy; only structures it for design.
 */
export function parseConsentAgreementSections(rawText, agencyName) {
  const name = agencyDisplayName(agencyName);
  const branded = replaceAgencyBrand(rawText, name)
    .replace(/\f/g, '\n')
    .replace(/\r\n/g, '\n')
    .replace(/\u00a0/g, ' ');

  const lines = branded.split('\n');
  const sections = [];
  let current = null;
  let buf = [];

  const flushBuf = () => {
    if (!current || !buf.length) {
      buf = [];
      return;
    }
    const text = joinSoftWrappedLines(buf);
    buf = [];
    if (!text) return;
    // Skip template chrome / signature labels that we render separately
    if (/^Client Name:/i.test(text) && text.length < 80) return;
    if (/^Consent for Homecare Services/i.test(text) && text.length < 80) return;
    if (/^Client Signature/i.test(text)) return;
    if (/^Representative Signature/i.test(text)) return;
    if (/^Secondary Guarantor/i.test(text)) return;
    if (/^Tertiary Guarantor/i.test(text)) return;
    if (/^I\/We guarantee to pay/i.test(text)) return;
    current.paragraphs.push(text);
  };

  for (const rawLine of lines) {
    const trimmed = String(rawLine || '').trim();
    if (!trimmed) {
      flushBuf();
      continue;
    }
    if (/^Client Name:/i.test(trimmed) && /DOB:/i.test(trimmed)) continue;
    if (/^Consent for Homecare Services/i.test(trimmed) && trimmed.length < 90) continue;

    const roman = trimmed.match(ROMAN_SECTION_RE);
    if (roman) {
      flushBuf();
      if (current) sections.push(current);
      current = {
        heading: `${roman[1].toUpperCase().replace(/\.$/, '')}. ${roman[2].trim()}`,
        paragraphs: [],
      };
      continue;
    }

    if (!current) {
      // preamble before first section — ignore chrome
      continue;
    }

    // Skip noisy service-checkbox lines from the template; UI data renders those
    if (/Non-Medical:/i.test(trimmed) && /Chore|Companion|Respite/i.test(trimmed)) continue;
    if (/Private Duty Nursing:/i.test(trimmed) && /\bRN\b|\bLPN\b/i.test(trimmed)) continue;
    if (/^Frequency by Discipline:/i.test(trimmed) && trimmed.length < 40) continue;
    if (/Billing Cycle:/i.test(trimmed) && /Weekly|Bi-Weekly|Monthly/i.test(trimmed)) {
      // keep payment prose before billing cycle marker if any
      const before = trimmed.split(/Billing Cycle:/i)[0].trim();
      if (before) buf.push(before);
      flushBuf();
      continue;
    }
    if (/I do not have an Advanced Directive/i.test(trimmed)) continue;
    if (/^\(Name\)/i.test(trimmed) || /has a copy of my Advanced Directive/i.test(trimmed)) continue;
    if (/Yes, I have a Health Care Representative/i.test(trimmed)) continue;
    if (/^Name:\s*$/i.test(trimmed) || (/^Name:/i.test(trimmed) && /Phone:/i.test(trimmed))) continue;

    buf.push(trimmed);
  }

  flushBuf();
  if (current) sections.push(current);
  return sections;
}


