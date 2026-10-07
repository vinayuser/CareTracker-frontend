import React, { useState, useEffect } from 'react';
import { fetchPdfTemplateBytes } from './pdfTemplateFetch';
import { submitFilledPdfForm } from './pdfFormSubmit';
import { PDFDocument } from 'pdf-lib';
import StatusModal from '../../ui/StatusModal';
import { validateHiringPdfForm, formatHiringValidationMessage } from '../../../utils/hiringPdfFormValidation';
import { getCandidatePrefill, mergeFormWithCandidate } from '../../../utils/candidateFormPrefill';
import { stripSignedSignaturePlaceholders } from './pdfSignatureUtils';
import ConsentSection from './sections/HepatitisB/ConsentSection';
import DeclinationSection from './sections/HepatitisB/DeclinationSection';

const PROOF_KEY = 'Medical proof of vaccination  Proof of immunity Attach results';

const EMPTY_1720 = {
  'I elect to receive the Hepatitis B vaccine': false,
  'I have received the Hepatitis B Vaccine Series': false,
  [PROOF_KEY]: false,
  Dates1: '',
  Dates2: '',
  Dates3: '',
  'I decline the Hepatitis B Vaccine and understand I can receive it at any time in the future': false,
  Date: '',
  Date_2: '',
  'Signature124_es_:signer:signature': '',
  'Signature125_es_:signer:signature': '',
};

function inferConsentChoice(data) {
  if (data['I elect to receive the Hepatitis B vaccine']) return 'consent';
  if (data['I decline the Hepatitis B Vaccine and understand I can receive it at any time in the future']) return 'decline';
  if (data['I have received the Hepatitis B Vaccine Series']) return 'alreadyVaccinated';
  return '';
}

function buildInitial1720(candidate, savedFormData) {
  const p = getCandidatePrefill(candidate);
  const merged = mergeFormWithCandidate(EMPTY_1720, savedFormData, {
    Date: p.today,
    Date_2: p.today,
  });
  return stripSignedSignaturePlaceholders(merged, [
    'Signature124_es_:signer:signature',
    'Signature125_es_:signer:signature',
  ]);
}

