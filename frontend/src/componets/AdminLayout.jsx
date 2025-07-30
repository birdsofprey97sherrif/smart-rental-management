import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ThemeToggle from '../componets/ThemeToggle';
import LanguageSwitcher from '../componets/LanguageSwitcher';
import { useAuth } from '../context/AuthContext';

export default function AdminLayout({ children }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <aside className="bg-dark text-white p-3 min-vh-100" style={{ width: '250px' }}>
        <h4 className="mb-4">🏠 Admin Panel</h4>
        <ul className="nav flex-column">
          <li className="nav-item"><Link to="/admin/dashboard" className="nav-link text-white">📊 Dashboard</Link></li>
          <li className="nav-item"><Link to="/admin/staff/register" className="nav-link text-white">👥 Register Staff</Link></li>
          <li className="nav-item"><Link to="/admin/defaulters" className="nav-link text-white">🚨 Defaulters</Link></li>
          <li className="nav-item"><Link to="/admin/broadcast" className="nav-link text-white">📢 Broadcast</Link></li>
          <li className="nav-item"><Link to="/admin/relocations" className="nav-link text-white">🚚 Relocations</Link></li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="flex-grow-1">
        {/* Header */}
        <nav className="d-flex justify-content-between align-items-center bg-light border-bottom px-4 py-2">
          <div><strong>Welcome,</strong> {user?.fullName || 'Admin'}</div>
          <div className="d-flex gap-3 align-items-center">
            <ThemeToggle />
            <LanguageSwitcher />
            <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>Logout</button>
          </div>
        </nav>

        {/* Page Content */}
        <div className="p-4">{children}</div>
      </main>
    </div>
  );
}
