import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import EntityDialog from '../components/ui/EntityDialog';
import { useData } from '../app/DataProvider';
import { formatRupiah } from '../utils/formatters';

export default function SPP() {
  const { data, saveTariff, deleteTariff } = useData();
  const [dialog, setDialog] = useState(null);
  const [feedback, setFeedback] = useState('');
  const fields = [
    { name: 'schoolYear', label: 'Tahun ajaran', placeholder: '2026/2027', help: 'Format: YYYY/YYYY.' },
    { name: 'amount', label: 'Nominal SPP per bulan', type: 'number', min: '1', step: '1000', placeholder: '250000' },
  ];
  const handleSave = (values) => {
    const year = values.schoolYear.trim();
    if (!/^\d{4}\/\d{4}$/.test(year)) { setFeedback('Tahun ajaran harus menggunakan format YYYY/YYYY.'); return; }
    const duplicate = data.sppTariffs.some((item) => item.schoolYear === year && item.id !== dialog.id);
    if (duplicate) { setFeedback('Tarif untuk tahun ajaran tersebut sudah tersedia.'); return; }
    saveTariff({ ...dialog, schoolYear: year, amount: Number(values.amount) });
    setDialog(null);
    setFeedback(dialog.id ? 'Tarif berhasil diperbarui. Nilai tagihan historis tetap.' : 'Tarif berhasil ditambahkan dan diaktifkan. Nilai tagihan yang sudah terbentuk tidak berubah.');
  };
  const handleDelete = (tariff) => {
    if (!window.confirm(`Hapus tarif tahun ajaran ${tariff.schoolYear}? Tagihan yang sudah terbentuk tetap menyimpan nominalnya.`)) return;
    deleteTariff(tariff.id);
    setFeedback('Tarif dihapus. Nominal tagihan historis tidak berubah.');
  };

  return (
    <div>
      <PageHeader title="Data SPP & Tarif" description="Kelola nominal SPP bulanan berdasarkan tahun ajaran." action={<button className="button button-primary" onClick={() => { setFeedback(''); setDialog({ amount: 250000 }); }}><Plus size={17} /> Tambah Tarif</button>} />
      {feedback && <p className="inline-feedback" role="status">{feedback}</p>}
      {data.sppTariffs.length ? <div className="tariff-grid">
        {data.sppTariffs.map((tariff) => (
          <article className="content-card tariff-card" key={tariff.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}><span className={`status-badge ${tariff.status === 'Aktif' ? '' : 'neutral'}`}>{tariff.status}</span><span className="cell-secondary">Tahun ajaran</span></div>
            <h3 style={{ marginTop: 12 }}>{tariff.schoolYear}</h3>
            <p className="tariff-amount">{formatRupiah(tariff.amount)}<span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}> / bulan</span></p>
            <div className="table-actions"><button className="table-action" onClick={() => { setFeedback(''); setDialog(tariff); }}>Edit</button><button className="table-action danger" onClick={() => handleDelete(tariff)}>Hapus</button></div>
          </article>
        ))}
      </div> : <div className="content-card" style={{ padding: 24, color: 'var(--text-secondary)' }}>Belum ada tarif. Tambahkan tarif agar tagihan untuk siswa baru dapat dibuat.</div>}
      <p className="cell-secondary" style={{ marginTop: 16 }}>Perubahan tarif berlaku untuk tagihan baru. Tagihan yang telah terbentuk menyimpan nominal historisnya.</p>
      {dialog && <EntityDialog title={dialog.id ? 'Edit Tarif SPP' : 'Tambah Tarif SPP'} fields={fields} initialValue={dialog} onSave={handleSave} onClose={() => setDialog(null)} />}
    </div>
  );
}
