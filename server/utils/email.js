const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
require('dotenv').config(); // Load environment variables from .env

// Beautiful email logger using mock/json transport of nodemailer
const logFilePath = path.join(__dirname, '../logs/emails.log');

// Ensure log directory exists
const logDir = path.dirname(logFilePath);
try {
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
} catch (error) {
  console.log('[Email Logger] Skipping log directory creation (Serverless environment detected).');
}

let transporter;

// Dynamically select between Gmail SMTP and JSON Mock Logger
if (process.env.EMAIL_USER && process.env.EMAIL_APP_PASSWORD) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD
    }
  });
  console.log('[Email Transporter] Configured with real Gmail SMTP.');
} else {
  transporter = nodemailer.createTransport({
    jsonTransport: true
  });
  console.log('[Email Transporter] Running in Mock Offline Mode. (Set EMAIL_USER and EMAIL_APP_PASSWORD in .env for real delivery)');
}

/**
 * Sends a highly styled email (real or mock)
 * @param {Object} options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - Email content in HTML format
 */
const sendEmail = async ({ to, subject, html }) => {
  try {
    const fromAddress = process.env.EMAIL_USER || 'notifications@careerconnect.com';
    const info = await transporter.sendMail({
      from: `"Career Connect" <${fromAddress}>`,
      to,
      subject,
      html,
    });

    const timestamp = new Date().toISOString();

    // Log to file if running in offline mock mode (info.message is populated by jsonTransport)
    if (info.message) {
      const logEntry = `
========================================================================
[EMAIL MOCK LOG] - ${timestamp}
------------------------------------------------------------------------
To: ${to}
Subject: ${subject}
Message JSON: ${info.message}
------------------------------------------------------------------------
Body Preview:
${html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 300)}...
========================================================================
`;
      try {
        fs.appendFileSync(logFilePath, logEntry, 'utf8');
        console.log(`[Email Mock Transporter] Logged email to ${to} for offline testing.`);
      } catch (e) {
        console.log(`[Email Mock Transporter] Mock email to ${to} generated but skipped logging to disk (Serverless).`);
      }
    } else {
      console.log(`[Email Transporter] Real email successfully sent via Gmail to ${to}. Message ID: ${info.messageId}`);
    }
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

module.exports = { sendEmail };
