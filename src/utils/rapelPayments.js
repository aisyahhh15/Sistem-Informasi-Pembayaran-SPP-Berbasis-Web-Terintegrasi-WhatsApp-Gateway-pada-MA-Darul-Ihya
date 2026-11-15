import { getInvoiceBalance, getInvoicePaidAmount } from './formatters.js';

export function applyRapelPayments(current, { payments, date, method = 'Tunai', recordedBy = 'Petugas demo' }) {
  const parsedDate = new Date(`${date}T00:00:00`);
  if (!Array.isArray(payments) || !payments.length || Number.isNaN(parsedDate.getTime())) return null;
  const invoiceIds = payments.map((payment) => payment.invoiceId);
  if (new Set(invoiceIds).size !== invoiceIds.length) return null;
  const invoices = invoiceIds.map((id) => current.invoices.find((invoice) => invoice.id === id));
  if (invoices.some((invoice, index) => !invoice || invoice.studentId !== invoices[0]?.studentId
    || !Number.isInteger(payments[index].amount) || payments[index].amount <= 0
    || payments[index].amount > getInvoiceBalance(invoice))) return null;
  const ids = payments.map(() => `TRX-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`);
  const byInvoice = new Map(payments.map((payment, index) => [payment.invoiceId, { ...payment, id: ids[index] }]));
  const nextData = {
    ...current,
    invoices: current.invoices.map((invoice) => {
      const payment = byInvoice.get(invoice.id);
      if (!payment) return invoice;
      const paidAmount = getInvoicePaidAmount(invoice) + payment.amount;
      return { ...invoice, paidAmount, status: paidAmount >= invoice.amount ? 'paid' : 'partial' };
    }),
    transactions: [...current.transactions, ...payments.map((payment, index) => {
      const invoice = invoices[index];
      const paidAmount = getInvoicePaidAmount(invoice) + payment.amount;
      return {
        id: ids[index], invoiceId: invoice.id, studentId: invoice.studentId,
        amount: payment.amount, date, status: 'Berhasil', method,
        balanceAfter: Math.max(0, invoice.amount - paidAmount), recordedBy,
        ...(payments.length > 1 ? { batchId: ids[0] } : {}),
      };
    })],
  };
  return { data: nextData, transactionIds: ids };
}
