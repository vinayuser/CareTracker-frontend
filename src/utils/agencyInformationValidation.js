/** Registration / agency information field helpers */

export const digitsOnly = (value = '') => String(value).replace(/\D/g, '');

/** Format as US phone: (XXX) XXX-XXXX */
export const formatUsPhone = (value = '') => {
  const digits = digitsOnly(value).slice(0, 10);
  if (digits.length === 0) return '';
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
};

export const isValidUsPhone = (value = '') => digitsOnly(value).length === 10;

export const isValidEmail = (value = '') =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(String(value).trim());

/** Allow empty, or http(s) URL / domain-like value */
export const isValidWebsite = (value = '') => {
  const raw = String(value).trim();
  if (!raw) return true;
  try {
    const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    const url = new URL(withProtocol);
    return Boolean(url.hostname) && url.hostname.includes('.');
  } catch {
    return false;
  }
};

export const normalizeWebsite = (value = '') => {
  const raw = String(value).trim();
  if (!raw) return '';
  if (/^https?:\/\//i.test(raw)) return raw;
  return `https://${raw}`;
};

const currentYear = () => new Date().getFullYear();

export const validateAgencyInformation = (form = {}) => {
  const errors = {};
  const agencyName = String(form.agencyName || '').trim();
  const agencyType = String(form.agencyType || '').trim();
  const email = String(form.email || '').trim();
  const phone = String(form.phone || '').trim();
  const website = String(form.website || '').trim();
  const address = String(form.address || '').trim();
  const description = String(form.description || '').trim();
  const yearRaw = String(form.yearEstablished || '').trim();

  if (!agencyName) errors.agencyName = 'Agency name is required';
  else if (agencyName.length < 2) errors.agencyName = 'Enter at least 2 characters';
  else if (agencyName.length > 120) errors.agencyName = 'Agency name is too long';

  if (!agencyType) errors.agencyType = 'Select an agency type';

  if (yearRaw) {
    const year = Number(yearRaw);
    if (!/^\d{4}$/.test(yearRaw) || Number.isNaN(year)) {
      errors.yearEstablished = 'Enter a valid 4-digit year';
    } else if (year < 1900 || year > currentYear()) {
      errors.yearEstablished = `Year must be between 1900 and ${currentYear()}`;
    }
  }

  if (!email) errors.email = 'Email is required';
  else if (!isValidEmail(email)) errors.email = 'Enter a valid email address';

  if (!phone) errors.phone = 'Phone number is required';
  else if (!isValidUsPhone(phone)) errors.phone = 'Enter a valid US phone number: (555) 123-4567';

  if (website && !isValidWebsite(website)) {
    errors.website = 'Enter a valid website (e.g. https://www.example.com)';
  }

  if (!address) errors.address = 'Address is required';
  else if (address.length < 8) errors.address = 'Enter a full street address';

  if (!description) errors.description = 'Agency description is required';
  else if (description.length < 20) {
    errors.description = 'Please add a bit more detail (at least 20 characters)';
  } else if (description.length > 2000) {
    errors.description = 'Description is too long (max 2000 characters)';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};
