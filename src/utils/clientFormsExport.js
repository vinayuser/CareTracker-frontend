import { createRoot } from 'react-dom/client';
import { createElement } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { domToJpeg } from 'modern-screenshot';
import { jsPDF } from 'jspdf';
import axiosInstance from '../api/axiosInstance';
import API_ROUTES from '../api/apiRoutes';
import AssessmentPrintLayout from '../components/agency/assessments/AssessmentPrintLayout';
import CarePlanPrintLayout from '../components/agency/care-plans/CarePlanPrintLayout';
import InsuranceIntakePrintLayout from '../components/agency/insurance-intake/InsuranceIntakePrintLayout';
import EvvEnrollmentPrintLayout from '../components/agency/evv-enrollment/EvvEnrollmentPrintLayout';
import { assessmentToForm } from './assessmentForm';
import { carePlanToForm } from './carePlanForm';
import { insuranceIntakeToForm } from './insuranceIntakeForm';
import { evvEnrollmentToForm } from './evvEnrollmentForm';

import '../components/agency/assessments/assessmentPrint.css';
import '../components/agency/care-plans/carePlanPrint.css';
import '../components/agency/insurance-intake/insuranceIntakePrint.css';
import '../components/agency/evv-enrollment/evvEnrollmentPrint.css';

const PAGE_SELECTOR = '.ap-page, .cp-page, .ii-page, .ev-page';

/**
 * Canvas / SVG foreignObject capture mishandles flex baseline + border-bottom
 * (line cuts through filled values). These rules only apply inside the export host
 * so Print Form appearance stays unchanged.
 */
const EXPORT_FIX_CSS = `
[data-client-forms-export-root] .no-print,
[data-client-forms-export-root] .ap-toolbar,
[data-client-forms-export-root] .cp-toolbar,
[data-client-forms-export-root] .ii-toolbar,
[data-client-forms-export-root] .ev-toolbar {
  display: none !important;
}
[data-client-forms-export-root] .ap-screen-wrap,
[data-client-forms-export-root] .cp-screen-wrap,
[data-client-forms-export-root] .ii-screen-wrap,
[data-client-forms-export-root] .ev-screen-wrap {
  background: #fff !important;
  padding: 0 !important;
  min-height: 0 !important;
}
[data-client-forms-export-root] .ap-page,
[data-client-forms-export-root] .cp-page,
[data-client-forms-export-root] .ii-page,
[data-client-forms-export-root] .ev-page {
  width: 8.5in !important;
  height: 11in !important;
  max-height: 11in !important;
  margin: 0 !important;
  overflow: hidden !important;
  box-shadow: none !important;
  -webkit-print-color-adjust: exact !important;
  print-color-adjust: exact !important;
}
[data-client-forms-export-root] .ap-field,
[data-client-forms-export-root] .cp-field,
[data-client-forms-export-root] .ii-field,
[data-client-forms-export-root] .ev-field,
[data-client-forms-export-root] .ap-row,
[data-client-forms-export-root] .cp-row,
[data-client-forms-export-root] .ii-row,
[data-client-forms-export-root] .ev-row {
  align-items: flex-end !important;
}
[data-client-forms-export-root] .ap-label,
[data-client-forms-export-root] .cp-label,
[data-client-forms-export-root] .ii-label,
[data-client-forms-export-root] .ev-label {
  flex-shrink: 0 !important;
  align-self: flex-end !important;
  line-height: 1.2 !important;
  padding-bottom: 1px !important;
}
[data-client-forms-export-root] .ap-value,
[data-client-forms-export-root] .cp-value,
[data-client-forms-export-root] .ii-value,
[data-client-forms-export-root] .ev-value {
  display: block !important;
  flex: 1 1 auto !important;
  min-width: 0 !important;
  line-height: 1.25 !important;
  padding-bottom: 2px !important;
  border-bottom: none !important;
  background-repeat: no-repeat !important;
  background-position: left bottom !important;
  background-size: 100% 1px !important;
  word-break: break-word !important;
  overflow-wrap: anywhere !important;
}
[data-client-forms-export-root] .ap-value {
  background-image: linear-gradient(#333, #333) !important;
}
[data-client-forms-export-root] .cp-value,
[data-client-forms-export-root] .ii-value,
[data-client-forms-export-root] .ev-value {
  background-image: linear-gradient(#888, #888) !important;
}
[data-client-forms-export-root] .ap-check,
[data-client-forms-export-root] .cp-check,
[data-client-forms-export-root] .ii-check,
[data-client-forms-export-root] .ev-check {
  align-items: center !important;
}
[data-client-forms-export-root] .ap-box,
[data-client-forms-export-root] .cp-box,
[data-client-forms-export-root] .ii-box,
[data-client-forms-export-root] .ev-box {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  line-height: 1 !important;
  flex-shrink: 0 !important;
  vertical-align: middle !important;
}
`;

