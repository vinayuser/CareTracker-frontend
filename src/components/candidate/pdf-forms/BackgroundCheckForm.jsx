// components/forms/BackgroundCheckForm.jsx
import React, { useState, useEffect } from 'react';
import { submitFilledPdfForm } from './pdfFormSubmit';
import { fetchPdfTemplateBytes } from './pdfTemplateFetch';

import { PDFDocument } from 'pdf-lib';
import StatusModal from '../../ui/StatusModal';
import PersonalInfoSection from './sections/BackgroundCheck/PersonalInfoSection';
import AddressHistorySection from './sections/BackgroundCheck/AddressHistorySection';
import AuthorizationSection from './sections/BackgroundCheck/AuthorizationSection';
import { validateHiringPdfForm, formatHiringValidationMessage } from '../../../utils/hiringPdfFormValidation';
import {
  getCandidatePrefill,
  mergeFormWithCandidate,
} from '../../../utils/candidateFormPrefill';

const EMPTY_1070 = {
  'Other Names Used': '',
  'Last First Middle': '',
  Maiden: '',
  'Social Security': '',
  DOB: '',
  Phone: '',
  "Driver's License": '',
  "Driver’s License": '',
  State: '',
  Street: '',
  CityStateZip: '',
  Years: '',
  Street_2: '',
  CityStateZip_2: '',
  Years_2: '',
  Street_3: '',
  CityStateZip_3: '',
  Years_3: '',
  Date: '',
  'Print Name': '',
  'Signature103_es_:signer:signature': '',
};

function buildInitial1070(candidate, savedFormData) {
  const p = getCandidatePrefill(candidate);
  const lastFirst = [p.lastName, p.firstName].filter(Boolean).join(' ') || p.fullName;
  return mergeFormWithCandidate(EMPTY_1070, savedFormData, {
    'Last First Middle': lastFirst,
    Phone: p.phone,
    DOB: p.dateOfBirth,
    'Print Name': p.fullName,
    Date: p.today,
    Street: p.location,
  });
}

const BackgroundCheckForm = ({ document, candidate = null, token, onClose, onSuccess }) => {
  const [formData, setFormData] = useState(() =>
    buildInitial1070(candidate || document?.candidate, document?.form_data),
  );

  const [submitting, setSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [filledPdfBytes, setFilledPdfBytes] = useState(null);
  const [signatureDataUrl, setSignatureDataUrl] = useState('');
  const [activeSection, setActiveSection] = useState('personal');
  const [errors, setErrors] = useState({});

  const [statusModal, setStatusModal] = useState({
    isOpen: false,
    type: 'success',
    title: '',
    message: '',
  });

  const sections = [
    { id: 'personal', name: 'Personal Info' },
    { id: 'address', name: 'Address History' },
    { id: 'authorization', name: 'Authorization & Signature' },
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
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
    clearFieldError(fieldName);
  };

  const handleSignatureChange = (dataUrl) => {
    setSignatureDataUrl(dataUrl || '');
    handleInputChange('Signature103_es_:signer:signature', '');
    if (dataUrl) clearFieldError('Signature103_es_:signer:signature');
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
        'Other Names Used', 'Last First Middle', 'Maiden', 'Social Security',
        'DOB', 'Phone', "Driver's License", "Driver’s License", 'State',
        'Street', 'CityStateZip', 'Years', 'Street_2', 'CityStateZip_2',
        'Years_2', 'Street_3', 'CityStateZip_3', 'Years_3',
        'Date', 'Print Name',
      ];

      textFields.forEach((fieldName) => {
        try {
          const field = form.getTextField(fieldName);
          if (field) field.setText(formData[fieldName] || '');
        } catch {
          /* ignore */
        }
      });

      if (signatureDataUrl) {
        const signatureImageBytes = await dataURLToImageBytes(signatureDataUrl);
        if (signatureImageBytes) {
          const signatureImage = await pdfDoc.embedPng(signatureImageBytes);
          const pages = pdfDoc.getPages();

          try {
            const signatureField = form.getTextField('Signature103_es_:signer:signature');
            if (signatureField) {
              const widgets = signatureField.acroField.getWidgets();
              if (widgets && widgets.length > 0) {
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
      }

      form.getFields().forEach((f) => {
        try { f.enableReadOnly(); } catch { /* ignore */ }
      });

      form.flatten();
      return await pdfDoc.save();
    } catch (error) {
      console.error('Error filling Background Check Authorization Form:', error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    try {
      const validation = validateHiringPdfForm('1070', formData, { hasSignature: Boolean(signatureDataUrl) });
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
        'Your Background Check Authorization form has been submitted successfully.',
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

  const renderCurrentSection = () => {
    switch (activeSection) {
      case 'personal':
        return (
          <PersonalInfoSection
            formData={formData}
            errors={errors}
            onInputChange={handleInputChange}
          />
        );
      case 'address':
        return (
          <AddressHistorySection
            formData={formData}
            errors={errors}
            onInputChange={handleInputChange}
          />
        );
      case 'authorization':
        return (
          <AuthorizationSection
            formData={formData}
            errors={errors}
            onInputChange={handleInputChange}
            signatureDataUrl={signatureDataUrl}
            onSignatureChange={handleSignatureChange}
          />
        );
      default:
        return (
          <PersonalInfoSection
            formData={formData}
            errors={errors}
            onInputChange={handleInputChange}
          />
        );
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
            <h2 className="text-xl font-semibold">Fill Background Check Authorization Form</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">✕</button>
          </div>

          <div className="p-6 overflow-y-auto max-h-[85vh]">
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeSection === section.id
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

export default BackgroundCheckForm;
