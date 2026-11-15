import React, { useMemo, useState } from 'react';
import { AlertTriangle, ArrowRight, CheckCircle2, CircleDollarSign, MessageCircle, Search, Users, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/layout/PageHeader';
import Feedback from '../components/ui/Feedback';
import { useData } from '../app/DataProvider';
import { formatPeriod, formatRupiah, getInvoiceBalance } from '../utils/formatters';
import './Arrears.css';

const getTier = (monthCount) => monthCount >= 3 ? 'critical' : monthCount === 2 ? 'medium' : 'new';

export default function Arrears() {
  const { data, sendWhatsAppSimulation } = useData();
  const [classId, setClassId] = useState('all');
  const [period, setPeriod] = useState('all');
  const [status, setStatus] = useState('all');
  const [tier, setTier] = useState('all');
  const [query, setQuery] = useState('');
  const [feedback, setFeedback] = useState('');
  const [feedbackTone, setFeedbackTone] = useState('success');
  const studentById = useMemo(() => Object.fromEntries(data.students.map((student) => [student.id, student])), [data.students]);
  const classById = useMemo(() => Object.fromEntries(data.classes.map((klass) => [klass.id, klass.name])), [data.classes]);
  const allOpenInvoices = data.invoices.filter((invoice) => getInvoiceBalance(invoice) > 0);
  const periods = [...new Map(allOpenInvoices.map((invoice) => {
    const key = `${invoice.year}-${invoice.month}`;
    return [key, { key, month: invoice.month, year: invoice.year }];
  })).values()].sort((a, b) => b.year - a.year || b.month - a.month);
  const grouped = allOpenInvoices.reduce((result, invoice) => {
    const student = studentById[invoice.studentId];
    if (!student) return result;
    if (!result[student.id]) result[student.id] = { student, invoices: [], total: 0 };
    result[student.id].invoices.push(invoice);
    result[student.id].total += getInvoiceBalance(invoice);
    return result;
  }, {});
  const allRows = Object.values(grouped).map((row) => ({
    ...row,
    invoices: row.invoices.sort((a, b) => a.year - b.year || a.month - b.month),
  })).sort((a, b) => b.invoices.length - a.invoices.length || b.total - a.total);
  const tierCounts = {
    critical: allRows.filter((row) => getTier(row.invoices.length) === 'critical').length,
    medium: allRows.filter((row) => getTier(row.invoices.length) === 'medium').length,
    new: allRows.filter((row) => getTier(row.invoices.length) === 'new').length,
  };
  const rows = allRows.map((row) => ({
    ...row,
    invoices: row.invoices.filter((invoice) => (period === 'all' || `${invoice.year}-${invoice.month}` === period)
      && (status === 'all' || (status === 'partial' ? getInvoiceBalance(invoice) < invoice.amount : getInvoiceBalance(invoice) === invoice.amount))),
  })).map((row) => ({ ...row, total: row.invoices.reduce((sum, invoice) => sum + getInvoiceBalance(invoice), 0) }))
    .filter(({ student, invoices }) => invoices.length
      && (classId === 'all' || student.classId === classId)
      && (tier === 'all' || getTier(invoices.length) === tier)
      && (!query.trim() || [student.name, student.nis, student.parentWhatsapp].some((value) => value?.toLocaleLowerCase('id-ID').includes(query.trim().toLocaleLowerCase('id-ID')))));
  const totalOutstanding = allOpenInvoices.reduce((sum, invoice) => sum + getInvoiceBalance(invoice), 0);
  const criticalStudents = allRows.filter((row) => getTier(row.invoices.length) === 'critical').length;
  const arrearsStudentIds = new Set(allRows.map((row) => row.student.id));
  const remindedStudentIds = new Set(data.waMessages.filter((message) => message.status === 'Terkirim (Simulasi)' && arrearsStudentIds.has(message.studentId)).map((message) => message.studentId));
  const byClass = data.classes.map((klass) => {
    const classRows = allRows.filter((row) => row.student.classId === klass.id);
    return { id: klass.id, name: klass.name, count: classRows.length, total: classRows.reduce((sum, row) => sum + row.total, 0) };
  }).filter((item) => item.count);
  const byMonth = periods.map((item) => ({
    ...item,
    count: allOpenInvoices.filter((invoice) => invoice.month === item.month && invoice.year === item.year).length,
    total: allOpenInvoices.filter((invoice) => invoice.month === item.month && invoice.year === item.year).reduce((sum, invoice) => sum + getInvoiceBalance(invoice), 0),
  }));
  const reminderTemplate = data.waTemplates.find((item) => item.id === 'wa-reminder') || data.waTemplates[0];
  const previewRow = allRows[0];
  const previewMessage = reminderTemplate && previewRow
    ? reminderTemplate.body.replace(/\{(nama|periode|nominal|sisa)\}/g, (_, key) => ({
      nama: previewRow.student.name,
      periode: previewRow.invoices.map((invoice) => formatPeriod(invoice.month, invoice.year)).join(', '),
      nominal: formatRupiah(previewRow.total),
      sisa: formatRupiah(previewRow.total),
    })[key])
    : 'Template pesan simulasi belum tersedia.';

  const sendReminder = ({ student, invoices, total }) => {
    if (!reminderTemplate || !student.parentWhatsapp) {
      setFeedbackTone('error');
      setFeedback('Template atau nomor tujuan fiktif tidak tersedia.');
      return;
    }
    const detailBulan = invoices.map((invoice) => formatPeriod(invoice.month, invoice.year)).join(', ');
    const values = { nama: student.name, periode: detailBulan, nominal: formatRupiah(total), sisa: `${detailBulan} — ${formatRupiah(total)}` };
    const body = reminderTemplate.body.replace(/\{(nama|periode|nominal|sisa)\}/g, (_, key) => values[key]);
    sendWhatsAppSimulation({ studentId: student.id, templateId: reminderTemplate.id, templateName: reminderTemplate.name, recipient: student.parentWhatsapp, body });
    setFeedbackTone('success');
    setFeedback(`Pengingat Terkirim (Simulasi) dicatat untuk ${student.name}. Tidak ada pesan sungguhan yang dikirim.`);
  };

  return <div className="arrears-page">
    <PageHeader title="Monitoring Tunggakan SPP & Tagihan Belum Lunas" description="Pantau rincian tunggakan per siswa, durasi keterlambatan, dan saldo setiap bulan." />
    <Feedback message={feedback} tone={feedbackTone} />

    <section className="arrears-kpi-grid" aria-label="Ringkasan tunggakan">
      <article className="arrears-kpi-card"><div><span>Total siswa menunggak</span><strong>{allRows.length} <small>siswa</small></strong></div><i><Users size={20} /></i><p>Berdasarkan seluruh tagihan terbuka</p></article>
      <article className="arrears-kpi-card is-green"><div><span>Total nominal piutang SPP</span><strong>{formatRupiah(totalOutstanding)}</strong></div><i><Wallet size={20} /></i><p>Akumulasi sisa seluruh tagihan</p></article>
      <article className="arrears-kpi-card is-red"><div><span>Kategori kritis (3+ bulan)</span><strong>{criticalStudents} <small>siswa</small></strong></div><i><AlertTriangle size={20} /></i><p>Prioritas untuk ditindaklanjuti</p></article>
      <article className="arrears-kpi-card is-green"><div><span>Pengingat WhatsApp</span><strong>{remindedStudentIds.size} <small>/ {allRows.length} siswa</small></strong></div><i><MessageCircle size={20} /></i><p>Dicatat sebagai simulasi</p></article>
    </section>

    <section className="arrears-filter-panel" aria-label="Filter tunggakan">
      <div className="arrears-tier-tabs" role="group" aria-label="Filter durasi tunggakan">
        <button className={tier === 'all' ? 'active' : ''} onClick={() => setTier('all')} type="button">Semua ({allRows.length})</button>
        <button className={`critical${tier === 'critical' ? ' active' : ''}`} onClick={() => setTier(tier === 'critical' ? 'all' : 'critical')} type="button">Kritis 3+ bulan ({tierCounts.critical})</button>
        <button className={`medium${tier === 'medium' ? ' active' : ''}`} onClick={() => setTier(tier === 'medium' ? 'all' : 'medium')} type="button">Menengah 2 bulan ({tierCounts.medium})</button>
        <button className={`new${tier === 'new' ? ' active' : ''}`} onClick={() => setTier(tier === 'new' ? 'all' : 'new')} type="button">Baru 1 bulan ({tierCounts.new})</button>
      </div>
      <div className="arrears-filter-controls">
        <label className="arrears-search"><Search size={17} aria-hidden="true" /><input aria-label="Cari nama siswa, NIS, atau WhatsApp wali" placeholder="Cari nama, NIS, atau nomor wali..." value={query} onChange={(event) => setQuery(event.target.value)} /></label>
        <select className="filter-control" aria-label="Filter kelas" value={classId} onChange={(event) => setClassId(event.target.value)}><option value="all">Semua kelas</option>{data.classes.map((klass) => <option key={klass.id} value={klass.id}>{klass.name}</option>)}</select>
        <select className="filter-control" aria-label="Filter periode tunggakan" value={period} onChange={(event) => setPeriod(event.target.value)}><option value="all">Semua bulan</option>{periods.map((item) => <option key={item.key} value={item.key}>{formatPeriod(item.month, item.year)}</option>)}</select>
        <select className="filter-control" aria-label="Filter status pembayaran" value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">Semua status</option><option value="unpaid">Belum dibayar</option><option value="partial">Dibayar sebagian</option></select>
      </div>
    </section>

    <section className="arrears-table-card" aria-label="Daftar rincian tunggakan">
      <header className="arrears-table-heading"><div><h2>Daftar Rincian Tunggakan Siswa Aktif</h2><p>Setiap periode dan sisa tagihan ditampilkan untuk masing-masing siswa.</p></div><span>{rows.length} siswa ditampilkan</span></header>
      <div className="arrears-table-scroll"><table className="arrears-data-table">
        <thead><tr><th>Identitas siswa & wali</th><th>Status & durasi</th><th>Rincian tagihan bulanan belum lunas</th><th>Total piutang</th><th>Status WA</th><th>Aksi</th></tr></thead>
        <tbody>{rows.map(({ student, invoices, total }) => {
          const rowTier = getTier(invoices.length);
          const hasReminder = remindedStudentIds.has(student.id);
          return <tr key={student.id} className={rowTier === 'critical' ? 'is-critical' : ''}>
            <td><strong className="arrears-student-name">{student.name}</strong><span className="arrears-secondary">NIS {student.nis} · {classById[student.classId] || 'Kelas —'}</span><span className="arrears-secondary">Wali: {student.parentWhatsapp || 'Nomor belum tersedia'}</span></td>
            <td><span className={`arrears-duration ${rowTier}`}>{invoices.length} bulan menunggak</span>{rowTier === 'critical' && <span className="arrears-critical-note">Prioritas tunggakan</span>}</td>
            <td><div className="arrears-month-lines">{invoices.map((invoice) => {
              const balance = getInvoiceBalance(invoice);
              const partial = balance < invoice.amount;
              return <div className="arrears-month-line" key={invoice.id}><strong>{formatPeriod(invoice.month, invoice.year)}</strong><span>{formatRupiah(invoice.amount)}</span><small>Sisa {formatRupiah(balance)} · {partial ? 'Dibayar Sebagian' : 'Belum Dibayar'}</small></div>;
            })}</div></td>
            <td><strong className="arrears-total-amount">{formatRupiah(total)}</strong><span className="arrears-secondary">Sisa tagihan</span></td>
            <td><span className={`arrears-wa-status${hasReminder ? ' sent' : ''}`}><CheckCircle2 size={14} />{hasReminder ? 'Terkirim (Simulasi)' : 'Belum dikirim (Simulasi)'}</span></td>
            <td><div className="arrears-row-actions"><Link className="arrears-pay-link" to="/payments/new" state={{ studentId: student.id }}>Bayar sekarang <ArrowRight size={14} /></Link><button className="arrears-remind-button" disabled={!student.parentWhatsapp || !reminderTemplate} title="Hanya mencatat pengiriman simulasi." onClick={() => sendReminder({ student, invoices, total })}><MessageCircle size={14} />Kirim WA (Simulasi)</button></div></td>
          </tr>;
        })}{!rows.length && <tr><td className="arrears-empty" colSpan="6">Tidak ada siswa yang cocok dengan filter tunggakan ini.</td></tr>}</tbody>
      </table></div>
      <footer className="arrears-table-footer">Menampilkan {rows.length} siswa · total sisa pada filter ini {formatRupiah(rows.reduce((sum, row) => sum + row.total, 0))}. <Link to="/payments/new">Buka transaksi pembayaran</Link></footer>
    </section>

    <section className="arrears-bottom-grid">
      <article className="arrears-recap-card"><header><div><CircleDollarSign size={19} /><h2>Rekap tunggakan per kelas & bulan</h2></div><span>Data aktual</span></header><p>Nilai dihitung dari saldo tagihan terbuka, bukan angka ringkasan terpisah.</p>
        <h3>Per kelas</h3><div className="arrears-recap-list">{byClass.map((item) => <div key={item.id}><span>{item.name} <small>{item.count} siswa</small></span><strong>{formatRupiah(item.total)}</strong></div>)}{!byClass.length && <span className="arrears-secondary">Tidak ada tunggakan.</span>}</div>
        <h3>Periode tagihan</h3><div className="arrears-recap-list">{byMonth.map((item) => <div key={item.key}><span>{formatPeriod(item.month, item.year)} <small>{item.count} tagihan</small></span><strong>{formatRupiah(item.total)}</strong></div>)}</div>
      </article>
      <article className="arrears-message-card"><header><div><MessageCircle size={19} /><h2>Pratinjau pengingat WhatsApp</h2></div><span>Simulasi</span></header><p>Pesan memakai template tersimpan dan tidak dikirim ke provider WhatsApp.</p><div className="arrears-message-preview">{previewMessage}</div><small>Pesan aktual untuk setiap siswa tersedia melalui tombol pengingat pada daftar di atas.</small></article>
    </section>
  </div>;
}
