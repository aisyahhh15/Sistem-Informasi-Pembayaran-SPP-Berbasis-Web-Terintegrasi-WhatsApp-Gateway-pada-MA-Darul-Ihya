/**
 * Utility Formatters sesuai UI-GUIDELINE.md MA Darul Ihya
 */

/**
 * Format angka ke format mata uang Rupiah
 * Contoh: 1250000 -> "Rp1.250.000"
 */
export const formatRupiah = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) return 'Rp0';
  const formatted = Math.floor(amount).toLocaleString('id-ID');
  return `Rp${formatted}`;
};

/**
 * Format tanggal ISO ke format Tampilan Indonesia
 * Contoh: "2026-10-09" -> "09 Okt 2026"
 */
export const formatDate = (dateInput) => {
  if (!dateInput) return '-';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return dateInput;

  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

export const getInvoicePaidAmount = (invoice) => invoice.paidAmount ?? (invoice.status === 'paid' ? invoice.amount : 0);

export const getInvoiceBalance = (invoice) => Math.max(0, invoice.amount - getInvoicePaidAmount(invoice));

export const formatPeriod = (month, year) => new Date(year, month - 1, 1).toLocaleDateString('id-ID', {
  month: 'long',
  year: 'numeric',
});

const smallNumbers = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan', 'sepuluh', 'sebelas'];
export const terbilang = (value) => {
  const number = Math.floor(Math.abs(Number(value) || 0));
  if (number === 0) return 'nol';
  if (number < 12) return smallNumbers[number];
  if (number < 20) return `${terbilang(number - 10)} belas`;
  if (number < 100) return `${terbilang(Math.floor(number / 10))} puluh${number % 10 ? ` ${terbilang(number % 10)}` : ''}`;
  if (number < 200) return `seratus${number > 100 ? ` ${terbilang(number - 100)}` : ''}`;
  if (number < 1000) return `${terbilang(Math.floor(number / 100))} ratus${number % 100 ? ` ${terbilang(number % 100)}` : ''}`;
  if (number < 2000) return `seribu${number > 1000 ? ` ${terbilang(number - 1000)}` : ''}`;
  if (number < 1000000) return `${terbilang(Math.floor(number / 1000))} ribu${number % 1000 ? ` ${terbilang(number % 1000)}` : ''}`;
  if (number < 1000000000) return `${terbilang(Math.floor(number / 1000000))} juta${number % 1000000 ? ` ${terbilang(number % 1000000)}` : ''}`;
  return `${terbilang(Math.floor(number / 1000000000))} miliar${number % 1000000000 ? ` ${terbilang(number % 1000000000)}` : ''}`;
};
