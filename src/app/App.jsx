import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DataProvider } from './DataProvider';
import AdminLayout from '../components/layout/AdminLayout';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Students from '../pages/Students';
import Classes from '../pages/Classes';
import SPP from '../pages/SPP';
import Payments from '../pages/Payments';
import History from '../pages/History';
import Arrears from '../pages/Arrears';
import WhatsApp from '../pages/WhatsApp';
import Reports from '../pages/Reports';
import Settings from '../pages/Settings';

export default function App() {
  const [isDemoLoggedIn, setIsDemoLoggedIn] = useState(false);

  return (
    <BrowserRouter>
      <DataProvider>
      <Routes>
        <Route
          path="/login"
          element={isDemoLoggedIn ? <Navigate to="/" replace /> : <Login onLogin={() => setIsDemoLoggedIn(true)} />}
        />
        
        <Route
          path="/"
          element={isDemoLoggedIn ? <AdminLayout onLogout={() => setIsDemoLoggedIn(false)} /> : <Navigate to="/login" replace />}
        >
          <Route index element={<Dashboard />} />
          <Route path="students" element={<Students />} />
          <Route path="classes" element={<Classes />} />
          <Route path="spp" element={<SPP />} />
          <Route path="payments/new" element={<Payments />} />
          <Route path="payments/history" element={<History />} />
          <Route path="arrears" element={<Arrears />} />
          <Route path="whatsapp" element={<WhatsApp />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </DataProvider>
    </BrowserRouter>
  );
}
