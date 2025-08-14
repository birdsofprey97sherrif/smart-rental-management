const RentalAgreement = require("../models/RentalAgreement");
const RentPayment = require("../models/RentPayment");
const User = require("../models/User");
const House = require("../models/House");
const { sendSMS } = require("../utils/sms");

const getCurrentMonthRange = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  return { start, end };
};

// Get all defaulters for a landlord
exports.getDefaulters = async (req, res) => {
  try {
    const landlordId = req.user.userId;
    const today = new Date();
    const dueDay = 5;

    if (today.getDate() <= dueDay) {
      return res.status(200).json({ message: "No defaulters yet. Due date not reached." });
    }

    const { start, end } = getCurrentMonthRange();
    const agreements = await RentalAgreement.find({ landlordId });

    // Run DB queries in parallel for efficiency
    const defaulterPromises = agreements.map(async (ag) => {
      const payment = await RentPayment.findOne({
        agreementId: ag._id,
        paymentDate: { $gte: start, $lte: end }
      });

      if (!payment) {
        const tenant = await User.findById(ag.tenantId).select("fullName email phone");
        const house = await House.findById(ag.houseId).select("title location");
        return {
          tenant,
          house,
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
    console.error("Defaulter tracking error:", err);
    res.status(500).json({ message: "Failed to get defaulters" });
  }
};

// Notify a single defaulter (stub for actual notification logic)
exports.notifyDefaulters = async (req, res) => {
  try {
    const { defaulterId } = req.params;
    const defaulter = await User.findById(defaulterId).select("fullName email phone");

    if (!defaulter) {
      return res.status(404).json({ message: "Defaulter not found" });
    }

    // Example: send notification here (email/SMS)
    // await sendEmail({ ... });

    res.status(200).json({ message: `Notification sent to ${defaulter.fullName}` });

  } catch (err) {
    console.error("Notification error:", err);
    res.status(500).json({ message: "Failed to notify defaulter" });
  }
};

// Send SMS reminders to all defaulters
exports.sendDefaulterReminders = async (req, res) => {
  try {
    const landlordId = req.user.userId;
    const today = new Date();
    const dueDay = 5;

    if (today.getDate() <= dueDay) {
      return res.status(200).json({ message: "Too early for reminders. Due date not reached." });
    }

    const { start, end } = getCurrentMonthRange();
    const agreements = await RentalAgreement.find({ landlordId });

    // Parallelize reminder sending
    const reminderPromises = agreements.map(async (ag) => {
      const payment = await RentPayment.findOne({
        agreementId: ag._id,
        paymentDate: { $gte: start, $lte: end }
      });

      if (!payment) {
        const tenant = await User.findById(ag.tenantId).select("fullName phone");
        const house = await House.findById(ag.houseId).select("title");

        const message = `Hi ${tenant.fullName}, you have not paid your rent (KES ${ag.monthlyRent}) for house "${house.title}". Please pay immediately to avoid penalties.`;

        await sendSMS({ to: tenant.phone, message });

        return { tenant: tenant.fullName, phone: tenant.phone, house: house.title };
      }
      return null;
    });

    const reminded = (await Promise.all(reminderPromises)).filter(Boolean);

    res.status(200).json({ message: "Reminders sent to defaulters", count: reminded.length, reminded });

  } catch (err) {
    console.error("Reminder SMS error:", err);
    res.status(500).json({ message: "Failed to send reminders" });
  }
};


exports.getDefaulterList = async (req, res) => {
  try {
    const landlordId = req.user.userId;
    const today = new Date();
    const dueDay = 5;

    if (today.getDate() <= dueDay) {
      return res.status(200).json({ message: "No defaulters yet. Due date not reached." });
    }

    const { start, end } = getCurrentMonthRange();
    const agreements = await RentalAgreement.find({ landlordId });

    // Run DB queries in parallel for efficiency
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
    console.error("Defaulter tracking error:", err);
    res.status(500).json({ message: "Failed to get defaulters" });
  }
}