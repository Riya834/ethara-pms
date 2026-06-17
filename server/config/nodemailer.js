const nodemailer = require('nodemailer');
const { smtp, fromEmail, nodeEnv } = require('./env');

let transporter;

const createTransporter = async () => {
  if (nodeEnv === 'development' && (!smtp.user || !smtp.pass)) {
    // Use Ethereal fake SMTP for development
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log('📧 Ethereal SMTP ready. Preview emails at https://ethereal.email');
    console.log(`   User: ${testAccount.user}`);
  } else {
    transporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.port === 465,
      auth: {
        user: smtp.user,
        pass: smtp.pass,
      },
    });
  }
  return transporter;
};

const getTransporter = () => {
  if (!transporter) throw new Error('Nodemailer transporter not initialized');
  return transporter;
};

const sendMail = async ({ to, subject, html, text }) => {
  try {
    const t = getTransporter();
    const info = await t.sendMail({
      from: `"Ethara PMS" <${fromEmail}>`,
      to,
      subject,
      html,
      text,
    });
    if (nodeEnv === 'development') {
      console.log(`📧 Email preview: ${nodemailer.getTestMessageUrl(info)}`);
    }
    return info;
  } catch (error) {
    console.error('❌ Email send failed:', error.message);
    throw error;
  }
};

module.exports = { createTransporter, getTransporter, sendMail };
