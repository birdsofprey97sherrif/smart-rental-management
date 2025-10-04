// utils/emailTemplates.js
const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const fs = require('fs');

exports.sendTemplatedEmail = async (to, template, data) => {
  const templatePath = `./templates/${template}.html`;
  const html = fs.readFileSync(templatePath, 'utf8');
  const compiled = handlebars.compile(html);
  const finalHtml = compiled(data);

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: data.subject,
    html: finalHtml
  });
};

// templates/welcome.html
/*
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .button { background: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Welcome {{fullName}}!</h1>
    <p>Thank you for joining Smart Rental Management.</p>
    <a href="{{verifyLink}}" class="button">Verify Your Account</a>
  </div>
</body>
</html>
*/