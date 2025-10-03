const nodemailer = require('nodemailer');
const { email: emailCfg } = require('../config/config');
const logger = require('../config/logger');

let transporter;
function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: emailCfg.host,
      port: emailCfg.port,
      secure: emailCfg.port === 465, // true for 465
      auth: emailCfg.user && emailCfg.password ? { user: emailCfg.user, pass: emailCfg.password } : undefined
    });
  }
  return transporter;
}

async function sendMail({ to, subject, html, attachments }) {
  const t = getTransporter();
  const info = await t.sendMail({ from: emailCfg.from, to, subject, html, attachments });
  logger.info('Email sent', { messageId: info.messageId, to, subject });
  return info;
}

module.exports = {
  sendMail
};
