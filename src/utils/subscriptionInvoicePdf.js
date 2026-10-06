import { jsPDF } from 'jspdf';

function formatMoney(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(value || 0));
}

function formatLongDate(value) {
  if (!value) return '—';
  const raw = String(value);
  const d = raw.includes('T') || raw.includes(' ')
    ? new Date(raw)
    : new Date(`${raw.slice(0, 10)}T12:00:00`);
  if (Number.isNaN(d.getTime())) return raw;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function agencyAddressLines(invoice = {}) {
  const lines = [];
  if (invoice.agencyAddress) lines.push(invoice.agencyAddress);
  const cityState = [invoice.agencyCity, invoice.agencyState].filter(Boolean).join(', ');
  if (cityState) lines.push(cityState);
  if (invoice.agencyEmail) lines.push(invoice.agencyEmail);
  if (invoice.agencyPhone) lines.push(invoice.agencyPhone);
  return lines;
}

async function loadLogoDataUrl() {
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}caretracker-logo.png`);
    if (!response.ok) return null;
    const blob = await response.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

/**
 * Build and download a CareTracker subscription invoice PDF (with platform logo).
 * @param {object} invoice - subscription invoice payload
 */
export async function downloadSubscriptionInvoicePdf(invoice) {
  if (!invoice) throw new Error('Invoice data is required');

  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 48;
  let y = margin;

  const logo = await loadLogoDataUrl();
  if (logo) {
    try {
      doc.addImage(logo, 'PNG', margin, y - 4, 120, 36);
    } catch {
      // fall through to text brand
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(0, 85, 212);
      doc.text('CareTraker', margin, y + 18);
    }
  } else {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(0, 85, 212);
    doc.text('CareTraker', margin, y + 18);
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(15, 23, 42);
  doc.text('INVOICE', pageWidth - margin, y + 18, { align: 'right' });

  y += 52;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(1);
  doc.line(margin, y, pageWidth - margin, y);
  y += 24;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('Bill To', margin, y);
  doc.text('Invoice Details', pageWidth / 2 + 12, y);
  y += 16;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);

  const leftLines = [
    invoice.agencyName || 'Agency',
    ...agencyAddressLines(invoice),
  ];
  leftLines.forEach((line, index) => {
    doc.text(String(line), margin, y + index * 14);
  });

  const rightLines = [
    `Invoice #: ${invoice.invoiceCode || '—'}`,
    `Invoice Date: ${formatLongDate(invoice.invoiceDate)}`,
    `Due Date: ${formatLongDate(invoice.dueDate)}`,
    `Status: ${invoice.status || '—'}`,
  ];
  if (invoice.transactionId) {
    rightLines.push(`Transaction: ${invoice.transactionId}`);
  }
  rightLines.forEach((line, index) => {
    doc.text(String(line), pageWidth / 2 + 12, y + index * 14);
  });

  y += Math.max(leftLines.length, rightLines.length) * 14 + 28;

  // Table header
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 28, 4, 4, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text('Description', margin + 12, y + 18);
  doc.text('Amount', pageWidth - margin - 12, y + 18, { align: 'right' });
  y += 40;

  const cycle = invoice.billingCycle
    ? String(invoice.billingCycle).charAt(0).toUpperCase() + String(invoice.billingCycle).slice(1)
    : 'Subscription';
  const planLabel = invoice.planName
    ? `${invoice.planName} (${cycle})`
    : `${cycle} subscription`;

  const rows = [
    { label: planLabel, amount: invoice.planAmount },
  ];
  if (Number(invoice.addOnAmount || 0) > 0) {
    rows.push({ label: 'Add-ons', amount: invoice.addOnAmount });
  }
  const taxPercent = Number(invoice.taxRate || 0) * 100;
  if (Number(invoice.taxAmount || 0) > 0 || taxPercent > 0) {
    const taxLabel = taxPercent > 0
      ? `Tax (${taxPercent.toFixed(2).replace(/\.00$/, '')}%)`
      : 'Tax';
    rows.push({ label: taxLabel, amount: invoice.taxAmount });
  }

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  rows.forEach((row) => {
    doc.text(row.label, margin + 12, y);
    doc.text(formatMoney(row.amount), pageWidth - margin - 12, y, { align: 'right' });
    y += 20;
  });

  y += 8;
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y, pageWidth - margin, y);
  y += 22;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(0, 85, 212);
  doc.text('Total Due', margin + 12, y);
  doc.text(formatMoney(invoice.total), pageWidth - margin - 12, y, { align: 'right' });

  if (invoice.paidAt) {
    y += 28;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(22, 163, 74);
    doc.text(`Paid on ${formatLongDate(invoice.paidAt)}`, margin + 12, y);
    if (invoice.paymentMethodLabel) {
      doc.setTextColor(100, 116, 139);
      doc.text(invoice.paymentMethodLabel, pageWidth - margin - 12, y, { align: 'right' });
    }
  }

  y = Math.max(y + 48, 680);
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y, pageWidth - margin, y);
  y += 18;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'CareTraker · Home Care Platform · hello@caretraker.com',
    pageWidth / 2,
    y,
    { align: 'center' },
  );
  doc.text(
    'This is a system-generated subscription invoice.',
    pageWidth / 2,
    y + 14,
    { align: 'center' },
  );

  const filename = `${invoice.invoiceCode || 'invoice'}.pdf`;
  doc.save(filename);
  return filename;
}
