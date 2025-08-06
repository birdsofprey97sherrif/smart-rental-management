const express = require("express");
const router = express.Router();

const {
  getAllHouses,
  getHouseById,
  createHouse,
  updateHouse,
  deleteHouse,
  assignCaretaker,
  getVacantHouses,
  searchHouses,
  uploadHouse,
} = require("../controllers/houseController");

const { protectRoute } = require("../middlewares/authMiddleware");
const { isLandlord } = require("../middlewares/roleMiddleware");
const upload = require("../middlewares/uploadMiddleware");
const { resizeHouseImage } = require("../middlewares/imageUpload");

// Search houses (landlord only) -- Place BEFORE :id route
router.get("/search", protectRoute, isLandlord, searchHouses);

// Get all houses
router.get("/", getAllHouses);

// Get house by ID
router.get("/:id", getHouseById);

// Get vacant houses
router.get("/vacant", getVacantHouses);

// Create house (single image, landlord only)
router.post(
  "/",
  protectRoute,
  isLandlord,
  upload.single("photo"),
  resizeHouseImage,
  createHouse
);

// Update house
router.put("/:id", protectRoute, updateHouse);

// Delete house
router.delete("/:id", protectRoute, deleteHouse);

// Assign caretaker to house
router.put("/:houseId/assign-caretaker", protectRoute, assignCaretaker);

// Multiple image upload (e.g. up to 5 images)
router.post(
  "/upload",
  protectRoute,
  upload.array("photos", 5),
  uploadHouse
);

module.exports = router;
