import React, { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  ArrowRight, Banknote, CheckCircle2, ChevronRight,
  Info, Landmark, MessageCircle, ReceiptText, Search, Users,
} from 'lucide-react';
import PaymentReceipt from '../components/ui/PaymentReceipt';
import Feedback from '../components/ui/Feedback';
import { useData } from '../app/DataProvider';
import {
  DEMO_PERIOD,
} from '../data';
import {
  formatDate, formatPeriod, formatRupiah, getInvoiceBalance,
  getInvoicePaidAmount,
} from '../utils/formatters';
import './Payments.css';

const getTodayIso = () => {
  const today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  return today.toISOString().slice(0, 10);
};

export default function Payments() {
  const { data, adminProfile, ensureInvoicesForPeriod, recordRapelPayment, sendWhatsAppSimulation } = useData();
  const location = useLocation();
  const demoArrearsStudent = data.students.find((student) => student.id.startsWith('student-demo-arrears-3')
    && data.invoices.filter((invoice) => invoice.studentId === student.id && getInvoiceBalance(invoice) > 0).length >= 3);
  const requestedStudentId = location.state?.studentId;
  const initialInvoice = data.invoices.find((invoice) => invoice.studentId === requestedStudentId && getInvoiceBalance(invoice) > 0)
    || data.invoices.find((invoice) => invoice.studentId === demoArrearsStudent?.id && getInvoiceBalance(invoice) > 0)
    || data.invoices.find((invoice) => getInvoiceBalance(invoice) > 0);
  const initialStudentInvoices = data.invoices.filter((invoice) => invoice.studentId === initialInvoice?.studentId && getInvoiceBalance(invoice) > 0);
  const [studentId, setStudentId] = useState(initialInvoice?.studentId || '');
  const [invoiceId, setInvoiceId] = useState(initialInvoice?.id || '');
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState(() => initialStudentInvoices.map((invoice) => invoice.id));
  const [studentQuery, setStudentQuery] = useState('');
  const [showStudentResults, setShowStudentResults] = useState(false);
  const [amount, setAmount] = useState('');
  const [cashReceived, setCashReceived] = useState('');
  const [date, setDate] = useState(getTodayIso);
  const [method, setMethod] = useState(adminProfile.defaultPaymentMethod || 'Tunai');
  const [invoicePeriod, setInvoicePeriod] = useState(`${DEMO_PERIOD.year}-${String(DEMO_PERIOD.month).padStart(2, '0')}`);
  const [confirmation, setConfirmation] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [feedbackTone, setFeedbackTone] = useState('success');
  const [receipt, setReceipt] = useState(null);
  const studentById = useMemo(() => Object.fromEntries(data.students.map((student) => [student.id, student])), [data.students]);
  const classById = useMemo(() => Object.fromEntries(data.classes.map((klass) => [klass.id, klass.name])), [data.classes]);
  const invoicesForStudent = data.invoices
    .filter((invoice) => invoice.studentId === studentId && getInvoiceBalance(invoice) > 0)
    .sort((first, second) => first.year - second.year || first.month - second.month);
  const selectedInvoice = invoicesForStudent.find((invoice) => invoice.id === invoiceId) || invoicesForStudent[0];
  const balance = selectedInvoice ? getInvoiceBalance(selectedInvoice) : 0;
  const selectedInvoices = invoicesForStudent.filter((invoice) => selectedInvoiceIds.includes(invoice.id));
  const selectedTotal = selectedInvoices.reduce((sum, invoice) => sum + getInvoiceBalance(invoice), 0);
  const openInvoiceTotal = invoicesForStudent.reduce((sum, invoice) => sum + invoice.amount, 0);
  const allocatedToOpenInvoices = invoicesForStudent.reduce((sum, invoice) => sum + getInvoicePaidAmount(invoice), 0);
  const outstandingTotal = invoicesForStudent.reduce((sum, invoice) => sum + getInvoiceBalance(invoice), 0);
  const selectedStudent = studentById[studentId];
  const monthKey = `${DEMO_PERIOD.year}-${String(DEMO_PERIOD.month).padStart(2, '0')}`;
  const thisMonthTransactions = data.transactions.filter((transaction) => transaction.date?.startsWith(monthKey));
  const monthlyRevenue = thisMonthTransactions.reduce((total, transaction) => total + transaction.amount, 0);
  const latestTransactions = [...data.transactions].sort((first, second) => second.date.localeCompare(first.date)).slice(0, 5);
  const matchingStudents = data.students.filter((student) => {
    const term = studentQuery.trim().toLocaleLowerCase('id-ID');
    return !term || student.name.toLocaleLowerCase('id-ID').includes(term) || student.nis.toLocaleLowerCase('id-ID').includes(term);
  }).sort((a, b) => Number(b.id.startsWith('student-demo-arrears-3')) - Number(a.id.startsWith('student-demo-arrears-3'))).slice(0, 8);

  const handleInvoicePeriodChange = (event) => {
    const value = event.target.value;
    setInvoicePeriod(value);
    if (!value) return;
    const [year, month] = value.split('-').map(Number);
    const result = ensureInvoicesForPeriod({ month, year });
    setFeedbackTone(result.missingTariff ? 'error' : 'success');
    if (result.created && result.missingTariff) setFeedback(`${result.created} tagihan dibuat untuk ${formatPeriod(month, year)}. ${result.missingTariff} siswa dilewati karena tarif skemanya belum tersedia.`);
    else if (result.created) setFeedback(`${result.created} tagihan periode ${formatPeriod(month, year)} dibuat untuk semua siswa aktif.`);
    else if (result.missingTariff) setFeedback(`Tidak ada tagihan baru. Tarif skema pembayaran belum tersedia untuk ${result.missingTariff} siswa.`);
    else setFeedback(`Tagihan periode ${formatPeriod(month, year)} sudah tersedia untuk semua siswa aktif.`);
  };

  const chooseStudent = (nextStudentId) => {
    setStudentId(nextStudentId);
    const nextInvoice = data.invoices.find((invoice) => invoice.studentId === nextStudentId && getInvoiceBalance(invoice) > 0);
    setInvoiceId(nextInvoice?.id || '');
    setSelectedInvoiceIds(data.invoices.filter((invoice) => invoice.studentId === nextStudentId && getInvoiceBalance(invoice) > 0).map((invoice) => invoice.id));
    setStudentQuery('');
    setShowStudentResults(false);
    setAmount('');
    setCashReceived('');
    setConfirmation(false);
    setFeedback('');
  };

  const chooseInvoice = (nextInvoiceId) => {
    setInvoiceId(nextInvoiceId);
    setSelectedInvoiceIds((current) => current.includes(nextInvoiceId)
      ? current.filter((id) => id !== nextInvoiceId) : [...current, nextInvoiceId]);
    setAmount('');
    setCashReceived('');
    setConfirmation(false);
    setFeedback('');
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const numericAmount = Number(amount);
    if (!selectedInvoices.length) { setFeedbackTone('error'); setFeedback('Pilih satu atau beberapa bulan tunggakan.'); return; }
    if (!Number.isInteger(numericAmount) || numericAmount <= 0) { setFeedbackTone('error'); setFeedback('Jumlah pembayaran harus berupa bilangan Rupiah positif.'); return; }
    if (numericAmount > selectedTotal) { setFeedbackTone('error'); setFeedback(`Jumlah pembayaran melebihi total bulan terpilih ${formatRupiah(selectedTotal)}.`); return; }
    if (method === 'Tunai' && cashReceived && (!Number.isInteger(Number(cashReceived)) || Number(cashReceived) < numericAmount)) {
      setFeedbackTone('error'); setFeedback('Uang diterima harus berupa Rupiah dan tidak boleh kurang dari jumlah pembayaran.'); return;
    }
    if (!date) { setFeedbackTone('error'); setFeedback('Tanggal pembayaran wajib diisi.'); return; }
    setFeedbackTone('success');
    setFeedback('');
    setConfirmation(true);
  };

  const confirmPayment = () => {
    if (!selectedInvoices.length) return;
    const numericAmount = Number(amount);
    let remaining = numericAmount;
    const payments = selectedInvoices.map((invoice) => {
      const installment = Math.min(getInvoiceBalance(invoice), remaining);
      remaining -= installment;
      return { invoiceId: invoice.id, amount: installment };
    }).filter((payment) => payment.amount > 0);
    const transactionIds = recordRapelPayment({ payments, date, method, recordedBy: adminProfile.name });
    if (!transactionIds) {
      setConfirmation(false);
      setFeedbackTone('error');
      setFeedback('Pembayaran tidak tersimpan. Tagihan mungkin sudah berubah; periksa kembali sisa tagihan.');
      return;
    }
    const transactionId = transactionIds[0];
    const firstPayment = payments[0];
    const invoice = selectedInvoices.find((item) => item.id === firstPayment.invoiceId);
    const paidAmount = getInvoicePaidAmount(invoice) + firstPayment.amount;
    const updatedInvoice = { ...invoice, paidAmount, status: paidAmount >= invoice.amount ? 'paid' : 'partial' };
    const transaction = { id: transactionId, invoiceId: invoice.id, studentId, amount: numericAmount, date, method, status: 'Berhasil', balanceAfter: Math.max(0, selectedTotal - numericAmount), recordedBy: adminProfile.name, rapelPeriods: payments.map((payment) => formatPeriod(data.invoices.find((item) => item.id === payment.invoiceId).month, data.invoices.find((item) => item.id === payment.invoiceId).year)), rapelBreakdown: payments.map((payment) => ({ period: formatPeriod(data.invoices.find((item) => item.id === payment.invoiceId).month, data.invoices.find((item) => item.id === payment.invoiceId).year), amount: payment.amount })) };
    const confirmationTemplate = data.waTemplates.find((item) => item.id === 'wa-confirmation');
    if (confirmationTemplate && selectedStudent?.parentWhatsapp) {
      const values = {
        nama: selectedStudent.name,
        periode: selectedInvoices.map((item) => formatPeriod(item.month, item.year)).join(', '),
        nominal: formatRupiah(numericAmount),
        sisa: formatRupiah(transaction.balanceAfter),
      };
      const body = confirmationTemplate.body.replace(/\{(nama|periode|nominal|sisa)\}/g, (_, key) => values[key]);
      sendWhatsAppSimulation({ studentId, templateId: confirmationTemplate.id, templateName: confirmationTemplate.name, recipient: selectedStudent.parentWhatsapp, body });
    }
    setReceipt({ transaction, invoice: updatedInvoice, student: selectedStudent, className: classById[selectedStudent?.classId] });
    setConfirmation(false);
    setFeedbackTone('success');
    setFeedback(`Pembayaran ${payments.length} bulan tersimpan. Notifikasi WhatsApp Terkirim (Simulasi) dicatat. Nomor transaksi ${transactionId}.`);
    setAmount('');
    setCashReceived('');
  };

  const showTransactionReceipt = (transaction) => {
    const invoice = data.invoices.find((item) => item.id === transaction.invoiceId);
    const student = studentById[transaction.studentId];
    if (!invoice || !student) {
      setFeedbackTone('error');
      setFeedback('Bukti tidak tersedia karena data transaksi terkait sudah tidak ada.');
      return;
    }
    setReceipt({ transaction, invoice, student, className: classById[student.classId] });
  };

  return (
    <div className="cashier-page">
      <header className="cashier-heading">
        <div>
          <div className="cashier-title-row">
            <h1>Transaksi Pembayaran SPP</h1>
            <span className="cashier-demo-badge"><span />Mode demo</span>
          </div>
          <p>Catat pembayaran siswa dan tinjau tagihan sebelum transaksi disimpan.</p>
        </div>
        <div className="cashier-stats">
          <div className="cashier-stat"><span>Periode ringkasan</span><strong>{DEMO_PERIOD.label}</strong></div>
          <div className="cashier-stat cashier-stat-highlight"><span>Penerimaan periode</span><strong>{formatRupiah(monthlyRevenue)} <small>({thisMonthTransactions.length} transaksi)</small></strong></div>
        </div>
      </header>

      <Feedback message={feedback} tone={feedbackTone} />

      <div className="cashier-workspace">
        <div className="cashier-primary-column">
          <section className="cashier-period-card" aria-labelledby="cashier-period-title">
            <div><h2 id="cashier-period-title">Buat tagihan periode</h2><p>Pilih bulan; tagihan yang belum ada dibuat untuk semua siswa aktif.</p></div>
            <label className="cashier-field"><span>Bulan dan tahun tagihan</span><input aria-label="Bulan dan tahun tagihan" type="month" value={invoicePeriod} onChange={handleInvoicePeriodChange} /></label>
          </section>
          <section className="cashier-lookup-card">
            <label className="cashier-searchbox">
              <Search size={19} aria-hidden="true" />
              <input
                aria-label="Cari siswa dengan nama atau NIS"
                placeholder="Cari NIS atau nama siswa..."
                value={studentQuery}
                onFocus={() => setShowStudentResults(true)}
                onChange={(event) => { setStudentQuery(event.target.value); setShowStudentResults(true); }}
              />
            </label>
            <div className="cashier-search-hint"><span>Contoh siswa menunggak tiga bulan tersedia di Data Tunggakan.</span>{demoArrearsStudent && <button type="button" onClick={() => chooseStudent(demoArrearsStudent.id)}>Tampilkan contoh 3 bulan</button>}</div>
            {showStudentResults && <div className="cashier-student-results" role="listbox" aria-label="Hasil pencarian siswa">
              {matchingStudents.map((student) => (
                <button className="cashier-student-result" type="button" key={student.id} onClick={() => chooseStudent(student.id)}>
                  <span className="cashier-result-avatar">{student.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()}</span>
                  <span><strong>{student.name}</strong><small>NIS {student.nis} · {classById[student.classId] || 'Kelas belum tersedia'}</small></span>
                  <ChevronRight size={16} />
                </button>
              ))}
              {!matchingStudents.length && <p className="cashier-no-results">Tidak ada siswa yang cocok dengan pencarian.</p>}
              <button type="button" className="cashier-close-results" onClick={() => setShowStudentResults(false)}>Tutup hasil</button>
            </div>}
          </section>

          <section className="cashier-student-card">
            <div className="cashier-student-card-header">
              <div><Users size={17} /><strong>Data siswa terpilih</strong></div>
              {selectedStudent && <span className="cashier-active-label"><CheckCircle2 size={13} />Siswa aktif</span>}
            </div>
            {selectedStudent ? <div className="cashier-student-info">
              <div className="cashier-person-main">
                <div className="cashier-person-avatar">{selectedStudent.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()}</div>
                <div className="cashier-person-name"><strong>{selectedStudent.name}{invoicesForStudent.length >= 3 && <span className="cashier-critical-badge">Tunggakan {invoicesForStudent.length} bulan</span>}</strong><span>{selectedStudent.nis} · {classById[selectedStudent.classId] || 'Kelas belum tersedia'} · Skema {selectedStudent.paymentScheme || 'Reguler'}</span></div>
              </div>
              <div className="cashier-identity-grid">
                <div><span>NIS</span><strong>{selectedStudent.nis}</strong></div>
                <div><span>WhatsApp orang tua</span><strong>{selectedStudent.parentWhatsapp || 'Belum tersedia'}</strong></div>
              </div>
            </div> : <div className="cashier-student-empty">Cari dan pilih siswa untuk melihat tagihannya.</div>}
          </section>

          <section className="cashier-invoices-card">
            <div className="cashier-section-heading">
              <div><h2>Tagihan belum lunas</h2><p>{selectedStudent ? `Tagihan untuk ${selectedStudent.name}` : 'Pilih siswa untuk menampilkan tagihan.'}</p></div>
              {selectedStudent && <span className="cashier-open-count">{invoicesForStudent.length} bulan belum lunas</span>}
            </div>
            {selectedStudent && invoicesForStudent.length ? <>
              <div className="cashier-invoice-actions"><span>Pilih periode yang akan dibayar</span><button type="button" onClick={() => setSelectedInvoiceIds(selectedInvoiceIds.length === invoicesForStudent.length ? [] : invoicesForStudent.map((invoice) => invoice.id))}>{selectedInvoiceIds.length === invoicesForStudent.length ? 'Batal pilih semua' : `Pilih semua (${invoicesForStudent.length})`}</button></div>
              <div className="cashier-invoice-table-scroll"><table className="cashier-invoice-table">
                <thead><tr><th><span className="sr-only">Pilih</span></th><th>Periode tagihan</th><th>Nominal SPP</th><th>Status</th><th>Sudah dibayar</th><th>Sisa</th></tr></thead>
                <tbody>{invoicesForStudent.map((invoice) => {
                  const paid = getInvoicePaidAmount(invoice);
                  const balanceAmount = getInvoiceBalance(invoice);
                  const isPartial = paid > 0 && balanceAmount > 0;
                  return <tr className={selectedInvoiceIds.includes(invoice.id) ? 'is-selected' : ''} key={invoice.id}>
                    <td><input aria-label={`Pilih tagihan ${formatPeriod(invoice.month, invoice.year)}`} type="checkbox" checked={selectedInvoiceIds.includes(invoice.id)} onChange={() => chooseInvoice(invoice.id)} /></td>
                    <td><strong>{formatPeriod(invoice.month, invoice.year)}</strong><small>{invoice.schoolYear}</small></td>
                    <td>{formatRupiah(invoice.amount)}</td>
                    <td><span className={`cashier-invoice-status${isPartial ? ' is-partial' : ''}`}>{isPartial ? 'Dibayar Sebagian' : 'Belum Dibayar'}</span></td>
                    <td>{formatRupiah(paid)}</td><td className="cashier-invoice-balance-value">{formatRupiah(balanceAmount)}</td>
                  </tr>;
                })}</tbody>
              </table></div>
            </> : <div className="cashier-invoice-empty">{selectedStudent ? 'Tidak ada tagihan yang perlu dibayar.' : 'Belum ada siswa dipilih.'}</div>}
            {selectedStudent && invoicesForStudent.length > 0 && <div className="cashier-arrears-total">
              <div><span>Jumlah bulan menunggak</span><strong>{invoicesForStudent.length} bulan</strong></div>
              <div><span>Total nominal tagihan</span><strong>{formatRupiah(openInvoiceTotal)}</strong></div>
              <div><span>Pembayaran dialokasikan</span><strong>{formatRupiah(allocatedToOpenInvoices)}</strong></div>
              <div><span>Total sisa tunggakan</span><strong>{formatRupiah(outstandingTotal)}</strong></div>
            </div>}
          </section>

          <section className="cashier-recent-card">
            <div className="cashier-section-heading">
              <div><h2>Transaksi terbaru</h2><p>Transaksi terakhir dari data demo.</p></div>
              <span className="cashier-recent-total">{data.transactions.length} total</span>
            </div>
            {latestTransactions.length ? <div className="cashier-recent-list">
              {latestTransactions.map((transaction) => {
                const student = studentById[transaction.studentId];
                const invoice = data.invoices.find((item) => item.id === transaction.invoiceId);
                return <article className="cashier-recent-row" key={transaction.id}>
                  <div className="cashier-recent-icon"><ReceiptText size={16} /></div>
                  <div className="cashier-recent-copy"><strong>{student?.name || 'Data siswa tidak tersedia'}</strong><span>{formatDate(transaction.date)} · {invoice ? formatPeriod(invoice.month, invoice.year) : 'Tagihan tidak tersedia'}</span></div>
                  <strong className="cashier-recent-amount">{formatRupiah(transaction.amount)}</strong>
                  <button className="cashier-receipt-link" type="button" onClick={() => showTransactionReceipt(transaction)} aria-label={`Lihat bukti untuk ${transaction.id}`}><ArrowRight size={16} /></button>
                </article>;
              })}
            </div> : <div className="cashier-invoice-empty">Belum ada transaksi.</div>}
          </section>
        </div>

        <aside className="cashier-side-column">
          <section className="cashier-payment-card">
            <div className="cashier-payment-card-heading"><div className="cashier-payment-icon"><ReceiptText size={18} /></div><div><h2>Rincian pembayaran</h2><p>Periksa nominal sebelum menyimpan.</p></div></div>
            <form className="cashier-payment-form" onSubmit={handleSubmit}>
              {selectedInvoice ? <>
                <div className="cashier-settlement-summary"><div><span>Total tunggakan awal</span><strong>{formatRupiah(outstandingTotal)} ({invoicesForStudent.length} bulan)</strong></div><div><span>Sudah dibayar sebelumnya</span><strong>{formatRupiah(allocatedToOpenInvoices)}</strong></div><div><span>Sisa pada bulan terpilih</span><strong>{formatRupiah(selectedTotal)}</strong></div></div>
                <div className="cashier-selected-period"><span>{selectedInvoices.length} bulan dipilih</span><strong>Total sisa {formatRupiah(selectedTotal)}</strong></div>
                <label className="cashier-field"><span>Jumlah pembayaran rapel</span><div className="cashier-money-input"><span>Rp</span><input aria-label="Jumlah pembayaran rapel" type="number" min="1" max={selectedTotal} step="1" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="Masukkan nominal" required /></div><small>Nominal dialokasikan berurutan ke bulan terpilih, maksimal {formatRupiah(selectedTotal)}. Pembayaran sebagian diperbolehkan.</small></label>
                <label className="cashier-field"><span>Tanggal pembayaran</span><input type="date" value={date} onChange={(event) => setDate(event.target.value)} required /></label>
                {method === 'Tunai' && <label className="cashier-field"><span>Uang diterima (opsional)</span><div className="cashier-money-input"><span>Rp</span><input aria-label="Uang diterima dari wali" type="number" min={amount || 0} step="1" value={cashReceived} onChange={(event) => setCashReceived(event.target.value)} placeholder="Masukkan uang dari wali" /></div><small>Nominal ini hanya menghitung kembalian; pembayaran tetap sebesar jumlah yang dialokasikan.</small></label>}
                <fieldset className="cashier-method-fieldset"><legend>Metode pembayaran</legend><div className="cashier-method-options">
                  {[{ label: 'Tunai', Icon: Banknote }, { label: 'Transfer Bank', Icon: Landmark }].map(({ label, Icon }) => <label className={`cashier-method-option${method === label ? ' selected' : ''}`} key={label}><input type="radio" name="paymentMethod" value={label} checked={method === label} onChange={() => setMethod(label)} /><Icon size={17} /><span>{label}</span></label>)}
                </div></fieldset>
                <div className="cashier-total-box"><span>Total pembayaran</span><strong>{amount && Number(amount) > 0 ? formatRupiah(Number(amount)) : formatRupiah(0)}</strong><small>Sisa tunggakan siswa setelah pembayaran: {formatRupiah(Math.max(0, invoicesForStudent.reduce((sum, item) => sum + getInvoiceBalance(item), 0) - (Number(amount) || 0)))}</small></div>
                {method === 'Tunai' && Number(cashReceived) >= Number(amount) && Number(amount) > 0 && <div className="cashier-change-box"><span>Kembalian</span><strong>{formatRupiah(Number(cashReceived) - Number(amount))}</strong></div>}
                <div className="cashier-wa-simulation"><MessageCircle size={16} /><span>Kuitansi akan dicatat sebagai <strong>WhatsApp Simulasi</strong>.</span></div>
                <button className="button button-primary cashier-submit" type="submit">Tinjau pembayaran <ChevronRight size={17} /></button>
              </> : <div className="cashier-no-invoice"><Info size={20} /><strong>Belum ada tagihan dipilih</strong><span>Pilih siswa dengan tagihan terbuka untuk melanjutkan transaksi.</span></div>}
            </form>
          </section>
          <div className="cashier-guidance"><Info size={16} /><span>Pembayaran dapat dialokasikan ke satu atau beberapa bulan yang dipilih. Riwayat dan sisa setiap tagihan diperbarui setelah transaksi dikonfirmasi.</span></div>
        </aside>
      </div>

      {confirmation && selectedInvoice && <div className="dialog-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setConfirmation(false)}>
        <section className="entity-dialog" role="dialog" aria-modal="true" aria-labelledby="payment-confirm-title">
          <header className="entity-dialog-header"><h3 id="payment-confirm-title">Konfirmasi Pembayaran</h3><button type="button" className="icon-button" onClick={() => setConfirmation(false)} aria-label="Tutup konfirmasi">×</button></header>
          <div className="confirmation-content"><p>Periksa kembali transaksi berikut sebelum disimpan.</p><dl className="detail-list">
            <div className="detail-item"><dt>Siswa</dt><dd>{selectedStudent?.name}</dd></div><div className="detail-item"><dt>Bulan dibayar</dt><dd>{selectedInvoices.map((item) => formatPeriod(item.month, item.year)).join(', ')}</dd></div>
            <div className="detail-item"><dt>Tanggal</dt><dd>{formatDate(date)}</dd></div><div className="detail-item"><dt>Jumlah bayar</dt><dd>{formatRupiah(Number(amount))}</dd></div>
            <div className="detail-item"><dt>Sisa setelah bayar</dt><dd>{formatRupiah(Math.max(0, invoicesForStudent.reduce((sum, item) => sum + getInvoiceBalance(item), 0) - Number(amount)))}</dd></div><div className="detail-item"><dt>Metode pembayaran</dt><dd>{method}</dd></div>
            {method === 'Tunai' && cashReceived && <><div className="detail-item"><dt>Uang diterima</dt><dd>{formatRupiah(Number(cashReceived))}</dd></div><div className="detail-item"><dt>Kembalian</dt><dd>{formatRupiah(Math.max(0, Number(cashReceived) - Number(amount)))}</dd></div></>}
          </dl><div className="dialog-actions"><button className="button button-secondary" onClick={() => setConfirmation(false)}>Kembali</button><button className="button button-primary" onClick={confirmPayment}>Konfirmasi &amp; Simpan</button></div></div>
        </section>
      </div>}
      {receipt && <PaymentReceipt transaction={receipt.transaction} invoice={receipt.invoice} student={receipt.student} className={receipt.className} onClose={() => setReceipt(null)} />}
    </div>
  );
}
