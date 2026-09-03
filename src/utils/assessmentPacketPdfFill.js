/**
 * Fill Mastercare assessment-packet PDF templates (AcroForm) with saved form data.
 * Templates live at backend/documents/fillable-forms/assessment-packet/
 */
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { fetchPdfTemplateBytes } from '../components/candidate/pdf-forms/pdfTemplateFetch';
import {
  ASSESSMENT_PACKET_FORMS,
  CARE_INSTRUCTION_GROUPS,
  SAFETY_ITEMS,
  isPacketFormEditable,
} from './assessmentPacket';
import { isAgencyTextForm } from './assessmentPacketAgencyCopy';
import { fillAgencyTextFormPdf } from './assessmentPacketLegalPdf';

export const ASSESSMENT_PACKET_PDF_FILES = {
  '110': '110-Physical-Assessment-Info_TX.pdf',
  '324': '324-Personal-Assistants-May-Not-Do_TX.pdf',
  '325': '325-Participant-Agreement-Release_TX.pdf',
  '350': '350-Client-Handbook-Acknowledgement_TX.pdf',
  '400': '400-Care-Instructions_TX.pdf',
  '410': '410-Care-Plan-Acknowledgement_TX.pdf',
  '610': '610-Client-Concerns-Grievance_TX.pdf',
  '790': '790-Case-Notes_TX.pdf',
  '800': '800-Discrimination-Notice_TX.pdf',
  '1009': '1009-Consent-for-Services-Agreement_TX.pdf',
  '1081': '1081-Consent-to-Release-Obtain-Information_TX.pdf',
  '1082': '1082-HIPAA-Notice-of-Privacy_TX.pdf',
  '1083': '1083-Assignment-of-Benefits_TX.pdf',
  '7000': '7000-Emergency-Plan_TX.pdf',
  '7050': '7050-Home-Environment-Safety-Checklist_TX.pdf',
};

/** Parallel to SAFETY_ITEMS — PDF checkbox base names for Y / N / R */
const SAFETY_PDF_TRIPLES = [
  { Y: 'StairsY1', N: 'StairsN1', R: 'StairsR1' },
  { Y: 'StairsY2', N: 'StairsN2', R: 'StairsR2' },
  { Y: 'StairsY3', N: 'StairsN3', R: 'StairsR3' },
  { Y: 'StairsY4', N: 'StairsN14', R: 'StairsR4' },
  { Y: 'CarpetY1', N: 'CarpetN1', R: 'CarpetR1' },
  { Y: 'CarpetY2', N: 'CarpetN2', R: 'CarpetR2' },
  { Y: 'CarpetY3', N: 'CarpetN3', R: 'CarpetR3' },
  { Y: 'Furniture1', N: 'FurnitureN1', R: 'FurnitureR1' },
  { Y: 'furnitureY2', N: 'FurnitureN2', R: 'FurnitureR2' },
  { Y: 'BathroomY1', N: 'BathroomN1', R: 'BathroomR1' },
  { Y: 'BathroomY2', N: 'BathroomN2', R: 'BathroomR2' },
  { Y: 'BathroomY3', N: 'BathroomN3', R: 'BathroomR3' },
  { Y: 'BathroomY4', N: 'BathroomN4', R: 'BathroomR4' },
  { Y: 'BathroomY5', N: 'BathroomN5', R: 'BathroomR5' },
  { Y: 'BathroomY6', N: 'BathroomN6', R: 'BathroomR6' },
  { Y: 'BedroomY1', N: 'BedroomN1', R: 'BedroomR1' },
  { Y: 'BedroomY2', N: 'BedroomN2', R: 'BedroomR2' },
  { Y: 'BedroomY3', N: 'BedroomN3', R: 'BedroomR3' },
  { Y: 'KitchenY1', N: 'KitchenN1', R: 'KitchenR1' },
  { Y: 'KitchenY2', N: 'KitchenN2', R: 'KitchenR2' },
  { Y: 'KitchenY3', N: 'KitchenN3', R: 'KitchenR3' },
  { Y: 'KitchenY4', N: 'KitchenN4', R: 'KitchenR4' },
  { Y: 'KitchenY5', N: 'KitchenN5', R: 'KitchenR5' },
  { Y: 'KitchenY6', N: 'KitchenN6', R: 'KitchenR6' },
  { Y: 'LivingY1', N: 'LivingN1', R: 'LivingR1' },
  { Y: 'LivingY2', N: 'LivingN2', R: 'LivingR2' },
  { Y: 'LivingY3', N: 'LivingN3', R: 'LivingR3' },
  { Y: 'BasementY1', N: 'BasementN1', R: 'BasementR1' },
  { Y: 'BasementY2', N: 'BasementN2', R: 'BasementR2' },
  { Y: 'BasementY3', N: 'BasementN3', R: 'BasementR3' },
  { Y: 'BasementY4', N: 'BasementN4', R: 'BasementR4' },
  { Y: 'PetsY1', N: 'PetsN1', R: null },
  { Y: 'PetsY2', N: 'PetsN2', R: null },
  { Y: 'PetsY3', N: 'PetsN3', R: null },
  { Y: 'FireY1', N: 'FireN1', R: 'FireR1' },
  { Y: 'FireY2', N: 'FireN2', R: 'FireR2' },
  { Y: 'FireY3', N: 'FireN3', R: 'FireR3' },
  { Y: 'FireY4', N: 'FireN4', R: 'FireR4' },
  { Y: 'FireY5', N: 'FireN5', R: 'FireR5' },
  { Y: 'FireY6', N: 'FireN6', R: 'FireR6' },
  { Y: 'FireY7', N: 'FireN7', R: 'FireR7' },
  { Y: 'FireY8', N: 'FireN8', R: 'FireR8' },
  { Y: 'FireY9', N: 'FireN9', R: 'FireR9' },
  { Y: 'FirePlanY1', N: 'FirePlanN1', R: 'FirePlanR1' },
  { Y: 'EquipmentY1', N: 'EquipmentN1', R: 'EquipmentR1' },
  { Y: 'EquipmentY2', N: 'EquipmentN2', R: 'EquipmentR2' },
  { Y: 'EquipmentY3', N: 'EquipmentN3', R: 'EquipmentR3' },
  { Y: 'EquipmentY4', N: 'EquipmentN4', R: 'EquipmentR4' },
  { Y: 'EquipmentY5', N: 'EquipmentN5', R: 'EquipmentR5' },
  { Y: 'EquipmentY6', N: 'EquipmentN6', R: 'EquipmentR6' },
  { Y: 'EquipmentY7', N: 'EquipmentN7', R: 'EquipmentR7' },
  { Y: 'PestsY1', N: 'PestsN1', R: 'PestsR1' },
  { Y: 'PestsY2', N: 'PestsN2', R: 'PestsR2' },
  { Y: 'StructuralY1', N: 'StructuralN1', R: 'StructuralR1' },
  { Y: 'StructuralY2', N: 'StructuralN2', R: 'StructuralR2' },
  { Y: 'StructuralY3', N: 'StructuralN3', R: 'StructuralR3' },
  { Y: 'StructuralY4', N: 'StructuralN4', R: 'StructuralR4' },
  { Y: 'StructuralY5', N: 'StructuralN5', R: 'StructuralR5' },
  { Y: 'StructuralY6', N: 'StructuralN6', R: 'StructuralR6' },
  { Y: 'PersonalY1', N: 'PersonalN1', R: 'PersonalR1' },
  { Y: 'PersonalY2', N: 'PersonalN2', R: 'PersonalR2' },
];

