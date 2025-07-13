const express = require("express");
const router = express.Router();
const {
  requestVisit,
  getMyVisits,
  getMyVisitRequests,
  respondToVisit,
} = require("../controllers/visitController");
const { protectRoute } = require("../middlewares/authMiddleware");
const { isCaretakerOrLandlord } = require("../middlewares/roleMiddleware");

router.post("/request", protectRoute, requestVisit);
router.get("/mine", protectRoute, getMyVisits);
router.get("/for-me", protectRoute, isCaretakerOrLandlord, getMyVisitRequests);
router.put("/:id/respond", protectRoute, isCaretakerOrLandlord, respondToVisit);

module.exports = router;

