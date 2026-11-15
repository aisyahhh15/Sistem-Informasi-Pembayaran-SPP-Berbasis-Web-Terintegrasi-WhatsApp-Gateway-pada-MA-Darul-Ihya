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
import MasterData from '../pages/MasterData';

function RoleGate({ currentUser, allowed, children }) {
  return allowed.includes(currentUser?.role) ? children : <Navigate to="/" replace />;
}

function ApplicationRoutes() {
  const [currentUser, setCurrentUser] = useState(null);

  return (
    <Routes>
      <Route path="/login" element={currentUser ? <Navigate to="/" replace /> : <Login onLogin={setCurrentUser} />} />
      <Route path="/" element={currentUser ? <AdminLayout currentUser={currentUser} onLogout={() => setCurrentUser(null)} /> : <Navigate to="/login" replace />}>
        <Route index element={<Dashboard />} />
        <Route path="students" element={<Navigate to="/master/students" replace />} />
        <Route path="classes" element={<RoleGate currentUser={currentUser} allowed={['admin']}><Navigate to="/master/classes" replace /></RoleGate>} />
        <Route path="master" element={<MasterData currentUser={currentUser} />}>
          <Route index element={<Navigate to="students" replace />} />
          <Route path="students" element={<Students />} />
          <Route path="classes" element={<RoleGate currentUser={currentUser} allowed={['admin']}><Classes /></RoleGate>} />
        </Route>
        <Route path="spp" element={<RoleGate currentUser={currentUser} allowed={['admin']}><SPP /></RoleGate>} />
        <Route path="payments/new" element={<Payments />} />
        <Route path="payments/history" element={<History />} />
        <Route path="arrears" element={<Arrears />} />
        <Route path="whatsapp" element={<RoleGate currentUser={currentUser} allowed={['admin']}><WhatsApp /></RoleGate>} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<RoleGate currentUser={currentUser} allowed={['admin']}><Settings /></RoleGate>} />
      </Route>
      <Route path="*" element={<Navigate to={currentUser ? '/' : '/login'} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <DataProvider>
        <ApplicationRoutes />
      </DataProvider>
    </BrowserRouter>
  );
}
