import React, { useMemo, useState } from 'react';
import { Download, Printer } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import { useData } from '../app/DataProvider';
import { formatDate, formatPeriod, formatRupiah } from '../utils/formatters';

const csvCell = (value) => {
  const text = String(value ?? '');
  const safeText = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
  return `"${safeText.replace(/"/g, '""')}"`;
};

export default function Reports() {
  const { data } = useData();
  const [period, setPeriod] = useState('all');
  const [schoolYear, setSchoolYear] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [classId, setClassId] = useState('all');
  const [studentId, setStudentId] = useState('all');
  const [feedback, setFeedback] = useState('');
  const studentById = useMemo(() => Object.fromEntries(data.students.map((student) => [student.id, student])), [data.students]);
  const classById = useMemo(() => Object.fromEntries(data.classes.map((klass) => [klass.id, klass.name])), [data.classes]);
  const invoiceById = useMemo(() => Object.fromEntries(data.invoices.map((invoice) => [invoice.id, invoice])), [data.invoices]);
  const periods = [...new Map(data.transactions.map((transaction) => {
    const invoice = invoiceById[transaction.invoiceId];
    if (!invoice) return null;
    const key = `${invoice.year}-${invoice.month}`;
    return [key, { key, month: invoice.month, year: invoice.year }];
  }).filter(Boolean)).values()];
  const schoolYears = [...new Set(data.invoices.map((invoice) => invoice.schoolYear))].sort();
  const filtered = [...data.transactions].filter((transaction) => {
    const student = studentById[transaction.studentId];
    const invoice = invoiceById[transaction.invoiceId];
    return (period === 'all' || (invoice && `${invoice.year}-${invoice.month}` === period))
      && (schoolYear === 'all' || invoice?.schoolYear === schoolYear)
      && (!dateFrom || transaction.date >= dateFrom)
      && (!dateTo || transaction.date <= dateTo)
      && (classId === 'all' || student?.classId === classId)
      && (studentId === 'all' || transaction.studentId === studentId);
  }).sort((a, b) => b.date.localeCompare(a.date));
  const total = filtered.reduce((sum, transaction) => sum + transaction.amount, 0);
  const uniqueStudents = new Set(filtered.map((transaction) => transaction.studentId)).size;
  const availableStudents = classId === 'all' ? data.students : data.students.filter((student) => student.classId === classId);
  const outstanding = data.invoices.filter((invoice) => {
    const student = studentById[invoice.studentId];
    return invoice.amount > (invoice.paidAmount ?? (invoice.status === 'paid' ? invoice.amount : 0))
      && (period === 'all' || `${invoice.year}-${invoice.month}` === period)
      && (schoolYear === 'all' || invoice.schoolYear === schoolYear)
      && (classId === 'all' || student?.classId === classId);
  }).reduce((sum, invoice) => sum + Math.max(0, invoice.amount - (invoice.paidAmount ?? (invoice.status === 'paid' ? invoice.amount : 0))), 0);

  const downloadCsv = () => {
    if (!filtered.length) { setFeedback('Tidak ada baris untuk diekspor.'); return; }
    const headers = ['No. Transaksi', 'Tanggal', 'NIS', 'Nama Siswa', 'Kelas', 'Periode SPP', 'Nominal', 'Status'];
    const rows = filtered.map((transaction) => {
      const student = studentById[transaction.studentId];
      const invoice = invoiceById[transaction.invoiceId];
      return [transaction.id, transaction.date, student?.nis || '-', student?.name || 'Siswa', classById[student?.classId] || '-', invoice ? formatPeriod(invoice.month, invoice.year) : '-', transaction.amount, transaction.status];
    });
    const csv = `\uFEFF${[headers, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n')}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `laporan-pembayaran-spp-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setFeedback('File CSV laporan berhasil dibuat oleh browser.');
  };

  return (
    <div className="report-page">
      <PageHeader title="Laporan Pembayaran SPP" description="Filter transaksi menurut rentang tanggal, bulan, tahun ajaran, dan kelas." />
      {feedback && <p className="inline-feedback" role="status">{feedback}</p>}
      <div className="page-toolbar report-filters">
        <select className="filter-control" aria-label="Filter periode laporan" value={period} onChange={(event) => setPeriod(event.target.value)}><option value="all">Semua periode</option>{periods.map((item) => <option value={item.key} key={item.key}>{formatPeriod(item.month, item.year)}</option>)}</select>
        <select className="filter-control" aria-label="Filter tahun ajaran" value={schoolYear} onChange={(event) => setSchoolYear(event.target.value)}><option value="all">Semua tahun ajaran</option>{schoolYears.map((year) => <option value={year} key={year}>{year}</option>)}</select>
        <input className="filter-control" aria-label="Tanggal mulai" type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} />
        <input className="filter-control" aria-label="Tanggal akhir" type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} />
        <select className="filter-control" aria-label="Filter kelas laporan" value={classId} onChange={(event) => { setClassId(event.target.value); setStudentId('all'); }}><option value="all">Semua kelas</option>{data.classes.map((klass) => <option value={klass.id} key={klass.id}>{klass.name}</option>)}</select>
        <select className="filter-control" aria-label="Filter siswa laporan" value={studentId} onChange={(event) => setStudentId(event.target.value)}><option value="all">Semua siswa</option>{availableStudents.map((student) => <option value={student.id} key={student.id}>{student.name}</option>)}</select>
        <div className="report-actions"><button className="button button-secondary" type="button" onClick={() => window.print()} disabled={!filtered.length} title={!filtered.length ? 'Tidak ada baris untuk dicetak' : ''}><Printer size={16} /> Cetak</button><button className="button button-secondary" type="button" onClick={() => setFeedback('Ekspor Excel masih simulasi; belum menghasilkan file. Gunakan Unduh CSV untuk file data yang dapat dibuka di Excel.')} disabled={!filtered.length} title={!filtered.length ? 'Tidak ada baris untuk diekspor' : ''}>Excel (Simulasi)</button><button className="button button-secondary" type="button" onClick={() => setFeedback('Ekspor PDF masih simulasi; belum menghasilkan file. Gunakan Cetak untuk menyimpan sebagai PDF dari browser.')} disabled={!filtered.length} title={!filtered.length ? 'Tidak ada baris untuk diekspor' : ''}>PDF (Simulasi)</button><button className="button button-primary" type="button" onClick={downloadCsv} disabled={!filtered.length} title={!filtered.length ? 'Tidak ada baris untuk diunduh' : ''}><Download size={16} /> Unduh CSV</button></div>
      </div>

      <section className="report-summary-grid" aria-label="Ringkasan laporan">
        <article className="metric-card"><span className="metric-label">Total transaksi</span><strong className="metric-value">{filtered.length}</strong><span className="metric-note">Sesuai filter laporan</span></article>
        <article className="metric-card"><span className="metric-label">Siswa membayar</span><strong className="metric-value">{uniqueStudents}</strong><span className="metric-note">Siswa unik dalam hasil</span></article>
        <article className="metric-card"><span className="metric-label">Total pemasukan</span><strong className="metric-value">{formatRupiah(total)}</strong><span className="metric-note">Jumlah nominal transaksi</span></article>
        <article className="metric-card"><span className="metric-label">Sisa tunggakan</span><strong className="metric-value">{formatRupiah(outstanding)}</strong><span className="metric-note">Sesuai filter kelas, bulan, dan tahun ajaran</span></article>
      </section>

      <section className="table-card report-table"><div className="table-scroll"><table className="data-table">
        <thead><tr><th>No. transaksi</th><th>Tanggal</th><th>Siswa / NIS</th><th>Kelas</th><th>Periode SPP</th><th>Nominal</th><th>Status</th></tr></thead>
        <tbody>{filtered.map((transaction) => {
          const student = studentById[transaction.studentId];
          const invoice = invoiceById[transaction.invoiceId];
          return <tr key={transaction.id}><td className="cell-primary">{transaction.id}</td><td>{formatDate(transaction.date)}</td><td><span className="cell-primary">{student?.name || 'Siswa'}</span><span className="cell-secondary">NIS {student?.nis || '-'}</span></td><td>{classById[student?.classId] || '-'}</td><td>{invoice ? formatPeriod(invoice.month, invoice.year) : '-'}</td><td className="cell-primary">{formatRupiah(transaction.amount)}</td><td><span className="status-badge">{transaction.status}</span></td></tr>;
        })}{!filtered.length && <tr><td className="table-empty" colSpan="7">Tidak ada transaksi sesuai filter.</td></tr>}</tbody>
      </table></div><div className="table-caption">{filtered.length} transaksi · Total {formatRupiah(total)}. CSV berisi data sesuai filter.</div></section>
    </div>
  );
}
