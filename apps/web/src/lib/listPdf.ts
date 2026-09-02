import { jsPDF } from 'jspdf';

export interface PdfColumn {
  header: string;
  width?: number;
  accessor: (row: unknown) => string;
}

export function downloadListPdf(title: string, columns: PdfColumn[], rows: unknown[]) {
  const doc = new jsPDF({ unit: 'pt', format: 'letter', orientation: 'landscape' });
  const marginX = 40;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const usableWidth = pageWidth - marginX * 2;
  const colWidth = usableWidth / columns.length;
  let y = 50;

  function drawHeader() {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(title, marginX, y);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120);
    doc.text(`Generado el ${new Date().toLocaleString('es-CL')} — ${rows.length} registro(s)`, marginX, y + 14);
    doc.setTextColor(0);
    y += 32;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    columns.forEach((col, i) => doc.text(col.header, marginX + i * colWidth, y));
    y += 6;
    doc.setDrawColor(180);
    doc.line(marginX, y, pageWidth - marginX, y);
    y += 14;
    doc.setFont('helvetica', 'normal');
  }

  drawHeader();

  for (const row of rows) {
    if (y > pageHeight - 40) {
      doc.addPage();
      y = 50;
      drawHeader();
    }
    columns.forEach((col, i) => {
      const text = col.accessor(row) || '-';
      doc.text(doc.splitTextToSize(text, colWidth - 8), marginX + i * colWidth, y);
    });
    y += 18;
  }

  if (rows.length === 0) {
    doc.setTextColor(120);
    doc.text('Sin registros.', marginX, y);
  }

  const fileName = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.pdf`;
  doc.save(fileName);
}
