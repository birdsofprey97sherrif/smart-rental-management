const RelocationRequest = require("../models/RelocationRequest");
const User = require("../models/User");
const { sendSMS } = require("../utils/sms");
const { sendEmail } = require("../utils/email");

// Tenant requests a relocation
exports.requestRelocation = async (req, res) => {
  try {
    const { houseId, distanceKm, floorNumber, houseSize } = req.body;
    const tenantId = req.user.userId;

    if (!houseId || distanceKm == null || floorNumber == null || !houseSize) {
      return res.status(400).json({ message: "All fields are required" });
    }

    let baseCost = 1000 + distanceKm * 100 + floorNumber * 200;
    if (houseSize === "medium") baseCost += 1000;
    if (houseSize === "large") baseCost += 2000;

    const request = await RelocationRequest.create({
      tenantId,
      houseId,
      distanceKm,
      floorNumber,
      houseSize,
      estimatedCost: baseCost,
    });

    res.status(201).json({ message: "Relocation requested", request });
  } catch (err) {
    res.status(500).json({ message: "Failed to request relocation" });
  }
};

// Get all relocation requests for the logged-in tenant
exports.getMyRelocationRequests = async (req, res) => {
  try {
    const tenantId = req.user.userId;
    const requests = await RelocationRequest.find({ tenantId })
      .populate("houseId", "title location")
      .sort({ requestedAt: -1 });

    res.json({ count: requests.length, requests });
  } catch (err) {
    res.status(500).json({ message: "Failed to load relocation requests" });
  }
};

// Admin/caretaker: Get all relocation requests
exports.getAllRelocationRequests = async (req, res) => {
  try {
    const requests = await RelocationRequest.find()
      .populate("tenantId", "fullName phone email")
      .populate("houseId", "title location")
      .sort({ requestedAt: -1 });

    res.json({ count: requests.length, requests });
  } catch (err) {
    res.status(500).json({ message: "Failed to load requests" });
  }
};

// Get a single relocation request by ID
exports.getRelocationRequestById = async (req, res) => {
  try {
    const { requestId } = req.params;
    const request = await RelocationRequest.findById(requestId)
      .populate("tenantId", "fullName phone email")
      .populate("houseId", "title location");

    if (!request) return res.status(404).json({ message: "Request not found" });

    res.json(request);
  } catch (err) {
    res.status(500).json({ message: "Failed to load request" });
  }
};

// Update relocation request status and notify tenant
const { isValidStatus } = require("../utils/validation").default;
const { notifyDriverAssignment } = require("../utils/notifications");

exports.updateRelocationStatus = async (req, res) => {
  const { status, driverId } = req.body;

  if (!isValidStatus(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  const request = await RelocationRequest.findById(req.params.id)
    .populate("tenantId", "fullName")
    .populate("houseId", "title")
    .populate("driverId", "phone");

  if (!request) return res.status(404).json({ message: "Relocation not found" });

  request.status = status;
  if (driverId) request.driverId = driverId;

  await request.save();

  // Optional driver SMS
  if (status === "assigned" && request.driverId?.phone) {
    await notifyDriverAssignment({
      driverPhone: request.driverId.phone,
      tenantName: request.tenantId.fullName,
      houseTitle: request.houseId.title,
    });
  }

  res.json({ message: "Status updated", request });
};

   
// Delete a relocation request
exports.deleteRelocationRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const request = await RelocationRequest.findByIdAndDelete(requestId);
    if (!request) return res.status(404).json({ message: "Request not found" });

    res.json({ message: "Relocation request deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete request" });
  }
};

// Notify tenant about relocation (email only)
exports.notifyTenantRelocation = async (req, res) => {
  try {
    const { requestId } = req.params;
    const request = await RelocationRequest.findById(requestId)
      .populate("tenantId", "fullName email phone")
      .populate("houseId", "title");

    if (!request) return res.status(404).json({ message: "Request not found" });

    await sendEmail({
      to: request.tenantId.email,
      subject: "Relocation Request Update",
      text: `Dear ${request.tenantId.fullName}, your relocation request for house "${request.houseId.title}" has been processed.`
    });

    res.json({ message: "Notification sent to tenant" });
  } catch (err) {
    res.status(500).json({ message: "Failed to notify tenant" });
  }
};

// Assign a driver to a relocation request
exports.assignDriver = async (req, res) => {
  try {
    const { requestId, driverId } = req.body;

    const request = await RelocationRequest.findByIdAndUpdate(
      requestId,
      { driverId, status: "assigned" },
      { new: true }
    ).populate("driverId", "name phone");

    if (!request) return res.status(404).json({ message: "Request not found" });

    res.json({ message: "Driver assigned successfully", request });
  } catch (err) {
    res.status(500).json({ message: "Failed to assign driver" });
  }
};

// Mark relocation as completed
exports.completeRelocation = async (req, res) => {
  try {
    const { requestId } = req.params;

    const request = await RelocationRequest.findByIdAndUpdate(
      requestId,
      { status: "completed" },
      { new: true }
    );

    if (!request) return res.status(404).json({ message: "Request not found" });

    res.json({ message: "Relocation completed successfully", request });
  } catch (err) {
    res.status(500).json({ message: "Failed to complete relocation" });
  }
};

// Rate a relocation
exports.rateRelocation = async (req, res) => {
  const { requestId, rating, feedback } = req.body;
  const tenantId = req.user.userId;

  const request = await RelocationRequest.findOne({ _id: requestId, tenantId });

  if (!request) return res.status(404).json({ message: "Not found or unauthorized" });
  if (request.ratedByTenant) return res.status(400).json({ message: "Already rated" });

  request.rating = rating;
  request.feedback = feedback;
  request.ratedByTenant = true;

  await request.save();
  res.json({ message: "Thank you for your feedback!" });
};

// Get filtered relocation requests for admin dashboard
exports.getFilteredRelocations = async (req, res) => {
  try {
    const { status, from, to } = req.query;

    const query = {};
    if (status) query.status = status;
    if (from || to) {
      query.requestedAt = {};
      if (from) query.requestedAt.$gte = new Date(from);
      if (to) query.requestedAt.$lte = new Date(to);
    }

    const requests = await RelocationRequest.find(query)
      .populate("tenantId", "fullName phone email")
      .populate("houseId", "title location")
      .populate("approvedBy", "fullName")
      .populate("driverId", "name phone")
      .sort({ requestedAt: -1 });

    res.json({ count: requests.length, requests });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch filtered requests" });
  }
};

