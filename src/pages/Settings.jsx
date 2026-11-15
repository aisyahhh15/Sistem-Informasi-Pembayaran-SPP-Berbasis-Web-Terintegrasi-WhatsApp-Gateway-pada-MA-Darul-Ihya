import React, { useMemo, useState } from 'react';
import { KeyRound, Pencil, ShieldCheck, Trash2, UserPlus, Users } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Feedback from '../components/ui/Feedback';
import { useData } from '../app/DataProvider';

const emptyAccount = { name: '', username: '', password: '' };

export default function Settings() {
  const { accounts, adminProfile, updateDemoCredentials, updateAdminProfile, createTuAccount, updateTuAccount, deleteTuAccount } = useData();
  const adminAccount = accounts.find((account) => account.role === 'admin');
  const tuAccounts = useMemo(() => accounts.filter((account) => account.role === 'tu'), [accounts]);
  const [feedback, setFeedback] = useState('');
  const [adminError, setAdminError] = useState('');
  const [accountError, setAccountError] = useState('');
  const [accountForm, setAccountForm] = useState(emptyAccount);
  const [editingId, setEditingId] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const username = formData.get('username')?.toString().trim() || '';
    const password = formData.get('password')?.toString() || '';
    const name = formData.get('name')?.toString().trim() || '';
    const email = formData.get('email')?.toString().trim() || '';
    const defaultPaymentMethod = formData.get('defaultPaymentMethod')?.toString() || 'Tunai';
    if (username.length < 3) { setAdminError('Username Admin minimal 3 karakter.'); return; }
    if (password && password.length < 6) { setAdminError('Kata sandi baru minimal 6 karakter.'); return; }
    if (accounts.some((account) => account.username.toLocaleLowerCase('id-ID') === username.toLocaleLowerCase('id-ID') && account.role !== 'admin')) { setAdminError('Username sudah digunakan akun lain.'); return; }
    if (!name || !email) { setAdminError('Nama bendahara dan email wajib diisi.'); return; }
    updateDemoCredentials({ username, password });
    updateAdminProfile({ name, email, defaultPaymentMethod });
    event.currentTarget.elements.password.value = '';
    setAdminError('');
    setFeedback('Profil dan akun Admin demo tersimpan di browser.');
  };

  const resetAccountForm = () => { setAccountForm(emptyAccount); setEditingId(null); setAccountError(''); };
  const handleAccountSubmit = (event) => {
    event.preventDefault();
    const username = accountForm.username.trim();
    const name = accountForm.name.trim();
    const password = accountForm.password;
    if (username.length < 3 || !name) { setAccountError('Nama dan username TU wajib diisi; username minimal 3 karakter.'); return; }
    if (!editingId && password.length < 6) { setAccountError('Kata sandi akun baru minimal 6 karakter.'); return; }
    if (password && password.length < 6) { setAccountError('Kata sandi baru minimal 6 karakter.'); return; }
    const duplicate = accounts.some((account) => account.id !== editingId && account.username.toLocaleLowerCase('id-ID') === username.toLocaleLowerCase('id-ID'));
    if (duplicate) { setAccountError('Username sudah dipakai. Gunakan username lain.'); return; }
    if (editingId) updateTuAccount(editingId, { username, name, password });
    else createTuAccount({ username, name, password });
    setFeedback(editingId ? 'Akun Tata Usaha berhasil diperbarui.' : 'Akun Tata Usaha berhasil dibuat.');
    resetAccountForm();
  };

  const editAccount = (account) => {
    setEditingId(account.id);
    setAccountForm({ name: account.name, username: account.username, password: '' });
    setAccountError('');
    setFeedback('');
  };

  const removeAccount = (account) => {
    setPendingDelete(account);
  };
  const confirmDeleteAccount = () => {
    deleteTuAccount(pendingDelete.id);
    if (editingId === pendingDelete.id) resetAccountForm();
    setFeedback(`Akun ${pendingDelete.username} berhasil dihapus dari data simulasi.`);
    setPendingDelete(null);
  };

  return <div>
    <PageHeader title="Pengaturan & Kelola Akun" description="Atur akun demo Admin dan Tata Usaha. Semua akun hanya berlaku untuk simulasi frontend." />
    <Feedback message={feedback} />
    <section className="content-card settings-card settings-account-card">
      <div className="payment-card-heading"><KeyRound size={19} color="var(--primary-600)" /><div><h3>Profil dan Akun Admin</h3><p>Akun utama memiliki akses pengelolaan sistem dan akun Tata Usaha.</p></div></div>
      <form className="settings-form" onSubmit={handleSubmit}>
        <div className="field"><label htmlFor="settings-name">Nama bendahara</label><input id="settings-name" name="name" type="text" defaultValue={adminProfile.name} required /></div>
        <div className="field"><label htmlFor="settings-email">Email admin demo</label><input id="settings-email" name="email" type="email" defaultValue={adminProfile.email} required /></div>
        <div className="field"><label htmlFor="settings-default-method">Preferensi metode pembayaran</label><select id="settings-default-method" name="defaultPaymentMethod" defaultValue={adminProfile.defaultPaymentMethod}><option>Tunai</option><option>Transfer Bank</option></select><span className="field-help">Dipakai sebagai pilihan awal pada formulir transaksi.</span></div>
        <div className="field"><label htmlFor="settings-username">Username Admin</label><input id="settings-username" name="username" type="text" minLength="3" defaultValue={adminAccount?.username || ''} required /></div>
        <div className="field"><label htmlFor="settings-password">Kata sandi baru Admin</label><input id="settings-password" name="password" type="password" minLength="6" placeholder="Kosongkan untuk mempertahankan saat ini" /><span className="field-help">Minimal 6 karakter jika diubah.</span></div>
        <Feedback message={adminError} tone="error" />
        <button className="button button-primary" type="submit">Simpan Profil Admin</button>
      </form>
    </section>

    <section className="content-card settings-card tu-account-card">
      <div className="payment-card-heading"><Users size={19} color="var(--primary-600)" /><div><h3>Akun Tata Usaha</h3><p>TU dapat membuka tugas administrasi harian, tanpa menu konfigurasi Admin.</p></div><span className="account-count-badge">{tuAccounts.length} akun</span></div>
      <form className="tu-account-form" onSubmit={handleAccountSubmit}>
        <div className="tu-account-form-title"><UserPlus size={16} /><strong>{editingId ? 'Edit akun Tata Usaha' : 'Buat akun Tata Usaha'}</strong></div>
        <div className="tu-account-fields">
          <div className="field"><label htmlFor="tu-account-name">Nama petugas</label><input id="tu-account-name" autoComplete="off" value={accountForm.name} onChange={(event) => setAccountForm((current) => ({ ...current, name: event.target.value }))} placeholder="Contoh: Petugas TU 01" required /></div>
          <div className="field"><label htmlFor="tu-account-username">Username</label><input id="tu-account-username" autoComplete="off" minLength="3" value={accountForm.username} onChange={(event) => setAccountForm((current) => ({ ...current, username: event.target.value }))} placeholder="Username masuk" required /></div>
          <div className="field"><label htmlFor="tu-account-password">{editingId ? 'Kata sandi baru (opsional)' : 'Kata sandi'}</label><input id="tu-account-password" type="password" autoComplete="new-password" minLength="6" value={accountForm.password} onChange={(event) => setAccountForm((current) => ({ ...current, password: event.target.value }))} placeholder={editingId ? 'Kosongkan untuk tetap sama' : 'Minimal 6 karakter'} required={!editingId} /></div>
        </div>
        <Feedback message={accountError} tone="error" />
        <div className="account-form-actions"><button className="button button-primary" type="submit">{editingId ? 'Simpan Perubahan' : 'Buat Akun TU'}</button>{editingId && <button className="button button-secondary" type="button" onClick={resetAccountForm}>Batal</button>}</div>
      </form>
      <div className="tu-account-list" aria-label="Daftar akun Tata Usaha">
        {tuAccounts.map((account) => <article className="tu-account-row" key={account.id}>
          <div className="tu-account-avatar" aria-hidden="true">{account.name.trim().slice(0, 1).toLocaleUpperCase('id-ID')}</div>
          <div className="tu-account-info"><strong>{account.name}</strong><span>{account.username} · Tata Usaha</span></div>
          <div className="tu-account-actions"><button className="table-action" type="button" onClick={() => editAccount(account)} aria-label={`Edit akun ${account.username}`}><Pencil size={15} /> Edit</button><button className="table-action danger" type="button" onClick={() => removeAccount(account)} aria-label={`Hapus akun ${account.username}`}><Trash2 size={15} /> Hapus</button></div>
        </article>)}
        {!tuAccounts.length && <p className="tu-account-empty">Belum ada akun TU tambahan. Buat akun melalui formulir di atas.</p>}
      </div>
      <div className="settings-demo-note"><ShieldCheck size={16} /><span>Username dan kata sandi demo disimpan di browser dan bukan perlindungan akun sungguhan. Jangan gunakan kata sandi pribadi.</span></div>
    </section>
    {pendingDelete && <ConfirmDialog title="Hapus akun Tata Usaha?" message={`Akun ${pendingDelete.username} tidak dapat digunakan lagi untuk masuk setelah dihapus.`} confirmText="Hapus akun" onConfirm={confirmDeleteAccount} onCancel={() => setPendingDelete(null)} />}
  </div>;
}
