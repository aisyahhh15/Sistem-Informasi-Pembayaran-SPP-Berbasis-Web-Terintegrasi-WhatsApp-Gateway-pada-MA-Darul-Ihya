import React from 'react';
import { Menu, User, ShieldCheck, Calendar } from 'lucide-react';
import { useData } from '../../app/DataProvider';
import './Topbar.css';

export default function Topbar({ onToggleSidebar, title = 'Dashboard', currentUser }) {
  const { accounts, adminProfile } = useData();
  const account = accounts.find((item) => item.id === currentUser?.id) || currentUser;
  const profileName = account?.role === 'admin' ? adminProfile.name : account?.name;
  const currentDate = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button 
          className="menu-toggle-btn"
          onClick={onToggleSidebar}
          aria-label="Buka Menu Sidebar"
        >
          <Menu size={20} />
        </button>
        <h1 className="topbar-title">{title}</h1>
      </div>

      <div className="topbar-right">
        <div className="demo-badge">
          <ShieldCheck size={14} />
          <span>Mode Demo</span>
        </div>

        <div className="topbar-date">
          <Calendar size={14} />
          <span>{currentDate}</span>
        </div>

        <div className="user-profile">
          <div className="avatar">
            <User size={16} />
          </div>
          <div className="user-info">
            <span className="user-name">{profileName || 'Pengguna Demo'}</span>
            <span className="user-role">{account?.role === 'admin' ? 'Admin' : 'Tata Usaha'} · {account?.username}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
