import React from 'react';

function FieldError({ message }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-600">{message}</p>;
}

const AcknowledgementSection = ({ formData, errors = {}, onInputChange }) => {
  const ackError = errors.orientation_acknowledged;

  return (
    <div className="mb-8">
      <h3 className="mb-4 text-lg font-semibold">Orientation Acknowledgements</h3>

      <div className="mb-6 max-h-80 overflow-y-auto rounded border border-gray-300 bg-gray-50 p-4">
        <div className="space-y-3 text-sm text-gray-700">
          <p>
            I acknowledge my obligation to fulfill the duties and responsibilities as set forth by the Employee
            Handbook and through our Orientation. I agree to comply with the terms as it relates to my employment
            with CareTraker. I further understand that violations of the information that is provided to me in the
            Employee Handbook will be grounds for disciplinary action, and may include termination of my employment.
          </p>
          <p>
            I have reviewed the following information in my Orientation and have been given the opportunity to ask
            question regarding its content. I understand that at any time should I have questions regarding any
            policies and how they may relate to my job or to my employment I should contact the Human Resources for
            clarification.
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
              id="orientation-acknowledge"
              type="checkbox"
              checked={formData.orientation_acknowledged || false}
              onChange={(e) => onInputChange('orientation_acknowledged', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="orientation-acknowledge" className="font-medium text-gray-700">
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
