import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { GraduationCap, Users } from 'lucide-react';
import { useData } from '../app/DataProvider';
import './MasterData.css';

export default function MasterData({ currentUser }) {
  const { data } = useData();

  return (
    <section className="master-data-page" aria-label="Data Master">
      <nav className="master-data-tabs" aria-label="Menu Data Master">
        <NavLink to="/master/students" className={({ isActive }) => `master-data-tab${isActive ? ' active' : ''}`}>
          <Users size={18} aria-hidden="true" />
          <span>Data Siswa</span>
          <span className="master-data-count">{data.students.length}</span>
        </NavLink>
        {currentUser?.role === 'admin' && (
          <NavLink to="/master/classes" className={({ isActive }) => `master-data-tab${isActive ? ' active' : ''}`}>
            <GraduationCap size={18} aria-hidden="true" />
            <span>Data Kelas</span>
            <span className="master-data-count">{data.classes.length}</span>
          </NavLink>
        )}
      </nav>
      <Outlet />
    </section>
  );
}
