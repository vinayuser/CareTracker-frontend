import React, { useState, useRef, useEffect } from 'react';
import { fetchPdfTemplateBytes } from './pdfTemplateFetch';
import { submitFilledPdfForm } from './pdfFormSubmit';
import { PDFDocument } from 'pdf-lib';
import StatusModal from '../../ui/StatusModal';
import {
  validateHiringPdfForm,
  formatHiringValidationMessage,
  clampText,
  HIRING_MAX,
} from '../../../utils/hiringPdfFormValidation';
import { getCandidatePrefill, mergeFormWithCandidate } from '../../../utils/candidateFormPrefill';
import { stripSignedSignaturePlaceholders } from './pdfSignatureUtils';
import ConsentSection from './sections/PreEmploymentDrug/ConsentSection';

const EMPTY_1740 = {
  'Print Name': '',
  Date: '',
  'Print Name_2': '',
  Date_2: '',
  Results: '',
  'Signature134_es_:signer:signature': '',
  'Signature135_es_:signer:signature': '',
};

function buildInitial1740(candidate, savedFormData) {
  const p = getCandidatePrefill(candidate);
  const merged = mergeFormWithCandidate(EMPTY_1740, savedFormData, {
    'Print Name': p.fullName,
    Date: p.today,
  });
  return stripSignedSignaturePlaceholders(merged, [
    'Signature134_es_:signer:signature',
    'Signature135_es_:signer:signature',
  ]);
}

