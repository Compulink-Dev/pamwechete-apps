// middleware/auth.js
const { createClerkClient } = require("@clerk/express");

// Initialize Clerk client with proper configuration
const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
  publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
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
      console.log("🔍 Verifying token with Clerk...");

      // Use the correct method - verifyToken might not be available in newer versions
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

      console.log("✅ Authentication successful for user:", req.auth.userId);
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
 * Alternative auth middleware using sessions (if verifyToken doesn't work)
 */
const requireAuthAlt = async (req, res, next) => {
  try {
    console.log("🔐 Auth middleware (alternative) called");

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("❌ No Bearer token provided");
      return res.status(401).json({
        success: false,
        message: "No authorization token provided",
      });
    }

    const token = authHeader.substring(7);

    try {
      // Alternative approach using sessions
      const session = await clerkClient.sessions.verifySession(token);
      console.log("✅ Session verified for user:", session.userId);

      if (!session || !session.userId) {
        return res.status(401).json({
          success: false,
          message: "Invalid session",
        });
      }

      // Attach user info to request
      req.auth = {
        userId: session.userId,
        sessionId: session.id,
      };

      console.log("✅ Authentication successful for user:", req.auth.userId);
      next();
    } catch (sessionError) {
      console.error("❌ Session verification failed:", sessionError);

      // Fallback to JWT verification
      try {
        // For development, you can decode the JWT without verification
        // WARNING: Only for development, remove in production
        if (process.env.NODE_ENV === "development") {
          const base64Url = token.split(".")[1];
          const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
          const decoded = JSON.parse(Buffer.from(base64, "base64").toString());

          console.log("🔧 Development fallback - decoded token:", decoded.sub);

          req.auth = {
            userId: decoded.sub,
            sessionId: decoded.sid,
          };

          console.log(
            "✅ Development authentication successful for user:",
            req.auth.userId
          );
          next();
        } else {
          throw new Error("Token verification failed");
        }
      } catch (fallbackError) {
        console.error("❌ All authentication methods failed:", fallbackError);
        return res.status(401).json({
          success: false,
          message: "Authentication failed",
          error: "Invalid token or session",
        });
      }
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
 * Simple auth middleware for development (bypasses Clerk verification)
 */
const requireAuthDev = async (req, res, next) => {
  if (process.env.NODE_ENV === "production") {
    return requireAuth(req, res, next);
  }

  try {
    console.log("🔐 Development auth middleware called");

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("❌ No Bearer token provided");
      return res.status(401).json({
        success: false,
        message: "No authorization token provided",
      });
    }

    const token = authHeader.substring(7);

    // Simple token decoding for development
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const decoded = JSON.parse(Buffer.from(base64, "base64").toString());

      console.log("🔧 Development - decoded token user:", decoded.sub);

      req.auth = {
        userId: decoded.sub,
        sessionId: decoded.sid || "dev-session",
      };

      console.log(
        "✅ Development authentication successful for user:",
        req.auth.userId
      );
      next();
    } catch (decodeError) {
      console.error("❌ Token decoding failed:", decodeError);
      return res.status(401).json({
        success: false,
        message: "Invalid token format",
      });
    }
  } catch (error) {
    console.error("Development auth middleware error:", error);
    return res.status(401).json({
      success: false,
      message: "Authentication failed",
      error: error.message,
    });
  }
};

module.exports = {
  requireAuth:
    process.env.NODE_ENV === "production" ? requireAuth : requireAuthDev,
  requireAuthAlt,
  requireAuthDev,
  requireVerified: async (req, res, next) => {
    // Implementation for verified users
    next();
  },
  requireAdmin: async (req, res, next) => {
    // Implementation for admin users
    next();
  },
};