const CARE_PDF_PREFIX = {
  assessment: 'Assessment',
  activityComfort: 'Activity',
  elimination: 'Elimination',
  personalCare: 'PersonalCare',
  medications: 'Medications',
  housekeeping: 'Housekeeping',
  mobility: 'Mobility',
  nutrition: 'Nutrition',
  specialty: 'Specialty',
  safety: 'Safety',
  records: 'Records',
};

export function getAssessmentPacketPdfUrl(code) {
  const file = ASSESSMENT_PACKET_PDF_FILES[code];
  if (!file) return '';
  return `/api/documents/fillable-forms/assessment-packet/${file}`;
}

const str = (v) => (v === null || v === undefined ? '' : String(v));

async function dataUrlToBytes(dataUrl) {
  if (!dataUrl || !String(dataUrl).startsWith('data:')) return null;
  try {
    const res = await fetch(dataUrl);
    return new Uint8Array(await res.arrayBuffer());
  } catch {
    return null;
  }
}

async function fetchImageBytes(url) {
  if (!url) return null;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return new Uint8Array(await res.arrayBuffer());
  } catch {
    return null;
  }
}

/** Mastercare logo sits in the top-right corner only — keep mask above the form title. */
const TEMPLATE_LOGO_MASK = {
  x: 370,
  width: 235,
  height: 62,
  topMargin: 0,
};

/** Agency logo on page 1 only — centered in the header band. */
const AGENCY_LOGO_BOX = {
  maxW: 200,
  maxH: 54,
  topMargin: 8,
};

/**
 * Cover both Mastercare footer lines (contact + copyright/website).
 * Measured for letter pages (612×792).
 */
const TEMPLATE_FOOTER_MASK = {
  x: 12,
  width: 588,
  height: 52,
  bottom: 4,
};

function coverTemplateLogo(page, pageHeight) {
  page.drawRectangle({
    x: TEMPLATE_LOGO_MASK.x,
    y: pageHeight - TEMPLATE_LOGO_MASK.topMargin - TEMPLATE_LOGO_MASK.height,
    width: TEMPLATE_LOGO_MASK.width,
    height: TEMPLATE_LOGO_MASK.height,
    color: rgb(1, 1, 1),
    borderWidth: 0,
  });
}

function coverTemplateFooter(page) {
  page.drawRectangle({
    x: TEMPLATE_FOOTER_MASK.x,
    y: TEMPLATE_FOOTER_MASK.bottom,
    width: TEMPLATE_FOOTER_MASK.width,
    height: TEMPLATE_FOOTER_MASK.height,
    color: rgb(1, 1, 1),
    borderWidth: 0,
  });
}

