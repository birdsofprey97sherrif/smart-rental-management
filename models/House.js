const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const houseSchema = new Schema({
  title: { type: String, required: true },
  description: String,
  location: {
    county: String,
    town: String,
    street: String,
    mapLink: String,
  },
  rent: { type: Number, required: true },
  size: { type: String, default: "" },
  amenities: { type: [String], default: [] },
  photos: { type: [String], default: [] },
  status: {
    type: String,
    enum: ["vacant", "occupied", "reserved"],
    default: "vacant",
  },

  landlordId: { type: Schema.Types.ObjectId, ref: "User", required: true }, // Landlord
  caretakerId: { type: Schema.Types.ObjectId, ref: "User", default: null }, // Assigned caretaker
  tenants: [{ type: Schema.Types.ObjectId, ref: "User" }], // Optional direct tenant list

}, { timestamps: true });


module.exports = mongoose.model("House", houseSchema);
