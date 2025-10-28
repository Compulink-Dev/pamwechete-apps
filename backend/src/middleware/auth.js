const { clerkClient } = require('@clerk/express');
const User = require('../models/User');

/**
 * Middleware to require authentication
 */
const requireAuth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No authorization token provided',
      });
    }

    // Verify token with Clerk
    const session = await clerkClient.sessions.verifySession(token);
    
    if (!session || !session.userId) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }

    // Attach user info to request
    req.auth = {
      userId: session.userId,
      sessionId: session.id,
    };

    // Get user from database
    const user = await User.findOne({ clerkId: session.userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({
      success: false,
      message: 'Authentication failed',
      error: error.message,
    });
  }
};

/**
 * Middleware to require verified user
 */
const requireVerified = async (req, res, next) => {
  if (!req.user?.canTrade()) {
    return res.status(403).json({
      success: false,
      message: 'Account verification required to perform this action',
      verificationStatus: req.user?.verification?.status,
    });
  }
  next();
};

/**
 * Middleware to require admin role
 */
const requireAdmin = async (req, res, next) => {
  if (!req.user || !['admin', 'superadmin'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Admin access required',
    });
  }
  next();
};

module.exports = {
  requireAuth,
  requireVerified,
  requireAdmin,
};
