const User = require("../models/User");
const House = require("../models/House"); // ✅ Add this import

// Get Profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select(
      "-password -resetToken -resetTokenExpiry"
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Failed to load user profile" });
  }
};

// Update Profile
exports.updateUserProfile = async (req, res) => {
  try {
    const { fullName, email, phone } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { fullName, email, phone },
      { new: true, runValidators: true }
    ).select("-password -resetToken -resetTokenExpiry");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Failed to update user profile" });
  }
};

// Deactivate or Reactivate Account
exports.toggleAccountDeactivation = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isDeleted = !user.isDeleted;
    await user.save();

    res.json({
      message: user.isDeleted
        ? "Your account has been deactivated."
        : "Your account is now active again.",
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to update account status" });
  }
};

// Admin Suspend/Unsuspend
exports.toggleSuspend = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isSuspended = !user.isSuspended;
    await user.save();

    res.json({
      message: `User is now ${user.isSuspended ? "suspended" : "active"}`,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to update user suspension" });
  }
};

// Register Staff (by Landlord/Admin)
exports.registerStaff = async (req, res) => {
  try {
    const { fullName, email, phone, password, role } = req.body;

    if (!["caretaker", "admin", "landlord"].includes(role)) {
      return res.status(400).json({ message: "Invalid staff role" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const staff = await User.create({
      fullName,
      email,
      phone,
      password,
      role,
      landlord: req.user.userId,
    });

    res.status(201).json({
      message: "Staff registered successfully",
      staff: {
        id: staff._id,
        fullName: staff.fullName,
        email: staff.email,
        role: staff.role,
      },
    });
  } catch (err) {
    console.error("Register staff error:", err);
    res.status(500).json({ message: "Failed to register staff" });
  }
};

// Register Tenant (by Landlord)
exports.registerTenant = async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const tenant = await User.create({
      fullName,
      email,
      phone,
      password,
      role: "tenant",
      landlord: req.user.userId,
    });

    res.status(201).json({
      message: "Tenant registered successfully",
      tenant: {
        id: tenant._id,
        fullName: tenant.fullName,
        email: tenant.email,
        role: tenant.role,
      },
    });
  } catch (err) {
    console.error("Register tenant error:", err);
    res.status(500).json({ message: "Failed to register tenant" });
  }
};

// ✅ FIXED: Get all tenants under a landlord (through houses)
exports.getTenantsForLandlord = async (req, res) => {
  try {
    const landlordId = req.user.userId;
    const search = req.query.search || "";

    // Find all houses owned by landlord
    const houses = await House.find({ postedBy: landlordId }).select("tenants");
    const tenantIds = houses.flatMap(h => h.tenants || []);

    // Build query
    const query = { _id: { $in: tenantIds } };
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const tenants = await User.find(query).select("-password -resetToken -resetTokenExpiry");

    res.json(tenants);
  } catch (err) {
    console.error("Error fetching tenants:", err);
    res.status(500).json({ message: "Failed to fetch tenants" });
  }
};

// ✅ FIXED: Get all staff (caretakers) for a landlord
exports.getStaffForLandlord = async (req, res) => {
  try {
    const landlordId = req.user.userId;
    const search = req.query.search || "";

    // Option 1: Get caretakers assigned to landlord's houses
    const houses = await House.find({ postedBy: landlordId })
      .populate("caretakerId", "fullName email phone role");

    const caretakers = houses
      .map(h => h.caretakerId)
      .filter(c => c != null);

    // Remove duplicates
    const uniqueCaretakers = Array.from(
      new Map(caretakers.map(c => [c._id.toString(), c])).values()
    );

    // Apply search filter if provided
    let filteredCaretakers = uniqueCaretakers;
    if (search) {
      const regex = new RegExp(search, 'i');
      filteredCaretakers = uniqueCaretakers.filter(c => 
        regex.test(c.fullName) || 
        regex.test(c.email) || 
        regex.test(c.phone)
      );
    }

    res.json({ staff: filteredCaretakers });
  } catch (err) {
    console.error("Error fetching staff:", err);
    res.status(500).json({ message: "Failed to fetch staff" });
  }
};

// ✅ NEW: Get all staff created by this landlord (alternative approach)
exports.getAllStaffForLandlord = async (req, res) => {
  try {
    const landlordId = req.user.userId;
    const search = req.query.search || "";

    // Find all staff (caretakers) linked to this landlord
    const query = {
      landlord: landlordId,
      role: { $in: ["caretaker", "admin"] }
    };

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } }
      ];
    }

    const staff = await User.find(query).select("-password -resetToken -resetTokenExpiry");

    res.json({ staff });
  } catch (err) {
    console.error("Error fetching all staff:", err);
    res.status(500).json({ message: "Failed to fetch staff" });
  }
};