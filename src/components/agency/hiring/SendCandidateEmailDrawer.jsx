import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Drawer from '../../ui/Drawer';
import axiosInstance from '../../../api/axiosInstance';
import API_ROUTES from '../../../api/apiRoutes';

const inputClass =
  'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20';

export default function SendCandidateEmailDrawer({ open, onClose, application, onSuccess }) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const candidate = application?.candidate || {};

  useEffect(() => {
    if (!open) return;
    setSubject('');
    setMessage('');
    setErrors({});
  }, [open, application?.id]);

  const validate = () => {
    const next = {};
    if (!subject.trim()) next.subject = 'Subject is required';
    if (!message.trim()) next.message = 'Message is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!application?.id || !validate()) return;

    setLoading(true);
    try {
      await axiosInstance.post(
        `${API_ROUTES.AGENCY.JOB_APPLICATIONS.EMAIL}/${application.id}/email`,
        { subject: subject.trim(), message: message.trim() },
      );
      toast.success('Email sent to candidate');
      onSuccess?.();
      onClose();
    } catch {
      // toast from axios interceptor
    }
    setLoading(false);
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Send Email"
      width="md"
      footer={(
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="send-candidate-email-form"
            disabled={loading}
            className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Email'}
          </button>
        </div>
      )}
    >
      <form id="send-candidate-email-form" onSubmit={handleSubmit} className="space-y-4">
        {(candidate.first_name || candidate.email) && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
            <p className="font-medium text-gray-900">
              {candidate.first_name} {candidate.last_name}
            </p>
            <p className="text-sm text-gray-500">{candidate.email}</p>
            {application?.job?.job_title && (
              <p className="mt-0.5 text-xs text-gray-400">{application.job.job_title}</p>
            )}
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Subject <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className={inputClass}
            placeholder="Email subject"
            maxLength={200}
          />
          {errors.subject && <p className="mt-1 text-xs text-red-500">{errors.subject}</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Message <span className="text-red-500">*</span>
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className={`${inputClass} min-h-[160px] resize-y`}
            placeholder="Write your message..."
            maxLength={5000}
          />
          {errors.message && <p className="mt-1 text-xs text-red-500">{errors.message}</p>}
        </div>
      </form>
    </Drawer>
  );
}
