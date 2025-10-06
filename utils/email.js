const nodemailer = require("nodemailer");

// Create reusable transporter
const createTransporter = () => {
  // Check if email credentials are configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("⚠️ Email credentials not configured. Emails will be logged instead.");
    return null;
  }

  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Send email function with fallback
exports.sendEmail = async ({ to, subject, text, html, attachments }) => {
  try {
    const transporter = createTransporter();

    // If no transporter (missing credentials), just log
    if (!transporter) {
      console.log("📧 [EMAIL LOG]");
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Body: ${text || html}`);
      return { success: false, message: "Email credentials not configured" };
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
      html,
      attachments,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Email send error:", error.message);
    // Don't throw - just log and return failure
    return { success: false, error: error.message };
  }
};

// Bulk email sender
exports.sendBulkEmail = async (recipients, subject, text, html) => {
  const results = [];

  for (const recipient of recipients) {
    const result = await exports.sendEmail({
      to: recipient,
      subject,
      text,
      html,
    });
    results.push({ recipient, ...result });
  }

  return results;
};