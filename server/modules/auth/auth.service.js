const User = require('../../models/User.model');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../../utils/tokens');
const { sendMail } = require('../../config/nodemailer');
const jwt = require('jsonwebtoken');
const { jwtAccessSecret } = require('../../config/env');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// Temp store for password reset tokens (production: use DB/Redis)
const resetTokenStore = new Map();

const register = async ({ name, email, password, role }) => {
  const existing = await User.findOne({ email });
  if (existing) {
    const err = new Error('Email already registered');
    err.statusCode = 409;
    throw err;
  }

  const user = await User.create({ name, email, password, role });
  const payload = { id: user._id, role: user.role, name: user.name };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  user.refreshToken = await bcrypt.hash(refreshToken, 10);
  await user.save();

  return {
    accessToken,
    refreshToken,
    user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
  };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email, isActive: true }).select('+password +refreshToken');
  if (!user) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  const match = await user.comparePassword(password);
  if (!match) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  user.lastSeen = new Date();
  const payload = { id: user._id, role: user.role, name: user.name };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  user.refreshToken = await bcrypt.hash(refreshToken, 10);
  await user.save();

  return {
    accessToken,
    refreshToken,
    user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
  };
};

const logout = async (userId) => {
  await User.findByIdAndUpdate(userId, { refreshToken: null });
};

const refreshAccessToken = async (incomingRefreshToken) => {
  if (!incomingRefreshToken) {
    const err = new Error('Refresh token missing');
    err.statusCode = 401;
    throw err;
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(incomingRefreshToken);
  } catch {
    const err = new Error('Invalid refresh token');
    err.statusCode = 401;
    throw err;
  }

  const user = await User.findById(decoded.id).select('+refreshToken');
  if (!user || !user.refreshToken) {
    const err = new Error('User not found or logged out');
    err.statusCode = 401;
    throw err;
  }

  const valid = await bcrypt.compare(incomingRefreshToken, user.refreshToken);
  if (!valid) {
    const err = new Error('Refresh token mismatch');
    err.statusCode = 401;
    throw err;
  }

  const payload = { id: user._id, role: user.role, name: user.name };
  const newAccessToken = signAccessToken(payload);
  const newRefreshToken = signRefreshToken(payload);
  user.refreshToken = await bcrypt.hash(newRefreshToken, 10);
  await user.save();

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

const forgotPassword = async (email) => {
  const user = await User.findOne({ email, isActive: true });
  if (!user) return; // Silent — don't leak user existence

  const token = crypto.randomBytes(32).toString('hex');
  resetTokenStore.set(token, { userId: user._id.toString(), expires: Date.now() + 15 * 60 * 1000 });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

  // Fire and forget
  sendMail({
    to: user.email,
    subject: 'Ethara PMS — Reset Your Password',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;">
        <h2 style="color:#6366f1">Reset Your Password</h2>
        <p>Hello ${user.name},</p>
        <p>Click the button below to reset your password. This link expires in 15 minutes.</p>
        <a href="${resetUrl}" style="display:inline-block;background:#6366f1;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin:16px 0;">Reset Password</a>
        <p style="color:#888;font-size:12px;">If you did not request this, ignore this email.</p>
      </div>
    `,
  }).catch((e) => console.error('Reset email failed:', e.message));
};

const resetPassword = async (token, newPassword) => {
  const record = resetTokenStore.get(token);
  if (!record || Date.now() > record.expires) {
    const err = new Error('Reset token invalid or expired');
    err.statusCode = 400;
    throw err;
  }

  const user = await User.findById(record.userId);
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  user.password = newPassword;
  user.refreshToken = null;
  await user.save();
  resetTokenStore.delete(token);
};

const getMe = async (userId) => {
  return User.findById(userId).select('-password -refreshToken');
};

module.exports = { register, login, logout, refreshAccessToken, forgotPassword, resetPassword, getMe };
