const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.log('Email service error:', error);
  } else {
    console.log('✉️  Email service ready');
  }
});

// Send email function
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const mailOptions = {
      from: `"TaskMaster" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      text: text || '', // Plain text fallback
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

// Email templates
const templates = {
  // Welcome email
  welcome: (userName) => ({
    subject: 'Welcome to TaskMaster!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2196F3; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { display: inline-block; padding: 12px 24px; background: #2196F3; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to TaskMaster!</h1>
          </div>
          <div class="content">
            <p>Hi ${userName},</p>
            <p>Thank you for joining TaskMaster - your platform for finding and completing tasks!</p>
            <p>Get started by:</p>
            <ul>
              <li>Posting your first task</li>
              <li>Browsing available tasks</li>
              <li>Completing your profile</li>
            </ul>
            <p>We're excited to have you on board!</p>
          </div>
          <div class="footer">
            <p>© 2025 TaskMaster. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  // New bid received
  newBid: (taskTitle, bidderName, bidAmount) => ({
    subject: `New Bid on "${taskTitle}"`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .highlight { background: #fff; padding: 15px; border-left: 4px solid #4CAF50; margin: 15px 0; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Bid Received!</h1>
          </div>
          <div class="content">
            <p>You have received a new bid on your task:</p>
            <div class="highlight">
              <p><strong>Task:</strong> ${taskTitle}</p>
              <p><strong>Bidder:</strong> ${bidderName}</p>
              <p><strong>Bid Amount:</strong> ${bidAmount.toLocaleString()} VND</p>
            </div>
            <p>Log in to TaskMaster to view the full bid details and accept or reject it.</p>
          </div>
          <div class="footer">
            <p>© 2025 TaskMaster. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  // Bid accepted
  bidAccepted: (taskTitle, posterName) => ({
    subject: `Your Bid Was Accepted for "${taskTitle}"`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .highlight { background: #fff; padding: 15px; border-left: 4px solid #4CAF50; margin: 15px 0; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Congratulations!</h1>
          </div>
          <div class="content">
            <p>Great news! Your bid has been accepted:</p>
            <div class="highlight">
              <p><strong>Task:</strong> ${taskTitle}</p>
              <p><strong>Task Poster:</strong> ${posterName}</p>
            </div>
            <p>You can now start working on the task. Make sure to communicate with the task poster and deliver quality work!</p>
          </div>
          <div class="footer">
            <p>© 2025 TaskMaster. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  // Task completed
  taskCompleted: (taskTitle, completedBy) => ({
    subject: `Task Completed: "${taskTitle}"`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2196F3; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .highlight { background: #fff; padding: 15px; border-left: 4px solid #2196F3; margin: 15px 0; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Task Completed!</h1>
          </div>
          <div class="content">
            <p>Your task has been marked as completed:</p>
            <div class="highlight">
              <p><strong>Task:</strong> ${taskTitle}</p>
              <p><strong>Completed By:</strong> ${completedBy}</p>
            </div>
            <p>Please log in to review the work and leave a rating for the task doer.</p>
          </div>
          <div class="footer">
            <p>© 2025 TaskMaster. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  // New review received
  newReview: (taskTitle, reviewerName, rating) => ({
    subject: `New Review Received`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #FF9800; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .highlight { background: #fff; padding: 15px; border-left: 4px solid #FF9800; margin: 15px 0; }
          .stars { color: #FFD700; font-size: 24px; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Review!</h1>
          </div>
          <div class="content">
            <p>You have received a new review:</p>
            <div class="highlight">
              <p><strong>Task:</strong> ${taskTitle}</p>
              <p><strong>Reviewer:</strong> ${reviewerName}</p>
              <p class="stars">${'⭐'.repeat(rating)}</p>
            </div>
            <p>Log in to TaskMaster to view the full review and respond if needed.</p>
          </div>
          <div class="footer">
            <p>© 2025 TaskMaster. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  // Dispute filed
  disputeFiled: (taskTitle, reason) => ({
    subject: `Dispute Filed for Task: "${taskTitle}"`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f44336; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .highlight { background: #fff; padding: 15px; border-left: 4px solid #f44336; margin: 15px 0; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Dispute Filed</h1>
          </div>
          <div class="content">
            <p>A dispute has been filed for your task:</p>
            <div class="highlight">
              <p><strong>Task:</strong> ${taskTitle}</p>
              <p><strong>Reason:</strong> ${reason}</p>
            </div>
            <p>Our admin team will review this dispute and work towards a fair resolution. You can add evidence and communicate through the dispute messaging system.</p>
          </div>
          <div class="footer">
            <p>© 2025 TaskMaster. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  // Password reset
  passwordReset: (userName, resetLink) => ({
    subject: 'Reset Your TaskMaster Password',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2196F3; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { display: inline-block; padding: 12px 24px; background: #2196F3; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Reset Your Password</h1>
          </div>
          <div class="content">
            <p>Hi ${userName},</p>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <p style="text-align: center;">
              <a href="${resetLink}" class="button">Reset Password</a>
            </p>
            <p>If you didn't request this, you can safely ignore this email.</p>
            <p>This link will expire in 1 hour.</p>
          </div>
          <div class="footer">
            <p>© 2025 TaskMaster. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),
};

// Send specific email types
const sendWelcomeEmail = async (email, userName) => {
  const template = templates.welcome(userName);
  return await sendEmail({ to: email, ...template });
};

const sendNewBidEmail = async (email, taskTitle, bidderName, bidAmount) => {
  const template = templates.newBid(taskTitle, bidderName, bidAmount);
  return await sendEmail({ to: email, ...template });
};

const sendBidAcceptedEmail = async (email, taskTitle, posterName) => {
  const template = templates.bidAccepted(taskTitle, posterName);
  return await sendEmail({ to: email, ...template });
};

const sendTaskCompletedEmail = async (email, taskTitle, completedBy) => {
  const template = templates.taskCompleted(taskTitle, completedBy);
  return await sendEmail({ to: email, ...template });
};

const sendNewReviewEmail = async (email, taskTitle, reviewerName, rating) => {
  const template = templates.newReview(taskTitle, reviewerName, rating);
  return await sendEmail({ to: email, ...template });
};

const sendDisputeFiledEmail = async (email, taskTitle, reason) => {
  const template = templates.disputeFiled(taskTitle, reason);
  return await sendEmail({ to: email, ...template });
};

const sendPasswordResetEmail = async (email, userName, resetLink) => {
  const template = templates.passwordReset(userName, resetLink);
  return await sendEmail({ to: email, ...template });
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendNewBidEmail,
  sendBidAcceptedEmail,
  sendTaskCompletedEmail,
  sendNewReviewEmail,
  sendDisputeFiledEmail,
  sendPasswordResetEmail,
};
