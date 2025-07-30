// src/pages/RelocationViewer.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useToast } from '../context/ToastContext';

export default function RelocationViewer() {
  const [relocations, setRelocations] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const fetchRelocations = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const { data } = await axios.get('https://smart-rental-management.onrender.com/api/admin/relocation-requests', { params });
      setRelocations(data);
    } catch (err) {
      showToast('Failed to fetch relocations', 'error');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, showToast]); // ✅ add as dependencies

  useEffect(() => {
    fetchRelocations();
  }, [fetchRelocations]); // ✅ safe to use

  return (
    <div className="container mt-4">
      <h2 className="text-success fw-bold mb-3">Relocation Requests</h2>

      {/* Date Filter Row */}
      <div className="row mb-3">
        <div className="col-md-5">
          <label className="form-label">Start Date</label>
          <input
            type="date"
            className="form-control"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="col-md-5">
          <label className="form-label">End Date</label>
          <input
            type="date"
            className="form-control"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <div className="col-md-2 d-flex align-items-end">
          <button className="btn btn-outline-success w-100" onClick={fetchRelocations}>
            🔄 Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div>Loading relocations...</div>
      ) : (
        <table className="table table-bordered table-striped">
          <thead className="table-success">
            <tr>
              <th>#</th>
              <th>Tenant</th>
              <th>House</th>
              <th>Reason</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {relocations.map((r, i) => (
              <tr key={r._id}>
                <td>{i + 1}</td>
                <td>{r.tenantName}</td>
                <td>{r.houseName}</td>
                <td>{r.reason}</td>
                <td>{new Date(r.date).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
