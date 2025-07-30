import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useToast } from '../context/ToastContext';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axios.get('https://smart-rental-management.onrender.com/api/admin/admin/analytics');
        setStats(data);
      } catch (err) {
        showToast('Failed to fetch dashboard stats', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [showToast]);

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div className="container-fluid">
      <h2 className="fw-bold text-success mb-4">Admin Dashboard</h2>
      <div className="row g-4">
        <div className="col-md-3">
          <div className="card shadow-sm border-start border-success border-4">
            <div className="card-body">
              <h5 className="card-title">👥 Users</h5>
              <h3 className="fw-bold">{stats.totalUsers}</h3>
              <p className="text-muted mb-0">All registered users</p>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow-sm border-start border-primary border-4">
            <div className="card-body">
              <h5 className="card-title">🏠 Houses</h5>
              <h3 className="fw-bold">{stats.totalHouses}</h3>
              <p className="text-muted mb-0">Properties listed</p>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow-sm border-start border-warning border-4">
            <div className="card-body">
              <h5 className="card-title">🚚 Relocations</h5>
              <h3 className="fw-bold">{stats.totalRelocations}</h3>
              <p className="text-muted mb-0">Relocation requests</p>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow-sm border-start border-danger border-4">
            <div className="card-body">
              <h5 className="card-title">💸 Defaulters</h5>
              <h3 className="fw-bold">{stats.totalDefaulters}</h3>
              <p className="text-muted mb-0">This month</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
