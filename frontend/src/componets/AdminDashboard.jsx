import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function AdminDashboard() {
 useAuth();
  const { showToast } = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axios.get('https://smart-rental-management.onrender.com/api/admin/admin/analytics');
        setStats(data);
      } catch (err) {
        showToast('Failed to load stats', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [showToast]);

  if (loading) return <div className="text-center p-5">Loading dashboard...</div>;

  return (
    <div className="container mt-4">
      <h2 className="fw-bold mb-4 text-success">Admin Dashboard</h2>

      <div className="row g-4">
        <div className="col-md-4">
          <div className="card shadow border-0 text-center p-3">
            <h5>Total Users</h5>
            <p className="display-6 fw-bold text-primary">{stats?.totalUsers}</p>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow border-0 text-center p-3">
            <h5>Total Houses</h5>
            <p className="display-6 fw-bold text-warning">{stats?.totalHouses}</p>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow border-0 text-center p-3">
            <h5>Relocation Requests</h5>
            <p className="display-6 fw-bold text-danger">{stats?.totalRelocations}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
