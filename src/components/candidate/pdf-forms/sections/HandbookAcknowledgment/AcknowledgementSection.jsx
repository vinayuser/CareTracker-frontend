import React from 'react';

function FieldError({ message }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-600">{message}</p>;
}

const AcknowledgementSection = ({ formData, errors = {}, onInputChange }) => {
  const ackError = errors.acknowledged;

  return (
    <div className="mb-8">
      <h3 className="mb-4 text-lg font-semibold">Handbook Acknowledgment</h3>

      <div className="mb-6 max-h-80 overflow-y-auto rounded border border-gray-300 bg-gray-50 p-4">
        <div className="space-y-3 text-sm text-gray-700">
          <p>
            I acknowledge that I have received a copy of the CareTraker Homecare Employee Handbook. I
            have read and understood the policies in the Employee Handbook, and I understand that my
            failure to comply with any of the rules, policies, or procedures of CareTraker Homecare, Inc.
            may result in disciplinary action, up to and including dismissal. I further understand and
            acknowledge that:
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>It is my responsibility to adhere to the policies contained in the Employee Handbook.</li>
            <li>
              The Employee Handbook may be changed or superseded by CareTraker Homecare at any time,
              with or without prior notice.
            </li>
            <li>
              I am an &quot;at-will&quot; employee and the provisions contained in the Employee Handbook do not
              constitute an implied or express contract of employment and do not alter the at-will
              employment relationship in any way.
            </li>
          </ul>
          <p>
            I have reviewed the following information in the Employee Handbook and have been given the
            opportunity to ask question regarding its content. I understand that at any time should I have
            questions regarding any policies and how they may relate to my job or to my employment I
            should contact the manager for clarification.
          </p>
        </div>
      </div>

      <div
        className={`mb-6 rounded-lg border p-4 ${
          ackError ? 'border-red-400 bg-red-50' : 'border-gray-200'
        }`}
      >
        <div className="flex items-start">
          <div className="flex h-5 items-center">
            <input
              id="acknowledge"
              type="checkbox"
              checked={formData.acknowledged || false}
              onChange={(e) => onInputChange('acknowledged', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="acknowledge" className="font-medium text-gray-700">
              I acknowledge and agree to all of the above statements
            </label>
            <p className="mt-1 text-gray-500">
              By checking this box, you confirm that you have read, understood, and agree to the terms outlined above.
            </p>
            <FieldError message={ackError} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcknowledgementSection;
