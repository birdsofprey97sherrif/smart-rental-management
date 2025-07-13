const africastalking = require("africastalking")({
  apiKey: process.env.AT_API_KEY,
  username: process.env.AT_USERNAME,
});

const sms = africastalking.SMS;

exports.sendSMS = async ({ to, message }) => {
  await sms.send({ to: [to], message });
};


exports.sendSMS = async ({ to, message }) => {
  try {
    const result = await sms.send({ to: [to], message });
    console.log("SMS sent:", result);
  } catch (err) {
    console.error("SMS send error:", err);
  }
};
exports.sendBulkSMS = async ({ to, message }) => {
  try {
    const result = await sms.send({ to, message });
    console.log("Bulk SMS sent:", result);
  } catch (err) {
    console.error("Bulk SMS send error:", err);
  }
};
exports.sendSMSWithMedia = async ({ to, message, mediaUrl }) => {
  try {
    const result = await sms.send({
      to: [to],
      message,
      mediaUrls: [mediaUrl],
    });
    console.log("SMS with media sent:", result);
  } catch (err) {
    console.error("SMS with media send error:", err);
  }
};
exports.sendDefaulterReminders = async (defaulters) => {
  try {
    const messages = defaulters.map(defaulter => ({
      to: defaulter.phone,
      message: `Dear ${defaulter.fullName}, please pay your rent of Ksh ${defaulter.monthlyRent} for the house at ${defaulter.house.location}. Lease ends on ${defaulter.leaseEnd}.`
    }));

    await Promise.all(messages.map(msg => this.sendSMS(msg)));
    console.log("Defaulter reminders sent successfully");
  } catch (err) {
    console.error("Error sending defaulter reminders:", err);
  }
};
