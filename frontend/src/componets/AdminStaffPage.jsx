import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useToast } from '../context/ToastContext';

export default function AdminStaffPage() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchStaff = React.useCallback(async () => {
    try {
      const { data } = await axios.get('https://smart-rental-management.onrender.com/api/admin/staff');
      setStaff(data);
    } catch (err) {
      showToast('Failed to load staff list', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const toggleStatus = async (userId, currentStatus) => {
    try {
      await axios.patch(`https://smart-rental-management.onrender.com/api/admin/staff/${userId}/status`, {
        isSuspended: !currentStatus,
      });
      showToast('User status updated', 'success');
      fetchStaff(); // refresh the list
    } catch (err) {
      showToast('Update failed', 'error');
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-3 fw-bold text-success">Manage Staff</h2>
      {loading ? (
        <div>Loading staff...</div>
      ) : (
        <table className="table table-bordered table-striped">
          <thead className="table-success">
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Email/Phone</th>
              <th>Role</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((user, index) => (
              <tr key={user._id}>
                <td>{index + 1}</td>
                <td>{user.fullName || user.name}</td>
                <td>{user.email || user.phone}</td>
                <td className="text-capitalize">{user.role}</td>
                <td>
                  <span className={`badge ${user.isSuspended ? 'bg-danger' : 'bg-success'}`}>
                    {user.isSuspended ? 'Suspended' : 'Active'}
                  </span>
                </td>
                <td>
                  <button
                    className={`btn btn-sm ${user.isSuspended ? 'btn-success' : 'btn-warning'}`}
                    onClick={() => toggleStatus(user._id, user.isSuspended)}
                  >
                    {user.isSuspended ? 'Unsuspend' : 'Suspend'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
