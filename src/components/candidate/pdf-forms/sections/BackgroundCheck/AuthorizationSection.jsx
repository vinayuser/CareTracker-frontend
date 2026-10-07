// components/forms/sections/BackgroundCheck/AuthorizationSection.jsx
import React from 'react';
import CandidateSignatureField from '../../CandidateSignatureField';
import { fieldInputErr, fieldInputOk } from '../../../../../utils/candidateFormPrefill';

function FieldError({ message }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-600">{message}</p>;
}

const AuthorizationSection = ({
  formData,
  errors = {},
  onInputChange,
  signatureDataUrl,
  onSignatureChange,
}) => {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4">Authorization & Signature</h3>

      <div className="mb-6 p-4 border border-gray-300 rounded bg-gray-50 max-h-60 overflow-y-auto">
        <div className="text-sm text-gray-700 space-y-3">
          <p>
            <strong>Authorization:</strong> I hereby authorize CareTraker Homecare, Inc. and its designated agents and representatives to conduct a comprehensive review of my background causing a consumer report and/or an investigative consumer report to be generated for employment and/or volunteer purpose. I understand that the scope of the consumer report/investigative consumer report may include but is not limited to the following areas:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Verification of social security number</li>
            <li>Current and previous residences</li>
            <li>Employment history</li>
            <li>Education background</li>
            <li>Character reference</li>
            <li>Drug testing</li>
            <li>Civil and criminal history records from any criminal justice agency in any and all federal, state, county jurisdictions</li>
            <li>Driving record</li>
            <li>Birth records</li>
            <li>Any other public records</li>
          </ul>
          <p>
            I further authorize any individual, company, firm, corporation, or public agency (including the Social Security Administration and law enforcement agencies) to divulge any and all information, verbal or written, pertaining to me, to CareTraker Homecare, Inc. or its agents. I further authorize the complete release of any record or data pertaining to me which the individual, company, firm, corporation, or public agency may have, to include information or data received from other sources.
          </p>
          <p>
            <strong>Release of Liability:</strong> I hereby release CareTraker Homecare, Inc. the Social Security Administration and its agents, officials, representative, or assigned agencies including officers, employees, or related personnel both individually and collectively, from any and all liability for damages of whatever kind, which may at any time result to me, my heirs, family or associates because of compliance with this authorization and request to release.
          </p>
          <p>
            <strong>Certification:</strong> The information provided in this application are true and factual to the best of my knowledge.
          </p>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Print Name *</label>
        <input
          type="text"
          value={formData['Print Name']}
          onChange={(e) => onInputChange('Print Name', e.target.value)}
          className={errors['Print Name'] ? fieldInputErr : fieldInputOk}
          placeholder="Type your name as it should appear printed"
        />
        <FieldError message={errors['Print Name']} />
      </div>

      <CandidateSignatureField
        label="Employee Signature *"
        dateLabel="Date *"
        dateValue={formData.Date || ''}
        onDateChange={(v) => onInputChange('Date', v)}
        signatureDataUrl={signatureDataUrl}
        onSignatureChange={onSignatureChange}
        dateError={errors.Date}
        signatureError={errors['Signature103_es_:signer:signature']}
      />

      <div className="mt-6 p-3 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          1070/MC-Rev.0423 ©CareTraker Homecare, Inc. All Rights Reserved
        </p>
      </div>
    </div>
  );
};

export default AuthorizationSection;
