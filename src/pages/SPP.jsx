import React, { useMemo, useState } from 'react';
import {
  BadgePercent, CalendarDays, CheckCircle2, GraduationCap, Info,
  Layers3, Plus, Search, Users, Wallet,
} from 'lucide-react';
import EntityDialog from '../components/ui/EntityDialog';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Feedback from '../components/ui/Feedback';
import { useData } from '../app/DataProvider';
import { formatRupiah } from '../utils/formatters';
import { PAYMENT_SCHEMES } from '../data';
import './SPP.css';

export default function SPP() {
  const { data, saveTariff, deleteTariff } = useData();
  const [dialog, setDialog] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [feedbackTone, setFeedbackTone] = useState('success');
  const [pendingDelete, setPendingDelete] = useState(null);
  const [schemeFilter, setSchemeFilter] = useState('Semua skema');
  const [query, setQuery] = useState('');
  const fields = [
    { name: 'schoolYear', label: 'Tahun ajaran', placeholder: '2026/2027', help: 'Format: YYYY/YYYY.' },
    { name: 'scheme', label: 'Skema pembayaran', type: 'select', defaultValue: 'Reguler', options: PAYMENT_SCHEMES.map((scheme) => ({ value: scheme, label: scheme })) },
    { name: 'amount', label: 'Nominal SPP per bulan', type: 'number', min: '1', step: '1000', placeholder: '250000' },
  ];
  const activeTariff = data.sppTariffs.find((tariff) => tariff.status === 'Aktif' && (tariff.scheme || 'Reguler') === 'Reguler');
  const visibleTariffs = useMemo(() => {
    const term = query.trim().toLocaleLowerCase('id-ID');
    return data.sppTariffs.filter((tariff) => {
      const scheme = tariff.scheme || 'Reguler';
      const matchesTerm = !term || tariff.schoolYear.toLocaleLowerCase('id-ID').includes(term) || scheme.toLocaleLowerCase('id-ID').includes(term);
      return matchesTerm && (schemeFilter === 'Semua skema' || scheme === schemeFilter);
    });
  }, [data.sppTariffs, query, schemeFilter]);

  const handleSave = (values) => {
    const year = values.schoolYear.trim();
    if (!/^\d{4}\/\d{4}$/.test(year)) { setFeedbackTone('error'); setFeedback('Tahun ajaran harus menggunakan format YYYY/YYYY.'); return; }
    const scheme = values.scheme || dialog.scheme || 'Reguler';
    const duplicate = data.sppTariffs.some((item) => item.schoolYear === year && (item.scheme || 'Reguler') === scheme && item.id !== dialog.id);
    if (duplicate) { setFeedbackTone('error'); setFeedback(`Tarif skema ${scheme} untuk tahun ajaran tersebut sudah tersedia.`); return; }
    saveTariff({ ...dialog, schoolYear: year, scheme, amount: Number(values.amount) });
    setDialog(null);
    setFeedbackTone('success');
    setFeedback(dialog.id ? 'Tarif berhasil diperbarui. Nilai tagihan historis tetap.' : 'Tarif berhasil ditambahkan dan diaktifkan. Nilai tagihan yang sudah terbentuk tidak berubah.');
  };

  const confirmDelete = () => {
    deleteTariff(pendingDelete.id);
    setPendingDelete(null);
    setFeedbackTone('success');
    setFeedback('Tarif dihapus. Nominal tagihan historis tidak berubah.');
  };

  return (
    <div className="spp-page">
      <header className="spp-page-heading">
        <div>
          <div className="spp-title-line">
            <span className="spp-title-icon"><Wallet size={21} /></span>
            <h1>Edit Tarif dan Skema</h1>
          </div>
          <p>Kelola nominal SPP berdasarkan tahun ajaran. Tarif yang sudah dipakai pada tagihan akan tetap tersimpan sebagai nilai historis.</p>
        </div>
        <button className="button button-primary" onClick={() => { setFeedback(''); setDialog({ amount: 250000 }); }}>
          <Plus size={17} /> Tambah Tarif SPP
        </button>
      </header>

      <Feedback message={feedback} tone={feedbackTone} />

      <section className="spp-summary-grid" aria-label="Ringkasan tarif dan data madrasah">
        <article className="spp-summary-card">
          <div className="spp-summary-top"><span>Tarif SPP aktif</span><span className="spp-summary-icon"><Wallet size={17} /></span></div>
          <strong>{activeTariff ? formatRupiah(activeTariff.amount) : 'Belum diatur'}</strong>
          <small>{activeTariff ? `${activeTariff.schoolYear} · per bulan` : 'Tambahkan tarif untuk memulai'}</small>
        </article>
        <article className="spp-summary-card">
          <div className="spp-summary-top"><span>Siswa terdaftar</span><span className="spp-summary-icon"><Users size={17} /></span></div>
          <strong>{data.students.length}</strong>
          <small>Data siswa demo</small>
        </article>
        <article className="spp-summary-card">
          <div className="spp-summary-top"><span>Rombongan belajar</span><span className="spp-summary-icon"><GraduationCap size={18} /></span></div>
          <strong>{data.classes.length}</strong>
          <small>Kelas pada data master</small>
        </article>
        <article className="spp-summary-card">
          <div className="spp-summary-top"><span>Skema tarif tersimpan</span><span className="spp-summary-icon"><Layers3 size={17} /></span></div>
          <strong>{data.sppTariffs.length}</strong>
          <small>Tarif menurut tahun ajaran</small>
        </article>
      </section>

      <div className="spp-content-grid">
        <section className="spp-tariff-panel" aria-labelledby="spp-tariff-title">
          <div className="spp-panel-heading">
            <div>
              <h2 id="spp-tariff-title">Daftar Tarif SPP</h2>
              <p>Atur nominal tarif untuk tahun ajaran.</p>
            </div>
            <span className="spp-record-count">{data.sppTariffs.length} tarif</span>
          </div>

          <div className="spp-table-toolbar">
            <label className="spp-search">
              <Search size={16} aria-hidden="true" />
              <input aria-label="Cari tahun ajaran" placeholder="Cari tahun ajaran..." value={query} onChange={(event) => setQuery(event.target.value)} />
            </label>
            <select className="spp-scheme-filter" aria-label="Filter skema pembayaran" value={schemeFilter} onChange={(event) => setSchemeFilter(event.target.value)}>
              <option>Semua skema</option>
              {PAYMENT_SCHEMES.map((scheme) => <option key={scheme}>{scheme}</option>)}
            </select>
            <span className="spp-current-year"><CalendarDays size={15} /> T.A. {activeTariff?.schoolYear || 'Belum ditentukan'}</span>
          </div>

          <div className="spp-table-scroll">
            <table className="spp-table">
              <thead><tr><th>Tahun ajaran</th><th>Skema pembayaran</th><th>Nominal per bulan</th><th>Status</th><th>Aksi</th></tr></thead>
              <tbody>
                {visibleTariffs.map((tariff) => (
                  <tr key={tariff.id}>
                    <td><span className="spp-year-cell"><CalendarDays size={16} />{tariff.schoolYear}</span></td>
                    <td><span className={`spp-scheme-badge scheme-${(tariff.scheme || 'Reguler').toLowerCase().replaceAll(' ', '-')}`}>{tariff.scheme || 'Reguler'}</span></td>
                    <td className="spp-amount-cell">{formatRupiah(tariff.amount)}</td>
                    <td><span className={`spp-status${tariff.status === 'Aktif' ? ' is-active' : ''}`}><CheckCircle2 size={13} />{tariff.status}</span></td>
                    <td><div className="spp-row-actions"><button type="button" className="table-action" onClick={() => { setFeedback(''); setDialog(tariff); }}>Edit</button><button type="button" className="table-action danger" onClick={() => setPendingDelete(tariff)}>Hapus</button></div></td>
                  </tr>
                ))}
                {!visibleTariffs.length && <tr><td className="spp-empty" colSpan="5">{data.sppTariffs.length ? 'Tidak ada tarif yang cocok.' : 'Belum ada tarif. Tambahkan tarif agar tagihan siswa baru dapat dibuat.'}</td></tr>}
              </tbody>
            </table>
          </div>
          <footer className="spp-table-footer">Menampilkan {visibleTariffs.length} dari {data.sppTariffs.length} tarif. Perubahan hanya berlaku untuk tagihan baru.</footer>
        </section>

        <aside className="spp-scheme-panel" aria-labelledby="spp-scheme-title">
          <div className="spp-scheme-heading">
            <span className="spp-scheme-icon"><BadgePercent size={19} /></span>
            <div><h2 id="spp-scheme-title">Skema Beasiswa PIP</h2><p>Informasi program bantuan</p></div>
          </div>
          <div className="spp-scheme-note">
            <Info size={17} />
            <p>Beasiswa PIP adalah bantuan pendidikan untuk siswa yang memenuhi ketentuan program. Pengelolaan penerima dan pencairan bantuan tidak dilakukan melalui pengaturan tarif SPP ini.</p>
          </div>
          <div className="spp-scheme-detail">
            <span>Status pada prototipe</span>
            <strong>Informasi saja</strong>
          </div>
          <div className="spp-scheme-footnote">Nominal tarif SPP dan tagihan siswa tidak otomatis berubah karena informasi bantuan PIP.</div>
        </aside>
      </div>

      <div className="spp-history-note"><Info size={16} /><span>Tarif historis pada tagihan yang sudah terbentuk tidak berubah saat tarif baru ditambahkan atau diperbarui.</span></div>

      {dialog && <EntityDialog title={dialog.id ? 'Edit Tarif SPP' : 'Tambah Tarif SPP'} fields={fields} initialValue={dialog} onSave={handleSave} onClose={() => setDialog(null)} />}
      {pendingDelete && <ConfirmDialog title="Hapus tarif SPP?" message={`Tarif tahun ajaran ${pendingDelete.schoolYear} akan dihapus. Nominal tagihan historis tetap dipertahankan.`} confirmText="Hapus tarif" onConfirm={confirmDelete} onCancel={() => setPendingDelete(null)} />}
    </div>
  );
}
