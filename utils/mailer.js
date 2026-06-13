const nodemailer = require('nodemailer');

const getTransporter = () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  return {
    sendMail: async (mailOptions) => {
      console.log('EMAIL NOT SENT - SMTP not configured:', mailOptions);
    },
  };
};

const sendMail = async (options) => {
  const transporter = getTransporter();
  const mailOptions = {
    from: process.env.SMTP_USER || 'no-reply@lifedrop.org',
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  };
  await transporter.sendMail(mailOptions);
};

module.exports = { sendMail };
