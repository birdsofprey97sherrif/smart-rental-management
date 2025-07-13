function allowRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied. Not authorized." });
    }
    next();
  };
}

module.exports = {
  isCaretakerOrLandlord: allowRoles("caretaker", "landlord"),
  isLandlord: allowRoles("landlord"),
  isTenant: allowRoles("tenant"),
  isCaretaker: allowRoles("caretaker"),
  isAdmin: allowRoles("admin"),
  isOwner: allowRoles("landlord", "admin"),
  isTenantOrLandlord: allowRoles("tenant", "landlord"),
  isTenantOrCaretaker: allowRoles("tenant", "caretaker"),
  isTenantOrLandlordOrCaretaker: allowRoles("tenant", "landlord", "caretaker"),
  isTenantOrLandlordOrAdmin: allowRoles("tenant", "landlord", "admin"),
  isAdminOrCaretaker: allowRoles("admin", "caretaker"),
};
