import React, { useMemo, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import EntityDialog from '../components/ui/EntityDialog';
import { useData } from '../app/DataProvider';

export default function Students() {
  const { data, saveStudent, deleteStudent } = useData();
  const [query, setQuery] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [dialog, setDialog] = useState(null);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState('');
  const classById = useMemo(() => Object.fromEntries(data.classes.map((item) => [item.id, item.name])), [data.classes]);
  const visibleStudents = data.students.filter((student) => {
    const term = query.trim().toLocaleLowerCase('id-ID');
    const matchesTerm = !term || student.name.toLocaleLowerCase('id-ID').includes(term) || student.nis.includes(term);
    return matchesTerm && (classFilter === 'all' || student.classId === classFilter);
  });
  const fields = [
    { name: 'nis', label: 'NIS', placeholder: 'Contoh: 26007' },
    { name: 'name', label: 'Nama siswa', placeholder: 'Nama lengkap' },
    { name: 'classId', label: 'Kelas', type: 'select', options: data.classes.map((item) => ({ value: item.id, label: item.name })) },
    { name: 'parentWhatsapp', label: 'WhatsApp orang tua (dummy)', type: 'tel', placeholder: '62812…', help: 'Gunakan nomor fiktif untuk prototipe.' },
    { name: 'status', label: 'Status', type: 'select', options: [{ value: 'Aktif', label: 'Aktif' }, { value: 'Nonaktif', label: 'Nonaktif' }] },
  ];

  const openForm = (student = null) => {
    setFeedback('');
    setDialog(student || { status: 'Aktif', classId: data.classes[0]?.id || '' });
  };
  const handleSave = (values) => {
    const duplicate = data.students.some((item) => item.nis === values.nis.trim() && item.id !== dialog.id);
    if (duplicate) { setFeedback('NIS tersebut sudah digunakan. Periksa kembali data siswa.'); return; }
    saveStudent({ ...dialog, ...values, nis: values.nis.trim(), name: values.name.trim(), parentWhatsapp: values.parentWhatsapp.trim() });
    setDialog(null);
    setFeedback(dialog.id ? 'Data siswa berhasil diperbarui.' : 'Siswa berhasil ditambahkan. Tagihan Oktober 2026 dibuat dari tarif aktif.');
  };
  const handleDelete = (student) => {
    if (!window.confirm(`Hapus ${student.name} beserta tagihan dan transaksi demo terkait?`)) return;
    deleteStudent(student.id);
    setFeedback('Data siswa dan data demo terkait berhasil dihapus.');
  };

  return (
    <div>
      <PageHeader title="Data Siswa" description="Cari dan kelola data siswa MA Darul Ihya." action={<button className="button button-primary" onClick={() => openForm()} disabled={!data.classes.length} title={!data.classes.length ? 'Tambahkan kelas terlebih dahulu sebelum mendaftarkan siswa.' : undefined}><Plus size={17} /> Tambah Siswa</button>} />
      {feedback && <p className="inline-feedback" role="status">{feedback}</p>}
      <div className="page-toolbar" style={{ marginBottom: 14 }}>
        <label className="filter-control" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Search size={16} aria-hidden="true" />
          <input aria-label="Cari nama atau NIS siswa" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari nama atau NIS" style={{ width: '100%', minWidth: 0, border: 0, outline: 0, background: 'transparent' }} />
        </label>
        <select className="filter-control" aria-label="Filter kelas" value={classFilter} onChange={(event) => setClassFilter(event.target.value)}>
          <option value="all">Semua kelas</option>
          {data.classes.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}
        </select>
      </div>
      <div className="table-card">
        <div className="table-scroll">
          <table className="data-table">
            <thead><tr><th>NIS / Nama</th><th>Kelas</th><th>WhatsApp orang tua</th><th>Status</th><th>Aksi</th></tr></thead>
            <tbody>
              {visibleStudents.map((student) => (
                <tr key={student.id}>
                  <td><span className="cell-primary">{student.name}</span><span className="cell-secondary">NIS {student.nis}</span></td>
                  <td>{classById[student.classId] || 'Kelas tidak tersedia'}</td>
                  <td>{student.parentWhatsapp}</td>
                  <td><span className={`status-badge ${student.status === 'Aktif' ? '' : 'neutral'}`}>{student.status}</span></td>
                  <td><div className="table-actions"><button className="table-action" onClick={() => setSelected(student)}>Detail</button><button className="table-action" onClick={() => openForm(student)}>Edit</button><button className="table-action danger" onClick={() => handleDelete(student)}>Hapus</button></div></td>
                </tr>
              ))}
              {!visibleStudents.length && <tr><td className="table-empty" colSpan="5">{data.students.length ? 'Tidak ada siswa yang cocok dengan pencarian.' : 'Belum ada data siswa.'}</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="table-caption">Menampilkan {visibleStudents.length} dari {data.students.length} siswa. Data kontak pada prototipe ini fiktif.</div>
      </div>
      {dialog && <EntityDialog title={dialog.id ? 'Edit Data Siswa' : 'Tambah Siswa'} fields={fields} initialValue={dialog} onSave={handleSave} onClose={() => setDialog(null)} />}
      {selected && (
        <div className="dialog-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setSelected(null)}>
          <section className="entity-dialog" role="dialog" aria-modal="true" aria-labelledby="student-detail-title">
            <header className="entity-dialog-header"><h3 id="student-detail-title">Detail Siswa</h3><button className="icon-button" onClick={() => setSelected(null)} aria-label="Tutup detail">×</button></header>
            <dl className="detail-list">
              <div className="detail-item"><dt>Nama</dt><dd>{selected.name}</dd></div><div className="detail-item"><dt>NIS</dt><dd>{selected.nis}</dd></div>
              <div className="detail-item"><dt>Kelas</dt><dd>{classById[selected.classId] || 'Tidak tersedia'}</dd></div><div className="detail-item"><dt>Status</dt><dd>{selected.status}</dd></div>
              <div className="detail-item"><dt>WhatsApp orang tua</dt><dd>{selected.parentWhatsapp}</dd></div>
            </dl>
          </section>
        </div>
      )}
    </div>
  );
}
