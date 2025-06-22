const { validationResult } = require('express-validator');
const User = require('../models/users.model');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const asyncWrapper = require('../middlewares/asyncWrapper');

// إعداد الإيميل
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

// إرسال OTP
const sendResetOTP = async (req, res) => {
  try {
    console.log("🚀 sendResetOTP endpoint triggered");

    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000;

    user.otp = otp;
    user.otpExpiresAt = new Date(expiresAt);
    user.verifiedForReset = false;
    await user.save();

    // إرسال الإيميل
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Reset Password OTP',
      text: `Your OTP code is: ${otp}. It expires in 5 minutes.`
    }, (err, info) => {
      if (err) {
        console.log("❌ Error sending email:", err);
        return res.status(500).json({ message: "Failed to send OTP", error: err });
      } else {
        console.log("✅ Email sent:", info.response);
        return res.json({ message: 'OTP sent to your email' });
      }
    });

  } catch (err) {
    console.log("💥 Caught error:", err);
    return res.status(500).json({ message: "Unexpected error", error: err });
  }
};

// التحقق من OTP
const verifyOTP = asyncWrapper (async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'User not found' });

  if (!user.otp || !user.otpExpiresAt) {
    return res.status(400).json({ message: 'No OTP was sent or OTP expired' });
  }

  if (user.otp !== otp) {
    return res.status(400).json({ message: 'Invalid OTP' });
  }

  if (user.otpExpiresAt < Date.now()) {
    return res.status(400).json({ message: 'OTP has expired' });
  }

  user.verifiedForReset = true;
  user.otp = undefined;
  user.otpExpiresAt = undefined;
  await user.save();

  res.json({ message: 'OTP verified successfully. You can now reset your password.' });
});
// تغيير الباسورد
const resetPassword = asyncWrapper (async (req, res) => {
  const { email, newPassword } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'User not found' });

  if (!user.verifiedForReset) {
    return res.status(403).json({ message: 'OTP verification required first' });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  user.verifiedForReset = false;
  await user.save();

  res.json({ message: 'Password has been reset successfully.' });
});

module.exports = {
  sendResetOTP,
  verifyOTP,
  resetPassword
}