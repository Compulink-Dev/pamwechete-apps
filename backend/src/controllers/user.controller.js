const User = require("../models/User");
const { clerkClient } = require("@clerk/express");

/**
 * Register a new user
 */
exports.register = async (req, res) => {
  try {
    const { clerkId, name, email, phone, address, interests, offerings } =
      req.body;

    // Check if user already exists
    let user = await User.findOne({ clerkId });
    if (user) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Create new user
    user = new User({
      clerkId,
      name,
      email,
      phone,
      address,
      interests: interests || [],
      offerings: offerings || [],
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message,
    });
  }
};

/**
 * Login user (Clerk handles actual authentication)
 */
exports.login = async (req, res) => {
  try {
    const { clerkId } = req.body;

    const user = await User.findOne({ clerkId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    res.json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
};

/**
 * Logout user
 */
exports.logout = async (req, res) => {
  try {
    res.json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Logout failed",
      error: error.message,
    });
  }
};

/**
 * Verify token and return user data
 */
exports.verifyToken = async (req, res) => {
  try {
    const user = await User.findOne({ clerkId: req.auth.userId });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        clerkId: user.clerkId,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(500).json({
      success: false,
      message: "Token verification failed",
      error: error.message,
    });
  }
};

/**
 * Get current user profile
 */
exports.getCurrentUser = async (req, res) => {
  try {
    console.log("👤 Getting user profile for:", req.auth.userId);

    const user = await User.findOne({ clerkId: req.auth.userId }).select(
      "-__v -updatedAt"
    );

    if (!user) {
      console.log("❌ User not found in database");
      return res.status(404).json({
        success: false,
        message: "User not found. Please complete registration.",
      });
    }

    console.log("✅ User found:", user.name);

    res.json({
      success: true,
      user: {
        id: user._id,
        clerkId: user.clerkId,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        tradePoints: user.tradePoints || 0,
        rating: user.rating || { average: 0, count: 0 },
        completedTrades: user.completedTrades || 0,
        activeTrades: user.activeTrades || 0,
        isVerified: user.isVerified || false,
        verification: user.verification || {},
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get user profile",
      error: error.message,
    });
  }
};

/**
 * Create or sync user from Clerk
 */
exports.syncUser = async (req, res) => {
  try {
    const { clerkId, name, email, phone } = req.body;

    console.log("🔄 Syncing user:", { clerkId, name, email });

    let user = await User.findOne({ clerkId: req.auth.userId });

    if (!user) {
      // Create new user
      user = new User({
        clerkId: req.auth.userId,
        name: name || "Trader",
        email: email,
        phone: phone,
        tradePoints: 100, // Starting points
        isVerified: false,
      });

      await user.save();
      console.log("✅ New user created:", user.name);
    } else {
      console.log("✅ Existing user found:", user.name);
    }

    res.json({
      success: true,
      message: "User synced successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        tradePoints: user.tradePoints,
      },
    });
  } catch (error) {
    console.error("Sync user error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to sync user",
      error: error.message,
    });
  }
};
