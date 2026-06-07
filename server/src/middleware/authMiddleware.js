const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided', data: null });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-__v');
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found', data: null });
    }

    req.user = user;
    req.token = token;
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired token', data: null });
  }
};

const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required', data: null });
  }
  next();
};

module.exports = { protect, adminOnly };
