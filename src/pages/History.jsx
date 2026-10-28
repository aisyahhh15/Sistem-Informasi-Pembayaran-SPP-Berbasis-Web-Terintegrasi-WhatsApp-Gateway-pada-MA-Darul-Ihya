import React, { useMemo, useState } from 'react';
import PageHeader from '../components/layout/PageHeader';
import PaymentReceipt from '../components/ui/PaymentReceipt';
import { useData } from '../app/DataProvider';
import { formatDate, formatPeriod, formatRupiah } from '../utils/formatters';

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
    return invoice ? [`${invoice.year}-${invoice.month}`, { key: `${invoice.year}-${invoice.month}`, month: invoice.month, year: invoice.year }] : [];
  }).filter(([key]) => key).map(([key, value]) => [key, value])).values()];
  const filtered = [...data.transactions].filter((transaction) => {
    const student = studentById[transaction.studentId];
    const invoice = invoiceById[transaction.invoiceId];
    const queryMatch = !query.trim() || [transaction.id, student?.name, student?.nis].some((value) => value?.toLocaleLowerCase('id-ID').includes(query.trim().toLocaleLowerCase('id-ID')));
    const periodMatch = period === 'all' || (invoice && `${invoice.year}-${invoice.month}` === period);
    const classMatch = classId === 'all' || student?.classId === classId;
    const statusMatch = status === 'all' || transaction.status === status;
    return queryMatch && periodMatch && classMatch && statusMatch;
  }).sort((a, b) => b.date.localeCompare(a.date));
  const total = filtered.reduce((sum, transaction) => sum + transaction.amount, 0);

  return (
    <div>
      <PageHeader title="Riwayat Pembayaran" description="Telusuri transaksi dan buka bukti pembayaran." />
      <div className="page-toolbar history-filters">
        <input className="filter-control" aria-label="Cari transaksi atau siswa" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari transaksi, nama, atau NIS" />
        <select className="filter-control" aria-label="Filter periode" value={period} onChange={(event) => setPeriod(event.target.value)}><option value="all">Semua periode</option>{periods.map((item) => <option key={item.key} value={item.key}>{formatPeriod(item.month, item.year)}</option>)}</select>
        <select className="filter-control" aria-label="Filter kelas" value={classId} onChange={(event) => setClassId(event.target.value)}><option value="all">Semua kelas</option>{data.classes.map((klass) => <option key={klass.id} value={klass.id}>{klass.name}</option>)}</select>
        <select className="filter-control" aria-label="Filter status" value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">Semua status</option><option value="Berhasil">Berhasil</option></select>
      </div>
      <div className="table-card history-table">
        <div className="table-scroll"><table className="data-table">
          <thead><tr><th>No. transaksi / tanggal</th><th>Siswa</th><th>Kelas</th><th>Periode SPP</th><th>Metode</th><th>Nominal bayar</th><th>Status</th><th>Bukti</th></tr></thead>
          <tbody>{filtered.map((transaction) => {
            const student = studentById[transaction.studentId];
            const invoice = invoiceById[transaction.invoiceId];
            return <tr key={transaction.id}>
              <td><span className="cell-primary">{transaction.id}</span><span className="cell-secondary">{formatDate(transaction.date)}</span></td>
              <td><span className="cell-primary">{student?.name || 'Siswa'}</span><span className="cell-secondary">NIS {student?.nis || '-'}</span></td>
              <td>{classById[student?.classId] || '-'}</td><td>{invoice ? formatPeriod(invoice.month, invoice.year) : '-'}</td><td>{transaction.method || 'Tunai'}</td>
              <td className="cell-primary">{formatRupiah(transaction.amount)}</td><td><span className="status-badge">{transaction.status}</span></td>
              <td><button className="table-action" onClick={() => setSelected({ transaction, student, invoice, className: classById[student?.classId] })}>Lihat bukti</button></td>
            </tr>;
          })}{!filtered.length && <tr><td className="table-empty" colSpan="8">{data.transactions.length ? 'Tidak ada transaksi sesuai filter.' : 'Belum ada transaksi pembayaran.'}</td></tr>}</tbody>
        </table></div>
        <div className="table-caption">{filtered.length} transaksi · Total tercatat {formatRupiah(total)}</div>
      </div>
      {selected && <PaymentReceipt {...selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
