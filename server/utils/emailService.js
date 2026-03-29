const nodemailer = require("nodemailer");
const Setting = require("../models/Setting");

let transporter;

function getTransporter() {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT || 587),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  return transporter;
}

async function sendEmail({ to, subject, html }) {
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    // Allow local dev without email configured.
    return;
  }

  const tx = getTransporter();
  await tx.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    html
  });
}

async function getTemplateHtml(key, fallbackHtml) {
  try {
    const tpl = await Setting.findOne({ key }).lean();
    if (tpl?.value && typeof tpl.value === "string") return tpl.value;
    return fallbackHtml;
  } catch {
    return fallbackHtml;
  }
}

function renderTemplate(html, vars) {
  let out = html;
  for (const [k, v] of Object.entries(vars || {})) {
    out = out.replaceAll(`{{${k}}}`, String(v));
  }
  return out;
}

module.exports = { sendEmail, getTemplateHtml, renderTemplate };

