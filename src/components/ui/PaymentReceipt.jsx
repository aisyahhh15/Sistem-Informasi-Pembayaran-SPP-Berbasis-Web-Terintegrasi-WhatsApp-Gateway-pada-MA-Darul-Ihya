import React, { useState } from 'react';
import { Download, Printer, X } from 'lucide-react';
import { formatDate, formatPeriod, formatRupiah, getInvoiceBalance, terbilang } from '../../utils/formatters';
import { useData } from '../../app/DataProvider';

export default function PaymentReceipt({ transaction, student, className, invoice, onClose }) {
  const [feedback, setFeedback] = useState('');
  const { adminProfile } = useData();
  return (
    <div className="dialog-backdrop receipt-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="receipt-dialog" role="dialog" aria-modal="true" aria-labelledby="receipt-title">
        <div className="receipt-screen-actions">
          <button className="button button-secondary" onClick={() => window.print()}><Printer size={16} /> Cetak Bukti</button>
          <button className="button button-secondary" onClick={() => setFeedback('Unduh PDF masih simulasi dan belum membuat file. Gunakan Cetak Bukti untuk menyimpan melalui dialog cetak browser.')}><Download size={16} /> Unduh PDF (Simulasi)</button>
          <button className="icon-button" onClick={onClose} aria-label="Tutup bukti"><X size={20} /></button>
        </div>
        {feedback && <p className="receipt-feedback" role="status">{feedback}</p>}
        <article className="receipt-print-content">
          <header className="receipt-heading">
            <div className="receipt-mark">DI</div>
            <div><h2 id="receipt-title">MA Darul Ihya</h2><p>Bukti Pembayaran SPP · Salinan Demo</p></div>
          </header>
          <div className="receipt-status">{invoice?.status === 'paid' ? 'LUNAS' : 'PEMBAYARAN SEBAGIAN'}</div>
          <dl className="receipt-details">
            <div><dt>No. transaksi</dt><dd>{transaction.id}</dd></div>
            <div><dt>Tanggal</dt><dd>{formatDate(transaction.date)}</dd></div>
            <div><dt>Nama siswa</dt><dd>{student?.name || 'Siswa'}</dd></div>
            <div><dt>NIS / Kelas</dt><dd>{student?.nis || '-'} / {className || '-'}</dd></div>
            <div><dt>Periode tagihan</dt><dd>{invoice ? formatPeriod(invoice.month, invoice.year) : '-'}</dd></div>
            <div><dt>Nominal transaksi</dt><dd>{formatRupiah(transaction.amount)}</dd></div>
            <div><dt>Terbilang</dt><dd>{terbilang(transaction.amount)} rupiah</dd></div>
            <div><dt>Metode pembayaran</dt><dd>{transaction.method || 'Tunai'}</dd></div>
            <div><dt>Sisa tagihan setelah transaksi</dt><dd>{formatRupiah(transaction.balanceAfter ?? (invoice ? getInvoiceBalance(invoice) : 0))}</dd></div>
          </dl>
          <div className="receipt-signature"><div><span>Diterima oleh,</span><strong>{adminProfile.name}</strong><small>Bendahara MA Darul Ihya</small></div><div><span>Tanggal cetak</span><strong>{formatDate(new Date())}</strong></div></div>
          <p className="receipt-footnote">Bukti ini dibuat dari prototipe frontend dengan data dummy. Tidak berlaku sebagai bukti pembayaran resmi.</p>
        </article>
      </section>
    </div>
  );
}
