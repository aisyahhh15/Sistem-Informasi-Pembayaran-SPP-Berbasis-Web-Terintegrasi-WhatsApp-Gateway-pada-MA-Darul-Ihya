import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import EntityDialog from '../components/ui/EntityDialog';
import { useData } from '../app/DataProvider';

export default function Classes() {
  const { data, saveClass, deleteClass } = useData();
  const [dialog, setDialog] = useState(null);
  const [feedback, setFeedback] = useState('');
  const fields = [
    { name: 'name', label: 'Nama kelas', placeholder: 'Contoh: X-B' },
    { name: 'homeroomTeacher', label: 'Wali kelas', placeholder: 'Nama wali kelas', required: false },
  ];
  const countFor = (classId) => data.students.filter((student) => student.classId === classId).length;

  const handleSave = (values) => {
    const normalized = values.name.trim().toLocaleUpperCase('id-ID');
    if (data.classes.some((item) => item.name.toLocaleUpperCase('id-ID') === normalized && item.id !== dialog.id)) {
      setFeedback('Nama kelas sudah digunakan.');
      return;
    }
    saveClass({ ...dialog, ...values, name: normalized, homeroomTeacher: values.homeroomTeacher.trim() });
    setDialog(null);
    setFeedback(dialog.id ? 'Data kelas berhasil diperbarui.' : 'Kelas berhasil ditambahkan.');
  };
  const handleDelete = (klass) => {
    const count = countFor(klass.id);
    if (count) { setFeedback(`Kelas ${klass.name} masih memiliki ${count} siswa. Pindahkan siswa terlebih dahulu.`); return; }
    if (!window.confirm(`Hapus kelas ${klass.name}?`)) return;
    deleteClass(klass.id);
    setFeedback('Kelas berhasil dihapus.');
  };

  return (
    <div>
      <PageHeader title="Data Kelas" description="Atur daftar kelas dan wali kelas." action={<button className="button button-primary" onClick={() => { setFeedback(''); setDialog({}); }}><Plus size={17} /> Tambah Kelas</button>} />
      {feedback && <p className="inline-feedback" role="status">{feedback}</p>}
      <div className="table-card">
        <div className="table-scroll"><table className="data-table">
          <thead><tr><th>Nama kelas</th><th>Wali kelas</th><th>Jumlah siswa</th><th>Aksi</th></tr></thead>
          <tbody>
            {data.classes.map((klass) => (
              <tr key={klass.id}><td className="cell-primary">{klass.name}</td><td>{klass.homeroomTeacher || 'Belum ditentukan'}</td><td>{countFor(klass.id)} siswa</td>
                <td><div className="table-actions"><button className="table-action" onClick={() => { setFeedback(''); setDialog(klass); }}>Edit</button><button className="table-action danger" onClick={() => handleDelete(klass)}>Hapus</button></div></td></tr>
            ))}
            {!data.classes.length && <tr><td className="table-empty" colSpan="4">Belum ada kelas. Tambahkan kelas agar data siswa dapat dikelola.</td></tr>}
          </tbody>
        </table></div>
        <div className="table-caption">Jumlah siswa dihitung langsung dari data master siswa.</div>
      </div>
      {dialog && <EntityDialog title={dialog.id ? 'Edit Kelas' : 'Tambah Kelas'} fields={fields} initialValue={dialog} onSave={handleSave} onClose={() => setDialog(null)} />}
    </div>
  );
}
