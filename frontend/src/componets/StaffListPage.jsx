import React, { useEffect, useState, useMemo, useCallback } from 'react';
import axios from 'axios';
import debounce from 'lodash.debounce';
import { useToast } from '../context/ToastContext';
import { Link } from 'react-router-dom';

export default function StaffListPage() {
  const [staff, setStaff] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchStaff = useCallback(async (query = '', pageNum = 1) => {
    try {
      setLoading(true);
      const { data } = await axios.get('https://smart-rental-management.onrender.com/api/admin/staff', {
        params: { search: query, page: pageNum, limit: 10 },
      });
      setStaff(data.staff);
      setTotalPages(data.totalPages);
      setPage(data.currentPage);
    } catch (err) {
      showToast('Failed to fetch staff', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const toggleStatus = async (userId, suspend) => {
    try {
      const action = suspend ? 'suspend' : 'unsuspend';
      await axios.patch(`https://smart-rental-management.onrender.com/api/admin/suspend-user/${action}/${userId}`);
      showToast(`User ${suspend ? 'suspended' : 'activated'} successfully`, 'success');
      fetchStaff(search, page);
    } catch (err) {
      showToast('Status update failed', 'error');
    }
  };

  useEffect(() => {
    fetchStaff(search, page);
  }, [search, page, fetchStaff]);

  const debouncedSearch = useMemo(
    () =>
      debounce((value) => {
        setPage(1);
        setSearch(value);
      }, 500),
    []
  );

  const handleSearch = (e) => debouncedSearch(e.target.value);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) setPage(newPage);
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-3 fw-bold text-primary">Staff Members</h2>

      {/* Search */}
      <div className="mb-3">
        <input
          type="text"
          placeholder="Search by name, email, or phone"
          className="form-control"
          onChange={handleSearch}
        />
      </div>

      {/* Table */}
      {loading ? (
        <div>Loading staff...</div>
      ) : staff.length === 0 ? (
        <div className="alert alert-info">No staff members found.</div>
      ) : (
        <table className="table table-striped table-bordered">
          <thead className="table-dark">
            <tr>
              <th>#</th>
              <th>Full Name</th>
              <th>Role</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
              <th colSpan="2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((user, index) => (
              <tr key={user._id}>
                <td>{(page - 1) * 10 + index + 1}</td>
                <td>{user.fullName}</td>
                <td className="text-capitalize">{user.role}</td>
                <td>{user.email}</td>
                <td>{user.phone}</td>
                <td>
                  <span className={`badge ${user.suspended ? 'bg-danger' : 'bg-success'}`}>
                    {user.suspended ? 'Suspended' : 'Active'}
                  </span>
                </td>
                <td>
                  <button
                    className={`btn btn-sm ${user.suspended ? 'btn-success' : 'btn-warning'}`}
                    onClick={() => toggleStatus(user._id, !user.suspended)}
                  >
                    {user.suspended ? 'Unsuspend' : 'Suspend'}
                  </button>
                </td>
                <td>
                  <Link to={`https://smart-rental-management.onrender.com/api/admin/profile/${user._id}`} className="btn btn-sm btn-info">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-between mt-3">
          <button
            className="btn btn-outline-secondary"
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
          >
            ⬅️ Prev
          </button>
          <span className="align-self-center">Page {page} of {totalPages}</span>
          <button
            className="btn btn-outline-secondary"
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
          >
            Next ➡️
          </button>
        </div>
      )}
    </div>
  );
}
