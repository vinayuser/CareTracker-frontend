// components/forms/RequestForReferenceForm.jsx
import React, { useState, useEffect } from 'react';
import { submitFilledPdfForm } from './pdfFormSubmit';
import { fetchPdfTemplateBytes } from './pdfTemplateFetch';

import { PDFDocument } from 'pdf-lib';
import StatusModal from '../../ui/StatusModal';
import RequestForReferenceSection from './sections/RequestForReference/RequestForReferenceSection';
import CandidateSignatureField from './CandidateSignatureField';
import { validateHiringPdfForm, formatHiringValidationMessage } from '../../../utils/hiringPdfFormValidation';
import {
  getCandidatePrefill,
  mergeFormWithCandidate,
} from '../../../utils/candidateFormPrefill';

const EMPTY_1060 = {
  'Please reply by': '',
  'Company Name 1': '',
  'Phone Number': '',
  'Employee Name': '',
  'Date of Birth': '',
  I: '',
  Date: '',
  'Address 1': '',
  From: '',
  To: '',
  'Reason for Leaving': '',
  Salary: '',
  'Notice Yes': false,
  'Notice No': false,
  AdditionalInformationRow1: '',
  'Additional InformationRow1': '',
  Name: '',
  Date_2: '',
  Title: '',
  'Mastercare Representative': '',
  Date_3: '',
  'Signature202_es_:signer:signature': '',
  'Mastercare Office Address': '',
  'Knowledgeable Yes': false,
  'Knowledgeable No': false,
  'Dependable Yes': false,
  'Dependable No': false,
  'Rehire Yes': false,
  'Rehire No': false,
  'Recommend Yes': false,
  'Recommend No': false,
};

function buildInitial1060(candidate, savedFormData) {
  const p = getCandidatePrefill(candidate);
  return mergeFormWithCandidate(EMPTY_1060, savedFormData, {
    'Employee Name': p.fullName,
    'Date of Birth': p.dateOfBirth,
    Date: p.today,
    'Phone Number': p.phone,
    I: p.fullName,
    'Address 1': p.location,
  });
}