function formatFooterAddress(branding = {}) {
  const cityState = [branding.city, branding.state].filter(Boolean).join(', ');
  return [branding.address, cityState].filter(Boolean).join(', ');
}

function normalizeWebsite(website = '') {
  return String(website || '')
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/\/$/, '');
}

async function embedLogoBytes(pdfDoc, logoBytes) {
  if (!logoBytes) return null;
  try {
    return await pdfDoc.embedPng(logoBytes);
  } catch {
    try {
      return await pdfDoc.embedJpg(logoBytes);
    } catch {
      return null;
    }
  }
}

function resolveBranding(options = {}) {
  const branding = { ...(options.agencyBranding || {}) };
  if (!branding.logoUrl && options.agencyLogoUrl) {
    branding.logoUrl = options.agencyLogoUrl;
  }
  return branding;
}

/**
 * Hide baked-in Mastercare branding on every page.
 * Draw agency logo on page 1 only (centered).
 * Draw agency footer on every page over the cleared Mastercare footer.
 */
async function overlayAgencyBranding(pdfDoc, options = {}) {
  const branding = resolveBranding(options);
  let logoBytes = null;
  if (branding.logoUrl) {
    logoBytes = String(branding.logoUrl).startsWith('data:')
      ? await dataUrlToBytes(branding.logoUrl)
      : await fetchImageBytes(branding.logoUrl);
  }

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const address = formatFooterAddress(branding);
  const phone = branding.phone ? `Phone: ${branding.phone}` : '';
  const fax = branding.fax ? `Fax: ${branding.fax}` : '';
  const email = branding.email ? `Email: ${branding.email}` : '';
  const website = normalizeWebsite(branding.website);
  const copyright = branding.name
    ? `©${branding.name} All Rights Reserved`
    : '';
  const midContact = [phone, fax].filter(Boolean).join('    ');
  const hasFooterContent = Boolean(address || midContact || email || copyright || website);

  const logoImage = logoBytes ? await embedLogoBytes(pdfDoc, logoBytes) : null;
  let logoW = 0;
  let logoH = 0;
  if (logoImage) {
    const dims = logoImage.scale(1);
    const scale = Math.min(
      AGENCY_LOGO_BOX.maxW / dims.width,
      AGENCY_LOGO_BOX.maxH / dims.height,
      1,
    );
    logoW = dims.width * scale;
    logoH = dims.height * scale;
  }

  const pageCount = pdfDoc.getPageCount();
  for (let pageIndex = 0; pageIndex < pageCount; pageIndex += 1) {
    const page = pdfDoc.getPage(pageIndex);
    const { width, height } = page.getSize();
    coverTemplateLogo(page, height);
    coverTemplateFooter(page);

    if (pageIndex === 0 && logoImage) {
      page.drawImage(logoImage, {
        x: (width - logoW) / 2,
        y: height - AGENCY_LOGO_BOX.topMargin - logoH,
        width: logoW,
        height: logoH,
      });
    }

    if (!hasFooterContent) continue;

    const fontSize = 7;
    const leftX = 20;
    const rightEdge = width - 20;
    const line1Y = 36;
    const line2Y = 18;

    if (address) {
      page.drawText(str(address).slice(0, 72), {
        x: leftX,
        y: line1Y,
        size: fontSize,
        font,
        color: rgb(0.15, 0.15, 0.15),
      });
    }
    if (midContact) {
      const midW = font.widthOfTextAtSize(midContact, fontSize);
      page.drawText(midContact, {
        x: Math.max(leftX, (width - midW) / 2),
        y: line1Y,
        size: fontSize,
        font,
        color: rgb(0.15, 0.15, 0.15),
      });
    }
    if (email) {
      const emailW = font.widthOfTextAtSize(email, fontSize);
      page.drawText(email, {
        x: rightEdge - emailW,
        y: line1Y,
        size: fontSize,
        font,
        color: rgb(0.15, 0.15, 0.15),
      });
    }

    page.drawText(`Page ${pageIndex + 1}`, {
      x: leftX,
      y: line2Y,
      size: fontSize,
      font,
      color: rgb(0.2, 0.2, 0.2),
    });
    if (copyright) {
      const copyW = font.widthOfTextAtSize(copyright, fontSize);
      page.drawText(copyright, {
        x: Math.max(leftX, (width - copyW) / 2),
        y: line2Y,
        size: fontSize,
        font,
        color: rgb(0.2, 0.2, 0.2),
      });
    }
    if (website) {
      const siteW = font.widthOfTextAtSize(website, fontSize);
      page.drawText(website, {
        x: rightEdge - siteW,
        y: line2Y,
        size: fontSize,
        font,
        color: rgb(0.2, 0.2, 0.2),
      });
    }
  }
}

const DEFAULT_FIELD_FONT_SIZE = 7;