const waitFrames = (n = 2) => new Promise((resolve) => {
  const step = (left) => {
    if (left <= 0) resolve();
    else requestAnimationFrame(() => step(left - 1));
  };
  step(n);
});

const safeFilePart = (value, fallback = 'form') => {
  const raw = String(value || fallback).trim() || fallback;
  return raw.replace(/[^\w.\-]+/g, '_').replace(/_+/g, '_').slice(0, 80);
};

/** Render a React print layout at exact letter size → PDF blob. */
export async function renderLayoutToPdfBlob(reactNode) {
  const host = document.createElement('div');
  host.setAttribute('data-client-forms-export-root', '1');
  // Keep in the layout viewport (opacity 0) — off-screen (-10000px) skews font metrics.
  host.style.cssText = [
    'position:fixed',
    'left:0',
    'top:0',
    'width:8.5in',
    'background:#fff',
    'opacity:0',
    'pointer-events:none',
    'z-index:-1',
    'overflow:hidden',
  ].join(';');

  const styleEl = document.createElement('style');
  styleEl.setAttribute('data-client-forms-export-style', '1');
  styleEl.textContent = EXPORT_FIX_CSS;

  document.body.appendChild(styleEl);
  document.body.appendChild(host);

  const root = createRoot(host);
  try {
    root.render(reactNode);
    await waitFrames(4);
    await new Promise((r) => setTimeout(r, 700));

    const page = host.querySelector(PAGE_SELECTOR) || host.firstElementChild;
    if (!page) throw new Error('Print page layout not found');

    page.style.width = '8.5in';
    page.style.height = '11in';
    page.style.maxHeight = '11in';
    page.style.margin = '0';
    page.style.overflow = 'hidden';

    await waitFrames(2);

    // Letter @ 96dpi = 816×1056; scale 2 → crisp but still under canvas limits
    const dataUrl = await domToJpeg(page, {
      scale: 2,
      quality: 0.95,
      backgroundColor: '#ffffff',
      width: page.offsetWidth || 816,
      height: page.offsetHeight || 1056,
      style: {
        margin: '0',
        transform: 'none',
      },
    });

    const pdf = new jsPDF({
      unit: 'in',
      format: 'letter',
      orientation: 'portrait',
      compress: true,
    });
    pdf.addImage(dataUrl, 'JPEG', 0, 0, 8.5, 11, undefined, 'FAST');
    return pdf.output('blob');
  } finally {
    root.unmount();
    host.remove();
    styleEl.remove();
  }
}

async function fetchJson(url) {
  const response = await axiosInstance.get(url);
  return response.data.data;
}

async function fetchBlob(url) {
  const response = await axiosInstance.get(url, {
    responseType: 'blob',
    skipErrorToast: true,
  });
  return response.data;
}

/**
 * Build and download a ZIP of client forms.
 * @param {object} meta - related-forms payload
 * @param {string} agencyName
 * @param {(pct: number, label: string) => void} onProgress
 */
