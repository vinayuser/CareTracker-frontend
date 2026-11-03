import { useEffect, useMemo, useState } from 'react';
import { Calendar, CalendarDays, ChevronDown, Info, Lock, X } from 'lucide-react';
import { toast } from 'react-toastify';
import axiosInstance from '../../api/axiosInstance';
import API_ROUTES from '../../api/apiRoutes';
import {
  formatUsPhone,
  isValidEmail,
  isValidUsPhone,
} from '../../utils/agencyInformationValidation';

const COUNTRIES = [
  { id: 'US', flag: '🇺🇸', dial: '+1' },
  { id: 'CA', flag: '🇨🇦', dial: '+1' },
  { id: 'GB', flag: '🇬🇧', dial: '+44' },
  { id: 'IN', flag: '🇮🇳', dial: '+91' },
  { id: 'AU', flag: '🇦🇺', dial: '+61' },
];

const EMPTY = {
  firstName: '',
  lastName: '',
  email: '',
  country: 'US',
  phone: '',
  date: '',
  time: '',
  address: '',
};

const inputOk =
  'h-9 w-full rounded-lg border border-[#e2e8f0] bg-white px-4 text-[13px] text-[#334155] placeholder:text-[#94a3b8] outline-none transition focus:border-[#2563eb]';
const inputErr =
  'h-9 w-full rounded-lg border border-red-400 bg-white px-4 text-[13px] text-[#334155] placeholder:text-[#94a3b8] outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-200';

function timeOptions() {
  const items = [];
  for (let h = 8; h <= 17; h += 1) {
    for (const m of [0, 30]) {
      if (h === 17 && m === 30) break;
      const hour12 = h % 12 === 0 ? 12 : h % 12;
      const ampm = h < 12 ? 'AM' : 'PM';
      items.push(`${hour12}:${m === 0 ? '00' : '30'} ${ampm}`);
    }
  }
  return items;
}

function Label({ children, required }) {
  return (
    <span className="mb-1.5 block text-[13px] font-semibold text-[#0f172a]">
      {children}
      {required ? <span className="text-[#ef4444]"> *</span> : null}
    </span>
  );
}

function ErrorText({ children }) {
  if (!children) return null;
  return <p className="mt-1 text-[11px] text-red-500">{children}</p>;
}

function validateDemoForm(form) {
  const errors = {};
  if (!String(form.firstName || '').trim()) errors.firstName = 'First name is required';
  if (!String(form.lastName || '').trim()) errors.lastName = 'Last name is required';

  const email = String(form.email || '').trim();
  if (!email) errors.email = 'Email is required';
  else if (!isValidEmail(email)) errors.email = 'Enter a valid email address';

  const phone = String(form.phone || '').trim();
  if (!phone) errors.phone = 'Phone number is required';
  else if (!isValidUsPhone(phone)) errors.phone = 'Enter a valid US phone number: (555) 123-4567';

  if (!form.date) errors.date = 'Schedule date is required';
  if (!form.time) errors.time = 'Schedule time is required';

  const address = String(form.address || '').trim();
  if (!address) errors.address = 'Address is required';
  else if (address.length < 8) errors.address = 'Enter a full street address';

  return errors;
}

