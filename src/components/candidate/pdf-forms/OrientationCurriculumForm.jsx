import React, { useState, useEffect } from 'react';
import { fetchPdfTemplateBytes } from './pdfTemplateFetch';
import { submitFilledPdfForm } from './pdfFormSubmit';
import { PDFDocument } from 'pdf-lib';
import StatusModal from '../../ui/StatusModal';
import { validateHiringPdfForm, formatHiringValidationMessage } from '../../../utils/hiringPdfFormValidation';
import { getCandidatePrefill, mergeFormWithCandidate } from '../../../utils/candidateFormPrefill';
import TopicsSection from './sections/OrientationCurriculum/TopicsSection';
import VideosSection from './sections/OrientationCurriculum/VideosSection';
import SignatureSection from './sections/OrientationCurriculum/SignatureSection';

function buildEmpty1203() {
  const empty = {
    Date: '',
    'Print Name': '',
    'Position with Company': '',
    'Start Date': '',
    'Signature1_es_:signer:signature': '',
  };
  for (let i = 1; i <= 8; i++) {
    empty[`DateRow${i}`] = '';
    empty[`Trainer InitialsRow${i}`] = '';
    empty[`Employee InitialsRow${i}`] = '';
    empty[`DateRow${i}_2`] = '';
    empty[`Trainer InitialsRow${i}_2`] = '';
    empty[`Employee InitialsRow${i}_2`] = '';
  }
  empty.DateRow9 = '';
  empty['Trainer InitialsRow9'] = '';
  empty['Employee InitialsRow9'] = '';
  return empty;
}

const EMPTY_1203 = buildEmpty1203();

function buildInitial1203(candidate, savedFormData) {
  const prefill = getCandidatePrefill(candidate);
  return mergeFormWithCandidate(EMPTY_1203, savedFormData, {
    'Print Name': prefill.fullName,
    'Position with Company': prefill.designation,
    Date: prefill.today,
    'Start Date': prefill.today,
  });
}

const SIG_KEY = 'Signature1_es_:signer:signature';

const OrientationCurriculumForm = ({ document, candidate = null, token, onClose, onSuccess }) => {
  const [formData, setFormData] = useState(() =>
    buildInitial1203(candidate || document?.candidate, document?.form_data),
  );
  const [submitting, setSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [filledPdfBytes, setFilledPdfBytes] = useState(null);
  const [signatureDataUrl, setSignatureDataUrl] = useState('');
  const [activeSection, setActiveSection] = useState('topics');
  const [errors, setErrors] = useState({});

  const [statusModal, setStatusModal] = useState({
    isOpen: false,
    type: 'success',
    title: '',
    message: '',
  });

  const sections = [
    { id: 'topics', name: 'Training Topics' },
    { id: 'videos', name: 'Training Videos' },
    { id: 'signature', name: 'Signature' },
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

  const handleTopicsBulkUpdate = (date, trainerInitials, employeeInitials) => {
    const updates = {};
    for (let i = 1; i <= 8; i++) {
      updates[`DateRow${i}`] = date;
      updates[`Trainer InitialsRow${i}`] = trainerInitials;
      updates[`Employee InitialsRow${i}`] = employeeInitials;
    }
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleVideosBulkUpdate = (date, trainerInitials, employeeInitials) => {
    const updates = {};
    for (let i = 1; i <= 8; i++) {
      updates[`DateRow${i}_2`] = date;
      updates[`Trainer InitialsRow${i}_2`] = trainerInitials;
      updates[`Employee InitialsRow${i}_2`] = employeeInitials;
    }
    updates.DateRow9 = date;
    updates['Trainer InitialsRow9'] = trainerInitials;
    updates['Employee InitialsRow9'] = employeeInitials;
    setFormData((prev) => ({ ...prev, ...updates }));
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
    const pdfBuffer = await fetchPdfTemplateBytes(pdfUrl);
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const form = pdfDoc.getForm();

    const fieldNames = [
      'DateRow1', 'Trainer InitialsRow1', 'Employee InitialsRow1',
      'DateRow2', 'Trainer InitialsRow2', 'Employee InitialsRow2',
      'DateRow3', 'Trainer InitialsRow3', 'Employee InitialsRow3',
      'DateRow4', 'Trainer InitialsRow4', 'Employee InitialsRow4',
      'DateRow5', 'Trainer InitialsRow5', 'Employee InitialsRow5',
      'DateRow6', 'Trainer InitialsRow6', 'Employee InitialsRow6',
      'DateRow7', 'Trainer InitialsRow7', 'Employee InitialsRow7',
      'DateRow8', 'Trainer InitialsRow8', 'Employee InitialsRow8',
      'DateRow1_2', 'Trainer InitialsRow1_2', 'Employee InitialsRow1_2',
      'DateRow2_2', 'Trainer InitialsRow2_2', 'Employee InitialsRow2_2',
      'DateRow3_2', 'Trainer InitialsRow3_2', 'Employee InitialsRow3_2',
      'DateRow4_2', 'Trainer InitialsRow4_2', 'Employee InitialsRow4_2',
      'DateRow5_2', 'Trainer InitialsRow5_2', 'Employee InitialsRow5_2',
      'DateRow6_2', 'Trainer InitialsRow6_2', 'Employee InitialsRow6_2',
      'DateRow7_2', 'Trainer InitialsRow7_2', 'Employee InitialsRow7_2',
      'DateRow8_2', 'Trainer InitialsRow8_2', 'Employee InitialsRow8_2',
      'DateRow9', 'Trainer InitialsRow9', 'Employee InitialsRow9',
      'Date', 'Print Name', 'Position with Company', 'Start Date',
    ];

    fieldNames.forEach((fieldName) => {
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
    const validation = validateHiringPdfForm('1203', formData, { hasSignature: Boolean(signatureDataUrl) });
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
        'Your Orientation Curriculum form has been submitted successfully.',
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
      case 'videos':
        return (
          <VideosSection
            formData={formData}
            onInputChange={handleInputChange}
            onBulkUpdate={handleVideosBulkUpdate}
          />
        );
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
      case 'topics':
      default:
        return (
          <TopicsSection
            formData={formData}
            onInputChange={handleInputChange}
            onBulkUpdate={handleTopicsBulkUpdate}
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
        <div className="max-h-[95vh] w-full max-w-6xl overflow-hidden rounded-lg bg-white">
          <div className="flex items-center justify-between border-b p-6">
            <h2 className="text-xl font-semibold">Orientation Curriculum</h2>
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

export default OrientationCurriculumForm;
