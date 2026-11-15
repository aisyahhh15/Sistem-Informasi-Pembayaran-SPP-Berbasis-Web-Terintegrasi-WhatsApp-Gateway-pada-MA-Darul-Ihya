import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BadgeCheck, BookOpenCheck, CheckCircle2, Eye, EyeOff,
  GraduationCap, Landmark, LockKeyhole, LogIn, MessageCircle, ReceiptText,
  ShieldCheck, UserRound,
} from 'lucide-react';
import { useData } from '../app/DataProvider';
import Feedback from '../components/ui/Feedback';
import './Login.css';

const roles = [
  { id: 'admin', label: 'Bendahara', Icon: Landmark },
  { id: 'tu', label: 'Tata Usaha', Icon: BadgeCheck },
];

export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const { accounts, data } = useData();
  const [error, setError] = useState('');
  const [selectedRole, setSelectedRole] = useState('admin');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const username = formData.get('username')?.toString().trim() || '';
    const password = formData.get('password')?.toString() || '';
    const account = accounts.find((item) =>
      item.username.toLocaleLowerCase('id-ID') === username.toLocaleLowerCase('id-ID')
      && item.password === password
      && item.role === selectedRole,
    );

    if (!account) {
      setError('Periksa kembali akun demo dan peran yang dipilih.');
      return;
    }

    setError('');
    onLogin({ id: account.id, username: account.username, name: account.name, role: account.role });
    navigate('/');
  };

  const demoAccounts = roles.map((role) => ({
    ...role,
    account: accounts.find((item) => item.role === role.id),
  })).filter(({ account }) => account);

  return (
    <main className="login-page">
      <section className="login-story" aria-label="Informasi MA Darul Ihya">
        <div className="login-orb login-orb-top" aria-hidden="true" />
        <div className="login-orb login-orb-bottom" aria-hidden="true" />
        <div className="login-story-content">
          <header className="login-brand">
            <div className="login-brand-mark"><GraduationCap size={30} strokeWidth={1.8} /></div>
            <div>
              <h1>MA Darul Ihya</h1>
              <p>Madrasah Aliyah Darul Ihya</p>
            </div>
          </header>
          <div className="login-period"><span className="login-status-dot" />Periode demo · Oktober 2026</div>

          <div className="login-intro">
            <div className="login-trust-label"><ShieldCheck size={16} />Amanah &amp; Akuntabel</div>
            <h2>Sistem Informasi Pembayaran SPP</h2>
            <p>Kelola administrasi keuangan madrasah dengan pencatatan yang rapi, transparan, dan mudah ditinjau.</p>
          </div>

          <div className="login-feature-grid">
            <div className="login-feature-card">
              <span className="login-feature-icon"><MessageCircle size={20} /></span>
              <div><strong>Notifikasi WhatsApp</strong><span>Alur pesan dalam simulasi</span></div>
            </div>
            <div className="login-feature-card">
              <span className="login-feature-icon"><ReceiptText size={20} /></span>
              <div><strong>Catatan Pembayaran</strong><span>Riwayat transaksi terpusat</span></div>
            </div>
          </div>

          <div className="login-story-note">
            <div className="login-grade-mark" aria-hidden="true"><span>X</span><span>XI</span><span>XII</span></div>
            <div><strong>{data.students.length} siswa demo</strong><span>Data fiktif untuk pratinjau sistem</span></div>
          </div>
        </div>
        <footer className="login-story-footer">
          <span>© 2026 MA Darul Ihya</span>
          <span><CheckCircle2 size={15} />Portal administrasi · Mode demo</span>
        </footer>
      </section>

      <section className="login-access" aria-labelledby="login-heading">
        <div className="login-access-inner">
          <header className="login-access-heading">
            <div className="login-access-label"><LockKeyhole size={15} />Akses demo</div>
            <h2 id="login-heading">Ahlan wa Sahlan</h2>
            <p>Masuk ke portal administrasi keuangan MA Darul Ihya.</p>
          </header>

          <div className="login-form-card">
            <form onSubmit={handleLogin} className="login-form" noValidate>
              <fieldset className="login-role-fieldset">
                <legend>Pilih peran</legend>
                <div className="login-role-options">
                  {roles.map(({ id, label, Icon }) => (
                    <label className={`login-role-option${selectedRole === id ? ' is-selected' : ''}`} key={id}>
                      <input
                        type="radio"
                        name="role"
                        value={id}
                        checked={selectedRole === id}
                        onChange={() => { setSelectedRole(id); setError(''); }}
                      />
                      <Icon size={18} aria-hidden="true" />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="login-field">
                <label htmlFor="login-username">Username</label>
                <div className="login-input-wrap">
                  <UserRound size={19} aria-hidden="true" />
                  <input autoComplete="username" id="login-username" name="username" placeholder="Masukkan username" required />
                </div>
              </div>

              <div className="login-field">
                <label htmlFor="login-password">Kata sandi</label>
                <div className="login-input-wrap">
                  <LockKeyhole size={19} aria-hidden="true" />
                  <input autoComplete="current-password" id="login-password" name="password" placeholder="Masukkan kata sandi" required type={showPassword ? 'text' : 'password'} />
                  <button
                    aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                    className="login-password-toggle"
                    onClick={() => setShowPassword((visible) => !visible)}
                    type="button"
                  >
                    {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </div>
              </div>

              <Feedback message={error} tone="error" />
              <button className="login-submit-btn" type="submit">
                <span>Masuk ke sistem</span><LogIn size={19} aria-hidden="true" />
              </button>
              <p className="login-simulation-note"><ShieldCheck size={16} />Login dan pembatasan peran berjalan sebagai simulasi frontend.</p>
            </form>

            <aside className="login-demo-credentials" aria-label="Kredensial akun demo">
              <div className="login-demo-heading"><BookOpenCheck size={18} /><strong>Akun untuk mencoba</strong></div>
              <div className="login-demo-list">
                {demoAccounts.map(({ id, label, account }) => (
                  <div className="login-demo-row" key={id}>
                    <span>{label}</span><code>{account.username}</code><code>{account.password}</code>
                  </div>
                ))}
              </div>
              <p>Kredensial disimpan lokal di browser dan bukan untuk akun nyata.</p>
            </aside>
          </div>

          <footer className="login-access-footer">
            <span><Landmark size={15} />MA Darul Ihya</span>
            <span><ShieldCheck size={15} />Prototipe frontend</span>
          </footer>
        </div>
      </section>
    </main>
  );
}
