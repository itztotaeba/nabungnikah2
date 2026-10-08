import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BudgetItem, WeddingSettings, Guest } from '../types';
import { formatCurrency } from '../helpers';

// Warna Sage Green untuk header tabel
const SAGE_GREEN: [number, number, number] = [135, 168, 120]; // #87A878
const SAGE_GREEN_LIGHT: [number, number, number] = [168, 196, 154]; // #A8C49A

/**
 * Helper untuk membuat cover page
 */
function createCoverPage(
  doc: jsPDF,
  title: string,
  weddingDate: string,
  currency: string
): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Background gradient effect (rectangle dengan warna)
  doc.setFillColor(SAGE_GREEN[0], SAGE_GREEN[1], SAGE_GREEN[2]);
  doc.rect(0, 0, pageWidth, 80, 'F');

  // Judul
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(title, pageWidth / 2, 45, { align: 'center' });

  // Subtitle
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Mahes&Aira Wedding Plan', pageWidth / 2, 60, { align: 'center' });

  // Reset warna teks
  doc.setTextColor(0, 0, 0);

  // Info box
  const boxY = 100;
  const boxHeight = 60;
  doc.setFillColor(245, 240, 232); // #F5F0E8
  doc.roundedRect(20, boxY, pageWidth - 40, boxHeight, 3, 3, 'F');

  // Tanggal Pernikahan
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Tanggal Pernikahan:', 30, boxY + 20);
  doc.setFont('helvetica', 'bold');
  if (weddingDate) {
    const date = new Date(weddingDate);
    const formattedDate = date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    doc.text(formattedDate, 30, boxY + 30);
  } else {
    doc.text('Belum diatur', 30, boxY + 30);
  }

  // Tanggal Cetak
  doc.setFont('helvetica', 'normal');
  doc.text('Tanggal Cetak:', 30, boxY + 45);
  doc.setFont('helvetica', 'bold');
  const today = new Date();
  const formattedToday = today.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  doc.text(formattedToday, 30, boxY + 55);

  // Footer
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(128, 128, 128);
  doc.text('Dokumen ini digenerate otomatis untuk Mahes & Aira', pageWidth / 2, pageHeight - 20, {
    align: 'center',
  });
}

/**
 * Generate PDF untuk Laporan Anggaran
 */
export function generateBudgetPDF(
  items: BudgetItem[],
  settings: WeddingSettings
): void {
  if (items.length === 0) {
    throw new Error('Data anggaran kosong');
  }

  const doc = new jsPDF();
  const currency = settings.currency || 'IDR';

  // Halaman 1: Cover
  createCoverPage(doc, 'Laporan Anggaran Pernikahan', settings.weddingDate, currency);

  // Halaman 2: Tabel Anggaran
  doc.addPage();

  // Judul halaman
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Rincian Anggaran', 14, 20);

  // Siapkan data tabel
  const tableColumn = ['Kategori', 'Nama Item', 'Estimasi', 'Aktual', 'Selisih', 'Status'];
  const tableRows: string[][] = [];

  let totalEstimasi = 0;
  let totalAktual = 0;

  items.forEach((item) => {
    const selisih = item.estimatedCost - item.actualCost;
    totalEstimasi += item.estimatedCost;
    totalAktual += item.actualCost;

    tableRows.push([
      item.category,
      item.itemName,
      formatCurrency(item.estimatedCost, currency),
      formatCurrency(item.actualCost, currency),
      formatCurrency(Math.abs(selisih), currency) + (selisih >= 0 ? ' (sisa)' : ' (lebih)'),
      item.status,
    ]);
  });

  // Tambahkan baris GRAND TOTAL
  tableRows.push([
    'GRAND TOTAL',
    '',
    formatCurrency(totalEstimasi, currency),
    formatCurrency(totalAktual, currency),
    '',
    '',
  ]);

  // Generate tabel
  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 30,
    margin: { left: 14, right: 14 },
    styles: {
      fontSize: 9,
      cellPadding: 3,
      lineColor: [200, 200, 200],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: SAGE_GREEN,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10,
    },
    footStyles: {
      fillColor: SAGE_GREEN_LIGHT,
      textColor: [0, 0, 0],
      fontStyle: 'bold',
    },
    // Styling untuk baris GRAND TOTAL (baris terakhir)
    didDrawCell: (data) => {
      if (data.section === 'body' && data.row.index === tableRows.length - 1) {
        doc.setFillColor(SAGE_GREEN_LIGHT[0], SAGE_GREEN_LIGHT[1], SAGE_GREEN_LIGHT[2]);
        doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
        doc.setFont('helvetica', 'bold');
      }
    },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 45 },
      2: { cellWidth: 30, halign: 'right' },
      3: { cellWidth: 30, halign: 'right' },
      4: { cellWidth: 30, halign: 'right' },
      5: { cellWidth: 20, halign: 'center' },
    },
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Halaman ${i} dari ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // Download file
  const today = new Date().toISOString().split('T')[0];
  doc.save(`Laporan-Anggaran-${today}.pdf`);
}

