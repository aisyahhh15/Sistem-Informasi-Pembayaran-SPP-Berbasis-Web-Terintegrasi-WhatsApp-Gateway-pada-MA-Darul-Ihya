import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, CalendarDays, GraduationCap, MessageCircle, Plus, ReceiptText, Users, Wallet } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import { useData } from '../app/DataProvider';
import { DEMO_PERIOD } from '../data';
import { formatDate, formatPeriod, formatRupiah, getInvoiceBalance } from '../utils/formatters';

const months = [5, 6, 7, 8, 9, 10];
const shortMonth = (month) => new Date(2026, month - 1, 1).toLocaleDateString('id-ID', { month: 'short' });

export default function Dashboard() {
  const { data, adminProfile } = useData();
  const studentById = useMemo(() => Object.fromEntries(data.students.map((student) => [student.id, student])), [data.students]);
  const classById = useMemo(() => Object.fromEntries(data.classes.map((item) => [item.id, item.name])), [data.classes]);
  const invoices = data.invoices.filter((item) => item.month === DEMO_PERIOD.month && item.year === DEMO_PERIOD.year);
  const paidInvoices = invoices.filter((item) => getInvoiceBalance(item) === 0);
  const unpaidInvoices = invoices.filter((item) => getInvoiceBalance(item) > 0);
  const arrearsTotal = data.invoices.reduce((sum, item) => sum + getInvoiceBalance(item), 0);
  const periodTransactions = data.transactions.filter((item) => {
    const date = new Date(`${item.date}T00:00:00`);
    return date.getMonth() + 1 === DEMO_PERIOD.month && date.getFullYear() === DEMO_PERIOD.year;
  });
  const income = periodTransactions.reduce((sum, item) => sum + item.amount, 0);
  const monthTotals = months.map((month) => data.transactions.filter((item) => {
    const date = new Date(`${item.date}T00:00:00`);
    return date.getMonth() + 1 === month && date.getFullYear() === DEMO_PERIOD.year;
  }).reduce((sum, item) => sum + item.amount, 0));
  const maxMonthTotal = Math.max(...monthTotals, 1);
  const recent = [...data.transactions].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id)).slice(0, 5);
  const arrearsByStudent = data.invoices.filter((item) => getInvoiceBalance(item) > 0).reduce((groups, invoice) => {
    if (!groups[invoice.studentId]) groups[invoice.studentId] = { studentId: invoice.studentId, invoices: [], total: 0 };
    groups[invoice.studentId].invoices.push(invoice);
    groups[invoice.studentId].total += getInvoiceBalance(invoice);
    return groups;
  }, {});
  const arrears = Object.values(arrearsByStudent).sort((a, b) => b.invoices.length - a.invoices.length || b.total - a.total).slice(0, 4);
  const arrearsByClass = data.classes.map((klass) => ({ ...klass, total: data.invoices.filter((invoice) => studentById[invoice.studentId]?.classId === klass.id).reduce((sum, invoice) => sum + getInvoiceBalance(invoice), 0) })).filter((klass) => klass.total > 0);
  const arrearsByMonth = [...new Map(data.invoices.filter((invoice) => getInvoiceBalance(invoice) > 0).map((invoice) => [`${invoice.year}-${invoice.month}`, invoice])).values()].map((period) => ({
    month: period.month, year: period.year,
    total: data.invoices.filter((invoice) => invoice.month === period.month && invoice.year === period.year).reduce((sum, invoice) => sum + getInvoiceBalance(invoice), 0),
  }));
  const totalArrearsMonths = data.invoices.filter((invoice) => getInvoiceBalance(invoice) > 0).length;
  const percentPaid = invoices.length ? Math.round((paidInvoices.length / invoices.length) * 100) : 0;
  const metrics = [
    { label: 'Total Siswa', value: data.students.length, note: `${data.classes.length} kelas terdaftar`, icon: Users },
    { label: 'Pembayaran Bulan Ini', value: formatRupiah(income), note: `${periodTransactions.length} transaksi · ${DEMO_PERIOD.label}`, icon: Wallet },
    { label: 'Sudah Membayar', value: `${paidInvoices.length} siswa`, note: `${percentPaid}% dari tagihan periode ini`, icon: ReceiptText },
    { label: 'Belum Membayar', value: `${unpaidInvoices.length} siswa`, note: `Tagihan ${DEMO_PERIOD.label}`, icon: GraduationCap },
    { label: 'Total Tunggakan', value: formatRupiah(arrearsTotal), note: `${new Set(data.invoices.filter((item) => getInvoiceBalance(item) > 0).map((item) => item.studentId)).size} siswa · semua periode`, icon: AlertTriangle },
  ];
  const greetingName = adminProfile.name.split(',')[0];
  const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return <div className="dashboard-page">
    <PageHeader title="Dashboard Utama" description={`Ringkasan keuangan dan aktivitas pembayaran · ${DEMO_PERIOD.label}`} action={<Link className="button button-primary" to="/payments/new"><Plus size={17} /> Transaksi Baru</Link>} />

    <section className="dashboard-welcome" aria-label="Sapaan dan ringkasan">
      <div className="dashboard-welcome-mark" aria-hidden="true"><GraduationCap size={112} /></div>
      <div className="dashboard-welcome-copy">
        <span className="dashboard-date"><CalendarDays size={14} />{today} <span aria-hidden="true">·</span> Periode demo {DEMO_PERIOD.label}</span>
        <h2>Ahlan wa Sahlan, {greetingName}</h2>
        <p>{percentPaid}% tagihan periode ini telah lunas. Pantau transaksi, periksa tunggakan, dan kelola pembayaran dari satu halaman.</p>
      </div>
      <div className="dashboard-welcome-actions">
        <Link className="button button-light" to="/reports">Lihat Laporan <ArrowRight size={16} /></Link>
        <Link className="button button-soft" to="/whatsapp"><MessageCircle size={16} /> Pengingat WA (Simulasi)</Link>
      </div>
    </section>

    <section className="metric-grid" aria-label="Ringkasan pembayaran">
      {metrics.map(({ label, value, note, icon: Icon }, index) => <article className="metric-card" key={label}>
        <div className="metric-card-top"><span className="metric-label">{label}</span><span className={`metric-icon metric-icon-${index}`}><Icon size={18} strokeWidth={1.8} aria-hidden="true" /></span></div>
        <strong className="metric-value">{value}</strong><span className="metric-note">{note}</span>
      </article>)}
    </section>

    <section className="dashboard-insights-grid" aria-label="Grafik dan kanal pembayaran">
      <article className="dashboard-card dashboard-income-card">
        <div className="dashboard-section-heading"><div><h3>Pemasukan per Bulan</h3><p className="dashboard-card-subtitle">Transaksi tercatat · tahun {DEMO_PERIOD.year}</p></div><span className="dashboard-period-pill"><CalendarDays size={14} /> {DEMO_PERIOD.label}</span></div>
        <div className="chart-bars" role="img" aria-label={`Grafik pemasukan dari ${shortMonth(months[0])} sampai ${shortMonth(months[months.length - 1])} ${DEMO_PERIOD.year}`}>
          {monthTotals.map((total, index) => <div className={`chart-column ${months[index] === DEMO_PERIOD.month ? 'chart-column-current' : ''}`} key={months[index]} title={`${shortMonth(months[index])}: ${formatRupiah(total)}`}>
            <span className="chart-value">{total ? `${(total / 1000000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} jt` : '—'}</span>
            <div className="chart-track"><div className="chart-bar" style={{ height: `${Math.max(total ? (total / maxMonthTotal) * 100 : 0, total ? 7 : 0)}%` }} /></div>
            <span className="chart-label">{shortMonth(months[index])}{months[index] === DEMO_PERIOD.month ? '*' : ''}</span>
          </div>)}
        </div>
        <div className="dashboard-chart-footer"><span>* Periode demo berjalan</span><strong>{formatRupiah(income)} diterima bulan ini</strong></div>
      </article>

      <article className="dashboard-card dashboard-payment-summary">
        <div className="dashboard-section-heading"><div><h3>Status Tagihan</h3><p className="dashboard-card-subtitle">Periode {DEMO_PERIOD.label}</p></div><Link className="dashboard-text-link" to="/arrears">Lihat tunggakan <ArrowRight size={14} /></Link></div>
        <div className="payment-progress" aria-label={`${paidInvoices.length} dari ${invoices.length} tagihan lunas`}><div style={{ width: `${percentPaid}%` }} /></div>
        <div className="payment-progress-label"><strong>{percentPaid}% lunas</strong><span>{paidInvoices.length} dari {invoices.length} tagihan</span></div>
        <div className="payment-status-rows">
          <div><span><i className="legend-dot paid-dot" />Lunas</span><strong>{paidInvoices.length}</strong></div>
          <div><span><i className="legend-dot due-dot" />Belum lunas</span><strong>{unpaidInvoices.length}</strong></div>
          <div><span><i className="legend-dot arrears-dot" />Total tunggakan</span><strong>{formatRupiah(arrearsTotal)}</strong></div>
        </div>
        <div className="dashboard-wa-note"><MessageCircle size={17} /><span>Status pengingat WhatsApp pada prototipe ini selalu berupa <strong>Simulasi</strong>.</span></div>
      </article>
    </section>

    <section className="dashboard-bottom-grid">
      <article className="dashboard-card dashboard-transactions-card">
        <div className="dashboard-section-heading"><div><h3>Pembayaran Terbaru</h3><p className="dashboard-card-subtitle">Transaksi terakhir dari data demo</p></div><Link className="dashboard-text-link" to="/payments/history">Semua riwayat <ArrowRight size={14} /></Link></div>
        <div className="dashboard-table-wrap"><table className="data-table dashboard-table"><thead><tr><th>Transaksi</th><th>Siswa</th><th>Periode</th><th>Tanggal</th><th className="amount-cell">Nominal</th></tr></thead><tbody>
          {recent.map((transaction) => { const student = studentById[transaction.studentId]; const invoice = data.invoices.find((item) => item.id === transaction.invoiceId); return <tr key={transaction.id}><td><span className="cell-primary dashboard-transaction-id">{transaction.id}</span></td><td><span className="cell-primary">{student?.name || 'Siswa'}</span><span className="cell-secondary">{classById[student?.classId] || 'Kelas —'}</span></td><td>{invoice ? formatPeriod(invoice.month, invoice.year) : '—'}</td><td>{formatDate(transaction.date)}</td><td className="amount-cell dashboard-amount">{formatRupiah(transaction.amount)}</td></tr>; })}
          {!recent.length && <tr><td className="table-empty" colSpan="5">Belum ada pembayaran.</td></tr>}
        </tbody></table></div>
      </article>

      <article className="dashboard-card dashboard-arrears-card">
        <div className="dashboard-section-heading"><div><h3>Tunggakan</h3><p className="dashboard-card-subtitle">Tagihan yang masih memiliki sisa</p></div><span className="dashboard-count-pill">{unpaidInvoices.length} periode</span></div>
        <div className="dashboard-arrears-list">{arrears.map(({ studentId, invoices: studentInvoices, total }) => { const student = studentById[studentId]; return <div className="dashboard-arrears-row" key={studentId}><div className="dashboard-arrears-icon"><AlertTriangle size={16} /></div><div className="dashboard-arrears-person"><strong>{student?.name || 'Siswa'}</strong><span>{classById[student?.classId] || 'Kelas —'} · {studentInvoices.length} bulan: {studentInvoices.map((item) => formatPeriod(item.month, item.year)).join(', ')}</span></div><strong className="dashboard-arrears-amount">{formatRupiah(total)}</strong></div>; })}
          {!arrears.length && <p className="table-empty">Tidak ada tunggakan.</p>}
        </div>
        <div className="table-caption">{new Set(data.invoices.filter((item) => getInvoiceBalance(item) > 0).map((item) => item.studentId)).size} siswa · {totalArrearsMonths} bulan tunggakan · Kelas: {arrearsByClass.map((item) => `${item.name}: ${formatRupiah(item.total)}`).join(' · ') || '—'} · Periode: {arrearsByMonth.map((item) => `${formatPeriod(item.month, item.year)}: ${formatRupiah(item.total)}`).join(' · ') || '—'}</div>
        <Link className="button button-secondary dashboard-arrears-link" to="/arrears">Kelola data tunggakan <ArrowRight size={15} /></Link>
      </article>
    </section>
  </div>;
}
