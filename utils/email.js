const nodemailer = require("nodemailer");

exports.sendEmail = async ({ to, subject, text, html }) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: `"Smart Rentals" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html
    });
  } catch (error) {
    console.error("Email send error:", error);
    throw new Error("Failed to send email");
  }
};
