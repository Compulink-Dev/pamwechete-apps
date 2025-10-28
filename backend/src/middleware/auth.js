// middleware/auth.js
const { createClerkClient } = require("@clerk/express");

// Initialize Clerk client
const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

/**
 * Middleware to require authentication
 */
const requireAuth = async (req, res, next) => {
  try {
    console.log("🔐 Auth middleware called");

    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("❌ No Bearer token provided");
      return res.status(401).json({
        success: false,
        message: "No authorization token provided",
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    console.log("📋 Token received:", token ? "Yes" : "No");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    // Verify the token with Clerk
    try {
      const decoded = await clerkClient.verifyToken(token);
      console.log("✅ Token verified for user:", decoded.sub);

      if (!decoded || !decoded.sub) {
        return res.status(401).json({
          success: false,
          message: "Invalid token",
        });
      }

      // Attach user info to request
      req.auth = {
        userId: decoded.sub,
        sessionId: decoded.sid,
      };

      next();
    } catch (verifyError) {
      console.error("❌ Token verification failed:", verifyError);
      return res.status(401).json({
        success: false,
        message: "Token verification failed",
        error: verifyError.message,
      });
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({
      success: false,
      message: "Authentication failed",
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
      message: "Account verification required to perform this action",
      verificationStatus: req.user?.verification?.status,
    });
  }
  next();
};

/**
 * Middleware to require admin role
 */
const requireAdmin = async (req, res, next) => {
  if (!req.user || !["admin", "superadmin"].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: "Admin access required",
    });
  }
  next();
};

module.exports = {
  requireAuth,
  requireVerified,
  requireAdmin,
};
