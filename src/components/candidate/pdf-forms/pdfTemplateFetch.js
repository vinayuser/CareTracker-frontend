export async function fetchPdfTemplateBytes(pdfUrl) {
  if (!pdfUrl) {
    throw new Error('PDF template URL is missing. Please contact your agency.');
  }
  const response = await fetch(pdfUrl);
  if (!response.ok) {
    throw new Error(`Could not load form template (HTTP ${response.status})`);
  }
  const bytes = await response.arrayBuffer();
  const header = new TextDecoder().decode(bytes.slice(0, 5));
  if (!header.startsWith('%PDF')) {
    throw new Error('Form template is not a valid PDF. Please contact your agency.');
  }
  return bytes;
}
