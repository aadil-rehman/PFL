const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AuthSession = require('../models/AuthSession');

const DUMMY_OTP = '111111';

const PHONE_REGEX = /^\+91[0-9]{10}$/;

const createOTPSession = async (phone, req) => {
  const otpHash = await bcrypt.hash(DUMMY_OTP, 10);
  const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await AuthSession.create({
    phone,
    otpHash,
    otpExpiry,
    expiresAt,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    deviceInfo: req.headers['user-device'],
  });

  console.log(`[DEV] OTP for ${phone}: ${DUMMY_OTP}`);
};

const register = async (req, res) => {
  try {
    const { phone, name, state, district, address } = req.body;

    if (!phone || !PHONE_REGEX.test(phone)) {
      return res.status(400).json({ message: 'Invalid phone number. Use +91XXXXXXXXXX format' });
    }
    if (!name || !state || !district || !address) {
      return res.status(400).json({ message: 'name, state, district, and address are required' });
    }

    const existingVerifiedUser = await User.findOne({ phone, isVerified: true, activeState: true });
    if (existingVerifiedUser) {
      return res.status(400).json({ message: 'Phone number already registered. Please login.' });
    }

    await User.findOneAndUpdate(
      { phone, activeState: true },
      { phone, name, state, district, address, isVerified: false },
      { upsert: true, new: true }
    );

    await createOTPSession(phone, req);

    return res.status(200).json({ message: 'OTP sent successfully' });
  } catch (err) {
    console.error('register error:', err);
    return res.status(500).json({ message: 'Registration failed' });
  }
};

const sendOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone || !PHONE_REGEX.test(phone)) {
      return res.status(400).json({ message: 'Invalid phone number. Use +91XXXXXXXXXX format' });
    }

    const user = await User.findOne({ phone, activeState: true });
    if (!user) {
      return res.status(404).json({ message: 'User not found. Please register first.' });
    }

    await createOTPSession(phone, req);

    return res.status(200).json({ message: 'OTP sent successfully' });
  } catch (err) {
    console.error('sendOTP error:', err);
    return res.status(500).json({ message: 'Failed to send OTP' });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ message: 'Phone and OTP are required' });
    }

    const session = await AuthSession.findOne({
      phone,
      otpVerified: false,
      token: null,
      activeState: true,
    }).sort({ createdAt: -1 });

    if (!session) {
      return res.status(404).json({ message: 'No pending OTP session found' });
    }

    if (new Date() > session.otpExpiry) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    const isMatch = await bcrypt.compare(otp, session.otpHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    const user = await User.findOne({ phone, activeState: true });
    if (!user) {
      return res.status(404).json({ message: 'User not found. Please register first.' });
    }

    if (!user.isVerified) {
      user.isVerified = true;
      await user.save();
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
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
      message: 'OTP verified successfully',
      token,
      user: {
        id: user._id,
        phone: user.phone,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('verifyOTP error:', err);
    return res.status(500).json({ message: 'OTP verification failed' });
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
      return res.status(404).json({ message: 'Active session not found' });
    }

    session.logoutAt = new Date();
    await session.save();

    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error('logout error:', err);
    return res.status(500).json({ message: 'Logout failed' });
  }
};

const me = async (req, res) => {
  try {
    return res.status(200).json({ user: req.user });
  } catch (err) {
    console.error('me error:', err);
    return res.status(500).json({ message: 'Failed to fetch user' });
  }
};

const sessions = async (req, res) => {
  try {
    const userSessions = await AuthSession.find({ userId: req.user._id, activeState: true })
      .sort({ createdAt: -1 })
      .select('-otpHash');

    return res.status(200).json({ sessions: userSessions });
  } catch (err) {
    console.error('sessions error:', err);
    return res.status(500).json({ message: 'Failed to fetch sessions' });
  }
};

const createAdmin = async (req, res) => {
  try {
    const { phone, secretKey } = req.body;

    if (!secretKey || secretKey !== process.env.ADMIN_SECRET_KEY) {
      return res.status(403).json({ message: 'Invalid secret key' });
    }

    if (!phone || !PHONE_REGEX.test(phone)) {
      return res.status(400).json({ message: 'Invalid phone number. Use +91XXXXXXXXXX format' });
    }

    const user = await User.findOneAndUpdate(
      { phone, activeState: true },
      { role: 'admin' },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ message: `${phone} has been granted admin access` });
  } catch (err) {
    console.error('createAdmin error:', err);
    return res.status(500).json({ message: 'Failed to grant admin access' });
  }
};

module.exports = { register, sendOTP, verifyOTP, logout, me, sessions, createAdmin };
