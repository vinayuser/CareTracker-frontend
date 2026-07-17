import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import Drawer from '../../ui/Drawer';
import { sendCaregiverEmail } from '../../../redux/slices/caregiversSlice';

const inputClass =
  'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20';

export default function SendCaregiverEmailDrawer({ open, onClose, caregiver, onSuccess }) {
  const dispatch = useDispatch();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSubject('');
    setMessage('');
    setErrors({});
  }, [open, caregiver?.id]);

  const validate = () => {
    const next = {};
    if (!subject.trim()) next.subject = 'Subject is required';
    if (!message.trim()) next.message = 'Message is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!caregiver?.id || !validate()) return;

    setLoading(true);
    try {
      await dispatch(
        sendCaregiverEmail({
          id: caregiver.id,
          subject: subject.trim(),
          message: message.trim(),
        }),
      ).unwrap();
      onSuccess?.();
      onClose();
    } catch {
      // toast in slice
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
            form="send-caregiver-email-form"
            disabled={loading}
            className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Email'}
          </button>
        </div>
      )}
    >
      <form id="send-caregiver-email-form" onSubmit={handleSubmit} className="space-y-4">
        {caregiver && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
            <p className="font-medium text-gray-900">{caregiver.fullName}</p>
            <p className="text-sm text-gray-500">{caregiver.email}</p>
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
