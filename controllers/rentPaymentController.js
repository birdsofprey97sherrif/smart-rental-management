const RentPayment = require("../models/RentPayment");
const RentalAgreement = require("../models/RentalAgreement");
const House = require("../models/House");
const User = require("../models/User");
const { generateReceiptPDF, generateRentHistoryPDF } = require("../utils/pdfReceipt");
const { sendEmail } = require("../utils/mailer");

// Tenant pays rent
exports.payRent = async (req, res) => {
  try {
    const { agreementId, amountPaid, paymentMethod } = req.body;
    const tenantId = req.user.userId;

    if (!agreementId || !amountPaid || !paymentMethod) {
      return res.status(400).json({ message: "agreementId, amountPaid, and paymentMethod are required" });
    }

    const agreement = await RentalAgreement.findById(agreementId);
    if (!agreement || agreement.tenantId.toString() !== tenantId) {
      return res.status(403).json({ message: "Unauthorized or agreement not found" });
    }

    const payment = new RentPayment({
      agreementId,
      tenantId,
      houseId: agreement.houseId,
      amountPaid,
      paymentMethod,
      receiptId: `RNT-${Date.now()}`
    });

    await payment.save();
    res.status(201).json({ message: "Rent paid successfully", payment });

  } catch (err) {
    res.status(500).json({ message: "Failed to process payment" });
  }
};

// Get all rent payments for the logged-in tenant
exports.getMyRentPayments = async (req, res) => {
  try {
    const tenantId = req.user.userId;
    const payments = await RentPayment.find({ tenantId })
      .populate("houseId", "title location")
      .populate("agreementId", "leaseStart leaseEnd monthlyRent");

    res.json({ count: payments.length, payments });
  } catch (err) {
    res.status(500).json({ message: "Failed to load payments" });
  }
};

// Get payments for a specific house
exports.getPaymentsByHouse = async (req, res) => {
  try {
    const houseId = req.params.id;
    const payments = await RentPayment.find({ houseId })
      .populate("tenantId", "fullName phone email")
      .populate("agreementId", "leaseStart leaseEnd monthlyRent");

    res.json({ count: payments.length, payments });
  } catch (err) {
    res.status(500).json({ message: "Failed to load payments for this house" });
  }
};

// Get all payments for landlord
exports.getLandlordPayments = async (req, res) => {
  try {
    const landlordId = req.user.userId;
    const agreements = await RentalAgreement.find({ landlordId });
    const agreementIds = agreements.map(ag => ag._id);

    const payments = await RentPayment.find({ agreementId: { $in: agreementIds } })
      .populate("tenantId", "fullName email phone")
      .populate("houseId", "title location")
      .populate("agreementId", "leaseStart leaseEnd monthlyRent");

    res.json({ count: payments.length, payments });
  } catch (err) {
    res.status(500).json({ message: "Failed to load landlord payments" });
  }
};

// Get all payments for caretaker
exports.getCaretakerPayments = async (req, res) => {
  try {
    const caretakerId = req.user.userId;
    const houses = await House.find({ caretakerId });
    const houseIds = houses.map(h => h._id);

    const agreements = await RentalAgreement.find({ houseId: { $in: houseIds } });
    const agreementIds = agreements.map(ag => ag._id);

    const payments = await RentPayment.find({ agreementId: { $in: agreementIds } })
      .populate("tenantId", "fullName email phone")
      .populate("houseId", "title location")
      .populate("agreementId", "leaseStart leaseEnd monthlyRent");

    res.json({ count: payments.length, payments });
  } catch (err) {
    res.status(500).json({ message: "Failed to load caretaker payments" });
  }
};

// Download rent payment receipt (PDF)
exports.downloadReceipt = async (req, res) => {
  try {
    const paymentId = req.params.id;
    const tenantId = req.user.userId;

    const payment = await RentPayment.findById(paymentId);
    if (!payment || payment.tenantId.toString() !== tenantId) {
      return res.status(404).json({ message: "Receipt not found or unauthorized" });
    }

    const tenant = await User.findById(tenantId);
    const house = await House.findById(payment.houseId);

    await generateReceiptPDF(payment, tenant, house, res);
  } catch (err) {
    res.status(500).json({ message: "Failed to generate receipt" });
  }
};

// Send rent payment receipt via email
exports.sendReceiptEmail = async (req, res) => {
  try {
    const paymentId = req.params.id;
    const tenantId = req.user.userId;

    const payment = await RentPayment.findById(paymentId);
    if (!payment || payment.tenantId.toString() !== tenantId) {
      return res.status(404).json({ message: "Receipt not found or unauthorized" });
    }

    const tenant = await User.findById(tenantId);
    const house = await House.findById(payment.houseId);

    const receipt = await generateReceiptPDF(payment, tenant, house);

    await sendEmail({
      to: tenant.email,
      subject: "Your Rent Payment Receipt",
      html: `
        <p>Dear ${tenant.fullName},</p>
        <p>Attached is your rent payment receipt for the house <strong>${house.title}</strong>.</p>
        <p>Regards,<br/>Smart Rental Management Team</p>
      `,
      attachments: [{ filename: "receipt.pdf", content: receipt }],
    });

    res.json({ message: "Receipt sent successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to send receipt email" });
  }
};

// Download rent payment history (PDF)
exports.downloadRentHistory = async (req, res) => {
  try {
    const tenantId = req.user.userId;
    const payments = await RentPayment.find({ tenantId }).sort({ paymentDate: 1 });
    const tenant = await User.findById(tenantId);

    await generateRentHistoryPDF(payments, tenant, res);
  } catch (err) {
    res.status(500).json({ message: "Failed to generate rent history" });
  }
};

// Landlord earnings summary (by month)
exports.getLandlordEarningsSummary = async (req, res) => {
  try {
    const landlordId = req.user.userId;
    const agreements = await RentalAgreement.find({ landlordId });
    const agreementIds = agreements.map(ag => ag._id);

    const payments = await RentPayment.find({ agreementId: { $in: agreementIds } });

    const summary = {};
    for (const pay of payments) {
      const month = new Date(pay.paymentDate).toLocaleString('default', { month: 'short', year: 'numeric' });
      if (!summary[month]) summary[month] = 0;
      summary[month] += pay.amountPaid;
    }

    res.json({ summary });
  } catch (err) {
    res.status(500).json({ message: "Failed to load earnings" });
  }
};

// Caretaker earnings summary (by month)
exports.getCaretakerEarningsSummary = async (req, res) => {
  try {
    const caretakerId = req.user.userId;
    const houses = await House.find({ caretakerId });
    const houseIds = houses.map(h => h._id);

    const agreements = await RentalAgreement.find({ houseId: { $in: houseIds } });
    const agreementIds = agreements.map(ag => ag._id);

    const payments = await RentPayment.find({ agreementId: { $in: agreementIds } });

    const summary = {};
    for (const pay of payments) {
      const month = new Date(pay.paymentDate).toLocaleString('default', { month: 'short', year: 'numeric' });
      if (!summary[month]) summary[month] = 0;
      summary[month] += pay.amountPaid;
    }

    res.json({ summary });
  } catch (err) {
    res.status(500).json({ message: "Failed to load earnings" });
  }
};
