import React, { useMemo, useState } from 'react';
import { CheckCircle2, ReceiptText } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import PaymentReceipt from '../components/ui/PaymentReceipt';
import { useData } from '../app/DataProvider';
import { formatDate, formatPeriod, formatRupiah, getInvoiceBalance, getInvoicePaidAmount } from '../utils/formatters';

export default function Payments() {
  const { data, adminProfile, recordPayment, sendWhatsAppSimulation } = useData();
  const [studentId, setStudentId] = useState(() => data.invoices.find((invoice) => getInvoiceBalance(invoice) > 0)?.studentId || '');
  const [invoiceId, setInvoiceId] = useState(() => data.invoices.find((invoice) => getInvoiceBalance(invoice) > 0)?.id || '');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('2026-10-19');
  const [method, setMethod] = useState(adminProfile.defaultPaymentMethod || 'Tunai');
  const [confirmation, setConfirmation] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [receipt, setReceipt] = useState(null);
  const studentById = useMemo(() => Object.fromEntries(data.students.map((student) => [student.id, student])), [data.students]);
  const classById = useMemo(() => Object.fromEntries(data.classes.map((klass) => [klass.id, klass.name])), [data.classes]);
  const invoicesForStudent = data.invoices.filter((invoice) => invoice.studentId === studentId && getInvoiceBalance(invoice) > 0);
  const selectedInvoice = invoicesForStudent.find((invoice) => invoice.id === invoiceId) || invoicesForStudent[0];
  const balance = selectedInvoice ? getInvoiceBalance(selectedInvoice) : 0;
  const selectedStudent = studentById[studentId];

  const chooseStudent = (nextStudentId) => {
    setStudentId(nextStudentId);
    const nextInvoice = data.invoices.find((invoice) => invoice.studentId === nextStudentId && getInvoiceBalance(invoice) > 0);
    setInvoiceId(nextInvoice?.id || '');
    setAmount('');
    setConfirmation(false);
    setFeedback('');
  };
  const chooseInvoice = (nextInvoiceId) => {
    setInvoiceId(nextInvoiceId);
    setAmount('');
    setConfirmation(false);
    setFeedback('');
  };
  const handleSubmit = (event) => {
    event.preventDefault();
    const numericAmount = Number(amount);
    if (!selectedInvoice) { setFeedback('Pilih siswa dengan tagihan yang belum lunas.'); return; }
    if (!Number.isInteger(numericAmount) || numericAmount <= 0) { setFeedback('Jumlah pembayaran harus berupa bilangan Rupiah positif.'); return; }
    if (numericAmount > balance) { setFeedback(`Jumlah pembayaran melebihi sisa tagihan ${formatRupiah(balance)}.`); return; }
    setFeedback('');
    setConfirmation(true);
  };
  const confirmPayment = () => {
    if (!selectedInvoice) return;
    const numericAmount = Number(amount);
    const transactionId = recordPayment({ invoiceId: selectedInvoice.id, amount: numericAmount, date, method });
    if (!transactionId) { setConfirmation(false); setFeedback('Pembayaran tidak tersimpan. Tagihan mungkin sudah berubah; periksa kembali sisa tagihan.'); return; }
    const paidAmount = getInvoicePaidAmount(selectedInvoice) + numericAmount;
    const updatedInvoice = { ...selectedInvoice, paidAmount, status: paidAmount >= selectedInvoice.amount ? 'paid' : 'partial' };
    const transaction = { id: transactionId, invoiceId: selectedInvoice.id, studentId, amount: numericAmount, date, method, status: 'Berhasil', balanceAfter: Math.max(0, selectedInvoice.amount - paidAmount) };
    const confirmationTemplate = data.waTemplates.find((item) => item.id === 'wa-confirmation');
    if (confirmationTemplate && selectedStudent?.parentWhatsapp) {
      const values = { nama: selectedStudent.name, periode: formatPeriod(selectedInvoice.month, selectedInvoice.year), nominal: formatRupiah(numericAmount), sisa: formatRupiah(transaction.balanceAfter) };
      const body = confirmationTemplate.body.replace(/\{(nama|periode|nominal|sisa)\}/g, (_, key) => values[key]);
      sendWhatsAppSimulation({ studentId, templateId: confirmationTemplate.id, templateName: confirmationTemplate.name, recipient: selectedStudent.parentWhatsapp, body });
    }
    setReceipt({ transaction, invoice: updatedInvoice, student: selectedStudent, className: classById[selectedStudent?.classId] });
    setConfirmation(false);
    setFeedback(`Pembayaran tersimpan. Notifikasi WhatsApp Terkirim (Simulasi) dicatat. Nomor transaksi ${transactionId}.`);
    setAmount('');
  };

  return (
    <div>
      <PageHeader title="Transaksi Pembayaran SPP" description="Catat pembayaran dan perbarui status tagihan secara langsung." />
      {feedback && <p className="inline-feedback" role="status">{feedback}</p>}
      <div className="payment-layout">
        <section className="content-card payment-form-card">
          <div className="payment-card-heading"><ReceiptText size={19} color="var(--primary-600)" /><div><h3>Input Pembayaran</h3><p>Isi data transaksi, lalu tinjau sebelum disimpan.</p></div></div>
          <form className="payment-form" onSubmit={handleSubmit}>
            <div className="field"><label htmlFor="payment-student">Siswa</label>
              <select id="payment-student" value={studentId} onChange={(event) => chooseStudent(event.target.value)} required>
                {data.students.map((student) => <option key={student.id} value={student.id}>{student.nis} · {student.name}</option>)}
              </select>
              {selectedStudent && <span className="field-help">Kelas: {classById[selectedStudent.classId] || '-'} · WhatsApp orang tua (fiktif): {selectedStudent.parentWhatsapp}</span>}
            </div>
            <div className="field"><label htmlFor="payment-period">Periode tagihan</label>
              <select id="payment-period" value={selectedInvoice?.id || ''} onChange={(event) => chooseInvoice(event.target.value)} required disabled={!invoicesForStudent.length}>
                {invoicesForStudent.map((invoice) => <option value={invoice.id} key={invoice.id}>{formatPeriod(invoice.month, invoice.year)} · Sisa {formatRupiah(getInvoiceBalance(invoice))}</option>)}
                {!invoicesForStudent.length && <option value="">Tidak ada tagihan terbuka</option>}
              </select>
            </div>
            <div className="payment-field-grid">
              <div className="field"><label htmlFor="payment-amount">Jumlah pembayaran</label>
                <input id="payment-amount" type="number" min="1" max={balance || undefined} step="1" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder={balance ? String(balance) : 'Tidak ada tagihan'} required disabled={!selectedInvoice} />
                {selectedInvoice && <span className="field-help">Maksimal sisa tagihan {formatRupiah(balance)}.</span>}
              </div>
              <div className="field"><label htmlFor="payment-date">Tanggal pembayaran</label><input id="payment-date" type="date" value={date} onChange={(event) => setDate(event.target.value)} required /></div>
            </div>
            <div className="field"><label htmlFor="payment-method">Metode pembayaran</label><select id="payment-method" value={method} onChange={(event) => setMethod(event.target.value)}><option>Tunai</option><option>Transfer Bank</option><option>QRIS</option></select></div>
            {selectedInvoice && <div className="payment-balance"><span>Nominal tagihan</span><strong>{formatRupiah(selectedInvoice.amount)}</strong><span>Sudah dibayar</span><strong>{formatRupiah(getInvoicePaidAmount(selectedInvoice))}</strong><span>Sisa tagihan</span><strong>{formatRupiah(balance)}</strong></div>}
            <button className="button button-primary" type="submit" disabled={!selectedInvoice}>Tinjau Pembayaran</button>
          </form>
        </section>
        <aside className="content-card payment-note"><h3>Catatan transaksi</h3><ul><li>Tagihan lunas tidak dapat dibayar ulang.</li><li>Pembayaran sebagian diperbolehkan; sisa tagihan tetap tercatat.</li><li>Data pembayaran disimpan di browser dan memicu log WhatsApp Simulasi.</li></ul><div className="status-badge neutral"><CheckCircle2 size={14} /> Simulasi frontend</div></aside>
      </div>
      {confirmation && selectedInvoice && <div className="dialog-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setConfirmation(false)}>
        <section className="entity-dialog" role="dialog" aria-modal="true" aria-labelledby="payment-confirm-title">
          <header className="entity-dialog-header"><h3 id="payment-confirm-title">Konfirmasi Pembayaran</h3><button className="icon-button" onClick={() => setConfirmation(false)} aria-label="Tutup konfirmasi">×</button></header>
          <div className="confirmation-content"><p>Periksa kembali transaksi berikut sebelum disimpan.</p><dl className="detail-list">
            <div className="detail-item"><dt>Siswa</dt><dd>{selectedStudent?.name}</dd></div><div className="detail-item"><dt>Periode</dt><dd>{formatPeriod(selectedInvoice.month, selectedInvoice.year)}</dd></div>
            <div className="detail-item"><dt>Tanggal</dt><dd>{formatDate(date)}</dd></div><div className="detail-item"><dt>Jumlah bayar</dt><dd>{formatRupiah(Number(amount))}</dd></div>
            <div className="detail-item"><dt>Sisa setelah bayar</dt><dd>{formatRupiah(Math.max(0, balance - Number(amount)))}</dd></div><div className="detail-item"><dt>Metode pembayaran</dt><dd>{method}</dd></div>
          </dl><div className="dialog-actions"><button className="button button-secondary" onClick={() => setConfirmation(false)}>Kembali</button><button className="button button-primary" onClick={confirmPayment}>Konfirmasi & Simpan</button></div></div>
        </section>
      </div>}
      {receipt && <PaymentReceipt transaction={receipt.transaction} invoice={receipt.invoice} student={receipt.student} className={receipt.className} onClose={() => setReceipt(null)} />}
    </div>
  );
}
