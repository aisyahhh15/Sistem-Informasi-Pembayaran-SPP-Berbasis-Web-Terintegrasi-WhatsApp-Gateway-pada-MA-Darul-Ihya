import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const getPageTitle = (pathname) => {
  switch (pathname) {
    case '/':
      return 'Dashboard';
    case '/students':
    case '/classes':
    case '/master':
    case '/master/students':
    case '/master/classes':
      return 'Data Master';
    case '/spp':
      return 'Edit Tarif dan Skema';
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

export default function AdminLayout({ onLogout, currentUser }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const pageTitle = getPageTitle(location.pathname);

  return (
    <div className="app-container">
      <Sidebar
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        onLogout={onLogout}
        currentUser={currentUser}
      />
      <div className="main-content">
        <Topbar 
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)} 
          title={pageTitle}
          currentUser={currentUser}
        />
        <main className="page-container">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
