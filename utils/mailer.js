const nodemailer = require("nodemailer");

// Use environment variables for credentials
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_SENDER,
    pass: process.env.EMAIL_PASS,
  },
});
// if (user.notificationPrefs.sms) await sendSMS(...);

exports.sendEmail = async ({ to, subject, html }) => {
  const mailOptions = {
    from: `Smart Rental <${process.env.EMAIL_SENDER}>`,
    to,
    subject,
    html,
  };

  await transporter.sendMail(mailOptions);
};

exports.sendResetPasswordEmail = async ({ to, subject, html }) => {
  await this.sendEmail({ to, subject, html });
};

exports.sendVerificationEmail = async ({ to, subject, html }) => {
  await this.sendEmail({ to, subject, html });
};
exports.sendVisitRequestEmail = async ({ to, subject, html }) => {
  await this.sendEmail({ to, subject, html });
};
exports.sendVisitResponseEmail = async ({ to, subject, html }) => {
  await this.sendEmail({ to, subject, html });
};
exports.sendMessageNotificationEmail = async ({ to, subject, html }) => {
  await this.sendEmail({ to, subject, html });
};
exports.sendHouseListingEmail = async ({ to, subject, html }) => {
  await this.sendEmail({ to, subject, html });
};
exports.sendHouseUpdateEmail = async ({ to, subject, html }) => {
  await this.sendEmail({ to, subject, html });
};
exports.sendHouseDeletionEmail = async ({ to, subject, html }) => {
  await this.sendEmail({ to, subject, html });
};
exports.sendTenantApplicationEmail = async ({ to, subject, html }) => {
  await this.sendEmail({ to, subject, html });
};
exports.sendTenantApprovalEmail = async ({ to, subject, html }) => {
  await this.sendEmail({ to, subject, html });
};
exports.sendTenantRejectionEmail = async ({ to, subject, html }) => {
  await this.sendEmail({ to, subject, html });
};
exports.sendTenantNotificationEmail = async ({ to, subject, html }) => {
  await this.sendEmail({ to, subject, html });
};
exports.sendPaymentNotificationEmail = async ({ to, subject, html }) => {
  await this.sendEmail({ to, subject, html });
};
exports.sendPaymentReceiptEmail = async ({ to, subject, html }) => {
  await this.sendEmail({ to, subject, html });
};
exports.sendPaymentReminderEmail = async ({ to, subject, html }) => {
  await this.sendEmail({ to, subject, html });
};
exports.sendPaymentFailureEmail = async ({ to, subject, html }) => {
  await this.sendEmail({ to, subject, html });
};
exports.sendPaymentSuccessEmail = async ({ to, subject, html

 }) => {
  await this.sendEmail({ to, subject, html });
};
exports.sendAccountActivationEmail = async ({ to, subject, html }) => {
  await this.sendEmail({ to, subject, html });
};
exports.sendAccountDeactivationEmail = async ({ to, subject, html }) => {
  await this.sendEmail({ to, subject, html });
};
exports.sendAccountDeletionEmail = async ({ to, subject, html }) => {
  await this.sendEmail({ to, subject, html });
};
exports.sendAccountUpdateEmail = async ({ to, subject, html }) => {
  await this.sendEmail({ to, subject, html });
};
