import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import ThemeToggle from "../componets/ThemeToggle";
import LanguageSwitcher from "../componets/LanguageSwitcher";
import { useAuth } from "../context/AuthContext";

const TenantSidebarLayout = () => {
  const { logout, user } = useAuth();

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      <div className="bg-dark text-white p-3" style={{ width: "250px" }}>
        <h4 className="mb-4">🏠 Tenant Panel</h4>
        <ul className="nav flex-column">
          <li className="nav-item">
            <NavLink to="/tenant/dashboard" className="nav-link text-white">
              📊 Dashboard
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/tenant/payments" className="nav-link text-white">
              💳 Payments
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/tenant/relocation" className="nav-link text-white">
              📝 Relocation
            </NavLink>
          </li>
        </ul>

        <div className="mt-4">
          <ThemeToggle />
          <LanguageSwitcher />
        </div>

        <button
          onClick={logout}
          className="btn btn-sm btn-outline-light mt-3 w-100"
        >
          🚪 Logout
        </button>
      </div>

      {/* Main content */}
      <div className="flex-grow-1 p-4 bg-light">
        <h5 className="text-muted mb-4">
          Welcome, {user?.fullName || "Tenant"}!
        </h5>
        <Outlet />
      </div>
    </div>
  );
};

export default TenantSidebarLayout;