function trySetText(form, name, value, fontSize = DEFAULT_FIELD_FONT_SIZE) {
  if (!name || value === undefined || value === null || value === '') return;
  try {
    const field = form.getTextField(name);
    field.setText(str(value));
    // Explicit size — auto-sizing makes short fields huge and vitals tiny
    try {
      field.setFontSize(fontSize);
    } catch { /* some fields reject size */ }
  } catch { /* field missing */ }
}

function normalizeAllTextFieldSizes(form, font, fontSize = DEFAULT_FIELD_FONT_SIZE) {
  form.getFields().forEach((field) => {
    try {
      if (typeof field.setFontSize === 'function' && typeof field.getText === 'function') {
        field.setFontSize(fontSize);
      }
    } catch { /* ignore */ }
  });
  try {
    form.updateFieldAppearances(font);
  } catch { /* ignore */ }
}

function tryCheck(form, name, on) {
  if (!name || !on) return;
  try {
    form.getCheckBox(name).check();
  } catch { /* missing */ }
}

function tryRadio(form, name, value) {
  if (!name || !value) return;
  try {
    form.getRadioGroup(name).select(str(value));
  } catch { /* missing / invalid option */ }
}

async function embedSignatureOnField(pdfDoc, form, fieldName, signatureDataUrl) {
  if (!signatureDataUrl) return;
  const bytes = await dataUrlToBytes(signatureDataUrl);
  if (!bytes) {
    trySetText(form, fieldName, 'Signed');
    return;
  }
  let image;
  try {
    image = signatureDataUrl.includes('image/jpeg') || signatureDataUrl.includes('image/jpg')
      ? await pdfDoc.embedJpg(bytes)
      : await pdfDoc.embedPng(bytes);
  } catch {
    trySetText(form, fieldName, 'Signed');
    return;
  }

  let field = null;
  try {
    field = form.getTextField(fieldName);
  } catch {
    try {
      field = form.getSignature(fieldName);
    } catch {
      field = null;
    }
  }
  if (!field) return;

  try {
    const widgets = field.acroField.getWidgets();
    if (!widgets?.length) {
      trySetText(form, fieldName, 'Signed');
      return;
    }
    const rect = widgets[0].getRectangle();
    const pages = pdfDoc.getPages();
    const pageRef = widgets[0].P();
    let pageIndex = 0;
    for (let i = 0; i < pages.length; i += 1) {
      if (pages[i].ref === pageRef) {
        pageIndex = i;
        break;
      }
    }
    const w = rect.width || 180;
    const h = rect.height || 40;
    pages[pageIndex].drawImage(image, {
      x: rect.x,
      y: rect.y,
      width: w,
      height: Math.min(h, w * 0.35),
    });
    try {
      form.getTextField(fieldName).setText('');
    } catch { /* signature field */ }
  } catch {
    trySetText(form, fieldName, 'Signed');
  }
}

/** Stamp name/date/signature onto PDFs with no AcroForm fields (1082, 790, 800). */
async function stampOverlay(pdfDoc, {
  lines = [],
  signatureDataUrl,
  signatureLabel = 'Signature',
} = {}) {
  const pages = pdfDoc.getPages();
  const page = pages[pages.length - 1];
  const { width } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  let y = 72;
  for (let i = lines.length - 1; i >= 0; i -= 1) {
    const line = lines[i];
    if (!line) continue;
    page.drawText(str(line).slice(0, 90), {
      x: 48,
      y,
      size: 10,
      font,
      color: rgb(0.1, 0.1, 0.1),
    });
    y += 14;
  }
  if (signatureDataUrl) {
    const bytes = await dataUrlToBytes(signatureDataUrl);
    if (bytes) {
      try {
        const image = signatureDataUrl.includes('image/jpeg')
          ? await pdfDoc.embedJpg(bytes)
          : await pdfDoc.embedPng(bytes);
        page.drawText(signatureLabel, {
          x: width - 260,
          y: 90,
          size: 8,
          font,
          color: rgb(0.3, 0.3, 0.3),
        });
        page.drawImage(image, {
          x: width - 260,
          y: 40,
          width: 180,
          height: 45,
        });
      } catch { /* ignore */ }
    }
  }
}

