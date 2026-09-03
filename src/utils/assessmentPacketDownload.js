import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import {
  ASSESSMENT_PACKET_FORMS,
  mergePacketForms,
  isPacketFormEditable,
} from './assessmentPacket';
import {
  fillAssessmentPacketPdf,
  fillAssessmentPacketAllPdfs,
} from './assessmentPacketPdfFill';

const safeFilePart = (value, fallback = 'form') => {
  const raw = String(value || fallback).trim() || fallback;
  return raw.replace(/[^\w.\-]+/g, '_').replace(/_+/g, '_').slice(0, 80);
};

export function triggerPdfDownload(bytes, filename = 'assessment.pdf') {
  const blob = new Blob([bytes], { type: 'application/pdf' });
  saveAs(blob, filename);
}

/** Download all packet forms as individual filled official PDFs in a ZIP. */
export async function downloadAssessmentPacketZip(
  formsByCode = {},
  basename = 'assessment-packet',
  onProgress = () => {},
  options = {},
) {
  const merged = mergePacketForms(formsByCode);
  const editableForms = ASSESSMENT_PACKET_FORMS.filter((f) => isPacketFormEditable(f.code));
  if (!editableForms.length) {
    throw new Error('No assessment forms available to download');
  }

  const zip = new JSZip();
  const folder = zip.folder(safeFilePart(basename, 'assessment-packet'));
  const rootName = safeFilePart(basename, 'assessment-packet');

  for (let i = 0; i < editableForms.length; i += 1) {
    const { code, short } = editableForms[i];
    const pct = Math.round(((i + 0.5) / editableForms.length) * 88);
    onProgress(pct, `Preparing form ${code}…`);
    const bytes = await fillAssessmentPacketPdf(code, merged[code] || {}, options);
    folder.file(`${code}-${safeFilePart(short, code)}.pdf`, bytes);
  }

  onProgress(92, 'Adding combined PDF…');
  try {
    const combined = await fillAssessmentPacketAllPdfs(merged, options);
    folder.file(`${rootName}-combined.pdf`, combined);
  } catch {
    /* combined PDF is optional if one template fails */
  }

  onProgress(96, 'Creating ZIP…');
  const blob = await zip.generateAsync(
    { type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } },
    (metadata) => {
      const pct = 96 + Math.round((metadata.percent || 0) * 0.04);
      onProgress(Math.min(99, pct), 'Creating ZIP…');
    },
  );

  onProgress(100, 'Download ready');
  saveAs(blob, `${rootName}-forms.zip`);
}

/** Download all packet forms merged into one filled official PDF. */
export async function downloadAssessmentPacketMergedPdf(
  formsByCode = {},
  filename = 'assessment-packet.pdf',
  options = {},
) {
  const bytes = await fillAssessmentPacketAllPdfs(mergePacketForms(formsByCode), options);
  triggerPdfDownload(bytes, filename);
}

/** Add filled assessment packet PDFs to an existing JSZip folder. */
export async function addAssessmentPacketPdfsToZip(
  folder,
  formsByCode = {},
  basename = 'assessment',
  onProgress = () => {},
  options = {},
) {
  const merged = mergePacketForms(formsByCode);
  const editableForms = ASSESSMENT_PACKET_FORMS.filter((f) => isPacketFormEditable(f.code));
  const assessmentFolder = folder.folder('assessment');
  const rootName = safeFilePart(basename, 'assessment');
  const warnings = [];

  for (let i = 0; i < editableForms.length; i += 1) {
    const { code, short } = editableForms[i];
    onProgress(`Building assessment form ${code}…`);
    try {
      const bytes = await fillAssessmentPacketPdf(code, merged[code] || {}, options);
      assessmentFolder.file(`${code}-${safeFilePart(short, code)}.pdf`, bytes);
    } catch {
      warnings.push(`Failed to build assessment form ${code}`);
    }
  }

  try {
    const combined = await fillAssessmentPacketAllPdfs(merged, options);
    assessmentFolder.file(`${rootName}-combined.pdf`, combined);
  } catch {
    warnings.push('Failed to build combined assessment PDF');
  }

  return { warnings };
}
