const nodemailer = require('nodemailer');
require('dotenv').config();

const defaultFrom = process.env.MAIL_FROM || 'no-reply@thehive.local';

function formatSmtpValue(value) {
  if (!value) return '[not set]';
  return value;
}

function isPlaceholderConfig() {
  const host = process.env.MAIL_HOST;
  const user = process.env.MAIL_USER;
  const pass = process.env.MAIL_PASS;

  if (!host || !user || !pass) return true;

  const invalidHosts = ['smtp.example.com', 'example.com'];
  const invalidUsers = ['your-smtp-username'];
  const invalidPass = ['your-smtp-password'];

  return (
    invalidHosts.includes(host.trim()) ||
    invalidUsers.includes(user.trim()) ||
    invalidPass.includes(pass.trim())
  );
}

function getSmtpMode() {
  return isPlaceholderConfig() ? 'DEBUG JSON TRANSPORT' : 'REAL SMTP';
}

function logSmtpConfig() {
  const host = process.env.MAIL_HOST?.trim();
  const port = process.env.MAIL_PORT?.trim();
  const user = process.env.MAIL_USER?.trim();
  const secure = process.env.MAIL_SECURE?.trim();
  const mode = getSmtpMode();

  console.log('SMTP Mode:', mode);
  console.log('Host:', formatSmtpValue(host));
  console.log('Port:', formatSmtpValue(port || '587'));
  console.log('User:', formatSmtpValue(user));
  console.log('Secure:', formatSmtpValue(secure || 'false'));

  if (mode === 'DEBUG JSON TRANSPORT') {
    console.log('SMTP Reason: Placeholder or missing SMTP configuration detected.');
  }
}

logSmtpConfig();

function getTransporter() {
  if (isPlaceholderConfig()) {
    return nodemailer.createTransport({ jsonTransport: true });
  }

  return nodemailer.createTransport({
    host: process.env.MAIL_HOST.trim(),
    port: Number(process.env.MAIL_PORT || 587),
    secure: process.env.MAIL_SECURE === 'true',
    auth: {
      user: process.env.MAIL_USER.trim(),
      pass: process.env.MAIL_PASS.trim(),
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
}

function buildCaseAssignmentEmail({ assigneeName, caseReference, title, department, description, recommendation }) {
  const safeName = assigneeName || 'Responder';
  const safeDepartment = department || 'N/A';
  const safeDescription = description || 'No description provided.';
  const safeRecommendation = recommendation || 'No recommendation provided.';

  const text = `Hello ${safeName},\n\n` +
    `A new case has been assigned to you in The Hive.\n\n` +
    `Reference: ${caseReference}\n` +
    `Title: ${title}\n` +
    `Department: ${safeDepartment}\n\n` +
    `Description:\n${safeDescription}\n\n` +
    `Recommendation:\n${safeRecommendation}\n\n` +
    `Please log in to the dashboard to review and resolve the assigned case.\n\n` +
    `Thank you,\n` +
    `The Hive Team`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Case Assigned</title>
</head>
<body style="font-family:Arial,Helvetica,sans-serif;color:#333;background:#f7f8fc;padding:24px;">
  <table width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 12px 30px rgba(15,23,42,0.08);">
    <tr style="background:#24292f;color:#ffffff;">
      <td style="padding:20px 24px;">
        <h1 style="margin:0;font-size:22px;line-height:1.3;">New case assigned</h1>
      </td>
    </tr>
    <tr>
      <td style="padding:24px;">
        <p style="font-size:15px;line-height:1.7;margin:0 0 18px;">Hello ${safeName},</p>
        <p style="font-size:15px;line-height:1.7;margin:0 0 18px;">A new case has been assigned to you in <strong>The Hive</strong>. Please review the details below and sign in to the dashboard to take action.</p>
        <table width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 18px;border:1px solid #e5e7eb;border-radius:10px;">
          <tr style="background:#f3f4f6;">
            <td style="padding:14px 16px;font-weight:700;color:#111827;">Reference</td>
            <td style="padding:14px 16px;color:#111827;">${caseReference}</td>
          </tr>
          <tr>
            <td style="padding:14px 16px;font-weight:700;color:#111827;">Title</td>
            <td style="padding:14px 16px;color:#111827;">${title}</td>
          </tr>
          <tr style="background:#f3f4f6;">
            <td style="padding:14px 16px;font-weight:700;color:#111827;">Department</td>
            <td style="padding:14px 16px;color:#111827;">${safeDepartment}</td>
          </tr>
        </table>
        <h2 style="font-size:16px;margin:0 0 10px;color:#111827;">Description</h2>
        <p style="font-size:15px;line-height:1.7;margin:0 0 18px;color:#4b5563;">${safeDescription.replace(/\n/g, '<br/>')}</p>
        <h2 style="font-size:16px;margin:0 0 10px;color:#111827;">Recommendation</h2>
        <p style="font-size:15px;line-height:1.7;margin:0 0 24px;color:#4b5563;">${safeRecommendation.replace(/\n/g, '<br/>')}</p>
        <p style="font-size:15px;line-height:1.7;margin:0 0 24px;">Please log into your dashboard to review and resolve this case.</p>
        <a href="#" style="display:inline-block;padding:12px 20px;background:#2563eb;color:#ffffff;border-radius:8px;text-decoration:none;font-weight:600;">Open The Hive</a>
        <p style="font-size:13px;color:#6b7280;margin:24px 0 0;">If you do not recognize this assignment, please contact your administrator.</p>
      </td>
    </tr>
    <tr style="background:#f9fafb;">
      <td style="padding:16px 24px;font-size:13px;color:#6b7280;">The Hive • Incident Response Case Management</td>
    </tr>
  </table>
</body>
</html>`;

  return { text, html };
}

async function sendMail({ to, subject, text, html }) {
  const transporter = getTransporter();
  const mailOptions = {
    from: defaultFrom,
    to,
    subject,
    text,
    html,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log('Email send result:', info);

  if (isPlaceholderConfig()) {
    console.log('Email payload (debug mode):', mailOptions);
  }

  return info;
}

module.exports = { sendMail, buildCaseAssignmentEmail };
