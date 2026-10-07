/**
 * PDF signature fields should only show drawn images — never placeholder text like "Signed".
 */

export function clearPdfSignatureTextFields(form, fieldNames = []) {
  fieldNames.forEach((fieldName) => {
    try {
      const field = form.getTextField(fieldName);
      if (field) field.setText('');
    } catch {
      // ignore missing fields
    }
  });
}

/** Remove legacy "Signed" markers from saved draft / form_data. */
export function stripSignedSignaturePlaceholders(data, signatureKeys = []) {
  if (!data || typeof data !== 'object') return data;
  const next = { ...data };
  signatureKeys.forEach((key) => {
    if (next[key] === 'Signed') next[key] = '';
  });
  return next;
}
