const User = require("../models/User");
const House = require("../models/House");
const Relocation = require("../models/RelocationRequest");

exports.getSystemStats = async (req, res) => {
  try {
    const [
      totalUsers,
      tenants,
      landlords,
      caretakers,
      totalHouses,
      totalRelocations,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ roles: "tenant" }),
      User.countDocuments({ roles: "landlord" }),
      User.countDocuments({ roles: "caretaker" }),
      House.countDocuments(),
      Relocation.countDocuments(),
    ]);

    res.status(200).json({
      users: { total: totalUsers, tenants, landlords, caretakers },
      houses: totalHouses,
      relocationRequests: totalRelocations,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch system stats", details: error.message });
  }
};

exports.getRelocationRequests = async (req, res) => {
  try {
    const relocationRequests = await Relocation.find();
    res.status(200).json(relocationRequests);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch relocation requests", details: error.message });
  }
};