function fill110(form, pdfDoc, d) {
  trySetText(form, 'Client Name', d.clientName || `${d.firstName || ''} ${d.lastName || ''}`.trim());
  trySetText(form, 'Date', d.date);
  trySetText(form, 'DOB', d.dob);
  trySetText(form, 'Code Status', d.codeStatus);
  tryRadio(form, 'Sex', d.sex);
  trySetText(form, 'Address', [d.address, d.city, d.state, d.zip].filter(Boolean).join(', ') || d.address);
  trySetText(form, 'Phone', d.phone);
  trySetText(form, 'Cell Phone', d.cellPhone);
  trySetText(form, 'Emergency Contact', d.emergencyContact);
  trySetText(form, 'Phone_2', d.emergencyPhone);
  trySetText(form, 'Relationship', d.emergencyRelationship);
  trySetText(form, 'Primary Caregiver', d.primaryCaregiver);
  trySetText(form, 'Phone_3', d.primaryCaregiverPhone);
  trySetText(form, 'Relationship_2', d.primaryCaregiverRelationship);
  trySetText(form, 'Primary Care Physician', d.primaryCarePhysician);
  trySetText(form, 'Phone_4', d.pcpPhone);
  trySetText(form, 'Address_2', d.pcpAddress);
  trySetText(form, 'Pharmacy', d.pharmacy);
  trySetText(form, 'Phone_5', d.pharmacyPhone);
  trySetText(form, 'Address_3', d.pharmacyAddress);
  trySetText(form, 'Other', d.sourceOther);
  trySetText(form, 'Temperature', d.vitals?.temperature);
  trySetText(form, 'BP', d.vitals?.bp);
  trySetText(form, 'HR', d.vitals?.hr);
  trySetText(form, 'Respirations', d.vitals?.respirations);
  trySetText(form, 'O2sat', d.vitals?.o2sat);
  trySetText(form, 'Special DietRow1', d.specialDiet);
  tryRadio(form, 'Allergic Reactions', d.allergicReactions);
  tryRadio(form, 'welfare of our employees', d.pertinentInfoYesNo === 'YES' ? 'Yes' : d.pertinentInfoYesNo === 'NO' ? 'No' : d.pertinentInfoYesNo);
  trySetText(form, 'If yes please briefly describeRow1', d.pertinentInfoDetails);
  trySetText(form, 'Hospital Admissions within 5 years', d.hospitalAdmissions);
  trySetText(form, 'Surgeries', d.surgeries);
  trySetText(form, 'Ongoing Medical Problems', d.ongoingProblems);
  trySetText(form, 'Primary Language', d.primaryLanguage);
  trySetText(form, 'Highest Level of Schooling', d.schooling);
  trySetText(form, 'Former Occupation', d.formerOccupation);
  trySetText(form, 'Hobbies and Interests', d.hobbies);
  trySetText(form, 'Print Name', d.assessorPrintName);
  trySetText(form, 'Date_2', d.assessorDate);
  trySetText(form, 'Equip:Other', d.equipmentOther);
  trySetText(form, 'Client:Other', d.livesWithOther);
  trySetText(form, 'Where', d.skin?.edemaWhere);
  trySetText(form, 'side', d.neuro?.weaknessSide);
  trySetText(form, 'out of 10', d.neuro?.painScore);
  trySetText(form, 'litermin', d.respiratory?.o2Liters);

  (d.diagnoses || []).forEach((diag, i) => {
    if (i < 5) trySetText(form, String(i + 1), diag);
    else trySetText(form, String(i + 1), diag);
  });
  (d.medications || []).forEach((med, i) => {
    const idx = i + 1;
    trySetText(form, `${idx}_2`, med?.name);
    trySetText(form, `${idx}_3`, med?.dose);
    trySetText(form, `${idx}_4`, med?.frequency);
  });
  (d.allergies || []).forEach((row, i) => {
    trySetText(form, `${i + 6}_2`, row?.allergy);
    // reaction fields vary; best-effort
  });

  // Named clinical checkboxes — match PDF labels where UI stores same strings
  const neuro = d.neuro || {};
  (neuro.loc || []).forEach((x) => tryCheck(form, x, true));
  if (neuro.perrla) tryCheck(form, 'PERRLA', true);
  if (neuro.movesExtremities) tryCheck(form, 'Moves all extremities without problems', true);
  if (neuro.paralysis) tryCheck(form, 'Paralysis', true);
  if (neuro.weakness) tryCheck(form, 'Weakness', true);
  if (neuro.abnormalGait) tryCheck(form, 'Abnormal gait', true);
  (d.skin?.items || []).forEach((x) => tryCheck(form, x, true));
  (d.skin?.color || []).forEach((x) => tryCheck(form, x, true));
  (d.cardiovascular?.items || []).forEach((x) => tryCheck(form, x, true));
  (d.gastrointestinal?.items || []).forEach((x) => tryCheck(form, x, true));
  (d.genitourinary?.items || []).forEach((x) => tryCheck(form, x, true));
  (d.respiratory?.items || []).forEach((x) => tryCheck(form, x, true));
  if (d.respiratory?.smoker) tryCheck(form, 'Smoker', true);
  (d.endocrine?.items || []).forEach((x) => tryCheck(form, x, true));
  (d.musculoskeletal?.items || []).forEach((x) => tryCheck(form, x, true));
  (d.psychological?.items || []).forEach((x) => tryCheck(form, x, true));
  (d.equipment || []).forEach((x) => tryCheck(form, x, true));
  if (d.eating) tryCheck(form, d.eating, true);
  if (d.bathing) tryCheck(form, d.bathing, true);
  if (d.toileting) tryCheck(form, d.toileting, true);
  if (d.dressing) tryCheck(form, d.dressing, true);
  if (d.ambulation) tryCheck(form, d.ambulation, true);
  if (d.livesWith === 'Alone') tryCheck(form, 'Alone', true);
  if (d.livesWith === 'With significant others') tryCheck(form, 'With significant others', true);
  if (d.livesWith === 'With family') tryCheck(form, 'With fami', true);

  return embedSignatureOnField(pdfDoc, form, 'Signature', d.assessorSignature);
}