export default function DemoRequestModal({ open, onClose }) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const times = useMemo(() => timeOptions(), []);
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const country = COUNTRIES.find((c) => c.id === form.country) || COUNTRIES[0];

  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      setForm(EMPTY);
      setErrors({});
      setSubmitted(false);
      setSubmitting(false);
    }
  }, [open]);

  if (!open) return null;

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const next = validateDemoForm(form);
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    try {
      await axiosInstance.post(API_ROUTES.DEMO_REQUESTS, {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        country: form.country,
        dialCode: country.dial,
        phone: form.phone.trim(),
        scheduleDate: form.date,
        scheduleTime: form.time,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
        address: form.address.trim(),
      }, { skipErrorToast: true });
      setSubmitted(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit your demo request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto p-4">
      <button
        type="button"
        aria-label="Close demo request"
        className="absolute inset-0 bg-[#64748b]/55"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="demo-request-title"
        className="relative z-10 w-full max-w-[680px] rounded-[20px] bg-white px-7 pb-5 pt-5 shadow-[0_24px_60px_-12px_rgba(15,23,42,0.45)] [&_button]:cursor-pointer"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3.5">
            <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-[12px] bg-[#d4e7fd] text-[#2563eb]">
              <Calendar size={22} strokeWidth={2} />
            </span>
            <div className="min-w-0 pt-0.5">
              <h2
                id="demo-request-title"
                className="text-[24px] font-bold leading-none tracking-tight text-[#0b1220]"
              >
                Request a Demo
              </h2>
              <p className="mt-1.5 text-[13px] leading-snug text-[#7b8499]">
                Tell us a little about your agency and choose a convenient time to connect.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="mt-0.5 inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-[#94a3b8] hover:bg-slate-50 hover:text-slate-600"
            aria-label="Close"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        {submitted ? (
          <div className="py-10 text-center">
            <p className="text-[15px] font-semibold text-[#0b1220]">Thanks — we received your request.</p>
            <p className="mt-2 text-[13px] text-slate-500">
              Our team will confirm your demo for {form.date} at {form.time}.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 h-11 cursor-pointer rounded-full bg-[#2563eb] px-8 text-[14px] font-semibold text-white hover:bg-[#1d4ed8]"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} noValidate>
            <div className="grid grid-cols-1 items-start gap-x-8 gap-y-3.5 sm:grid-cols-2">
              <label className="block">
                <Label required>First Name</Label>
                <input
                  className={errors.firstName ? inputErr : inputOk}
                  value={form.firstName}
                  onChange={(e) => setField('firstName', e.target.value)}
                  placeholder="Enter your first name"
                  autoComplete="given-name"
                />
                <ErrorText>{errors.firstName}</ErrorText>
              </label>
              <label className="block">
                <Label required>Last Name</Label>
                <input
                  className={errors.lastName ? inputErr : inputOk}
                  value={form.lastName}
                  onChange={(e) => setField('lastName', e.target.value)}
                  placeholder="Enter your last name"
                  autoComplete="family-name"
                />
                <ErrorText>{errors.lastName}</ErrorText>
              </label>
              <label className="block">
                <Label required>Work Email</Label>
                <input
                  type="email"
                  className={errors.email ? inputErr : inputOk}
                  value={form.email}
                  onChange={(e) => setField('email', e.target.value)}
                  placeholder="Enter your work email"
                  autoComplete="email"
                />
                <ErrorText>{errors.email}</ErrorText>
              </label>
              <div className="block">
                <Label required>Mobile Number</Label>
                <div
                  className={`flex h-9 items-center rounded-lg border bg-white px-3.5 ${
                    errors.phone
                      ? 'border-red-400 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-200'
                      : 'border-[#e2e8f0] focus-within:border-[#2563eb]'
                  }`}
                >
                  <span className="text-[14px] leading-none" aria-hidden>
                    {country.flag}
                  </span>
                  <span className="relative ml-1.5 inline-flex items-center">
                    <select
                      className="cursor-pointer appearance-none bg-transparent pr-3.5 text-[13px] font-medium text-[#334155] outline-none"
                      value={form.country}
                      onChange={(e) => setField('country', e.target.value)}
                      aria-label="Country code"
                    >
                      {COUNTRIES.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.dial}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={12}
                      className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-[#94a3b8]"
                    />
                  </span>
                  <span className="mx-2.5 h-4 w-px shrink-0 bg-[#e2e8f0]" />
                  <input
                    className="h-full min-w-0 flex-1 bg-transparent text-[13px] text-[#334155] placeholder:text-[#94a3b8] outline-none"
                    value={form.phone}
                    onChange={(e) => setField('phone', formatUsPhone(e.target.value))}
                    placeholder="(555) 123-4567"
                    autoComplete="tel"
                    inputMode="tel"
                  />
                </div>
                <ErrorText>{errors.phone}</ErrorText>
              </div>

              <div className="block">
                <Label required>Schedule Date</Label>
                <div className="relative">
                  <input
                    type="date"
                    min={today}
                    value={form.date}
                    onChange={(e) => setField('date', e.target.value)}
                    className={`${errors.date ? inputErr : inputOk} relative pr-10 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 ${
                      form.date ? 'text-[#334155]' : 'text-transparent'
                    }`}
                  />
                  {!form.date ? (
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[13px] text-slate-400">
                      Select a date
                    </span>
                  ) : null}
                  <CalendarDays
                    size={16}
                    className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8]"
                  />
                </div>
                <p className="mt-2 flex items-center gap-1.5 text-[12px] text-[#94a3b8]">
                  <Info size={14} className="shrink-0 text-[#2563eb]" strokeWidth={2} />
                  All times are shown in your local time zone.
                </p>
                <ErrorText>{errors.date}</ErrorText>
              </div>

              <label className="block">
                <Label required>Schedule Time</Label>
                <div className="relative">
                  <select
                    className={`${errors.time ? inputErr : inputOk} cursor-pointer appearance-none pr-10 ${form.time ? 'text-[#334155]' : 'text-[#94a3b8]'}`}
                    value={form.time}
                    onChange={(e) => setField('time', e.target.value)}
                  >
                    <option value="">Select a time</option>
                    {times.map((t) => (
                      <option key={t} value={t} className="text-[#334155]">
                        {t}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8]"
                  />
                </div>
                <ErrorText>{errors.time}</ErrorText>
              </label>
            </div>

            <label className="mt-4 block">
              <Label required>Address</Label>
              <textarea
                rows={2}
                className={`h-[64px] w-full resize-y rounded-xl bg-white px-4 py-3 text-[13px] leading-5 text-[#334155] placeholder:text-[#94a3b8] outline-none transition ${
                  errors.address
                    ? 'border border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                    : 'border border-[#e2e8f0] focus:border-[#2563eb]'
                }`}
                value={form.address}
                onChange={(e) => setField('address', e.target.value)}
                placeholder="Street address, city, state, ZIP code"
                autoComplete="street-address"
              />
              <ErrorText>{errors.address}</ErrorText>
            </label>

            <div className="mt-5 flex items-center justify-center gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex h-10 cursor-pointer items-center rounded-full bg-[#2563eb] px-10 text-[14px] font-semibold text-white hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? 'Submitting…' : 'Submit Demo Request'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="cursor-pointer text-[14px] font-semibold text-[#2563eb] hover:text-[#1d4ed8]"
              >
                Cancel
              </button>
            </div>

            <p className="mt-4 flex items-center justify-center gap-1.5 text-[12px] text-[#94a3b8]">
              <Lock size={13} strokeWidth={2} />
              Your information will only be used to arrange your demo.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
