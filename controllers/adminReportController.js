// ✅ Add all required imports at the top
const RentPayment = require("../models/RentPayment");
const RentalAgreement = require("../models/RentalAgreement");
const House = require("../models/House");
const User = require("../models/User");
const VisitRequest = require("../models/VisitRequest");

// ✅ Add helper function
const getCurrentMonthRange = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  return { start, end };
};

exports.getHouseReport = async (req, res) => {
  try {
    const { houseId } = req.params;

    const payments = await RentPayment.find({ houseId })
      .populate("tenantId", "fullName")
      .sort({ paymentDate: -1 });

    res.json({
      houseId,
      totalPayments: payments.length,
      totalEarnings: payments.reduce((sum, p) => sum + p.amountPaid, 0),
      payments
    });

  } catch (err) {
    console.error("getHouseReport error:", err);
    res.status(500).json({ message: "Failed to get house report" });
  }
};

exports.getTenantReport = async (req, res) => {
  try {
    const tenantId = req.user.userId;

    const payments = await RentPayment.find({ tenantId })
      .populate("houseId", "title location")
      .sort({ paymentDate: -1 });

    res.json({
      tenantId,
      totalPayments: payments.length,
      totalPaid: payments.reduce((sum, p) => sum + p.amountPaid, 0),
      payments
    });

  } catch (err) {
    console.error("getTenantReport error:", err);
    res.status(500).json({ message: "Failed to get tenant report" });
  }
};

exports.getLandlordReport = async (req, res) => {
  try {
    const landlordId = req.user.userId;

    const agreements = await RentalAgreement.find({ landlordId })
      .populate("tenantId", "fullName")
      .populate("houseId", "title location");

    const reports = await Promise.all(agreements.map(async (ag) => {
      const payments = await RentPayment.find({ agreementId: ag._id })
        .sort({ paymentDate: -1 });

      return {
        house: ag.houseId,
        tenant: ag.tenantId,
        totalPayments: payments.length,
        totalEarnings: payments.reduce((sum, p) => sum + p.amountPaid, 0),
        payments
      };
    }));

    res.json(reports);

  } catch (err) {
    console.error("getLandlordReport error:", err);
    res.status(500).json({ message: "Failed to get landlord report" });
  }
};

exports.getVisitReport = async (req, res) => {
  try {
    const visits = await VisitRequest.find({ requestedTo: req.user.userId })
      .populate("tenantId", "fullName phone email")
      .populate("houseId", "title location")
      .sort({ createdAt: -1 });

    res.json(visits);

  } catch (err) {
    console.error("getVisitReport error:", err);
    res.status(500).json({ message: "Failed to fetch visit requests" });
  }
};

exports.getEstateReport = async (req, res) => {
  try {
    const { estate } = req.params;

    const houses = await House.find({ location: estate });
    const houseIds = houses.map(h => h._id);

    const payments = await RentPayment.find({ houseId: { $in: houseIds } });

    res.json({
      estate,
      houseCount: houses.length,
      totalPayments: payments.length,
      totalEarnings: payments.reduce((sum, p) => sum + p.amountPaid, 0),
      payments
    });

  } catch (err) {
    console.error("getEstateReport error:", err);
    res.status(500).json({ message: "Failed to get estate report" });
  }
};

exports.getDefaulterReport = async (req, res) => {
  try {
    const landlordId = req.user.userId;
    const today = new Date();
    const dueDay = 5;

    if (today.getDate() <= dueDay) {
      return res.status(200).json({ message: "No defaulters yet. Due date not reached." });
    }

    const { start, end } = getCurrentMonthRange();
    const agreements = await RentalAgreement.find({ landlordId });

    const defaulterPromises = agreements.map(async (ag) => {
      const payment = await RentPayment.findOne({
        agreementId: ag._id,
        paymentDate: { $gte: start, $lte: end }
      });

      if (!payment) {
        const tenant = await User.findById(ag.tenantId).select("fullName email phone");
        return {
          tenant,
          house: ag.houseId,
          monthlyRent: ag.monthlyRent,
          leaseStart: ag.leaseStart,
          leaseEnd: ag.leaseEnd
        };
      }
      return null;
    });

    const defaulters = (await Promise.all(defaulterPromises)).filter(Boolean);

    res.status(200).json({ count: defaulters.length, defaulters });

  } catch (err) {
    console.error("Defaulter report error:", err);
    res.status(500).json({ message: "Failed to get defaulter report" });
  }
};