/**
 * Generate PDF untuk Daftar Tamu
 */
export function generateGuestPDF(
  guests: Guest[],
  settings: WeddingSettings
): void {
  if (guests.length === 0) {
    throw new Error('Data tamu kosong');
  }

  const doc = new jsPDF();
  const currency = settings.currency || 'IDR';

  // Halaman 1: Cover
  createCoverPage(doc, 'Daftar Tamu Undangan', settings.weddingDate, currency);

  // Halaman 2: Tabel Tamu
  doc.addPage();

  // Judul halaman
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Daftar Tamu', 14, 20);

  // Siapkan data tabel
  const tableColumn = ['Nama', 'Kategori', 'Pax', 'Circle', 'Status RSVP'];
  const tableRows: string[][] = [];

  let totalPax = 0;
  let totalCircle = 0;

  guests.forEach((guest) => {
    totalPax += guest.pax;
    if (guest.circle) totalCircle++;

    tableRows.push([
      guest.name,
      guest.category,
      guest.pax.toString(),
      guest.circle || '-',
      guest.rsvpStatus,
    ]);
  });

  // Tambahkan baris TOTAL
  tableRows.push([
    'TOTAL',
    '',
    totalPax.toString() + ' pax',
    totalCircle.toString() + ' circle',
    '',
  ]);

  // Generate tabel
  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 30,
    margin: { left: 14, right: 14 },
    styles: {
      fontSize: 9,
      cellPadding: 3,
      lineColor: [200, 200, 200],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: SAGE_GREEN,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10,
    },
    // Styling untuk baris TOTAL (baris terakhir)
    didDrawCell: (data) => {
      if (data.section === 'body' && data.row.index === tableRows.length - 1) {
        doc.setFillColor(SAGE_GREEN_LIGHT[0], SAGE_GREEN_LIGHT[1], SAGE_GREEN_LIGHT[2]);
        doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
        doc.setFont('helvetica', 'bold');
      }
    },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 35 },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 35, halign: 'right' },
      4: { cellWidth: 30, halign: 'center' },
    },
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Halaman ${i} dari ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // Download file
  const today = new Date().toISOString().split('T')[0];
  doc.save(`Daftar-Tamu-${today}.pdf`);
}

/**
 * Generate PDF Laporan Lengkap (Gabungan Anggaran + Tamu)
 */