const RequestForReferenceForm = ({ document, candidate = null, token, onClose, onSuccess }) => {
  const [formData, setFormData] = useState(() =>
    buildInitial1060(candidate || document?.candidate, document?.form_data),
  );

  const [generatingPreview, setGeneratingPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [filledPdfBytes, setFilledPdfBytes] = useState(null);
  const [signatureDataUrl, setSignatureDataUrl] = useState('');
  const [, setActiveSection] = useState('main');
  const [errors, setErrors] = useState({});

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
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
    clearFieldError(fieldName);
  };

  const handleCheckboxChange = (fieldName, checked) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: checked,
    }));
  };

  const handleSignatureChange = (dataUrl) => {
    setSignatureDataUrl(dataUrl || '');
    handleInputChange('Signature202_es_:signer:signature', '');
    if (dataUrl) clearFieldError('Signature202_es_:signer:signature');
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

  const fillPdf = async (formData, pdfUrl) => {
    try {
      const pdfBuffer = await fetchPdfTemplateBytes(pdfUrl);
      const pdfDoc = await PDFDocument.load(pdfBuffer);
      const form = pdfDoc.getForm();

      const textFields = [
        'Please reply by', 'Company Name 1', 'Phone Number', 'Employee Name',
        'Date of Birth', 'I', 'Date', 'From', 'To', 'Reason for Leaving',
        'Salary', 'Additional InformationRow1', 'Name', 'Date_2', 'Title',
        'Mastercare Representative', 'Date_3', 'Mastercare Office Address', 'Address 1',
      ];

      textFields.forEach((fieldName) => {
        try {
          const field = form.getTextField(fieldName);
          if (field) field.setText(formData[fieldName] || '');
        } catch {
          /* ignore */
        }
      });

      const checkboxFields = [
        'Notice Yes', 'Notice No', 'Knowledgeable Yes', 'Knowledgeable No',
        'Dependable Yes', 'Dependable No', 'Rehire Yes', 'Rehire No',
        'Recommend Yes', 'Recommend No',
      ];

      checkboxFields.forEach((fieldName) => {
        try {
          const field = form.getCheckBox(fieldName);
          if (field) {
            if (formData[fieldName] === true) field.check();
            else field.uncheck();
          }
        } catch {
          /* ignore */
        }
      });

      if (signatureDataUrl) {
        try {
          const signatureImageBytes = await dataURLToImageBytes(signatureDataUrl);
          if (signatureImageBytes) {
            const signatureImage = await pdfDoc.embedPng(signatureImageBytes);
            const pages = pdfDoc.getPages();

            try {
              const signatureField = form.getTextField('Signature202_es_:signer:signature');
              if (signatureField) {
                const widgets = signatureField.acroField.getWidgets();
                if (widgets && widgets.length > 0) {
                  const widget = widgets[0];
                  const rect = widget.getRectangle();
                  const pageRef = widget.P();
                  let pageIndex = 0;
                  for (let i = 0; i < pages.length; i++) {
                    if (pages[i].ref === pageRef) {
                      pageIndex = i;
                      break;
                    }
                  }
                  if (pages[pageIndex]) {
                    pages[pageIndex].drawImage(signatureImage, {
                      x: rect.x || rect.left || 100,
                      y: rect.y || rect.bottom || 100,
                      width: rect.width || (rect.right - rect.left) || 200,
                      height: rect.height || (rect.top - rect.bottom) || 50,
                    });
                  }
                  signatureField.setText('');
                }
              }
            } catch {
              if (pages[0]) {
                pages[0].drawImage(signatureImage, {
                  x: 100, y: 100, width: 200, height: 50,
                });
              }
            }
          }
        } catch (error) {
          console.error('Error embedding drawn signature:', error);
        }
      }

      form.getFields().forEach((f) => {
        try { f.enableReadOnly(); } catch { /* ignore */ }
      });

      form.flatten();
      return await pdfDoc.save();
    } catch (error) {
      console.error('Error filling Request for Reference Form:', error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    try {
      const validation = validateHiringPdfForm('1060', formData, { hasSignature: Boolean(signatureDataUrl) });
      if (!validation.ok) {
        setErrors(validation.fieldErrors || {});
        if (validation.firstSection) setActiveSection(validation.firstSection);
        showStatusModal('error', 'Please fix the form', formatHiringValidationMessage(validation.messages));
        return;
      }
      setErrors({});

      setSubmitting(true);

      let bytes = filledPdfBytes;
      if (!bytes) {
        bytes = await fillPdf(formData, document.url);
      }

      const filledPdfBlob = new Blob([bytes], { type: 'application/pdf' });

      await submitFilledPdfForm({
        token,
        documentCode: document.code,
        formData,
        pdfBlob: filledPdfBlob,
        fileName: `${document.name}_filled.pdf`,
      });

      showStatusModal(
        'success',
        'Document Submitted Successfully!',
        'Your Request for Reference form has been submitted successfully.',
      );

      if (previewUrl) {
        try { URL.revokeObjectURL(previewUrl); } catch { /* ignore */ }
      }
      setPreviewUrl('');
      setFilledPdfBytes(null);

      setTimeout(() => {
        try { onSuccess && onSuccess(); } catch { /* ignore */ }
        try { onClose && onClose(); } catch { /* ignore */ }
      }, 2000);
    } catch (error) {
      console.error('Error submitting PDF:', error);
      const errorMessage = error?.message || error.response?.data?.message || 'Failed to submit document. Please try again.';
      showStatusModal('error', 'Submission Failed', errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    return () => {
      if (previewUrl) {
        try { URL.revokeObjectURL(previewUrl); } catch { /* ignore */ }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-6xl w-full max-h-[95vh] overflow-hidden">
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-xl font-semibold">Request for Reference Form</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">✕</button>
          </div>

          <div className="p-6 overflow-y-auto max-h-[85vh]">
            <RequestForReferenceSection
              formData={formData}
              errors={errors}
              onInputChange={handleInputChange}
              onCheckboxChange={handleCheckboxChange}
            />

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Signature & Date</h3>
              <CandidateSignatureField
                label="Applicant Signature *"
                dateLabel="Date *"
                dateValue={formData.Date || ''}
                onDateChange={(v) => handleInputChange('Date', v)}
                signatureDataUrl={signatureDataUrl}
                onSignatureChange={handleSignatureChange}
                dateError={errors.Date}
                signatureError={errors['Signature202_es_:signer:signature']}
              />
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

export default RequestForReferenceForm;
