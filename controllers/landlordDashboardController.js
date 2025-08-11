exports.getLandlordDashboardStats = async (req, res) => {
  try {
    const landlordId = req.user.userId;

    // Houses
    const houses = await House.find({ landlordId });
    const totalHouses = houses.length;
    const occupied = houses.filter(h => h.status === "occupied").length;
    const vacant = houses.filter(h => h.status === "vacant").length;

    // Tenants & Caretakers
    const tenants = await User.find({ role: "tenant", landlordId });
    const caretakers = await User.find({ role: "caretaker", landlordId });

    // Visit Requests (pending)
    const pendingVisits = await VisitRequest.countDocuments({ landlordId, status: "pending" });

    // Relocations (pending)
    const pendingRelocations = await Relocation.countDocuments({ landlordId, status: "pending" });

    // Defaulters
    const defaulters = await RentPayment.countDocuments({ landlordId, isDefaulted: true });

    // Maintenance stats
    const allRequests = await Maintenance.find({ landlordId });
    const pendingMaint = allRequests.filter(r => r.status === "pending").length;
    const inProgressMaint = allRequests.filter(r => r.status === "in-progress").length;
    const completedMaint = allRequests.filter(r => r.status === "completed").length;

    const now = new Date();
    const thisMonthMaint = allRequests.filter(r => {
      const created = new Date(r.createdAt);
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
    }).length;

    // Group maintenance by month for chart
    const monthlyData = {};
    allRequests.forEach(r => {
      const date = new Date(r.createdAt);
      const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
      monthlyData[key] = (monthlyData[key] || 0) + 1;
    });

    res.json({
      houses: { total: totalHouses, occupied, vacant },
      tenants: tenants.length,
      caretakers: caretakers.length,
      visits: pendingVisits,
      relocations: pendingRelocations,
      defaulters,
      maintenance: {
        pending: pendingMaint,
        inProgress: inProgressMaint,
        completed: completedMaint,
        thisMonthCount: thisMonthMaint,
        monthlyData
      }
    });

  } catch (err) {
    res.status(500).json({ message: "Failed to load landlord dashboard stats" });
  }
};



exports.getLandlordActivityLog = async (req, res) => {
  try {
    const landlordId = req.user.userId;
    const { type, skip = 0, limit = 10 } = req.query;

    let logs = [];

    if (!type || type === "visit") {
      const visits = await VisitRequest.find({ landlordId })
        .sort({ createdAt: -1 })
        .skip(parseInt(skip))
        .limit(parseInt(limit))
        .select("houseId tenantId status createdAt")
        .populate("houseId", "title")
        .populate("tenantId", "fullName");

      logs.push(
        ...visits.map(v => ({
          type: "Visit Request",
          house: v.houseId?.title,
          tenant: v.tenantId?.fullName,
          status: v.status,
          date: v.createdAt
        }))
      );
    }

    if (!type || type === "relocation") {
      const relocations = await Relocation.find({ landlordId })
        .sort({ createdAt: -1 })
        .skip(parseInt(skip))
        .limit(parseInt(limit))
        .select("houseId tenantId status createdAt")
        .populate("houseId", "title")
        .populate("tenantId", "fullName");

      logs.push(
        ...relocations.map(r => ({
          type: "Relocation",
          house: r.houseId?.title,
          tenant: r.tenantId?.fullName,
          status: r.status,
          date: r.createdAt
        }))
      );
    }

    if (!type || type === "maintenance") {
      const maints = await Maintenance.find({ landlordId })
        .sort({ createdAt: -1 })
        .skip(parseInt(skip))
        .limit(parseInt(limit))
        .select("houseId tenantId status issue createdAt")
        .populate("houseId", "title")
        .populate("tenantId", "fullName");

      logs.push(
        ...maints.map(m => ({
          type: "Maintenance",
          house: m.houseId?.title,
          tenant: m.tenantId?.fullName,
          status: m.status,
          date: m.createdAt
        }))
      );
    }

    // Sort all logs by date (newest first)
    logs.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({
      total: logs.length,
      logs: logs.slice(0, parseInt(limit)) // send only first `limit` after merging
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to load activity log" });
  }
};
