import React, { useMemo, useState } from 'react';
import { Banknote, CalendarDays, ReceiptText, Search, Users } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import PaymentReceipt from '../components/ui/PaymentReceipt';
import { useData } from '../app/DataProvider';
import { formatDate, formatPeriod, formatRupiah } from '../utils/formatters';
import './History.css';

export default function History() {
  const { data } = useData();
  const [period, setPeriod] = useState('all');
  const [classId, setClassId] = useState('all');
  const [status, setStatus] = useState('all');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const studentById = useMemo(() => Object.fromEntries(data.students.map((student) => [student.id, student])), [data.students]);
  const classById = useMemo(() => Object.fromEntries(data.classes.map((klass) => [klass.id, klass.name])), [data.classes]);
  const invoiceById = useMemo(() => Object.fromEntries(data.invoices.map((invoice) => [invoice.id, invoice])), [data.invoices]);
  const periods = [...new Map(data.transactions.map((transaction) => {
    const invoice = invoiceById[transaction.invoiceId];
    if (!invoice) return null;
    const key = `${invoice.year}-${invoice.month}`;
    return [key, { key, month: invoice.month, year: invoice.year }];
  }).filter(Boolean)).values()].sort((a, b) => b.year - a.year || b.month - a.month);
  const matchingTransactions = [...data.transactions].filter((transaction) => {
    const student = studentById[transaction.studentId];
    const invoice = invoiceById[transaction.invoiceId];
    const term = query.trim().toLocaleLowerCase('id-ID');
    const queryMatch = !term || [transaction.id, transaction.batchId, student?.name, student?.nis, transaction.recordedBy]
      .some((value) => value?.toLocaleLowerCase('id-ID').includes(term));
    const periodMatch = period === 'all' || (invoice && `${invoice.year}-${invoice.month}` === period);
    const classMatch = classId === 'all' || student?.classId === classId;
    const statusMatch = status === 'all' || transaction.status === status;
    return queryMatch && periodMatch && classMatch && statusMatch;
  });
  const transactionsByGroup = matchingTransactions.reduce((groups, transaction) => {
    const groupId = transaction.batchId || transaction.id;
    if (!groups.has(groupId)) groups.set(groupId, []);
    groups.get(groupId).push(transaction);
    return groups;
  }, new Map());
  const filtered = [...transactionsByGroup.entries()].map(([groupId, transactions]) => {
    const first = transactions[0];
    if (!first.batchId) return first;
    const breakdown = transactions.map((transaction) => {
      const invoice = invoiceById[transaction.invoiceId];
      return invoice ? { period: formatPeriod(invoice.month, invoice.year), amount: transaction.amount } : null;
    }).filter(Boolean);
    return {
      ...first,
      id: groupId,
      batchId: groupId,
      amount: transactions.reduce((sum, transaction) => sum + transaction.amount, 0),
      balanceAfter: transactions.reduce((sum, transaction) => sum + (transaction.balanceAfter ?? 0), 0),
      rapelPeriods: breakdown.map((item) => item.period),
      rapelBreakdown: breakdown,
    };
  }).sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
  const total = filtered.reduce((sum, transaction) => sum + transaction.amount, 0);
  const uniqueStudents = new Set(filtered.map((transaction) => transaction.studentId)).size;
  const rapelBatches = filtered.filter((transaction) => transaction.batchId).length;

  return <div className="history-page">
    <PageHeader title="Riwayat Pembayaran" description="Telusuri pembayaran SPP, alokasi rapel per bulan, petugas pencatat, dan bukti transaksi." />

    <section className="history-summary-grid" aria-label="Ringkasan riwayat pembayaran">
      <article className="history-summary-card"><span><ReceiptText size={17} />Transaksi tercatat</span><strong>{filtered.length}</strong><small>Sesuai filter saat ini</small></article>
      <article className="history-summary-card is-green"><span><Banknote size={17} />Total pembayaran</span><strong>{formatRupiah(total)}</strong><small>Jumlah transaksi terfilter</small></article>
      <article className="history-summary-card"><span><Users size={17} />Siswa membayar</span><strong>{uniqueStudents}</strong><small>Siswa unik pada hasil</small></article>
      <article className="history-summary-card is-green"><span><CalendarDays size={17} />Kelompok pembayaran rapel</span><strong>{rapelBatches}</strong><small>Rincian tiap bulan tercatat terpisah</small></article>
    </section>

    <section className="history-filter-card" aria-label="Filter riwayat pembayaran">
      <label className="history-search"><Search size={17} aria-hidden="true" /><input aria-label="Cari transaksi, siswa, NIS, atau petugas" placeholder="Cari nomor transaksi, nama, NIS, atau petugas..." value={query} onChange={(event) => setQuery(event.target.value)} /></label>
      <select className="filter-control" aria-label="Filter periode" value={period} onChange={(event) => setPeriod(event.target.value)}><option value="all">Semua periode</option>{periods.map((item) => <option key={item.key} value={item.key}>{formatPeriod(item.month, item.year)}</option>)}</select>
      <select className="filter-control" aria-label="Filter kelas" value={classId} onChange={(event) => setClassId(event.target.value)}><option value="all">Semua kelas</option>{data.classes.map((klass) => <option key={klass.id} value={klass.id}>{klass.name}</option>)}</select>
      <select className="filter-control" aria-label="Filter status" value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">Semua status</option><option value="Berhasil">Berhasil</option></select>
    </section>

    <section className="history-table-card" aria-label="Daftar transaksi pembayaran">
      <header className="history-table-heading"><div><h2>Daftar Transaksi Pembayaran</h2><p>Satu pembayaran rapel ditampilkan sebagai satu transaksi dengan rincian alokasi tiap bulan.</p></div><span>{filtered.length} transaksi</span></header>
      <div className="history-table-scroll"><table className="history-data-table">
        <thead><tr><th>Transaksi / tanggal</th><th>Siswa</th><th>Kelas</th><th>Bulan dibayar</th><th>Metode</th><th>Nominal</th><th>Sisa tagihan</th><th>Petugas</th><th>Status</th><th>Bukti</th></tr></thead>
        <tbody>{filtered.map((transaction) => {
          const student = studentById[transaction.studentId];
          const invoice = invoiceById[transaction.invoiceId];
          return <tr key={transaction.id}>
            <td><strong className="history-transaction-id">{transaction.id}</strong><span className="history-cell-note">{formatDate(transaction.date)}</span>{transaction.batchId && <span className="history-rapel-badge">Rapel · {transaction.batchId}</span>}</td>
            <td><strong className="history-student-name">{student?.name || 'Siswa'}</strong><span className="history-cell-note">NIS {student?.nis || '-'}</span></td>
            <td>{classById[student?.classId] || '-'}</td>
            <td>{transaction.rapelPeriods?.length ? <div className="history-period-list">{transaction.rapelPeriods.map((item) => <span key={item}>{item}</span>)}</div> : invoice ? formatPeriod(invoice.month, invoice.year) : '-'}</td>
            <td>{transaction.method || 'Tunai'}</td>
            <td><strong className="history-money">{formatRupiah(transaction.amount)}</strong></td>
            <td>{formatRupiah(transaction.balanceAfter ?? 0)}</td>
            <td>{transaction.recordedBy || '-'}</td>
            <td><span className="history-status">{transaction.status}</span></td>
            <td><button className="history-receipt-button" type="button" onClick={() => setSelected({ transaction, student, invoice, className: classById[student?.classId] })}>Lihat bukti</button></td>
          </tr>;
        })}{!filtered.length && <tr><td className="history-empty" colSpan="10">{data.transactions.length ? 'Tidak ada transaksi sesuai filter.' : 'Belum ada transaksi pembayaran.'}</td></tr>}</tbody>
      </table></div>
      <footer className="history-table-footer">{filtered.length} transaksi · Total tercatat {formatRupiah(total)} · Rincian alokasi rapel tersedia pada bukti transaksi.</footer>
    </section>
    {selected && <PaymentReceipt {...selected} onClose={() => setSelected(null)} />}
  </div>;
}