function fill400(form, d) {
  trySetText(form, 'NAME', d.clientName);
  trySetText(form, 'DOB', d.dob);
  const tasks = d.tasks || {};
  Object.entries(CARE_INSTRUCTION_GROUPS).forEach(([groupKey, labels]) => {
    const prefix = CARE_PDF_PREFIX[groupKey];
    if (!prefix) return;
    labels.forEach((label, i) => {
      const n = i + 1;
      const row = tasks[label] || {};
      if (row.enabled || row.checked || row.on) tryCheck(form, `${prefix}${n}`, true);
      trySetText(form, `${prefix}Comments${n}`, row.frequency || row.comments || '');
    });
  });
}

function fill7050(form, pdfDoc, d) {
  trySetText(form, 'Client Name', d.clientName);
  trySetText(form, 'Safety Check By', d.performedBy);
  trySetText(form, 'Date', d.date);
  trySetText(form, 'Address', d.address);
  trySetText(form, 'Telephone', d.telephone);
  trySetText(form, 'Emergency Contact', d.emergencyContact);
  trySetText(form, 'If yes list the problems', d.otherProblemsList || d.otherProblems);
  trySetText(form, 'Comments', [d.comments, d.adviceGiven].filter(Boolean).join('\n'));
  trySetText(form, 'Date_2', d.client?.date);
  trySetText(form, 'Date_3', d.agency?.date);

  const checks = d.checks || {};
  SAFETY_ITEMS.forEach((label, i) => {
    const triple = SAFETY_PDF_TRIPLES[i];
    if (!triple) return;
    const v = String(checks[label] || '').toUpperCase();
    if (v === 'Y' || v === 'YES') tryCheck(form, triple.Y, true);
    else if (v === 'N' || v === 'NO') tryCheck(form, triple.N, true);
    else if (v === 'R' && triple.R) tryCheck(form, triple.R, true);
  });

  return Promise.all([
    embedSignatureOnField(pdfDoc, form, 'Signature75_es_:signer:signature', d.client?.signature),
    embedSignatureOnField(pdfDoc, form, 'Signature76_es_:signer:signature', d.agency?.signature),
  ]);
}

