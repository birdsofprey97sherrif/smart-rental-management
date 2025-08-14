const Message = require("../models/Message");

// Send message
exports.sendMessage = async (req, res) => {
  try {
    const { houseId, receiverId, text } = req.body;
    if (!houseId || !receiverId || !text) {
      return res.status(400).json({ message: "houseId, receiverId, and text are required" });
    }

    const message = new Message({
      houseId,
      senderId: req.user.userId,
      receiverId,
      text,
    });

    await message.save();
    res.status(201).json({ message: "Message sent", data: message });
  } catch (err) {
    console.error("Send message error:", err);
    res.status(500).json({ message: "Failed to send message" });
  }
};

// Get messages for a house (conversation)
exports.getHouseMessages = async (req, res) => {
  try {
    const { houseId } = req.params;
    if (!houseId) {
      return res.status(400).json({ message: "houseId is required" });
    }

    const messages = await Message.find({ houseId })
      .populate("senderId", "fullName role")
      .populate("receiverId", "fullName role")
      .sort({ sentAt: 1 });

    res.status(200).json({ count: messages.length, messages });
  } catch (err) {
    res.status(500).json({ message: "Error loading messages" });
  }
};

exports.getmessageHistory = async (req, res) => {
  try {
    const { houseId } = req.params;
    if (!houseId) {
      return res.status(400).json({ message: "houseId is required" });
    }

    const messages = await Message.find({ houseId })
      .populate("senderId", "fullName role")
      .populate("receiverId", "fullName role")
      .sort({ sentAt: 1 });

    res.status(200).json({ count: messages.length, messages });
  } catch (err) {
    res.status(500).json({ message: "Error loading messages" });
  }
};