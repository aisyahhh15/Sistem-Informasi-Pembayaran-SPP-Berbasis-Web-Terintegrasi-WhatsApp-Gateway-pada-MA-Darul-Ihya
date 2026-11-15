import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import ConfirmDialog from '../ui/ConfirmDialog';
import {
  LayoutDashboard,
  Database,
  GraduationCap,
  Tags,
  Receipt,
  History,
  AlertCircle,
  MessageSquare,
  FileText,
  Settings,
  LogOut,
  X
} from 'lucide-react';
import './Sidebar.css';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/master', label: 'Data Master', icon: Database },
  { path: '/spp', label: 'Edit Tarif dan Skema', icon: Tags },
  { path: '/payments/new', label: 'Transaksi Pembayaran', icon: Receipt },
  { path: '/payments/history', label: 'Riwayat Pembayaran', icon: History },
  { path: '/arrears', label: 'Data Tunggakan', icon: AlertCircle },
  { path: '/whatsapp', label: 'WhatsApp Gateway', icon: MessageSquare },
  { path: '/reports', label: 'Laporan Pembayaran', icon: FileText },
  { path: '/settings', label: 'Pengaturan', icon: Settings },
];

export default function Sidebar({ isOpen, onClose, onLogout, currentUser }) {
  const navigate = useNavigate();
  const [confirmLogout, setConfirmLogout] = useState(false);
  const visibleItems = navItems.filter((item) => currentUser?.role === 'admin' || !['/classes', '/spp', '/whatsapp', '/settings'].includes(item.path));
  const logout = () => {
    setConfirmLogout(false);
    onClose?.();
    onLogout?.();
    navigate('/login', { replace: true });
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} aria-hidden="true" />}
      
      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="brand-logo">
              <GraduationCap size={22} />
            </div>
            <div className="brand-text">
              <span className="brand-title">MA Darul Ihya</span>
              <span className="brand-subtitle">Sistem Informasi SPP</span>
            </div>
          </div>
          <button 
            className="sidebar-close-btn" 
            onClick={onClose}
            aria-label="Tutup Menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <ul className="nav-list">
            {visibleItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path} className="nav-item">
                  <NavLink
                    to={item.path}
                    end={item.path === '/'}
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                    onClick={() => onClose && onClose()}
                  >
                    <Icon size={18} className="nav-icon" />
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button type="button" className="logout-btn" onClick={() => setConfirmLogout(true)}>
            <LogOut size={18} />
            <span>Keluar</span>
          </button>
        </div>
      </aside>
      {confirmLogout && <ConfirmDialog title="Keluar dari aplikasi?" message={`Anda akan mengakhiri sesi demo ${currentUser?.role === 'admin' ? 'Admin' : 'Tata Usaha'}.`} confirmText="Ya, keluar" onConfirm={logout} onCancel={() => setConfirmLogout(false)} variant="warning" />}
    </>
  );
}