async function applyFormData(code, pdfDoc, data) {
  const form = pdfDoc.getForm();
  const d = data || {};

  switch (code) {
    case '110':
      await fill110(form, pdfDoc, d);
      break;
    case '324':
      trySetText(form, 'Date', d.client?.date);
      trySetText(form, 'Print Name', d.client?.printedName);
      trySetText(form, 'Date_2', d.agency?.date);
      trySetText(form, 'Print Name_2', d.agency?.printedName);
      await embedSignatureOnField(pdfDoc, form, 'Signature10_es_:signer:signature', d.client?.signature);
      await embedSignatureOnField(pdfDoc, form, 'Signature11_es_:signer:signature', d.agency?.signature);
      break;
    case '325':
      trySetText(form, 'Print Name', d.printName || d.client?.printedName);
      trySetText(form, 'Date', d.client?.date);
      await embedSignatureOnField(pdfDoc, form, 'Signature28_es_:signer:signature', d.client?.signature);
      break;
    case '350':
      trySetText(form, 'Print First and Last Name', d.printName);
      trySetText(form, 'Date', d.client?.date);
      trySetText(form, 'Print ClientLegal Guardian Name', d.client?.printedName || d.printName);
      trySetText(form, 'Date_2', d.agency?.date);
      trySetText(form, 'Print Mastercare Representative Name', d.agency?.printedName);
      await embedSignatureOnField(pdfDoc, form, 'Signature30_es_:signer:signature', d.client?.signature);
      await embedSignatureOnField(pdfDoc, form, 'Signature31_es_:signer:signature', d.agency?.signature);
      break;
    case '400':
      fill400(form, d);
      break;
    case '410':
      trySetText(form, 'Print First and Last Name', d.printName);
      trySetText(form, 'Client Name', d.clientName);
      trySetText(form, 'DOB', d.dob);
      trySetText(form, 'Comments 1', d.comments);
      trySetText(form, 'Date', d.employee?.date);
      trySetText(form, 'Employee Print Name', d.employee?.printedName);
      trySetText(form, 'Date_2', d.client?.date);
      trySetText(form, 'Date_3', d.agency?.date);
      trySetText(form, 'Mastercare Representative Print Name', d.agency?.printedName);
      await embedSignatureOnField(pdfDoc, form, 'Employee Signature', d.employee?.signature);
      await embedSignatureOnField(pdfDoc, form, 'Client Signature', d.client?.signature);
      await embedSignatureOnField(pdfDoc, form, 'Mastercare Representative Signature', d.agency?.signature);
      break;
    case '610':
      trySetText(form, 'Date', d.client?.date);
      trySetText(form, 'Print Name', d.client?.printedName);
      await embedSignatureOnField(pdfDoc, form, 'Signature79_es_:signer:signature', d.client?.signature);
      break;
    case '790':
      await stampOverlay(pdfDoc, {
        lines: [
          `Client: ${d.clientName || ''}   DOB: ${d.clientDob || ''}`,
          `Rep: ${d.representativeName || ''}  ${d.representativeTitle || ''}`,
          ...(d.entries || []).filter((e) => e.date || e.notes).slice(0, 6).map(
            (e) => `${e.date || ''} ${e.time || ''} — ${str(e.notes).slice(0, 70)}`,
          ),
        ],
      });
      break;
    case '800':
      await stampOverlay(pdfDoc, {
        lines: [
          `Print Name: ${d.client?.printedName || ''}`,
          `Date: ${d.client?.date || ''}`,
        ],
        signatureDataUrl: d.client?.signature,
      });
      break;
    case '1009':
      trySetText(form, 'Client Name', d.clientName);
      trySetText(form, 'DOB', d.dob);
      trySetText(form, 'DOB_2', d.dob);
      (d.nonMedical || []).forEach((x) => tryCheck(form, x, true));
      (d.privateDutyNursing || []).forEach((x) => tryCheck(form, x, true));
      if (d.billingCycle === 'Weekly') tryCheck(form, 'Weekly', true);
      if (d.billingCycle === 'BiWeekly') tryCheck(form, 'BiWeekly', true);
      if (d.billingCycle === 'Monthly') tryCheck(form, 'Monthly', true);
      trySetText(form, 'andor other Insurance Billing Cycle', d.billingCycle);
      trySetText(form, 'Other sources of payment', d.otherPayment);
      trySetText(form, 'hrs', d.depositHours);
      trySetText(form, '2 Week Deposit based on', d.depositAmount);
      trySetText(form, 'has a copy of my Advanced Directive', d.advancedDirectiveHolder);
      trySetText(form, 'Relationship', d.advancedDirectiveRelationship);
      if (d.advancedDirective === 'none') tryCheck(form, 'I do not have an Advanced Directive', true);
      if (d.advancedDirective === 'yes') tryCheck(form, 'I have an Advance Directive', true);
      trySetText(form, 'Date', d.client?.date);
      trySetText(form, 'Date_2', d.agency?.date);
      await embedSignatureOnField(pdfDoc, form, 'Signature99_es_:signer:signature', d.client?.signature);
      await embedSignatureOnField(pdfDoc, form, 'Signature100_es_:signer:signature', d.agency?.signature);
      break;
    case '1081':
      trySetText(form, 'Client Name', d.clientName);
      trySetText(form, 'DOB', d.dob);
      (d.releaseObtain || []).forEach((x) => {
        if (/release/i.test(x)) tryCheck(form, 'Release', true);
        if (/obtain/i.test(x)) tryCheck(form, 'Obtain the following information about me', true);
      });
      if (d.entireMedicalRecords) {
        tryCheck(form, 'Entire Medical Records including billing records insurance records records from other health', true);
      }
      if (d.medicalRecordsFrom) tryCheck(form, 'Medical Records from', true);
      trySetText(form, 'undefined', d.medicalRecordsFrom);
      if (d.other) tryCheck(form, 'Other', true);
      trySetText(form, 'undefined_2', d.other);
      if (d.includeAlcoholDrug) trySetText(form, 'Alcohol  Drug Treatment', 'X');
      if (d.includeCommunicable) trySetText(form, 'Communicable Diseases Including HIV  AIDS', 'X');
      ['a', 'b', 'c', 'd'].forEach((k, i) => trySetText(form, k, d.parties?.[i]));
      trySetText(form, 'Date', d.client?.date);
      trySetText(form, 'Print Name of Person Giving Consent', d.client?.printedName);
      trySetText(form, 'Relationship', d.client?.relationship);
      await embedSignatureOnField(pdfDoc, form, 'Signature103_es_:signer:signature', d.client?.signature);
      break;
    case '1082':
      await stampOverlay(pdfDoc, {
        lines: [
          `Client: ${d.clientName || ''}`,
          `DOB: ${d.dob || ''}`,
          `Effective: ${d.effectiveDate || ''}`,
          `Print Name: ${d.client?.printedName || ''}`,
          `Date: ${d.client?.date || ''}`,
          d.acknowledged ? 'HIPAA Notice acknowledged' : '',
        ],
        signatureDataUrl: d.client?.signature,
      });
      break;
    case '1083':
      trySetText(form, 'First Name', d.firstName);
      trySetText(form, 'Last Name', d.lastName);
      trySetText(form, 'DOB', d.dob);
      trySetText(form, 'Address1', d.address);
      trySetText(form, 'Phone Number1', d.phone);
      trySetText(form, 'Insurance Carrier', d.insuranceCarrier);
      trySetText(form, 'Address2', d.insuranceAddress);
      trySetText(form, 'Phone Number2', d.insurancePhone);
      trySetText(form, 'Policy Number', d.policyNumber);
      trySetText(form, 'Claim Number', d.claimNumber);
      trySetText(form, 'Client Pays For', d.clientPaysPercent);
      trySetText(form, 'Insurance Pays For', d.insurancePaysPercent);
      if (d.triWest) tryCheck(form, 'TriWest', true);
      if (d.vaReferral) tryCheck(form, 'VA Referral', true);
      trySetText(form, 'Date', d.client?.date);
      trySetText(form, 'Print Name of Client of Legal Representative', d.client?.printedName);
      trySetText(form, 'Relationship', d.client?.relationship);
      trySetText(form, 'Date_2', d.agency?.date);
      trySetText(form, 'Print Name of Mastercare Representative', d.agency?.printedName);
      trySetText(form, 'Signature of Mastercare Representative', d.agency?.printedName);
      await embedSignatureOnField(pdfDoc, form, 'Signature14_es_:signer:signature', d.client?.signature);
      break;
    case '7000':
      trySetText(form, 'Date', d.date);
      trySetText(form, 'Reassessment Date', d.reassessmentDate);
      trySetText(form, 'Client Name', d.clientName);
      trySetText(form, 'DOB', d.dob);
      trySetText(form, 'Address', d.address);
      trySetText(form, 'Phone', d.phone);
      trySetText(form, 'Cell', d.cell);
      trySetText(form, 'Major Crossroads', d.majorCrossroads);
      trySetText(form, 'Emergency Contact', d.emergencyContact);
      trySetText(form, 'EC Phone', d.emergencyPhone);
      trySetText(form, 'Relationship', d.emergencyRelationship);
      trySetText(form, 'EC Cell', d.emergencyCell);
      trySetText(form, 'Physician', d.physicians?.[0]?.name);
      trySetText(form, 'Dr Phone', d.physicians?.[0]?.phone);
      trySetText(form, 'Hospital', d.hospital);
      trySetText(form, 'Hospital Phone', d.hospitalPhone);
      trySetText(form, 'Pharmacy', d.pharmacy);
      trySetText(form, 'Temp Relocation', d.relocationName);
      trySetText(form, 'Relocation Phone', d.relocationPhone);
      trySetText(form, 'Utilities: Electric', d.electricCompany);
      trySetText(form, 'Utilities: Gas', d.gasCompany);
      trySetText(form, 'Client Print Name', d.client?.printedName);
      trySetText(form, 'Rep Print Name', d.agency?.printedName);
      trySetText(form, 'Client Date', d.client?.date);
      trySetText(form, 'Rep Date', d.agency?.date);
      if (d.priorityLevel === '1') tryCheck(form, '1 High Priority  Uninterrupted Service', true);
      if (d.priorityLevel === '2') tryCheck(form, '2 Moderate Priority  Phone Call Required', true);
      if (d.priorityLevel === '3') tryCheck(form, '3 Low Priority Stable  Can Miss a Visit', true);
      if (d.priorityLevel === '4') tryCheck(form, '4 Lowest Priority  May Be Postponed for 3 Days', true);
      await embedSignatureOnField(pdfDoc, form, 'Signature122_es_:signer:signature', d.client?.signature);
      break;
    case '7050':
      await fill7050(form, pdfDoc, d);
      break;
    default:
      break;
  }

  try {
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    normalizeAllTextFieldSizes(form, font, DEFAULT_FIELD_FONT_SIZE);
  } catch { /* ignore */ }

  try {
    form.flatten();
  } catch { /* some PDFs refuse flatten */ }
}

