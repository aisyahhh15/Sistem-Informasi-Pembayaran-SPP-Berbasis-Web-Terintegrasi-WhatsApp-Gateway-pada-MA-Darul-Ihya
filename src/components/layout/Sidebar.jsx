import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  CreditCard,
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
  { path: '/students', label: 'Data Siswa', icon: Users },
  { path: '/classes', label: 'Data Kelas', icon: GraduationCap },
  { path: '/spp', label: 'Data SPP', icon: CreditCard },
  { path: '/payments/new', label: 'Transaksi Pembayaran', icon: Receipt },
  { path: '/payments/history', label: 'Riwayat Pembayaran', icon: History },
  { path: '/arrears', label: 'Data Tunggakan', icon: AlertCircle },
  { path: '/whatsapp', label: 'WhatsApp Gateway', icon: MessageSquare },
  { path: '/reports', label: 'Laporan Pembayaran', icon: FileText },
  { path: '/settings', label: 'Pengaturan', icon: Settings },
];

export default function Sidebar({ isOpen, onClose, onLogout }) {
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
            {navItems.map((item) => {
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
          <NavLink to="/login" className="logout-btn" onClick={() => { onClose?.(); onLogout?.(); }}>
            <LogOut size={18} />
            <span>Keluar (Logout)</span>
          </NavLink>
        </div>
      </aside>
    </>
  );
}
