const RentalAgreement = require("../models/RentalAgreement");
const House = require("../models/House");

// Create a rental agreement
exports.createRentalAgreement = async (req, res) => {
  try {
    const { tenantId, houseId, leaseStart, leaseEnd, monthlyRent } = req.body;
    const landlordId = req.user.userId;

    const house = await House.findById(houseId);
    if (!house || house.postedBy.toString() !== landlordId) {
      return res.status(403).json({ message: "Only the landlord can assign this house" });
    }

    const agreement = new RentalAgreement({
      tenantId, houseId, landlordId, leaseStart, leaseEnd, monthlyRent
    });

    await agreement.save();
    res.status(201).json({ message: "Rental agreement created", agreement });
  } catch (err) {
    res.status(500).json({ message: "Failed to create agreement" });
  }
};

// Generic agreement fetcher
async function fetchAgreements(res, filter) {
  try {
    const agreements = await RentalAgreement.find(filter)
      .populate("tenantId", "fullName phone email")
      .populate("landlordId", "fullName phone")
      .populate("houseId", "title location");
    res.json(agreements);
  } catch (err) {
    res.status(500).json({ message: "Failed to retrieve agreements" });
  }
}

// Get agreements by tenant
exports.getAgreementsByTenant = (req, res) => fetchAgreements(res, { tenantId: req.user.userId });

// Get agreements by landlord
exports.getAgreementsByLandlord = (req, res) => fetchAgreements(res, { landlordId: req.user.userId });

// Get agreements by house
exports.getAgreementsByHouse = (req, res) => fetchAgreements(res, { houseId: req.params.id });

// Get all agreements
exports.getAllAgreements = (req, res) => fetchAgreements(res, {});

// Get agreements by caretaker
exports.getAgreementsByCaretaker = (req, res) => fetchAgreements(res, { caretakerId: req.user.userId });

// Get agreements by multiple roles (flexible)
exports.getAgreementsByRoles = async (req, res) => {
  try {
    const { houseId } = req.params;
    const userId = req.user.userId;
    const orFilter = [
      { tenantId: userId },
      { landlordId: userId },
      { caretakerId: userId }
    ];
    if (houseId) orFilter.push({ houseId });

    const agreements = await RentalAgreement.find({ $or: orFilter })
      .populate("tenantId", "fullName phone email")
      .populate("landlordId", "fullName phone")
      .populate("houseId", "title location");

    res.json(agreements);
  } catch (err) {
    res.status(500).json({ message: "Failed to retrieve agreements" });
  }
};

// Get agreement by ID
exports.getAgreementById = async (req, res) => {
  try {
    const agreement = await RentalAgreement.findById(req.params.id)
      .populate("tenantId", "fullName phone email")
      .populate("landlordId", "fullName phone")
      .populate("houseId", "title location");

    if (!agreement) return res.status(404).json({ message: "Agreement not found" });
    res.json(agreement);
  } catch (err) {
    res.status(500).json({ message: "Failed to retrieve agreement" });
  }
};

// Sign agreement
exports.signAgreement = async (req, res) => {
  try {
    const agreementId = req.params.id;
    const agreement = await RentalAgreement.findById(agreementId);
    if (!agreement) return res.status(404).json({ message: "Agreement not found" });

    agreement.isSigned = true;
    await agreement.save();
    res.json({ message: "Agreement signed", agreement });
  } catch (err) {
    res.status(500).json({ message: "Failed to sign agreement" });
  }
};

// Mark deposit as paid
exports.markDepositPaid = async (req, res) => {
  try {
    const agreementId = req.params.id;
    const agreement = await RentalAgreement.findById(agreementId);
    if (!agreement) return res.status(404).json({ message: "Agreement not found" });

    agreement.depositPaid = true;
    await agreement.save();
    res.json({ message: "Deposit marked as paid", agreement });
  } catch (err) {
    res.status(500).json({ message: "Failed to mark deposit as paid" });
  }
};

// Terminate agreement
exports.terminateAgreement = async (req, res) => {
  try {
    const agreementId = req.params.id;
    const agreement = await RentalAgreement.findById(agreementId);
    if (!agreement) return res.status(404).json({ message: "Agreement not found" });

    await agreement.remove();
    res.json({ message: "Agreement terminated" });
  } catch (err) {
    res.status(500).json({ message: "Failed to terminate agreement" });
  }
};

// Update agreement
exports.updateAgreement = async (req, res) => {
  try {
    const agreementId = req.params.id;
    const updates = req.body;

    const agreement = await RentalAgreement.findByIdAndUpdate(agreementId, updates, { new: true });
    if (!agreement) return res.status(404).json({ message: "Agreement not found" });
    res.json(agreement);
  } catch (err) {
    res.status(500).json({ message: "Failed to update agreement" });
  }
};

// Delete agreement
exports.deleteAgreement = async (req, res) => {
  try {
    const agreementId = req.params.id;
    const agreement = await RentalAgreement.findByIdAndDelete(agreementId);
    if (!agreement) return res.status(404).json({ message: "Agreement not found" });

    res.json({ message: "Agreement deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete agreement" });
  }
};