const PreEmploymentDrugConsentForm = ({ document, candidate = null, token, onClose, onSuccess }) => {
  const [formData, setFormData] = useState(() =>
    buildInitial1740(candidate || document?.candidate, document?.form_data),
  );

  const [submitting, setSubmitting] = useState(false);
  const [filledPdfBytes, setFilledPdfBytes] = useState(null);
  const [applicantSignatureUrl, setApplicantSignatureUrl] = useState('');
  const [witnessSignatureUrl, setWitnessSignatureUrl] = useState('');
  const [activeSignature, setActiveSignature] = useState('witness');
  const [errors, setErrors] = useState({});
  const witnessSigCanvasRef = useRef();

  const [statusModal, setStatusModal] = useState({
    isOpen: false,
    type: 'success',
    title: '',
    message: '',
  });

  const showStatusModal = (type, title, message) => {
    setStatusModal({ isOpen: true, type, title, message });
  };

  const closeStatusModal = () => {
    setStatusModal((prev) => ({ ...prev, isOpen: false }));
  };

  const clearFieldError = (...fields) => {
    setErrors((prev) => {
      if (!fields.some((f) => prev[f])) return prev;
      const next = { ...prev };
      fields.forEach((f) => { delete next[f]; });
      return next;
    });
  };

  const handleInputChange = (fieldName, value) => {
    const nextValue = fieldName.includes('Name')
      ? clampText(value, HIRING_MAX.short)
      : value;
    setFormData((prev) => ({ ...prev, [fieldName]: nextValue }));
    clearFieldError(fieldName);
  };

  const handleApplicantSignatureChange = (dataUrl) => {
    setApplicantSignatureUrl(dataUrl || '');
    handleInputChange('Signature134_es_:signer:signature', '');
    if (dataUrl) clearFieldError('Signature134_es_:signer:signature');
  };

  const handleWitnessSignatureEnd = () => {
    if (witnessSigCanvasRef.current && !witnessSigCanvasRef.current.isEmpty()) {
      const signatureDataURL = witnessSigCanvasRef.current.toDataURL();
      setWitnessSignatureUrl(signatureDataURL);
      handleInputChange('Signature135_es_:signer:signature', '');
    }
  };

  const clearWitnessSignature = () => {
    if (witnessSigCanvasRef.current) {
      witnessSigCanvasRef.current.clear();
      setWitnessSignatureUrl('');
      handleInputChange('Signature135_es_:signer:signature', '');
    }
  };

  const dataURLToImageBytes = async (dataURL) => {
    if (!dataURL) return null;
    try {
      const response = await fetch(dataURL);
      const blob = await response.blob();
      return new Uint8Array(await blob.arrayBuffer());
    } catch (error) {
      console.error('Error converting signature to image:', error);
      return null;
    }
  };

  const fillPdf = async (data, pdfUrl) => {
    const pdfBuffer = await fetchPdfTemplateBytes(pdfUrl);
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const form = pdfDoc.getForm();

    ['Print Name', 'Date', 'Print Name_2', 'Date_2', 'Results'].forEach((fieldName) => {
      try {
        const field = form.getTextField(fieldName);
        if (field) field.setText(data[fieldName] || '');
      } catch {
        // ignore
      }
    });

    const embedSignature = async (dataUrl, fieldName) => {
      if (!dataUrl) return;
      const signatureImageBytes = await dataURLToImageBytes(dataUrl);
      if (!signatureImageBytes) return;
      const signatureImage = await pdfDoc.embedPng(signatureImageBytes);
      const pages = pdfDoc.getPages();
      try {
        const signatureField = form.getTextField(fieldName);
        if (signatureField) {
          const widgets = signatureField.acroField.getWidgets();
          if (widgets?.length > 0) {
            const rect = widgets[0].getRectangle();
            const pageRef = widgets[0].P();
            let pageIndex = 0;
            for (let i = 0; i < pages.length; i++) {
              if (pages[i].ref === pageRef) {
                pageIndex = i;
                break;
              }
            }
            pages[pageIndex].drawImage(signatureImage, {
              x: rect.x || rect.left || 100,
              y: rect.y || rect.bottom || 100,
              width: rect.width || (rect.right - rect.left) || 150,
              height: rect.height || (rect.top - rect.bottom) || 50,
            });
          }
        }
      } catch {
        if (pages[0]) {
          pages[0].drawImage(signatureImage, { x: 100, y: 100, width: 150, height: 50 });
        }
      }
    };

    await embedSignature(applicantSignatureUrl, 'Signature134_es_:signer:signature');
    await embedSignature(witnessSignatureUrl, 'Signature135_es_:signer:signature');

    ['Signature134_es_:signer:signature', 'Signature135_es_:signer:signature'].forEach((fieldName) => {
      try {
        const field = form.getTextField(fieldName);
        if (field) field.setText('');
      } catch {
        // ignore
      }
    });

    form.getFields().forEach((f) => {
      try { f.enableReadOnly(); } catch { /* ignore */ }
    });

    form.flatten();
    return pdfDoc.save();
  };

  const handleSubmit = async () => {
    try {
      const validation = validateHiringPdfForm('1740', formData, {
        hasApplicantSignature: Boolean(applicantSignatureUrl),
      });
      setErrors(validation.fieldErrors || {});
      if (!validation.ok) {
        showStatusModal('error', 'Please fix the form', formatHiringValidationMessage(validation.messages));
        return;
      }

      setSubmitting(true);

      let bytes = filledPdfBytes;
      if (!bytes) {
        bytes = await fillPdf(formData, document.url);
      }

      await submitFilledPdfForm({
        token,
        documentCode: document.code,
        formData,
        pdfBlob: new Blob([bytes], { type: 'application/pdf' }),
        fileName: `${document.name}_filled.pdf`,
      });

      showStatusModal(
        'success',
        'Document Submitted Successfully!',
        'Your Pre-Employment Drug/Alcohol Testing Consent has been submitted successfully.',
      );

      setFilledPdfBytes(null);

      setTimeout(() => {
        try { onSuccess?.(); } catch { /* ignore */ }
        try { onClose?.(); } catch { /* ignore */ }
      }, 2000);
    } catch (error) {
      console.error('Error submitting PDF:', error);
      const errorMessage = error?.message || error.response?.data?.message || 'Failed to submit document. Please try again.';
      showStatusModal('error', 'Submission Failed', errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => () => {
    if (witnessSigCanvasRef.current) {
      try { witnessSigCanvasRef.current.clear(); } catch { /* ignore */ }
    }
  }, []);

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-6xl w-full max-h-[95vh] overflow-hidden">
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-xl font-semibold">Pre-Employment Drug/Alcohol Testing Consent</h2>
            <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">✕</button>
          </div>

          <div className="p-6 overflow-y-auto max-h-[85vh]">
            <ConsentSection
              formData={formData}
              errors={errors}
              onInputChange={handleInputChange}
              applicantSignatureUrl={applicantSignatureUrl}
              witnessSignatureUrl={witnessSignatureUrl}
              onApplicantSignatureChange={handleApplicantSignatureChange}
              onWitnessSignatureEnd={handleWitnessSignatureEnd}
              onClearWitnessSignature={clearWitnessSignature}
              witnessSigCanvasRef={witnessSigCanvasRef}
              activeSignature={activeSignature}
              setActiveSignature={setActiveSignature}
            />

            <div className="mt-6 p-4 border border-gray-300 rounded bg-gray-50">
              <h4 className="text-md font-semibold text-gray-800 mb-2">Signature Status:</h4>
              <div className="flex flex-wrap gap-4">
                <div className={`px-3 py-1 rounded-full text-sm ${applicantSignatureUrl ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {applicantSignatureUrl ? '✓ Applicant signed' : 'Applicant signature required'}
                </div>
                <div className={`px-3 py-1 rounded-full text-sm ${witnessSignatureUrl ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                  {witnessSignatureUrl ? '✓ Witness signed' : 'Witness optional'}
                </div>
              </div>
            </div>

            <div className="flex gap-4 mb-6 mt-8">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="flex min-w-[160px] items-center justify-center gap-2 rounded-md bg-primary px-6 py-2 text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                {submitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Submitting...
                  </>
                ) : (
                  'Submit Form'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <StatusModal
        isOpen={statusModal.isOpen}
        onClose={closeStatusModal}
        type={statusModal.type}
        title={statusModal.title}
        message={statusModal.message}
        duration={statusModal.type === 'success' ? 2000 : 3000}
      />
    </>
  );
};

export default PreEmploymentDrugConsentForm;
