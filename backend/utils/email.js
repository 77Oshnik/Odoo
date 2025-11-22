const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const fromAddress = process.env.EMAIL_FROM || process.env.SMTP_USER;

const sendOtpEmail = async ({ to, code }) => {
  if (!fromAddress) {
    throw new Error('Email from address is not configured');
  }

  await transporter.sendMail({
    from: fromAddress,
    to,
    subject: 'Your OTP Code',
    text: `Your OTP code is ${code}. It will expire in 10 minutes.`,
    html: `<p>Your OTP code is <strong>${code}</strong>.</p><p>This code will expire in 10 minutes.</p>`
  });
};

module.exports = {
  sendOtpEmail
};
