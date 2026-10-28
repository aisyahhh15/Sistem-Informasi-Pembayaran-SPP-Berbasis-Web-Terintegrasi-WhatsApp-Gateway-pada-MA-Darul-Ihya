import React, { useMemo, useState } from 'react';
import PageHeader from '../components/layout/PageHeader';
import { useData } from '../app/DataProvider';
import { formatPeriod, formatRupiah, getInvoiceBalance } from '../utils/formatters';

export default function Arrears() {
  const { data, sendWhatsAppSimulation } = useData();
  const [classId, setClassId] = useState('all');
  const [period, setPeriod] = useState('all');
  const [feedback, setFeedback] = useState('');
  const studentById = useMemo(() => Object.fromEntries(data.students.map((student) => [student.id, student])), [data.students]);
  const classById = useMemo(() => Object.fromEntries(data.classes.map((klass) => [klass.id, klass.name])), [data.classes]);
  const periods = [...new Map(data.invoices.filter((invoice) => getInvoiceBalance(invoice) > 0).map((invoice) => {
    const key = `${invoice.year}-${invoice.month}`;
    return [key, { key, month: invoice.month, year: invoice.year }];
  })).values()];
  const arrearsByStudent = data.invoices.filter((invoice) => getInvoiceBalance(invoice) > 0).reduce((groups, invoice) => {
    const student = studentById[invoice.studentId];
    if (!student || (classId !== 'all' && student.classId !== classId) || (period !== 'all' && `${invoice.year}-${invoice.month}` !== period)) return groups;
    if (!groups[student.id]) groups[student.id] = { student, invoices: [], total: 0 };
    groups[student.id].invoices.push(invoice);
    groups[student.id].total += getInvoiceBalance(invoice);
    return groups;
  }, {});
  const rows = Object.values(arrearsByStudent).sort((a, b) => b.total - a.total);
  const invoiceCount = rows.reduce((sum, row) => sum + row.invoices.length, 0);
  const outstandingTotal = rows.reduce((sum, row) => sum + row.total, 0);
  const sendReminder = ({ student, invoices, total }) => {
    const template = data.waTemplates.find((item) => item.id === 'wa-reminder') || data.waTemplates[0];
    if (!template || !student.parentWhatsapp) { setFeedback('Template atau nomor tujuan fiktif tidak tersedia.'); return; }
    const invoice = invoices[0];
    const values = {
      nama: student.name,
      periode: formatPeriod(invoice.month, invoice.year),
      nominal: formatRupiah(total),
      sisa: formatRupiah(total),
    };
    const body = template.body.replace(/\{(nama|periode|nominal|sisa)\}/g, (_, key) => values[key]);
    sendWhatsAppSimulation({ studentId: student.id, templateId: template.id, templateName: template.name, recipient: student.parentWhatsapp, body });
    setFeedback(`Pengingat Terkirim (Simulasi) dicatat untuk ${student.name}. Tidak ada pesan sungguhan yang dikirim.`);
  };

  return (
    <div>
      <PageHeader title="Data Tunggakan SPP" description="Sisa tagihan dihitung dari nominal tagihan dikurangi seluruh transaksi yang tercatat." />
      {feedback && <p className="inline-feedback" role="status">{feedback}</p>}
      <div className="arrears-summary-grid">
        <article className="metric-card"><span className="metric-label">Siswa menunggak</span><strong className="metric-value">{rows.length}</strong><span className="metric-note">Sesuai filter yang dipilih</span></article>
        <article className="metric-card"><span className="metric-label">Periode tagihan terbuka</span><strong className="metric-value">{invoiceCount}</strong><span className="metric-note">Termasuk tagihan sebagian</span></article>
        <article className="metric-card"><span className="metric-label">Total sisa tunggakan</span><strong className="metric-value">{formatRupiah(outstandingTotal)}</strong><span className="metric-note">Dihitung dari saldo tagihan</span></article>
      </div>
      <div className="page-toolbar arrears-filters">
        <select className="filter-control" aria-label="Filter kelas" value={classId} onChange={(event) => setClassId(event.target.value)}><option value="all">Semua kelas</option>{data.classes.map((klass) => <option key={klass.id} value={klass.id}>{klass.name}</option>)}</select>
        <select className="filter-control" aria-label="Filter periode tunggakan" value={period} onChange={(event) => setPeriod(event.target.value)}><option value="all">Semua periode</option>{periods.map((item) => <option key={item.key} value={item.key}>{formatPeriod(item.month, item.year)}</option>)}</select>
      </div>
      <div className="table-card arrears-table"><div className="table-scroll"><table className="data-table">
        <thead><tr><th>Siswa</th><th>Kelas</th><th>Periode belum lunas</th><th>Jumlah bulan</th><th>Total sisa</th><th>Pengingat</th></tr></thead>
        <tbody>{rows.map(({ student, invoices, total }) => <tr key={student.id}>
          <td><span className="cell-primary">{student.name}</span><span className="cell-secondary">NIS {student.nis}</span></td>
          <td>{classById[student.classId] || '-'}</td>
          <td><div className="arrears-period-list">{invoices.sort((a, b) => b.year - a.year || b.month - a.month).map((invoice) => <span className="arrears-period" key={invoice.id}>{formatPeriod(invoice.month, invoice.year)}{invoice.status === 'partial' ? ' · Sebagian' : ''}</span>)}</div></td>
          <td>{invoices.length} bulan</td><td className="cell-primary">{formatRupiah(total)}</td>
          <td><button className="table-action" disabled={!student.parentWhatsapp || !data.waTemplates.length} title="Pesan hanya dicatat sebagai simulasi." onClick={() => sendReminder({ student, invoices, total })}>Kirim Pengingat (Simulasi)</button></td>
        </tr>)}{!rows.length && <tr><td className="table-empty" colSpan="6">Tidak ada tunggakan untuk filter ini.</td></tr>}</tbody>
      </table></div>
        <div className="table-caption">Data ini bersumber dari tagihan dan transaksi demo. Tombol pengingat hanya mencatat pesan simulasi.</div>
      </div>
    </div>
  );
}
