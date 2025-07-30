import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Modal, Button, Form } from "react-bootstrap";

export default function TenantDashboard() {
  useAuth();
  const { showToast } = useToast();

  const [rentalInfo, setRentalInfo] = useState(null);
  const [showPayModal, setShowPayModal] = useState(false);
  const [amount, setAmount] = useState("");
  const [paying, setPaying] = useState(false);

  // ✅ reusable fetchRentalInfo
  const fetchRentalInfo = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/tenant/rent-info");
      setRentalInfo(data);
    } catch (err) {
      showToast("Failed to load rental info", "error");
    }
  }, [showToast]);

  useEffect(() => {
    fetchRentalInfo();
  }, [fetchRentalInfo]);

  const handlePayment = async () => {
    setPaying(true);
    try {
      await axios.post("/api/tenant/pay", { amount });
      showToast("Payment successful!", "success");
      setShowPayModal(false);
      setAmount("");
      fetchRentalInfo(); // ✅ Refresh after payment
    } catch (err) {
      showToast("Payment failed. Try again.", "error");
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="container py-4">
      <h2 className="fw-bold mb-4 text-success">🏠 Tenant Dashboard</h2>

      {rentalInfo ? (
        <>
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-success text-white fw-bold">
              My Rental Information
            </div>
            <div className="card-body">
              <p><strong>House:</strong> {rentalInfo.houseName}</p>
              <p><strong>Location:</strong> {rentalInfo.location}</p>
              <p><strong>Monthly Rent:</strong> KES {rentalInfo.rentAmount}</p>
              <p><strong>Status:</strong> {rentalInfo.isActive ? "Active" : "Terminated"}</p>
              <p><strong>Landlord:</strong> {rentalInfo.landlordName}</p>
              <p><strong>Caretaker:</strong> {rentalInfo.caretakerName}</p>
              <p><strong>Next Rent Due:</strong> {new Date(rentalInfo.nextDueDate).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="card shadow-sm mb-4">
            <div className="card-header bg-warning text-dark fw-bold">
              💸 Rent Payment
            </div>
            <div className="card-body">
              <p><strong>Current Balance:</strong> KES {rentalInfo.balance || rentalInfo.rentAmount}</p>
              <Button variant="success" onClick={() => setShowPayModal(true)}>
                Pay Now via M-Pesa
              </Button>
            </div>
          </div>
        </>
      ) : (
        <div className="alert alert-info">Loading rental info...</div>
      )}

      <Modal show={showPayModal} onHide={() => setShowPayModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Simulated M-Pesa Payment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Amount (KES)</Form.Label>
              <Form.Control
                type="number"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPayModal(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={handlePayment} disabled={paying}>
            {paying ? "Processing..." : "Confirm Payment"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
