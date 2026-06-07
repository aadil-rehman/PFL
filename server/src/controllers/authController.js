const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AuthSession = require('../models/AuthSession');
const { sendOtp, validateOtp } = require('../services/messageCentral');

const PHONE_REGEX = /^\+91[0-9]{10}$/;

const createOTPSession = async (phone, req) => {
  // MessageCentral sends the OTP and returns a verificationId we validate against later.
  const verificationId = await sendOtp(phone);
  const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await AuthSession.create({
    phone,
    verificationId,
    otpExpiry,
    expiresAt,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    deviceInfo: req.headers['user-device'],
  });
};

const register = async (req, res) => {
  try {
    const { phone, name, state, district, address } = req.body;

    if (!phone || !PHONE_REGEX.test(phone)) {
      return res.status(400).json({ success: false, message: 'Invalid phone number. Use +91XXXXXXXXXX format', data: null });
    }
    if (!name || !state || !district || !address) {
      return res.status(400).json({ success: false, message: 'name, state, district, and address are required', data: null });
    }

    const existingVerifiedUser = await User.findOne({ phone, isVerified: true, activeState: true });
    if (existingVerifiedUser) {
      return res.status(400).json({ success: false, message: 'Phone number already registered. Please login.', data: null });
    }

    await User.findOneAndUpdate(
      { phone, activeState: true },
      { phone, name, state, district, address, isVerified: false },
      { upsert: true, new: true }
    );

    await createOTPSession(phone, req);

    return res.status(200).json({ success: true, message: 'OTP sent successfully', data: null });
  } catch (err) {
    console.error('register error:', err);
    return res.status(500).json({ success: false, message: 'Registration failed', data: null });
  }
};

const sendOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone || !PHONE_REGEX.test(phone)) {
      return res.status(400).json({ success: false, message: 'Invalid phone number. Use +91XXXXXXXXXX format', data: null });
    }

    const user = await User.findOne({ phone, activeState: true });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found. Please register first.', data: null });
    }

    await createOTPSession(phone, req);

    return res.status(200).json({ success: true, message: 'OTP sent successfully', data: null });
  } catch (err) {
    console.error('sendOTP error:', err);
    return res.status(500).json({ success: false, message: 'Failed to send OTP', data: null });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ success: false, message: 'Phone and OTP are required', data: null });
    }

    const session = await AuthSession.findOne({
      phone,
      otpVerified: false,
      token: null,
      activeState: true,
    }).sort({ createdAt: -1 });

    if (!session) {
      return res.status(404).json({ success: false, message: 'No pending OTP session found', data: null });
    }

    if (new Date() > session.otpExpiry) {
      return res.status(400).json({ success: false, message: 'OTP has expired', data: null });
    }

    const isMatch = await validateOtp({ phone, verificationId: session.verificationId, code: otp });
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid OTP', data: null });
    }

    const user = await User.findOne({ phone, activeState: true });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found. Please register first.', data: null });
    }

    if (!user.isVerified) {
      user.isVerified = true;
      await user.save();
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });

    const now = new Date();
    session.otpVerified = true;
    session.token = token;
    session.loginAt = now;
    session.userId = user._id;
    session.expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    session.ipAddress = req.ip;
    session.userAgent = req.headers['user-agent'];
    session.deviceInfo = req.headers['user-device'];
    await session.save();

    return res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      data: {
        token,
        user: {
          id:    user._id,
          phone: user.phone,
          name:  user.name,
          role:  user.role,
        },
      },
    });
  } catch (err) {
    console.error('verifyOTP error:', err);
    return res.status(500).json({ success: false, message: 'OTP verification failed', data: null });
  }
};

const logout = async (req, res) => {
  try {
    const session = await AuthSession.findOne({
      token: req.token,
      logoutAt: null,
      activeState: true,
    });

    if (!session) {
      return res.status(404).json({ success: false, message: 'Active session not found', data: null });
    }

    session.logoutAt = new Date();
    await session.save();

    return res.status(200).json({ success: true, message: 'Logged out successfully', data: null });
  } catch (err) {
    console.error('logout error:', err);
    return res.status(500).json({ success: false, message: 'Logout failed', data: null });
  }
};

const me = async (req, res) => {
  try {
    return res.status(200).json({ success: true, message: 'User fetched successfully', data: { user: req.user } });
  } catch (err) {
    console.error('me error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch user', data: null });
  }
};

const sessions = async (req, res) => {
  try {
    const userSessions = await AuthSession.find({ userId: req.user._id, activeState: true })
      .sort({ createdAt: -1 })
      .select('-otpHash');

    return res.status(200).json({ success: true, message: 'Sessions fetched successfully', data: { sessions: userSessions } });
  } catch (err) {
    console.error('sessions error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch sessions', data: null });
  }
};

const createAdmin = async (req, res) => {
  try {
    const { phone, secretKey } = req.body;

    if (!secretKey || secretKey !== process.env.ADMIN_SECRET_KEY) {
      return res.status(403).json({ success: false, message: 'Invalid secret key', data: null });
    }

    if (!phone || !PHONE_REGEX.test(phone)) {
      return res.status(400).json({ success: false, message: 'Invalid phone number. Use +91XXXXXXXXXX format', data: null });
    }

    const user = await User.findOneAndUpdate(
      { phone, activeState: true },
      { role: 'admin' },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found', data: null });
    }

    return res.status(200).json({ success: true, message: `${phone} has been granted admin access`, data: null });
  } catch (err) {
    console.error('createAdmin error:', err);
    return res.status(500).json({ success: false, message: 'Failed to grant admin access', data: null });
  }
};

module.exports = { register, sendOTP, verifyOTP, logout, me, sessions, createAdmin };
