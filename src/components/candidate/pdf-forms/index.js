import EmploymentApplicationForm from './EmploymentApplicationForm';
import EqualOpportunityForm from './EqualOpportunityForm';
import SkillsChecklistForm from './SkillsChecklistForm';
import RequestForReferenceForm from './RequestForReferenceForm';
import BackgroundCheckForm from './BackgroundCheckForm';
import CareAvailabilityForm from './CareAvailabilityForm';
import EmployeePersonalActionForm from './EmployeePersonalActionForm';
import HandbookAcknowledgmentForm from './HandbookAcknowledgmentForm';
import OrientationAcknowledgementsForm from './OrientationAcknowledgementsForm';
import OrientationCurriculumForm from './OrientationCurriculumForm';
import AbuseNeglectPolicyForm from './AbuseNeglectPolicyForm';
import CareAssociateScheduleForm from './CareAssociateScheduleForm';
import EmergencyContactForm from './EmergencyContactForm';
import HepatitisBConsentForm from './HepatitisBConsentForm';
import PreEmploymentDrugConsentForm from './PreEmploymentDrugConsentForm';
import IDBadgeAgreementForm from './IDBadgeAgreementForm';
import NonDisclosureNoncompeteForm from './NonDisclosureNoncompeteForm';
import I9Form from './I9Form';
import W4Form2023 from './W4Form2023';

export const pdfFormRegistry = {
  '1020': EmploymentApplicationForm,
  '1021': EqualOpportunityForm,
  '1050': SkillsChecklistForm,
  '1060': RequestForReferenceForm,
  '1070': BackgroundCheckForm,
  '1204': CareAvailabilityForm,
  '1010': EmployeePersonalActionForm,
  '1201': HandbookAcknowledgmentForm,
  '1202': OrientationAcknowledgementsForm,
  '1203': OrientationCurriculumForm,
  '1220': AbuseNeglectPolicyForm,
  '1530': CareAssociateScheduleForm,
  '1600': EmergencyContactForm,
  '1720': HepatitisBConsentForm,
  '1740': PreEmploymentDrugConsentForm,
  '2900': IDBadgeAgreementForm,
  '4000': NonDisclosureNoncompeteForm,
  'I-9': I9Form,
  'W-4': W4Form2023,
};

export const getPdfForm = (documentCode) => pdfFormRegistry[documentCode] || null;

export const hasPdfForm = (documentCode) => Boolean(pdfFormRegistry[documentCode]);