const HepatitisBConsentForm = ({ document, candidate = null, token, onClose, onSuccess }) => {
  const [formData, setFormData] = useState(() =>
    buildInitial1720(candidate || document?.candidate, document?.form_data),
  );

  const [submitting, setSubmitting] = useState(false);
  const [signatureDataUrl, setSignatureDataUrl] = useState('');
  const [activeSection, setActiveSection] = useState('consent');
  const [consentChoice, setConsentChoice] = useState(() =>
    inferConsentChoice(buildInitial1720(candidate || document?.candidate, document?.form_data)),
  );
  const [errors, setErrors] = useState({});

  const [statusModal, setStatusModal] = useState({
    isOpen: false,
    type: 'success',
    title: '',
    message: '',
  });

  const sections = [
    { id: 'consent', name: 'Vaccine Consent' },
    { id: 'declination', name: 'Vaccine Declination' },
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
    clearFieldError(fieldName, 'Signature124_es_:signer:signature', 'Signature125_es_:signer:signature', 'Signature');
  };

  const handleCheckboxChange = (fieldName, checked) => {
    setFormData((prev) => {
      const next = { ...prev, [fieldName]: checked };
      if (fieldName === 'I elect to receive the Hepatitis B vaccine' && checked) {
        next['I decline the Hepatitis B Vaccine and understand I can receive it at any time in the future'] = false;
        next['I have received the Hepatitis B Vaccine Series'] = false;
        setConsentChoice('consent');
        setActiveSection('consent');
      } else if (fieldName === 'I decline the Hepatitis B Vaccine and understand I can receive it at any time in the future' && checked) {
        next['I elect to receive the Hepatitis B vaccine'] = false;
        next['I have received the Hepatitis B Vaccine Series'] = false;
        setConsentChoice('decline');
        setActiveSection('declination');
      } else if (fieldName === 'I have received the Hepatitis B Vaccine Series' && checked) {
        next['I elect to receive the Hepatitis B vaccine'] = false;
        next['I decline the Hepatitis B Vaccine and understand I can receive it at any time in the future'] = false;
        setConsentChoice('alreadyVaccinated');
        setActiveSection('consent');
      } else if (!checked) {
        setConsentChoice((current) => {
          if (fieldName === 'I elect to receive the Hepatitis B vaccine' && current === 'consent') return '';
          if (fieldName === 'I decline the Hepatitis B Vaccine and understand I can receive it at any time in the future' && current === 'decline') return '';
          if (fieldName === 'I have received the Hepatitis B Vaccine Series' && current === 'alreadyVaccinated') return '';
          return current;
        });
      }
      return next;
    });
    clearFieldError('consentChoice', 'Dates1');
  };

  const handleSignatureChange = (dataUrl) => {
    setSignatureDataUrl(dataUrl || '');
    handleInputChange('Signature124_es_:signer:signature', '');
    handleInputChange('Signature125_es_:signer:signature', '');
    if (dataUrl) {
      clearFieldError('Signature124_es_:signer:signature', 'Signature125_es_:signer:signature', 'Signature');
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

  const fillPdf = async (data, pdfUrl, choice) => {
    const pdfBuffer = await fetchPdfTemplateBytes(pdfUrl);
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const form = pdfDoc.getForm();

    const setCheckbox = (name, checked) => {
      try {
        const cb = form.getCheckBox(name);
        if (!cb) return;
        if (checked) cb.check();
        else cb.uncheck();
      } catch {
        // ignore
      }
    };

    setCheckbox('I elect to receive the Hepatitis B vaccine', data['I elect to receive the Hepatitis B vaccine']);
    setCheckbox('I have received the Hepatitis B Vaccine Series', data['I have received the Hepatitis B Vaccine Series']);
    setCheckbox(
      'I decline the Hepatitis B Vaccine and understand I can receive it at any time in the future',
      data['I decline the Hepatitis B Vaccine and understand I can receive it at any time in the future'],
    );

    try {
      let proofCheckbox = form.getCheckBox(PROOF_KEY);
      if (!proofCheckbox) proofCheckbox = form.getCheckBox('Medical proof of vaccination / Proof of immunity (Attach results.)');
      if (!proofCheckbox) proofCheckbox = form.getCheckBox('Medical proof of vaccination');
      if (proofCheckbox) {
        if (data[PROOF_KEY]) proofCheckbox.check();
        else proofCheckbox.uncheck();
      }
    } catch {
      // ignore
    }

    ['Date', 'Date_2', 'Dates1', 'Dates2', 'Dates3'].forEach((fieldName) => {
      try {
        const field = form.getTextField(fieldName);
        if (field) field.setText(data[fieldName] || '');
      } catch {
        // ignore
      }
    });

    if (signatureDataUrl) {
      const signatureImageBytes = await dataURLToImageBytes(signatureDataUrl);
      if (signatureImageBytes) {
        const signatureImage = await pdfDoc.embedPng(signatureImageBytes);
        const pages = pdfDoc.getPages();
        const signatureField = choice === 'decline'
          ? 'Signature125_es_:signer:signature'
          : 'Signature124_es_:signer:signature';

        try {
          const sigField = form.getTextField(signatureField);
          if (sigField) {
            const widgets = sigField.acroField.getWidgets();
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
          }
        } catch {
          if (pages[0]) {
            pages[0].drawImage(signatureImage, { x: 100, y: 100, width: 200, height: 50 });
          }
        }
      }
    }

    ['Signature124_es_:signer:signature', 'Signature125_es_:signer:signature'].forEach((fieldName) => {
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
      const validation = validateHiringPdfForm('1720', formData, {
        hasSignature: Boolean(signatureDataUrl),
        consentChoice,
      });
      setErrors(validation.fieldErrors || {});
      if (!validation.ok) {
        if (validation.firstSection) setActiveSection(validation.firstSection);
        showStatusModal('error', 'Please fix the form', formatHiringValidationMessage(validation.messages));
        return;
      }

      setSubmitting(true);
      const bytes = await fillPdf(formData, document.url, consentChoice);

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
        'Your Hepatitis B Consent/Declination form has been submitted successfully.',
      );

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

  const renderCurrentSection = () => {
    const shared = {
      formData,
      errors,
      onInputChange: handleInputChange,
      onCheckboxChange: handleCheckboxChange,
      signatureDataUrl,
      onSignatureChange: handleSignatureChange,
    };

    if (activeSection === 'declination') {
      return <DeclinationSection {...shared} />;
    }
    return <ConsentSection {...shared} />;
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-6xl w-full max-h-[95vh] overflow-hidden">
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-xl font-semibold">Hepatitis B Vaccine Consent/Declination</h2>
            <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">✕</button>
          </div>

          <div className="p-6 overflow-y-auto max-h-[85vh]">
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => setActiveSection(section.id)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
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

            <div className="mt-6 p-4 border border-gray-300 rounded bg-gray-50">
              <h4 className="text-md font-semibold text-gray-800 mb-2">Current Selection:</h4>
              <div className="flex flex-wrap gap-4">
                <div className={`px-3 py-1 rounded-full text-sm ${consentChoice === 'consent' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                  {consentChoice === 'consent' ? '✓ Consent to vaccine' : 'Consent to vaccine'}
                </div>
                <div className={`px-3 py-1 rounded-full text-sm ${consentChoice === 'alreadyVaccinated' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}>
                  {consentChoice === 'alreadyVaccinated' ? '✓ Already vaccinated' : 'Already vaccinated'}
                </div>
                <div className={`px-3 py-1 rounded-full text-sm ${consentChoice === 'decline' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'}`}>
                  {consentChoice === 'decline' ? '✓ Decline vaccine' : 'Decline vaccine'}
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

export default HepatitisBConsentForm;
