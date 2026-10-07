import React, { useState, useEffect } from 'react';
import { submitFilledPdfForm } from './pdfFormSubmit';
import { fetchPdfTemplateBytes } from './pdfTemplateFetch';
import { PDFDocument } from 'pdf-lib';
import StatusModal from '../../ui/StatusModal';
import { validateHiringPdfForm, formatHiringValidationMessage } from '../../../utils/hiringPdfFormValidation';
import { getCandidatePrefill, mergeFormWithCandidate } from '../../../utils/candidateFormPrefill';
import AcknowledgementSection from './sections/HandbookAcknowledgment/AcknowledgementSection';
import SignatureSection from './sections/HandbookAcknowledgment/SignatureSection';

const EMPTY_1201 = {
  Date: '',
  'Print Name': '',
  'Position with Company': '',
  'Verified by': '',
  Date_2: '',
  'Signature30_es_:signer:signature': '',
  acknowledged: false,
};

function buildInitial1201(candidate, savedFormData) {
  const prefill = getCandidatePrefill(candidate);
  return mergeFormWithCandidate(EMPTY_1201, savedFormData, {
    'Print Name': prefill.fullName,
    'Position with Company': prefill.designation,
    Date: prefill.today,
    Date_2: prefill.today,
  });
}

const SIG_KEY = 'Signature30_es_:signer:signature';

const HandbookAcknowledgmentForm = ({ document, candidate = null, token, onClose, onSuccess }) => {
  const [formData, setFormData] = useState(() =>
    buildInitial1201(candidate || document?.candidate, document?.form_data),
  );
  const [generatingPreview, setGeneratingPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [filledPdfBytes, setFilledPdfBytes] = useState(null);
  const [signatureDataUrl, setSignatureDataUrl] = useState('');
  const [activeSection, setActiveSection] = useState('acknowledgement');
  const [errors, setErrors] = useState({});

  const [statusModal, setStatusModal] = useState({
    isOpen: false,
    type: 'success',
    title: '',
    message: '',
  });

  const sections = [
    { id: 'acknowledgement', name: 'Acknowledgment' },
    { id: 'signature', name: 'Signature & Verification' },
  ];

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
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
    clearFieldError(fieldName);
  };

  const handleSignatureChange = (dataUrl) => {
    setSignatureDataUrl(dataUrl || '');
    setFormData((prev) => ({ ...prev, [SIG_KEY]: '' }));
    if (dataUrl) clearFieldError(SIG_KEY);
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
    if (!data.acknowledged) {
      throw new Error('You must acknowledge the handbook terms before submitting.');
    }

    const pdfBuffer = await fetchPdfTemplateBytes(pdfUrl);
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const form = pdfDoc.getForm();

    ['Date', 'Print Name', 'Position with Company', 'Verified by', 'Date_2'].forEach((fieldName) => {
      try {
        const field = form.getTextField(fieldName);
        if (field) field.setText(data[fieldName] || '');
      } catch {
        /* field missing */
      }
    });

    try {
      const signatureField = form.getTextField(SIG_KEY);
      if (signatureField) {
        if (signatureDataUrl) {
          const signatureImageBytes = await dataURLToImageBytes(signatureDataUrl);
          if (signatureImageBytes) {
            const signatureImage = await pdfDoc.embedPng(signatureImageBytes);
            const pages = pdfDoc.getPages();
            try {
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
                  width: rect.width || (rect.right - rect.left) || 200,
                  height: rect.height || (rect.top - rect.bottom) || 50,
                });
              }
            } catch {
              if (pages[0]) {
                pages[0].drawImage(signatureImage, { x: 100, y: 100, width: 200, height: 50 });
              }
            }
            signatureField.setText('');
          }
        } else {
          signatureField.setText('');
        }
      }
    } catch {
      /* signature field missing */
    }

    form.getFields().forEach((f) => {
      try { f.enableReadOnly(); } catch { /* ignore */ }
    });
    form.flatten();
    return pdfDoc.save();
  };

  const handleSubmit = async () => {
    const validation = validateHiringPdfForm('1201', formData, { hasSignature: Boolean(signatureDataUrl) });
    setErrors(validation.fieldErrors || {});
    if (!validation.ok) {
      if (validation.firstSection) setActiveSection(validation.firstSection);
      showStatusModal('error', 'Please fix the form', formatHiringValidationMessage(validation.messages));
      return;
    }

    try {
      setSubmitting(true);
      let bytes = filledPdfBytes;
      if (!bytes) bytes = await fillPdf(formData, document.url);

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
        'Your Handbook Acknowledgment form has been submitted successfully.',
      );

      if (previewUrl) {
        try { URL.revokeObjectURL(previewUrl); } catch { /* ignore */ }
      }
      setPreviewUrl('');
      setFilledPdfBytes(null);

      setTimeout(() => {
        try { onSuccess?.(); } catch { /* ignore */ }
        try { onClose?.(); } catch { /* ignore */ }
      }, 2000);
    } catch (error) {
      const errorMessage =
        error?.message || error.response?.data?.message || 'Failed to submit document. Please try again.';
      showStatusModal('error', 'Submission Failed', errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const renderCurrentSection = () => {
    switch (activeSection) {
      case 'signature':
        return (
          <SignatureSection
            formData={formData}
            errors={errors}
            onInputChange={handleInputChange}
            signatureDataUrl={signatureDataUrl}
            onSignatureChange={handleSignatureChange}
          />
        );
      case 'acknowledgement':
      default:
        return (
          <AcknowledgementSection
            formData={formData}
            errors={errors}
            onInputChange={handleInputChange}
          />
        );
    }
  };

  useEffect(() => () => {
    if (previewUrl) {
      try { URL.revokeObjectURL(previewUrl); } catch { /* ignore */ }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div className="max-h-[95vh] w-full max-w-4xl overflow-hidden rounded-lg bg-white">
          <div className="flex items-center justify-between border-b p-6">
            <h2 className="text-xl font-semibold">Fill Handbook Acknowledgment Form</h2>
            <button type="button" onClick={onClose} className="text-2xl text-gray-500 hover:text-gray-700">✕</button>
          </div>

          <div className="max-h-[85vh] overflow-y-auto p-6">
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => setActiveSection(section.id)}
                    className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                      activeSection === section.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {section.name}
                  </button>
                ))}
              </div>
            </div>

            {renderCurrentSection()}

            <div className="mb-6 mt-8 flex gap-4">
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

export default HandbookAcknowledgmentForm;
