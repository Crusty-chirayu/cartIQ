// c:\Users\chira\cartIQ\cartiq-backend\services\notificationService.js
const Notification = require("../models/Notification");
const nodemailer = require("nodemailer");

/**
 * Email transporter
 */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send notification across multiple channels
 */
const sendNotification = async (userId, type, title, message, data = {}, channels = { email: true, sms: false, push: true }) => {
  try {
    // Create notification record
    const notification = await Notification.create({
      user: userId,
      type,
      title,
      message,
      data,
      channels,
    });

    // Send via channels
    if (channels.email) {
      await sendEmailNotification(userId, title, message, type);
      notification.sentAt.email = new Date();
    }

    if (channels.sms) {
      await sendSMSNotification(userId, message);
      notification.sentAt.sms = new Date();
    }

    if (channels.push) {
      // Web push would be handled via Socket.io
      notification.sentAt.push = new Date();
    }

    await notification.save();
    return notification;
  } catch (error) {
    console.error("Notification Error:", error);
  }
};

/**
 * Send email notification
 */
const sendEmailNotification = async (userId, subject, message, type) => {
  try {
    const User = require("../models/User");
    const user = await User.findById(userId);

    if (!user || !user.preferences.notifications.email) return;

    const emailContent = `
      <html>
        <body style="font-family: Arial, sans-serif;">
          <h2>${subject}</h2>
          <p>${message}</p>
          <hr>
          <p><small>© CartIQ ${new Date().getFullYear()}</small></p>
        </body>
      </html>
    `;

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: user.email,
      subject,
      html: emailContent,
    });
  } catch (error) {
    console.error("Email Send Error:", error);
  }
};

/**
 * Send SMS notification
 */
const sendSMSNotification = async (userId, message) => {
  try {
    const User = require("../models/User");
    const user = await User.findById(userId);

    if (!user || !user.phone || !user.preferences.notifications.sms) return;

    // Twilio integration would go here
    console.log(`SMS to ${user.phone}: ${message}`);
  } catch (error) {
    console.error("SMS Send Error:", error);
  }
};

/**
 * Mark notification as read
 */
const markAsRead = async (notificationId) => {
  return await Notification.findByIdAndUpdate(
    notificationId,
    {
      isRead: true,
      readAt: new Date(),
    },
    { new: true }
  );
};

/**
 * Get user's notifications
 */
const getUserNotifications = async (userId, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;

  const notifications = await Notification.find({ user: userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Notification.countDocuments({ user: userId });

  return { notifications, total };
};

module.exports = {
  sendNotification,
  sendEmailNotification,
  sendSMSNotification,
  markAsRead,
  getUserNotifications,
};
