import Swal from 'sweetalert2';

const PRIMARY = '#0055d4';
const DANGER = '#dc2626';
const CANCEL = '#6b7280';

export async function confirmAlert({
  title = 'Are you sure?',
  text = '',
  html = '',
  confirmText = 'OK',
  cancelText = 'Cancel',
  icon = 'warning',
  danger = false,
} = {}) {
  const result = await Swal.fire({
    title,
    text: html ? undefined : text,
    html: html || undefined,
    icon,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    confirmButtonColor: danger ? DANGER : PRIMARY,
    cancelButtonColor: CANCEL,
    reverseButtons: true,
    focusCancel: true,
    customClass: {
      popup: 'rounded-2xl',
      title: 'text-lg font-semibold text-gray-900',
      htmlContainer: 'text-sm text-gray-600',
    },
  });

  return result.isConfirmed;
}

/**
 * Three-way choice: confirm / deny / cancel.
 * @returns {'confirm' | 'deny' | null}
 */
export async function chooseAlert({
  title = 'Choose an option',
  text = '',
  html = '',
  confirmText = 'Option A',
  denyText = 'Option B',
  cancelText = 'Cancel',
  icon = 'question',
  dangerConfirm = false,
  dangerDeny = true,
} = {}) {
  const result = await Swal.fire({
    title,
    text: html ? undefined : text,
    html: html || undefined,
    icon,
    showCancelButton: true,
    showDenyButton: true,
    confirmButtonText: confirmText,
    denyButtonText: denyText,
    cancelButtonText: cancelText,
    confirmButtonColor: dangerConfirm ? DANGER : PRIMARY,
    denyButtonColor: dangerDeny ? DANGER : PRIMARY,
    cancelButtonColor: CANCEL,
    reverseButtons: true,
    focusCancel: true,
    customClass: {
      popup: 'rounded-2xl',
      title: 'text-lg font-semibold text-gray-900',
      htmlContainer: 'text-sm text-gray-600',
    },
  });

  if (result.isConfirmed) return 'confirm';
  if (result.isDenied) return 'deny';
  return null;
}

export function showSuccessAlert({ title = 'Success', text = '' } = {}) {
  return Swal.fire({
    title,
    text,
    icon: 'success',
    confirmButtonColor: PRIMARY,
    customClass: { popup: 'rounded-2xl' },
  });
}

export function showErrorAlert({ title = 'Error', text = '' } = {}) {
  return Swal.fire({
    title,
    text,
    icon: 'error',
    confirmButtonColor: PRIMARY,
    customClass: { popup: 'rounded-2xl' },
  });
}
