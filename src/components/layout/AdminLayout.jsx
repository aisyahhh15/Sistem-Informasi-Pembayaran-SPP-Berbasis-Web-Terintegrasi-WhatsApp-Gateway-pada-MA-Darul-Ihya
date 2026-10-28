import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const getPageTitle = (pathname) => {
  switch (pathname) {
    case '/':
      return 'Dashboard';
    case '/students':
      return 'Data Siswa';
    case '/classes':
      return 'Data Kelas';
    case '/spp':
      return 'Data SPP';
    case '/payments/new':
      return 'Transaksi Pembayaran';
    case '/payments/history':
      return 'Riwayat Pembayaran';
    case '/arrears':
      return 'Data Tunggakan';
    case '/whatsapp':
      return 'WhatsApp Gateway';
    case '/reports':
      return 'Laporan Pembayaran';
    case '/settings':
      return 'Pengaturan';
    default:
      return 'MA Darul Ihya SPP';
  }
};

export default function AdminLayout({ onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const pageTitle = getPageTitle(location.pathname);

  return (
    <div className="app-container">
      <Sidebar
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        onLogout={onLogout}
      />
      <div className="main-content">
        <Topbar 
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)} 
          title={pageTitle}
        />
        <main className="page-container">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
