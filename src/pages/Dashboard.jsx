import React, { useMemo } from 'react';
import { AlertTriangle, GraduationCap, ReceiptText, Users, Wallet } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import { useData } from '../app/DataProvider';
import { DEMO_PERIOD } from '../data';
import { formatDate, formatRupiah, getInvoiceBalance } from '../utils/formatters';

const monthLabels = ['Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt'];
const monthNumbers = [5, 6, 7, 8, 9, 10];

export default function Dashboard() {
  const { data } = useData();
  const studentById = useMemo(() => Object.fromEntries(data.students.map((student) => [student.id, student])), [data.students]);
  const currentInvoices = data.invoices.filter((invoice) => invoice.month === DEMO_PERIOD.month && invoice.year === DEMO_PERIOD.year);
  const studentsInArrears = new Set(data.invoices.filter((invoice) => getInvoiceBalance(invoice) > 0).map((invoice) => invoice.studentId));
  const arrearsTotal = data.invoices.reduce((sum, invoice) => sum + getInvoiceBalance(invoice), 0);
  const thisMonthTransactions = data.transactions.filter((transaction) => {
    const date = new Date(`${transaction.date}T00:00:00`);
    return date.getMonth() + 1 === DEMO_PERIOD.month && date.getFullYear() === DEMO_PERIOD.year;
  });
  const monthTotals = monthNumbers.map((month) => data.transactions
    .filter((transaction) => {
      const date = new Date(`${transaction.date}T00:00:00`);
      return date.getMonth() + 1 === month && date.getFullYear() === DEMO_PERIOD.year;
    })
    .reduce((sum, transaction) => sum + transaction.amount, 0));
  const maxMonthTotal = Math.max(...monthTotals, 1);
  const recentTransactions = [...data.transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  const metrics = [
    { label: 'Total Siswa', value: data.students.length, note: 'Data master siswa', icon: Users },
    { label: 'Total Guru', value: data.teachers?.length || 0, note: 'Tenaga pendidik', icon: GraduationCap },
    { label: 'Jumlah Transaksi', value: data.transactions.length, note: 'Seluruh periode tercatat', icon: ReceiptText },
    { label: 'Pemasukan Bulan Ini', value: formatRupiah(thisMonthTransactions.reduce((sum, item) => sum + item.amount, 0)), note: DEMO_PERIOD.label, icon: Wallet },
    { label: 'Siswa Menunggak', value: studentsInArrears.size, note: `Sisa tagihan ${formatRupiah(arrearsTotal)}`, icon: AlertTriangle },
  ];

  return (
    <div>
      <PageHeader title="Dashboard Utama" description={`Ringkasan pembayaran SPP · periode demo ${DEMO_PERIOD.label}`} />
      <section className="metric-grid" aria-label="Ringkasan pembayaran">
        {metrics.map(({ label, value, note, icon: Icon }) => <article className="metric-card" key={label}>
          <div className="metric-card-top"><span className="metric-label">{label}</span><span className="metric-icon"><Icon size={18} strokeWidth={1.8} aria-hidden="true" /></span></div>
          <strong className="metric-value">{value}</strong><span className="metric-note">{note}</span>
        </article>)}
      </section>

      <div className="dashboard-grid">
        <section className="dashboard-card" aria-labelledby="income-heading">
          <h3 id="income-heading">Pemasukan per Bulan</h3>
          <p className="dashboard-card-subtitle">Pembayaran tercatat pada tahun 2026</p>
          <div className="chart-bars" role="img" aria-label="Grafik pemasukan dari Mei sampai Oktober 2026">
            {monthTotals.map((total, index) => <div className="chart-column" key={monthNumbers[index]} title={`${monthLabels[index]}: ${formatRupiah(total)}`}>
              <span className="chart-value">{total ? `${(total / 1000000).toLocaleString('id-ID', { maximumFractionDigits: 2 })} jt` : '—'}</span>
              <div className="chart-bar" style={{ height: `${Math.max(total ? (total / maxMonthTotal) * 72 : 0, total ? 8 : 2)}%` }} />
              <span className="chart-label">{monthLabels[index]}</span>
            </div>)}
          </div>
          <div className="summary-box"><span>Tagihan Oktober lunas</span><strong>{currentInvoices.filter((invoice) => invoice.status === 'paid').length} dari {currentInvoices.length} siswa</strong></div>
        </section>

        <section className="dashboard-card" aria-labelledby="recent-heading">
          <h3 id="recent-heading">Pembayaran Terbaru</h3>
          <p className="dashboard-card-subtitle">Transaksi dari data demo</p>
          <div className="recent-list">
            {recentTransactions.map((transaction) => {
              const student = studentById[transaction.studentId];
              return <div className="recent-row" key={transaction.id}>
                <div><span className="recent-name">{student?.name || 'Siswa'}</span><span className="cell-secondary">{formatDate(transaction.date)} · {transaction.id}</span></div>
                <span className="recent-amount">{formatRupiah(transaction.amount)}</span>
              </div>;
            })}
            {!recentTransactions.length && <p className="table-empty">Belum ada pembayaran.</p>}
          </div>
          <div className="summary-box"><span>WhatsApp Gateway</span><strong>{data.waTemplates.length} template siap (Simulasi)</strong></div>
        </section>
      </div>
    </div>
  );
}
