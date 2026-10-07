/** Max size for user-uploaded images across the platform */
export const MAX_IMAGE_UPLOAD_BYTES = 1 * 1024 * 1024; // 1 MB

export const MAX_IMAGE_UPLOAD_LABEL = '1 MB';

export const IMAGE_UPLOAD_HINT = `JPG, PNG, WEBP, or GIF — max ${MAX_IMAGE_UPLOAD_LABEL}`;

export function isImageFile(file) {
  if (!file) return false;
  if (file.type && String(file.type).startsWith('image/')) return true;
  const name = String(file.name || '').toLowerCase();
  return /\.(jpe?g|png|gif|webp|heic|bmp|svg)$/i.test(name);
}

/**
 * @param {File|Blob|null|undefined} file
 * @param {{ required?: boolean }} [options]
 * @returns {string} Error message, or empty string when valid
 */
export function getImageUploadError(file, { required = false } = {}) {
  if (!file) {
    return required ? 'Please choose an image to upload' : '';
  }
  if (!isImageFile(file)) {
    return 'Please choose an image file (JPG, PNG, WEBP, or GIF)';
  }
  if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
    return `Image must be ${MAX_IMAGE_UPLOAD_LABEL} or smaller`;
  }
  return '';
}

/**
 * Validate an image file. Returns `{ ok, error }`.
 * Non-image files return ok:true when `imagesOnly` is false (for mixed document pickers).
 */
export function validateImageUpload(file, { imagesOnly = true, required = false } = {}) {
  if (!file) {
    return {
      ok: !required,
      error: required ? 'Please choose a file to upload' : '',
    };
  }
  if (!isImageFile(file)) {
    if (imagesOnly) {
      return { ok: false, error: 'Please choose an image file (JPG, PNG, WEBP, or GIF)' };
    }
    return { ok: true, error: '' };
  }
  if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
    return {
      ok: false,
      error: `Image must be ${MAX_IMAGE_UPLOAD_LABEL} or smaller`,
    };
  }
  return { ok: true, error: '' };
}