export async function exportClientFormsZip(meta, agencyName = '', onProgress = () => {}) {
  const client = meta?.client || {};
  const hasAny = Boolean(
    meta?.assessment
    || meta?.care_plan
    || meta?.insurance_intake
    || meta?.evv_enrollment,
  );
  if (!hasAny) {
    throw new Error('No forms found for this client yet.');
  }

  const zip = new JSZip();
  const rootName = safeFilePart(
    `${client.fullName || 'Client'}_${client.clientCode || client.id || 'forms'}`,
    'client_forms',
  );
  const folder = zip.folder(rootName);
  const warnings = [];

  onProgress(8, 'Loading form records…');

  let assessmentForm = null;
  let carePlanForm = null;
  let insuranceForm = null;
  let evvForm = null;

  if (meta.assessment?.id) {
    try {
      const data = await fetchJson(`${API_ROUTES.AGENCY.ASSESSMENTS.LIST}/${meta.assessment.id}`);
      assessmentForm = assessmentToForm(data);
    } catch {
      warnings.push('Could not load assessment');
    }
  }
  onProgress(15, 'Loading care plan…');

  if (meta.care_plan?.id) {
    try {
      const data = await fetchJson(`${API_ROUTES.AGENCY.CARE_PLANS.LIST}/${meta.care_plan.id}`);
      carePlanForm = carePlanToForm(data, data.client);
    } catch {
      warnings.push('Could not load care plan');
    }
  }
  onProgress(20, 'Loading insurance intake…');

  if (meta.insurance_intake?.id) {
    try {
      const data = await fetchJson(`${API_ROUTES.AGENCY.INSURANCE_INTAKES.LIST}/${meta.insurance_intake.id}`);
      insuranceForm = insuranceIntakeToForm(data, data.client);
    } catch {
      warnings.push('Could not load insurance intake');
    }
  }
  onProgress(25, 'Loading EVV enrollment…');

  if (meta.evv_enrollment?.id) {
    try {
      const data = await fetchJson(`${API_ROUTES.AGENCY.EVV_ENROLLMENTS.LIST}/${meta.evv_enrollment.id}`);
      evvForm = evvEnrollmentToForm(data);
    } catch {
      warnings.push('Could not load EVV enrollment');
    }
  }

  const pdfJobs = [];
  if (assessmentForm) {
    pdfJobs.push({
      label: 'Building assessment PDF…',
      path: `assessment/${safeFilePart(meta.assessment.assessmentCode || 'assessment')}.pdf`,
      node: createElement(AssessmentPrintLayout, { form: assessmentForm, agencyName }),
    });
  }
  if (carePlanForm) {
    pdfJobs.push({
      label: 'Building care plan PDF…',
      path: `care-plan/${safeFilePart(meta.care_plan.planCode || 'care-plan')}.pdf`,
      node: createElement(CarePlanPrintLayout, { form: carePlanForm, agencyName }),
    });
  }
  if (insuranceForm) {
    pdfJobs.push({
      label: 'Building insurance intake PDF…',
      path: `insurance/${safeFilePart(meta.insurance_intake.intakeCode || 'insurance-intake')}.pdf`,
      node: createElement(InsuranceIntakePrintLayout, { form: insuranceForm }),
    });
  }
  if (evvForm) {
    pdfJobs.push({
      label: 'Building EVV enrollment PDF…',
      path: `evv/${safeFilePart(meta.evv_enrollment.enrollmentCode || 'evv-enrollment')}.pdf`,
      node: createElement(EvvEnrollmentPrintLayout, { form: evvForm }),
    });
  }

  const pdfStart = 28;
  const pdfEnd = 75;
  for (let i = 0; i < pdfJobs.length; i += 1) {
    const job = pdfJobs[i];
    const pct = pdfStart + Math.round(((i + 0.5) / Math.max(pdfJobs.length, 1)) * (pdfEnd - pdfStart));
    onProgress(pct, job.label);
    try {
      const blob = await renderLayoutToPdfBlob(job.node);
      folder.file(job.path, blob);
    } catch {
      warnings.push(`Failed to build ${job.path}`);
    }
    onProgress(
      pdfStart + Math.round(((i + 1) / Math.max(pdfJobs.length, 1)) * (pdfEnd - pdfStart)),
      job.label.replace('Building', 'Added'),
    );
  }

  const docs = Array.isArray(meta.insurance_intake?.documents) ? meta.insurance_intake.documents : [];
  if (docs.length) {
    const docsFolder = folder.folder('insurance/documents');
    for (let i = 0; i < docs.length; i += 1) {
      const doc = docs[i];
      const pct = 75 + Math.round(((i + 0.5) / docs.length) * 15);
      onProgress(pct, `Adding insurance document: ${doc.label || doc.key}…`);
      try {
        if (!doc.url) continue;
        const blob = await fetchBlob(doc.url);
        const extFromName = doc.originalName?.includes('.')
          ? doc.originalName.slice(doc.originalName.lastIndexOf('.'))
          : '';
        const extFromUrl = (() => {
          try {
            const path = new URL(doc.url, window.location.origin).pathname;
            const dot = path.lastIndexOf('.');
            return dot >= 0 ? path.slice(dot) : '';
          } catch {
            return '';
          }
        })();
        const ext = extFromName || extFromUrl || '.bin';
        const name = `${safeFilePart(doc.label || doc.key)}${ext}`;
        docsFolder.file(name, blob);
      } catch {
        warnings.push(`Could not download document ${doc.label || doc.key}`);
      }
    }
  }

  onProgress(92, 'Creating ZIP…');
  const zipBlob = await zip.generateAsync(
    { type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } },
    (metadata) => {
      const pct = 92 + Math.round((metadata.percent || 0) * 0.07);
      onProgress(Math.min(99, pct), 'Creating ZIP…');
    },
  );

  onProgress(100, 'Download ready');
  saveAs(zipBlob, `${rootName}_forms.zip`);
  return { warnings };
}
