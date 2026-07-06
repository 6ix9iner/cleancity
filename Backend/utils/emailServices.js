const nodemailer = require('nodemailer');

/**
 * Creates a reusable Nodemailer transporter using Gmail SMTP.
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false, // use STARTTLS on port 587
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

/**
 * Core send function — never crashes the app on email failure.
 * In development, logs to console instead of sending.
 * Skips sending gracefully if email credentials are not configured.
 */
const sendEmail = async ({ to, subject, html }) => {
  // Skip if Gmail credentials haven't been set yet
  if (!process.env.EMAIL_USER || process.env.EMAIL_PASS === 'your_app_password') {
    console.log(`📧 [Email skipped — not configured] To: ${to} | Subject: ${subject}`);
    return { success: false, reason: 'Email not configured' };
  }

  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from: `"Clean City Nigeria" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`📧 Email sent to ${to} — MessageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`📧 Email failed to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
};

// ── Email Templates ───────────────────────────────────────────────

/**
 * Sends a 6-digit verification code to a newly registered user.
 */
const sendVerificationEmail = (email, name, code) => {
  // Log verification code to console for development/testing
  console.log(`\n${'='.repeat(80)}`);
  console.log(`✉️  VERIFICATION EMAIL FOR: ${email}`);
  console.log(`📌 Name: ${name}`);
  console.log(`🔐 VERIFICATION CODE: ${code}`);
  console.log(`⏰ Valid for: 24 hours`);
  console.log(`${'='.repeat(80)}\n`);

  return sendEmail({
    to: email,
    subject: 'Verify your Clean City Nigeria account',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#fff">
        <div style="background:#16a34a;padding:16px;border-radius:8px 8px 0 0;text-align:center">
          <h1 style="color:#fff;margin:0;font-size:22px">🌿 Clean City Nigeria</h1>
        </div>
        <div style="border:1px solid #e5e7eb;border-top:none;padding:24px;border-radius:0 0 8px 8px">
          <p style="font-size:16px">Hi <strong>${name}</strong>,</p>
          <p>Thanks for joining Clean City Nigeria! Use the code below to verify your account:</p>
          <div style="background:#f0fdf4;border:2px dashed #16a34a;border-radius:8px;padding:24px;text-align:center;margin:24px 0">
            <p style="margin:0 0 8px;color:#555;font-size:13px">YOUR VERIFICATION CODE</p>
            <h1 style="color:#16a34a;letter-spacing:12px;margin:0;font-size:36px">${code}</h1>
          </div>
          <p style="color:#666;font-size:14px">⏰ This code expires in <strong>24 hours</strong>.</p>
          <p style="color:#666;font-size:13px">If you didn't create this account, you can safely ignore this email.</p>
        </div>
      </div>
    `,
  });
};

/**
 * Notifies a citizen when their report status changes.
 */
const sendReportStatusEmail = (email, name, reportId, status) => {
  const statusMessages = {
    under_review: '🔍 Your report is now under review by our team.',
    assigned:     '📋 Your report has been assigned to a local agency.',
    in_progress:  '🚛 Work has begun on your reported issue.',
    resolved:     '✅ Great news! Your reported issue has been resolved.',
    rejected:     '❌ Unfortunately, your report could not be processed at this time.',
  };

  const statusColors = {
    under_review: '#f59e0b',
    assigned:     '#3b82f6',
    in_progress:  '#8b5cf6',
    resolved:     '#16a34a',
    rejected:     '#ef4444',
  };

  const color = statusColors[status] || '#6b7280';
  const message = statusMessages[status] || `Your report status: ${status}`;

  return sendEmail({
    to: email,
    subject: `Report Update — ${status.replace(/_/g, ' ').toUpperCase()} | Clean City Nigeria`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#fff">
        <div style="background:#16a34a;padding:16px;border-radius:8px 8px 0 0;text-align:center">
          <h1 style="color:#fff;margin:0;font-size:22px">🌿 Clean City Nigeria</h1>
        </div>
        <div style="border:1px solid #e5e7eb;border-top:none;padding:24px;border-radius:0 0 8px 8px">
          <p style="font-size:16px">Hi <strong>${name}</strong>,</p>
          <div style="background:${color}15;border-left:4px solid ${color};padding:16px;border-radius:4px;margin:16px 0">
            <p style="margin:0;font-size:15px;color:${color}"><strong>${message}</strong></p>
          </div>
          <p style="color:#555;font-size:14px">Report ID: <code style="background:#f3f4f6;padding:2px 6px;border-radius:4px">${reportId}</code></p>
          <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/reports/${reportId}"
             style="display:inline-block;background:#16a34a;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;margin-top:16px">
            View Report →
          </a>
        </div>
      </div>
    `,
  });
};

/**
 * Notifies a citizen that they've earned reward tokens after a resolved report.
 */
const sendRewardEmail = (email, name, tokenAmount, rewardToken) => {
  return sendEmail({
    to: email,
    subject: `🎉 You earned ${tokenAmount} tokens! | Clean City Nigeria`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#fff">
        <div style="background:#16a34a;padding:16px;border-radius:8px 8px 0 0;text-align:center">
          <h1 style="color:#fff;margin:0;font-size:22px">🌿 Clean City Nigeria</h1>
        </div>
        <div style="border:1px solid #e5e7eb;border-top:none;padding:24px;border-radius:0 0 8px 8px">
          <p style="font-size:16px">Hi <strong>${name}</strong>,</p>
          <p>Your report has been resolved and you've earned <strong>${tokenAmount} tokens</strong> as a reward for keeping Lagos clean! 🌍</p>
          <div style="background:#f0fdf4;border:2px solid #16a34a;border-radius:8px;padding:24px;text-align:center;margin:24px 0">
            <p style="margin:0 0 8px;color:#555;font-size:13px">YOUR REWARD TOKEN</p>
            <h2 style="color:#16a34a;letter-spacing:6px;margin:0;font-size:28px">${rewardToken}</h2>
            <p style="margin:8px 0 0;color:#16a34a;font-size:13px">+${tokenAmount} tokens added to your balance</p>
          </div>
          <p style="color:#555">Visit your dashboard to redeem tokens for exciting rewards!</p>
          <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard"
             style="display:inline-block;background:#16a34a;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;margin-top:8px">
            Go to Dashboard →
          </a>
        </div>
      </div>
    `,
  });
};

module.exports = { sendVerificationEmail, sendReportStatusEmail, sendRewardEmail };