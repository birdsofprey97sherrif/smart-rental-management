const House = require("../models/House");
const User = require("../models/User");

// =====================
// Get ALL houses
// =====================
exports.getAllHouses = async (req, res) => {
  try {
    const houses = await House.find().populate("landlordId", "fullName phone role");
    res.json(houses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not retrieve houses" });
  }
};

// =====================
// Get house by ID
// =====================
exports.getHouseById = async (req, res) => {
  try {
    const house = await House.findById(req.params.id).populate("landlordId", "fullName phone role");
    if (!house) return res.status(404).json({ message: "House not found" });
    res.json(house);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error retrieving house" });
  }
};

// =====================
// Create House
// =====================
exports.createHouse = async (req, res) => {
  try {
    const { title, description, location, rent, size, amenities } = req.body;

    const house = new House({
      title,
      description,
      location,
      rent,
      size,
      amenities,
      landlordId: req.user.userId, // ✅ FIXED: Use landlordId instead of postedBy
    });

    await house.save();

    res.status(201).json({ message: "House created successfully", house });
  } catch (err) {
    console.error("Create house error:", err);
    res.status(500).json({ message: "Failed to create house", error: err.message });
  }
};

// =====================
// Update House
// =====================
exports.updateHouse = async (req, res) => {
  try {
    const houseId = req.params.id;
    
    // ✅ Check ownership before updating
    const house = await House.findById(houseId);
    if (!house) return res.status(404).json({ message: "House not found" });
    
    if (house.landlordId.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Not authorized to update this house" });
    }

    const updated = await House.findByIdAndUpdate(houseId, req.body, { 
      new: true,
      runValidators: true 
    });
    
    res.json({ message: "House updated", house: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update house" });
  }
};

// =====================
// Delete House
// =====================
exports.deleteHouse = async (req, res) => {
  try {
    const houseId = req.params.id;
    
    // ✅ Check ownership before deleting
    const house = await House.findById(houseId);
    if (!house) return res.status(404).json({ message: "House not found" });
    
    if (house.landlordId.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Not authorized to delete this house" });
    }

    await House.findByIdAndDelete(houseId);
    res.json({ message: "House deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete house" });
  }
};

// =====================
// Assign Caretaker
// =====================
exports.assignCaretaker = async (req, res) => {
  try {
    const { houseId } = req.params;
    const { caretakerId } = req.body;

    const house = await House.findById(houseId);
    if (!house) return res.status(404).json({ message: "House not found" });

    // ✅ FIXED: Use landlordId instead of postedBy
    if (house.landlordId.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Only the owner can assign a caretaker" });
    }

    const caretaker = await User.findById(caretakerId);
    if (!caretaker || caretaker.role !== "caretaker") {
      return res.status(400).json({ message: "Invalid caretaker" });
    }

    house.caretakerId = caretakerId;
    await house.save();

    // ✅ Update caretaker's managed houses
    if (!caretaker.caretakerDetails) {
      caretaker.caretakerDetails = { housesManaged: [] };
    }
    
    const alreadyAssigned = caretaker.caretakerDetails.housesManaged.some(
      id => id.toString() === houseId
    );
    
    if (!alreadyAssigned) {
      caretaker.caretakerDetails.housesManaged.push(houseId);
      await caretaker.save();
    }

    res.json({ message: "Caretaker assigned successfully", house });
  } catch (err) {
    console.error("Assign caretaker error:", err);
    res.status(500).json({ message: "Failed to assign caretaker" });
  }
};

// =====================
// Search Houses
// =====================
exports.searchHouses = async (req, res) => {
  try {
    const { location, minRent, maxRent, size } = req.query;
    const query = { landlordId: req.user.userId }; // ✅ Only search landlord's houses
    
    if (location) {
      query.$or = [
        { "location.county": { $regex: location, $options: "i" } },
        { "location.town": { $regex: location, $options: "i" } },
        { "location.street": { $regex: location, $options: "i" } }
      ];
    }
    
    if (size) query.size = size;
    
    if (minRent || maxRent) {
      query.rent = {};
      if (minRent) query.rent.$gte = Number(minRent);
      if (maxRent) query.rent.$lte = Number(maxRent);
    }

    const houses = await House.find(query).populate("landlordId", "fullName phone");
    res.json({ count: houses.length, houses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to search houses" });
  }
};

// =====================
// Upload House (With Image Uploads)
// =====================
exports.uploadHouse = async (req, res) => {
  try {
    let {
      title,
      description,
      location,
      rent,
      size,
      amenities,
      photos,
    } = req.body;

    let photoPaths = [];
    if (req.files && req.files.length > 0) {
      photoPaths = req.files.map(file => file.path);
    } else if (photos) {
      photoPaths = Array.isArray(photos) ? photos : [photos];
    }

    // ✅ Parse JSON strings if needed
    if (typeof location === "string") {
      try { location = JSON.parse(location); } catch (e) {
        console.error("Location parse error:", e);
      }
    }
    if (typeof amenities === "string") {
      try { amenities = JSON.parse(amenities); } catch (e) {
        console.error("Amenities parse error:", e);
      }
    }

    const house = new House({
      title,
      description,
      location,
      rent,
      size,
      amenities,
      photos: photoPaths,
      landlordId: req.user.userId, // ✅ FIXED: Use landlordId
    });

    await house.save();

    res.status(201).json({ message: "House uploaded successfully", house });
  } catch (err) {
    console.error("Error uploading house:", err);
    res.status(500).json({ message: "Error uploading house", error: err.message });
  }
};

// =====================
// Get Only Vacant Houses
// =====================
exports.getVacantHouses = async (req, res) => {
  try {
    const houses = await House.find({ 
      status: "vacant",
      landlordId: req.user.userId // ✅ Only landlord's vacant houses
    }).populate("landlordId", "fullName phone role");
    
    res.json(houses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not retrieve vacant houses" });
  }
};

// =====================
// ✅ NEW: Get Landlord's Houses Only
// =====================
exports.getLandlordHouses = async (req, res) => {
  try {
    const houses = await House.find({ landlordId: req.user.userId })
      .populate("landlordId", "fullName phone role")
      .populate("caretakerId", "fullName phone")
      .populate("tenants", "fullName email phone")
      .sort({ createdAt: -1 });
    
    res.json({ 
      count: houses.length, 
      houses 
    });
  } catch (err) {
    console.error("Error fetching landlord houses:", err);
    res.status(500).json({ message: "Failed to fetch houses" });
  }
};

// =====================
// ✅ NEW: Get Houses Statistics
// =====================
exports.getHouseStats = async (req, res) => {
  try {
    const landlordId = req.user.userId;
    
    const totalHouses = await House.countDocuments({ landlordId });
    const occupied = await House.countDocuments({ landlordId, status: "occupied" });
    const vacant = await House.countDocuments({ landlordId, status: "vacant" });
    const reserved = await House.countDocuments({ landlordId, status: "reserved" });
    
    res.json({
      total: totalHouses,
      occupied,
      vacant,
      reserved,
      occupancyRate: totalHouses > 0 ? ((occupied / totalHouses) * 100).toFixed(2) : 0
    });
  } catch (err) {
    console.error("Error fetching house stats:", err);
    res.status(500).json({ message: "Failed to fetch statistics" });
  }
};