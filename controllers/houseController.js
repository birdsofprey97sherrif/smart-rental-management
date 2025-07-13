const House = require("../models/House");
const User = require("../models/User");

// =====================
// Get ALL houses
// =====================
exports.getAllHouses = async (req, res) => {
  try {
    const houses = await House.find().populate("postedBy", "fullName phone role");
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
    const house = await House.findById(req.params.id).populate("postedBy", "fullName phone role");
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
      postedBy: req.user.userId,
    });

    await house.save();

    // Update owned houses for landlord
    await User.findByIdAndUpdate(
      req.user.userId,
      { $addToSet: { ownedHouseIds: house._id } },
      { new: true }
    );

    res.status(201).json({ message: "House created successfully", house });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create house" });
  }
};

// =====================
// Update House
// =====================
exports.updateHouse = async (req, res) => {
  try {
    const updated = await House.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "House not found" });
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
    const deleted = await House.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "House not found" });
    res.json({ message: "House deleted" });
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

    if (house.postedBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Only the owner can assign a caretaker" });
    }

    const caretaker = await User.findById(caretakerId);
    if (!caretaker || caretaker.role !== "caretaker") {
      return res.status(400).json({ message: "Invalid caretaker" });
    }

    house.caretakerId = caretakerId;
    await house.save();

    if (!caretaker.caretakerDetails) caretaker.caretakerDetails = { housesManaged: [] };
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
    const query = {};
    if (location) query.location = { $regex: location, $options: "i" };
    if (size) query.size = size;
    if (minRent || maxRent) {
      query.rent = {};
      if (minRent) query.rent.$gte = Number(minRent);
      if (maxRent) query.rent.$lte = Number(maxRent);
    }

    const houses = await House.find(query);
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

    if (typeof location === "string") {
      try { location = JSON.parse(location); } catch {}
    }
    if (typeof amenities === "string") {
      try { amenities = JSON.parse(amenities); } catch {}
    }

    const house = new House({
      title,
      description,
      location,
      rent,
      size,
      amenities,
      photos: photoPaths,
      postedBy: req.user.userId,
    });

    await house.save();

    await User.findByIdAndUpdate(
      req.user.userId,
      { $addToSet: { ownedHouseIds: house._id } },
      { new: true }
    );

    res.status(201).json({ message: "House uploaded successfully", house });
  } catch (err) {
    console.error("Error uploading house:", err);
    res.status(500).json({ message: "Error uploading house" });
  }
};

// =====================
// Get Only Vacant Houses
// =====================
exports.getVacantHouses = async (req, res) => {
  try {
    const houses = await House.find({ status: "vacant" }).populate("postedBy", "fullName phone role");
    res.json(houses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not retrieve vacant houses" });
  }
};
