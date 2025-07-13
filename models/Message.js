const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const messageSchema = new Schema({
  houseId: { type: Schema.Types.ObjectId, ref: "House", required: true },
  senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  receiverId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true },
  seen: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("Message", messageSchema);
