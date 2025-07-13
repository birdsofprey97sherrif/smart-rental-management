const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const rentPaymentSchema = new Schema({
  agreementId: { type: Schema.Types.ObjectId, ref: "RentalAgreement", required: true },
  tenantId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  houseId: { type: Schema.Types.ObjectId, ref: "House", required: true },
  amountPaid: { type: Number, required: true },
  paymentDate: { type: Date, default: Date.now },
  receiptId: { type: String }, // optional receipt code
  paymentMethod: { type: String, default: "Mpesa" }
}, { timestamps: true });

module.exports = mongoose.model("RentPayment", rentPaymentSchema);
