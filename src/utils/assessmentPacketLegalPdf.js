/**
 * Agency-branded legal assessment forms (Mastercare body text replaced).
 */
import { createElement } from 'react';
import { AssessmentLegalFormPrintView } from '../components/agency/assessments/packet/AssessmentLegalFormPrintView';
import { isAgencyTextForm } from './assessmentPacketAgencyCopy';
import { renderLayoutToPdfBlob } from './clientFormsExport';

import '../components/agency/assessments/packet/assessmentLegalPrint.css';
import '../components/agency/assessments/assessmentPrint.css';

async function blobToUint8Array(blob) {
  return new Uint8Array(await blob.arrayBuffer());
}

export async function fillAgencyTextFormPdf(code, formData, options = {}) {
  if (!isAgencyTextForm(code)) {
    throw new Error(`Form ${code} is not an agency text form`);
  }
  const branding = options.agencyBranding || {
    name: options.agencyName || '',
    logoUrl: options.agencyLogoUrl || '',
  };
  const blob = await renderLayoutToPdfBlob(
    createElement(AssessmentLegalFormPrintView, {
      code,
      data: formData || {},
      agencyBranding: branding,
    }),
  );
  return blobToUint8Array(blob);
}
