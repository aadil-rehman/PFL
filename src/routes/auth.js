const express = require('express');
const { rateLimit, ipKeyGenerator } = require('express-rate-limit'); // single import
const { register, sendOTP, verifyOTP, logout, me, sessions, createAdmin } = require('../controllers/authController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  keyGenerator: (req) => ipKeyGenerator(req, req.body.phone),
  message: { message: 'Too many OTP requests. Try again in 15 minutes.' },
});

router.post('/register', otpLimiter, register);
router.post('/send-otp', otpLimiter, sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/logout', protect, logout);
router.get('/me', protect, me);
router.get('/sessions', protect, sessions);
router.post('/create-admin', protect, adminOnly, createAdmin);

module.exports = router;