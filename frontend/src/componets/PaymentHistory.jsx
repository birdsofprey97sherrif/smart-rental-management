import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { CSVLink } from "react-csv";
import { useToast } from "../context/ToastContext";

export default function PaymentHistory() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchPayments = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/tenant/payments");
      setPayments(data);
    } catch (err) {
      showToast("Failed to fetch payments", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const csvHeaders = [
    { label: "Date", key: "paymentDate" },
    { label: "Amount", key: "amount" },
    { label: "Method", key: "method" },
  ];

  const csvData = payments.map((p) => ({
    ...p,
    paymentDate: new Date(p.paymentDate).toLocaleDateString(),
  }));

  return (
    <div className="card shadow-sm mt-4">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="mb-0">💳 Payment History</h5>
        {payments.length > 0 && (
          <CSVLink
            data={csvData}
            headers={csvHeaders}
            filename="payment_history.csv"
            className="btn btn-sm btn-outline-success"
          >
            Export CSV
          </CSVLink>
        )}
      </div>
      <div className="card-body">
        {loading ? (
          <div className="text-muted">Loading payments...</div>
        ) : payments.length === 0 ? (
          <div className="text-muted">No payment records found.</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Amount (KES)</th>
                  <th>Method</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p._id}>
                    <td>{new Date(p.paymentDate).toLocaleDateString()}</td>
                    <td>{p.amount}</td>
                    <td>{p.method}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
