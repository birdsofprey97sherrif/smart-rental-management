const Notification = require("../models/Notification");
const User = require("../models/User");
const { sendSMS } = require("./sms");
const { sendEmail } = require("./email");

exports.sendNotification = async ({ userId, type, message }) => {
  const user = await User.findById(userId);
  if (!user) return;

  // Save in-app
  await Notification.create({ userId, type, message });

  // Respect preferences
  if (user.notificationPrefs?.sms) {
    await sendSMS({ to: user.phone, message });
  }

  if (user.notificationPrefs?.email) {
    await sendEmail({
      to: user.email,
      subject: "Smart Rental Notification",
      text: message,
    });
  }
};
exports.getNotifications = async (userId) => {
  const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
  return notifications;
};