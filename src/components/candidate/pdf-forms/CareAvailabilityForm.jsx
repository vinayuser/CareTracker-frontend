import React, { useState, useEffect } from 'react';
import { submitFilledPdfForm } from './pdfFormSubmit';
import { fetchPdfTemplateBytes } from './pdfTemplateFetch';
import { PDFDocument } from 'pdf-lib';
import StatusModal from '../../ui/StatusModal';
import PersonalInfoSection from './sections/CareAvailability/PersonalInfoSection';
import AvailabilitySection from './sections/CareAvailability/AvailabilitySection';
import AreasSection from './sections/CareAvailability/AreasSection';
import { validateHiringPdfForm, formatHiringValidationMessage, formatUsPhone } from '../../../utils/hiringPdfFormValidation';
import { getCandidatePrefill, mergeFormWithCandidate } from '../../../utils/candidateFormPrefill';

const EMPTY_1204 = {
  Name: '',
  Position: '',
  Address: '',
  'Cell Phone': '',
  'Home Phone': '',
  Email: '',
  'Areas I can workRow1': '',
  'Areas I can workRow2': '',
  'Areas I can workRow3': '',
  'Areas I can workRow4': '',
  'Areas I can workRow5': '',
  'Areas I can workRow6': '',
  '1': '',
  '2': '',
  '3': '',
  '4': '',
  '5': '',
  SundayPM: '',
  SundayAM: '',
  MondayAM: '',
  MondayPM: '',
  TuesdayAM: '',
  TuesdayPM: '',
  WedAM: '',
  WedPM: '',
  ThuAM: '',
  ThuPM: '',
  FridayAM: '',
  FridayPM: '',
  SatAM: '',
  SatPM: '',
};

function buildInitial1204(candidate, savedFormData) {
  const prefill = getCandidatePrefill(candidate);
  return mergeFormWithCandidate(EMPTY_1204, savedFormData, {
    Name: prefill.fullName,
    Position: prefill.designation,
    Address: prefill.location,
    'Cell Phone': prefill.phone,
    Email: prefill.email,
  });
}

const PHONE_FIELDS = new Set(['Cell Phone', 'Home Phone']);

const CareAvailabilityForm = ({ document, candidate = null, token, onClose, onSuccess }) => {
  const [formData, setFormData] = useState(() =>
    buildInitial1204(candidate || document?.candidate, document?.form_data),
  );
  const [submitting, setSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [filledPdfBytes, setFilledPdfBytes] = useState(null);
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
    { id: 'availability', name: 'Availability' },
    { id: 'areas', name: 'Work Areas & Limits' },
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
    const next = PHONE_FIELDS.has(fieldName) ? formatUsPhone(value) : value;
    setFormData((prev) => ({ ...prev, [fieldName]: next }));
    clearFieldError(fieldName);
  };

  const fillPdf = async (data, pdfUrl) => {
    const pdfBuffer = await fetchPdfTemplateBytes(pdfUrl);
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const form = pdfDoc.getForm();

    const textFields = [
      'Name', 'Position', 'Address', 'Cell Phone', 'Home Phone', 'Email',
      'Areas I can workRow1', 'Areas I can workRow2', 'Areas I can workRow3',
      'Areas I can workRow4', 'Areas I can workRow5', 'Areas I can workRow6',
      '1', '2', '3', '4', '5',
      'SundayPM', 'SundayAM', 'MondayAM', 'MondayPM', 'TuesdayAM', 'TuesdayPM',
      'WedAM', 'WedPM', 'ThuAM', 'ThuPM', 'FridayAM', 'FridayPM', 'SatAM', 'SatPM',
    ];

    textFields.forEach((fieldName) => {
      try {
        const field = form.getTextField(fieldName);
        if (field) field.setText(data[fieldName] || '');
      } catch {
        /* field missing */
      }
    });

    form.getFields().forEach((f) => {
      try { f.enableReadOnly(); } catch { /* ignore */ }
    });
    form.flatten();
    return pdfDoc.save();
  };

  const handleSubmit = async () => {
    const validation = validateHiringPdfForm('1204', formData, {});
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
        'Your Care Associate Availability form has been submitted successfully.',
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
      case 'availability':
        return <AvailabilitySection formData={formData} onInputChange={handleInputChange} />;
      case 'areas':
        return <AreasSection formData={formData} onInputChange={handleInputChange} />;
      case 'personal':
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
            <h2 className="text-xl font-semibold">Fill Care Associate Availability Form</h2>
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

export default CareAvailabilityForm;
