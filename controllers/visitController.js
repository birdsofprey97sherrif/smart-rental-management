const VisitRequest = require("../models/VisitRequest");
const House = require("../models/House");
const { sendEmail } = require("../utils/mailer");
const { sendSMS } = require("../utils/sms");
const User = require("../models/User");

// Request a visit to a house
exports.requestVisit = async (req, res) => {
  try {
    const { houseId } = req.body;

    const house = await House.findById(houseId);
    if (!house) return res.status(404).json({ message: "House not found" });

    const visit = new VisitRequest({
      tenantId: req.user.userId,
      houseId,
      requestedTo: house.postedBy,
    });

    await visit.save();
    res.status(201).json({ message: "Visit request sent", visit });
  } catch (err) {
    console.error("Visit request error:", err);
    res.status(500).json({ message: "Failed to request visit" });
  }
};

// Get visits for the logged-in tenant
exports.getMyVisits = async (req, res) => {
  try {
    const visits = await VisitRequest.find({ tenantId: req.user.userId })
      .populate("houseId", "title location");
    res.json({ count: visits.length, visits });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch my visits" });
  }
};

// Get visit requests for the logged-in caretaker/landlord
exports.getMyVisitRequests = async (req, res) => {
  try {
    const visits = await VisitRequest.find({ requestedTo: req.user.userId })
      .populate("tenantId", "fullName phone email")
      .populate("houseId", "title location");
    res.json({ count: visits.length, visits });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch visit requests" });
  }
};

// Approve or reject a visit request
exports.respondToVisit = async (req, res) => {
  try {
    const visitId = req.params.id;
    const { action } = req.body; // "approve" or "decline"

    const visit = await VisitRequest.findById(visitId)
      .populate("tenantId", "fullName phone email")
      .populate("houseId", "title");

    if (!visit) return res.status(404).json({ message: "Visit not found" });

    if (visit.requestedTo.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Unauthorized action" });
    }

    if (action === "approve") {
      visit.status = "approved";
    } else if (action === "decline") {
      visit.status = "declined";
    } else {
      return res.status(400).json({ message: "Invalid action" });
    }

    await visit.save();

    const tenant = visit.tenantId;
    if (tenant && tenant.email) {
      await sendEmail({
        to: tenant.email,
        subject: `Your Visit Request has been ${visit.status}`,
        html: `
          <p>Dear ${tenant.fullName},</p>
          <p>Your request to visit the house <strong>${visit.houseId.title}</strong> has been <strong>${visit.status}</strong>.</p>
          <p>Regards,<br/>Smart Rental Management Team</p>
        `,
      });
    }
    if (tenant && tenant.phone) {
      await sendSMS({
        to: tenant.phone,
        message: `Hi ${tenant.fullName}, your site visit request has been ${visit.status}. - Smart Rentals`
      });
    }

    res.json({ message: `Visit ${action}d successfully`, visit });
  } catch (err) {
    console.error("Visit response error:", err);
    res.status(500).json({ message: "Failed to respond to visit request" });
  }
};
