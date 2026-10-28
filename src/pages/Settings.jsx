import React, { useState } from 'react';
import { KeyRound, ShieldCheck } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import { useData } from '../app/DataProvider';

export default function Settings() {
  const { demoCredentials, adminProfile, updateDemoCredentials, updateAdminProfile } = useData();
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const username = formData.get('username')?.toString().trim() || '';
    const password = formData.get('password')?.toString() || '';
    const name = formData.get('name')?.toString().trim() || '';
    const email = formData.get('email')?.toString().trim() || '';
    const defaultPaymentMethod = formData.get('defaultPaymentMethod')?.toString() || 'Tunai';
    if (username.length < 3) { setError('Username demo harus terdiri dari minimal 3 karakter.'); return; }
    if (password && password.length < 6) { setError('Kata sandi baru harus terdiri dari minimal 6 karakter.'); return; }
    if (!name || !email) { setError('Nama bendahara dan email wajib diisi.'); return; }
    updateDemoCredentials({ username, password });
    updateAdminProfile({ name, email, defaultPaymentMethod });
    event.currentTarget.elements.username.value = username;
    event.currentTarget.elements.password.value = '';
    event.currentTarget.elements.name.value = name;
    event.currentTarget.elements.email.value = email;
    setError('');
    setFeedback('Profil disimpan di browser. Kredensial login berlaku selama sesi halaman ini.');
  };

  return (
    <div>
      <PageHeader title="Pengaturan Akun Demo" description="Ubah kredensial simulasi yang hanya berlaku pada sesi frontend ini." />
      {feedback && <p className="inline-feedback" role="status">{feedback}</p>}
      <section className="content-card settings-card">
        <div className="payment-card-heading"><KeyRound size={19} color="var(--primary-600)" /><div><h3>Profil Bendahara dan Akun Demo</h3><p>Profil disimpan lokal di browser; kata sandi demo hanya berlaku selama sesi.</p></div></div>
        <form className="settings-form" onSubmit={handleSubmit}>
          <div className="field"><label htmlFor="settings-name">Nama bendahara</label><input id="settings-name" name="name" type="text" defaultValue={adminProfile.name} required /></div>
          <div className="field"><label htmlFor="settings-email">Email admin demo</label><input id="settings-email" name="email" type="email" defaultValue={adminProfile.email} required /></div>
          <div className="field"><label htmlFor="settings-default-method">Preferensi metode pembayaran</label><select id="settings-default-method" name="defaultPaymentMethod" defaultValue={adminProfile.defaultPaymentMethod}><option>Tunai</option><option>Transfer Bank</option><option>QRIS</option></select><span className="field-help">Dipakai sebagai pilihan awal pada formulir transaksi.</span></div>
          <div className="field"><label htmlFor="settings-username">Username demo</label><input id="settings-username" name="username" type="text" minLength="3" defaultValue={demoCredentials.username} required /></div>
          <div className="field"><label htmlFor="settings-password">Kata sandi baru</label><input id="settings-password" name="password" type="password" minLength="6" placeholder="Kosongkan untuk mempertahankan saat ini" /><span className="field-help">Password tidak ditampilkan kembali. Minimal 6 karakter jika diubah.</span></div>
          {error && <p className="settings-error" role="alert">{error}</p>}
          <button className="button button-primary" type="submit">Simpan Pengaturan Demo</button>
        </form>
        <div className="settings-demo-note"><ShieldCheck size={16} /><span>Login tetap simulasi sisi frontend; perubahan profil tersimpan lokal dan bukan autentikasi aman.</span></div>
      </section>
    </div>
  );
}
