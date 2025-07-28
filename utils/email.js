const nodemailer = require("nodemailer");

exports.sendEmail = async ({ to, subject, text, html }) => {
  try {
    const testAccount = await nodemailer.createTestAccount();

    const transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    const info = await transporter.sendMail({
      from: `"Smart Rentals" <${testAccount.user}>`,
      to,
      subject,
      text,
      html,
    });

    console.log("✅ Email sent!");
    console.log("📬 Preview URL:", nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error("❌ Email send error:", error);
    throw new Error("Failed to send email");
  }
};
