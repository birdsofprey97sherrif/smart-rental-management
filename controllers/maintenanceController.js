const Maintenance = require("../models/MaintenanceRequest");

// Create a maintenance request
exports.createMaintenanceRequest = async (req, res) => {
  try {
    const { houseId, issue } = req.body;
    const tenantId = req.user.userId;

    const request = await Maintenance.create({ tenantId, houseId, issue });
    res.status(201).json({ message: "Maintenance request submitted", request });
  } catch (err) {
    res.status(500).json({ message: "Failed to submit maintenance request" });
  }
};

// Get all requests for caretaker
exports.getAllRequestsForCaretaker = async (req, res) => {
  try {
    const requests = await Maintenance.find()
      .populate("tenantId", "fullName email")
      .populate("houseId", "title location");
    res.json({ count: requests.length, requests });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch requests" });
  }
};

// Update maintenance status
exports.updateMaintenanceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const request = await Maintenance.findByIdAndUpdate(
      id,
      { status, updatedAt: Date.now() },
      { new: true }
    );

    if (!request) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Status updated", request });
  } catch (err) {
    res.status(500).json({ message: "Failed to update status" });
  }
};

// Delete maintenance request
exports.deleteMaintenanceRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await Maintenance.findByIdAndDelete(id);
    if (!request) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Request deleted", request });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete request" });
  }
};

// Get requests for a tenant
exports.getRequestsForTenant = async (req, res) => {
  try {
    const requests = await Maintenance.find({ tenantId: req.user.userId });
    res.json({ count: requests.length, requests });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch tenant requests" });
  }
};

// Get a single request by ID
exports.getRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await Maintenance.findById(id);
    if (!request) return res.status(404).json({ message: "Not found" });
    res.json(request);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch request" });
  }
};
