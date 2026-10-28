import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Lock, User, ShieldCheck } from 'lucide-react';
import { useData } from '../app/DataProvider';
import './Login.css';

export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const { demoCredentials } = useData();
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const username = formData.get('username')?.toString().trim();
    const password = formData.get('password')?.toString();

    if (username !== demoCredentials.username || password !== demoCredentials.password) {
      setError('Username atau kata sandi demo tidak sesuai.');
      return;
    }

    setError('');
    onLogin();
    navigate('/');
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <GraduationCap size={32} />
          </div>
          <h2>MA Darul Ihya</h2>
          <p className="login-subtitle">Sistem Informasi Pembayaran SPP</p>
          <div className="demo-notice">
            <ShieldCheck size={16} />
            <span>Mode Demo (Login Simulasi Frontend)</span>
          </div>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username Admin</label>
            <div className="input-with-icon">
              <User size={18} className="field-icon" />
              <input 
                type="text" 
                id="username"
                name="username"
                defaultValue={demoCredentials.username}
                placeholder="Masukkan username"
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Kata Sandi</label>
            <div className="input-with-icon">
              <Lock size={18} className="field-icon" />
              <input 
                type="password" 
                id="password"
                name="password"
                placeholder="Masukkan password"
                required 
              />
            </div>
          </div>

          {error && <p className="login-error" role="alert">{error}</p>}

          <button type="submit" className="login-submit-btn">
            Masuk ke Aplikasi (Demo)
          </button>
        </form>

        <div className="login-footer">
          <p>Akun demo disimpan hanya selama sesi halaman ini.</p>
          <code>Username saat ini: {demoCredentials.username}</code>
        </div>
      </div>
    </div>
  );
}
