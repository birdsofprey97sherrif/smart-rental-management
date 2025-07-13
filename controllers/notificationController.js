const Notification = require("../models/Notification");

// Get all notifications for the logged-in user
exports.getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json({ notifications });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

// Mark all notifications as seen for the user
exports.markAsSeen = async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user.userId, seen: false }, { seen: true });
    res.json({ message: "All notifications marked as seen" });
  } catch (err) {
    res.status(500).json({ message: "Failed to mark notifications as seen" });
  }
};

// Delete a notification
exports.deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const notification = await Notification.findById(notificationId);

    if (!notification) return res.status(404).json({ message: "Notification not found" });

    if (notification.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Not authorized to delete this notification" });
    }

    await notification.remove();
    res.json({ message: "Notification deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete notification" });
  }
};

// Example of creating a notification (this should be moved to the relevant business logic area)
// await Notification.create({
//   userId: recipientId,
//   type: "rent_due", // or "chat", "visit_approved"
//   message: `Your rent for House A is due.`,
// });
// Replace the following with actual parameters, e.g. recipient's phone number and message
// if (user.notificationPrefs.sms) await sendSMS(user.phoneNumber, `Your rent for House A is due.`);
// await Notification.create({
//   userId: recipientId,
//   type: "rent_due", // or "chat", "visit_approved"
//   message: `Your rent for House A is due.`,
// });
