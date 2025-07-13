const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const rentalAgreementSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  houseId: { type: Schema.Types.ObjectId, ref: "House", required: true },
  landlordId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  leaseStart: { type: Date, required: true },
  leaseEnd: { type: Date, required: true },
  monthlyRent: { type: Number, required: true },
  depositPaid: { type: Boolean, default: false },
  signedByTenant: { type: Boolean, default: false },
  signedByLandlord: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model("RentalAgreement", rentalAgreementSchema);