/**
 * @returns {Promise<Uint8Array>}
 */
export async function fillAssessmentPacketPdf(code, formData, options = {}) {
  // Legal / notice forms: recreate with dynamic agency name (no Mastercare body text).
  if (isAgencyTextForm(code)) {
    return fillAgencyTextFormPdf(code, formData, options);
  }

  const url = getAssessmentPacketPdfUrl(code);
  if (!url) throw new Error(`No PDF template for form ${code}`);
  const templateBytes = await fetchPdfTemplateBytes(url);
  const pdfDoc = await PDFDocument.load(templateBytes, { ignoreEncryption: true });
  await applyFormData(code, pdfDoc, formData);
  await overlayAgencyBranding(pdfDoc, options);
  return pdfDoc.save({ useObjectStreams: false });
}

/** Merge all 15 filled forms into one PDF. */
export async function fillAssessmentPacketAllPdfs(formsByCode = {}, options = {}) {
  const merged = await PDFDocument.create();
  for (const { code } of ASSESSMENT_PACKET_FORMS) {
    if (!isPacketFormEditable(code)) continue;
    const bytes = await fillAssessmentPacketPdf(code, formsByCode[code] || {}, options);
    const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
    const pages = await merged.copyPages(doc, doc.getPageIndices());
    pages.forEach((p) => merged.addPage(p));
  }
  return merged.save();
}

export function openPdfBytes(bytes, filename = 'assessment-form.pdf') {
  const blob = new Blob([bytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank');
  if (!win) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  }
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
