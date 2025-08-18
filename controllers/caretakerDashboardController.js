// controllers/caretakerDashboardController.js
const Maintenance = require("../models/MaintenanceRequest");
const Relocation = require("../models/RelocationRequest");
const Visit = require("../models/VisitRequest");
const House = require("../models/House");

exports.getDashboardStats = async (req, res) => {
  try {
    const caretakerId = req.user.id;

    const housesManaged = await House.countDocuments({ caretaker: caretakerId });
    const visitsPending = await Visit.countDocuments({ caretaker: caretakerId, status: "pending" });
    const relocationsPending = await Relocation.countDocuments({ caretaker: caretakerId, status: "pending" });

    const maintenancePending = await Maintenance.countDocuments({ caretaker: caretakerId, status: "pending" });

    // Monthly maintenance data (for Recharts)
    const monthlyData = {};
    const maintDocs = await Maintenance.aggregate([
      { $match: { caretaker: caretakerId } },
      {
        $group: {
          _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    maintDocs.forEach(doc => {
      const month = new Date(doc._id.year, doc._id.month - 1).toLocaleString("default", { month: "short" });
      monthlyData[month] = doc.count;
    });

    res.json({
      housesManaged,
      visitsPending,
      relocationsPending,
      maintenance: { pending: maintenancePending, monthlyData }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error fetching dashboard stats" });
  }
};

exports.getActivityLogs = async (req, res) => {
  try {
    const caretakerId = req.user.id;
    const { type, skip = 0, limit = 5 } = req.query;

    let logs = [];

    const query = { caretaker: caretakerId };
    if (type) {
      if (type === "visit") logs = await Visit.find(query).skip(Number(skip)).limit(Number(limit)).lean();
      else if (type === "relocation") logs = await Relocation.find(query).skip(Number(skip)).limit(Number(limit)).lean();
      else if (type === "maintenance") logs = await Maintenance.find(query).skip(Number(skip)).limit(Number(limit)).lean();
    } else {
      const visitLogs = await Visit.find(query).lean();
      const relocationLogs = await Relocation.find(query).lean();
      const maintenanceLogs = await Maintenance.find(query).lean();
      logs = [...visitLogs, ...relocationLogs, ...maintenanceLogs];
      logs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      logs = logs.slice(Number(skip), Number(skip) + Number(limit));
    }

    res.json({
      logs: logs.map(log => ({
        type: log.type || log.requestType || log.constructor.modelName,
        house: log.houseId?.title || "N/A",
        person: log.tenantId?.fullName || log.landlordId?.fullName || "N/A",
        status: log.status,
        date: log.createdAt
      })),
      total: logs.length
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error fetching activity logs" });
  }
};
