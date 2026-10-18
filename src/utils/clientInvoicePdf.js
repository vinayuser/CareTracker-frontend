import { jsPDF } from 'jspdf';

function money(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value || 0));
}

function formatLongDate(value) {
  if (!value) return '—';
  const raw = String(value);
  const d = raw.includes('T') || raw.includes(' ')
    ? new Date(raw)
    : new Date(`${raw.slice(0, 10)}T12:00:00`);
  if (Number.isNaN(d.getTime())) return raw;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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

export async function downloadClientInvoicePdf(invoice) {
  if (!invoice) throw new Error('Invoice data is required');
  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;
  let y = margin;

  const logo = await loadLogoDataUrl();
  if (logo) {
    try {
      doc.addImage(logo, 'PNG', margin, y - 4, 120, 36);
    } catch {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(0, 85, 212);
      doc.text('CareTraker', margin, y + 18);
    }
  } else {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(0, 85, 212);
    doc.text('CareTraker', margin, y + 18);
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(15, 23, 42);
  doc.text('INVOICE', pageWidth - margin, y + 18, { align: 'right' });
  y += 48;
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y, pageWidth - margin, y);
  y += 20;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('From', margin, y);
  doc.text('Bill to', pageWidth / 2, y);
  y += 14;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  const fromLines = [invoice.agencyName || 'Agency', invoice.agencyAddress, invoice.agencyPhone, invoice.agencyEmail].filter(Boolean);
  const toLines = [invoice.clientName || 'Client', invoice.clientCode ? `ID ${invoice.clientCode}` : '', invoice.clientAddress, invoice.clientPhone, invoice.clientEmail].filter(Boolean);
  const meta = [
    `Invoice #: ${invoice.invoiceCode || '—'}`,
    `Period: ${invoice.periodFrom || '—'} – ${invoice.periodTo || '—'}`,
    `Due date: ${formatLongDate(invoice.dueDate)}`,
    `Status: ${invoice.status || '—'}`,
  ];
  const rows = Math.max(fromLines.length, toLines.length);
  fromLines.forEach((line, i) => doc.text(String(line), margin, y + i * 13));
  toLines.forEach((line, i) => doc.text(String(line), pageWidth / 2, y + i * 13));
  y += rows * 13 + 16;
  meta.forEach((line) => {
    doc.text(line, margin, y);
    y += 14;
  });
  y += 8;

  const cols = [margin, margin + 70, margin + 170, margin + 280, margin + 380, pageWidth - margin];
  const headers = ['Date', 'Service', 'Caregiver', 'Hours', 'Amount'];
  doc.setFillColor(248, 250, 252);
  doc.rect(margin, y, pageWidth - margin * 2, 20, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  headers.forEach((h, i) => doc.text(h, cols[i] + 4, y + 13));
  y += 26;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);

  (invoice.lines || []).forEach((line) => {
    if (y > 720) {
      doc.addPage();
      y = margin;
    }
    const cells = [
      formatLongDate(line.date),
      String(line.serviceArea || 'Service').slice(0, 22),
      String(line.caregiverName || '—').slice(0, 18),
      `${Number(line.billableHours || 0).toFixed(2)}h`,
      money(line.amount),
    ];
    cells.forEach((cell, i) => doc.text(cell, cols[i] + 4, y));
    y += 16;
  });

  y += 10;
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y, pageWidth - margin, y);
  y += 20;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(0, 85, 212);
  doc.text('Total due', margin, y);
  doc.text(money(invoice.total), pageWidth - margin, y, { align: 'right' });
  y += 28;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Payment is due by ${formatLongDate(invoice.dueDate)}.`, margin, y);

  doc.save(`${invoice.invoiceCode || 'invoice'}.pdf`);
}