export function generateFullReport(
  budgetItems: BudgetItem[],
  guests: Guest[],
  settings: WeddingSettings
): void {
  if (budgetItems.length === 0 && guests.length === 0) {
    throw new Error('Data kosong');
  }

  const doc = new jsPDF();
  const currency = settings.currency || 'IDR';

  // Halaman 1: Cover
  createCoverPage(doc, 'Laporan Perencanaan Pernikahan', settings.weddingDate, currency);

  // ============================================
  // BAGIAN 1: ANGGARAN
  // ============================================
  if (budgetItems.length > 0) {
    doc.addPage();

    // Judul section
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Rincian Anggaran', 14, 20);

    // Siapkan data tabel
    const tableColumn = ['Kategori', 'Nama Item', 'Estimasi', 'Aktual', 'Selisih', 'Status'];
    const tableRows: string[][] = [];

    let totalEstimasi = 0;
    let totalAktual = 0;

    budgetItems.forEach((item) => {
      const selisih = item.estimatedCost - item.actualCost;
      totalEstimasi += item.estimatedCost;
      totalAktual += item.actualCost;

      tableRows.push([
        item.category,
        item.itemName,
        formatCurrency(item.estimatedCost, currency),
        formatCurrency(item.actualCost, currency),
        formatCurrency(Math.abs(selisih), currency) + (selisih >= 0 ? ' (sisa)' : ' (lebih)'),
        item.status,
      ]);
    });

    // Tambahkan baris GRAND TOTAL
    tableRows.push([
      'GRAND TOTAL',
      '',
      formatCurrency(totalEstimasi, currency),
      formatCurrency(totalAktual, currency),
      '',
      '',
    ]);

    // Generate tabel
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      margin: { left: 14, right: 14 },
      styles: {
        fontSize: 9,
        cellPadding: 3,
        lineColor: [200, 200, 200],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: SAGE_GREEN,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10,
      },
      didDrawCell: (data) => {
        if (data.section === 'body' && data.row.index === tableRows.length - 1) {
          doc.setFillColor(SAGE_GREEN_LIGHT[0], SAGE_GREEN_LIGHT[1], SAGE_GREEN_LIGHT[2]);
          doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
          doc.setFont('helvetica', 'bold');
        }
      },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 45 },
        2: { cellWidth: 30, halign: 'right' },
        3: { cellWidth: 30, halign: 'right' },
        4: { cellWidth: 30, halign: 'right' },
        5: { cellWidth: 20, halign: 'center' },
      },
    });
  }

  // ============================================
  // BAGIAN 2: DAFTAR TAMU
  // ============================================
  if (guests.length > 0) {
    doc.addPage();

    // Judul section
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Daftar Tamu', 14, 20);

    // Siapkan data tabel
    const tableColumn = ['Nama', 'Kategori', 'Pax', 'Circle', 'Status RSVP'];
    const tableRows: string[][] = [];

    let totalPax = 0;
    let totalCircle = 0;

    guests.forEach((guest) => {
      totalPax += guest.pax;
      if (guest.circle) totalCircle++;

      tableRows.push([
        guest.name,
        guest.category,
        guest.pax.toString(),
        guest.circle || '-',
        guest.rsvpStatus,
      ]);
    });

    // Tambahkan baris TOTAL
    tableRows.push([
      'TOTAL',
      '',
      totalPax.toString() + ' pax',
      totalCircle.toString() + ' circle',
      '',
    ]);

    // Generate tabel
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      margin: { left: 14, right: 14 },
      styles: {
        fontSize: 9,
        cellPadding: 3,
        lineColor: [200, 200, 200],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: SAGE_GREEN,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10,
      },
      didDrawCell: (data) => {
        if (data.section === 'body' && data.row.index === tableRows.length - 1) {
          doc.setFillColor(SAGE_GREEN_LIGHT[0], SAGE_GREEN_LIGHT[1], SAGE_GREEN_LIGHT[2]);
          doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
          doc.setFont('helvetica', 'bold');
        }
      },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 35 },
        2: { cellWidth: 20, halign: 'center' },
        3: { cellWidth: 35, halign: 'right' },
        4: { cellWidth: 30, halign: 'center' },
      },
    });
  }

  // Footer (nomor halaman)
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Halaman ${i} dari ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // Download file
  const today = new Date().toISOString().split('T')[0];
  doc.save(`Laporan-Pernikahan-${today}.pdf`);
}
