const User = require('../models/User');

// Middleware to check if user is admin
const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.accountType !== 'admin' && user.accountType !== 'superadmin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    req.adminUser = user;
    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(500).json({ message: 'Server error during authorization' });
  }
};

// Middleware to check if user is superadmin
const isSuperAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.accountType !== 'superadmin') {
      return res.status(403).json({ message: 'Access denied. Superadmin privileges required.' });
    }

    req.adminUser = user;
    next();
  } catch (error) {
    console.error('Superadmin auth error:', error);
    res.status(500).json({ message: 'Server error during authorization' });
  }
};

module.exports = { isAdmin, isSuperAdmin };
