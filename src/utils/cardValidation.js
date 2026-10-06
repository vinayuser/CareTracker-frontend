/** Demo payment card helpers — format + validate only (no real gateway). */

export function digitsOnly(value = '') {
  return String(value).replace(/\D/g, '');
}

/** Format as groups of 4: 1234 5678 9012 3456 */
export function formatCardNumber(value = '') {
  const digits = digitsOnly(value).slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
}

/** Format as MM/YY while typing */
export function formatExpiry(value = '') {
  const digits = digitsOnly(value).slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function formatCvv(value = '') {
  return digitsOnly(value).slice(0, 4);
}

/** Luhn check for card numbers */
export function isValidLuhn(cardNumber = '') {
  const digits = digitsOnly(cardNumber);
  if (digits.length < 13 || digits.length > 19) return false;

  let sum = 0;
  let alternate = false;
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let n = Number(digits[i]);
    if (alternate) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alternate = !alternate;
  }
  return sum % 10 === 0;
}

export function isValidExpiry(expiry = '') {
  const match = String(expiry).trim().match(/^(\d{2})\s*\/\s*(\d{2})$/);
  if (!match) return false;

  const month = Number(match[1]);
  const year = Number(match[2]);
  if (month < 1 || month > 12) return false;

  const now = new Date();
  const currentYear = now.getFullYear() % 100;
  const currentMonth = now.getMonth() + 1;

  if (year < currentYear) return false;
  if (year === currentYear && month < currentMonth) return false;
  return true;
}

export function isValidCvv(cvv = '', cardNumber = '') {
  const digits = digitsOnly(cvv);
  const cardDigits = digitsOnly(cardNumber);
  // Amex (34/37) uses 4-digit CVV; others use 3
  const amex = /^3[47]/.test(cardDigits);
  if (amex) return digits.length === 4;
  return digits.length === 3;
}

export function validatePaymentCard({
  nameOnCard = '',
  cardNumber = '',
  expiry = '',
  cvv = '',
} = {}) {
  const errors = {};

  if (!String(nameOnCard).trim()) {
    errors.nameOnCard = 'Name on card is required';
  } else if (String(nameOnCard).trim().length < 2) {
    errors.nameOnCard = 'Enter the full name on the card';
  }

  const numberDigits = digitsOnly(cardNumber);
  if (!numberDigits) {
    errors.cardNumber = 'Card number is required';
  } else if (numberDigits.length < 13 || numberDigits.length > 16) {
    errors.cardNumber = 'Enter a valid 13–16 digit card number';
  } else if (!isValidLuhn(numberDigits)) {
    errors.cardNumber = 'Card number is invalid';
  }

  if (!String(expiry).trim()) {
    errors.expiry = 'Expiry date is required';
  } else if (!isValidExpiry(expiry)) {
    errors.expiry = 'Enter a valid future expiry (MM/YY)';
  }

  if (!digitsOnly(cvv)) {
    errors.cvv = 'CVV is required';
  } else if (!isValidCvv(cvv, cardNumber)) {
    errors.cvv = /^3[47]/.test(numberDigits)
      ? 'Amex CVV must be 4 digits'
      : 'CVV must be 3 digits';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
