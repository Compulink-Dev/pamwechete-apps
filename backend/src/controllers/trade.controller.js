const Trade = require("../models/Trade");
const User = require("../models/User");

/**
 * Get all trades with pagination and filters
 */
exports.getAllTrades = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      condition,
      minPoints,
      maxPoints,
      status = "active",
    } = req.query;

    const query = { status };

    if (category) query.category = category;
    if (condition) query.condition = condition;
    if (minPoints || maxPoints) {
      query.tradePoints = {};
      if (minPoints) query.tradePoints.$gte = parseInt(minPoints);
      if (maxPoints) query.tradePoints.$lte = parseInt(maxPoints);
    }

    const trades = await Trade.find(query)
      .populate("owner", "name rating profileImage")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const count = await Trade.countDocuments(query);

    res.json({
      success: true,
      trades,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error("Get trades error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch trades",
      error: error.message,
    });
  }
};

/**
 * Get trade by ID
 */
exports.getTradeById = async (req, res) => {
  try {
    const trade = await Trade.findById(req.params.id).populate(
      "owner",
      "name rating profileImage phone email"
    );

    if (!trade) {
      return res.status(404).json({
        success: false,
        message: "Trade not found",
      });
    }

    // Increment views
    await trade.incrementViews();

    res.json({
      success: true,
      trade,
    });
  } catch (error) {
    console.error("Get trade error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch trade",
      error: error.message,
    });
  }
};

// controllers/trade.controller.js - update createTrade function

/**
 * Create new trade
 */
// In controllers/trade.controller.js - update createTrade function
// Update the createTrade function in trade.controller.js
exports.createTrade = async (req, res) => {
  try {
    console.log(
      "📥 Creating trade with data:",
      JSON.stringify(req.body, null, 2)
    );
    console.log("👤 Auth user ID:", req.auth?.userId);

    if (!req.auth || !req.auth.userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    // Find user by Clerk ID
    const user = await User.findOne({ clerkId: req.auth.userId });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found in database",
      });
    }

    const {
      title,
      description,
      category,
      condition,
      tradeType,
      valuation,
      images,
      location,
      tradePoints, // Get tradePoints from request
    } = req.body;

    console.log("📊 Frontend sent tradePoints:", tradePoints);

    // Ensure valuation has all required fields with defaults
    const tradeData = {
      owner: user._id,
      title,
      description,
      category,
      condition: condition || "good",
      tradeType: tradeType || "product",
      valuation: {
        baseValue: valuation?.baseValue || 0,
        age: valuation?.age || 0,
        quality: valuation?.quality || 5,
        brand: valuation?.brand || "",
        currency: valuation?.currency || "USD",
      },
      tradePoints: tradePoints || 0, // Use frontend value or default
      images: images || [],
      location: location || {
        city: "",
        state: "",
        country: "",
        address: "",
      },
      status: "active",
    };

    console.log(
      "📤 Final trade data for model:",
      JSON.stringify(tradeData, null, 2)
    );

    const trade = new Trade(tradeData);

    // Log the trade object before any middleware
    console.log("🔄 Trade object created:");
    console.log("- tradePoints from constructor:", trade.tradePoints);
    console.log("- valuation:", trade.valuation);
    console.log("- condition:", trade.condition);
    console.log("- category:", trade.category);

    // Test the static calculation method
    const calculatedPoints = Trade.calculateTradePoints(
      trade.valuation,
      trade.condition,
      trade.category
    );
    console.log("🧪 Test calculation result:", calculatedPoints);

    // Save the trade
    console.log("💾 Saving trade...");
    await trade.save();

    console.log("✅ Trade saved successfully!");
    console.log("📈 Final trade points:", trade.tradePoints);

    // Populate owner info
    await trade.populate("owner", "name email profileImage rating");

    res.status(201).json({
      success: true,
      message: "Trade created successfully",
      trade,
    });
  } catch (error) {
    console.error("❌ Create trade error:", error);

    // More detailed error logging
    if (error.name === "ValidationError") {
      console.error("Validation errors:");
      for (const [key, err] of Object.entries(error.errors)) {
        console.error(`  ${key}: ${err.message} (value: ${err.value})`);
      }
    }

    res.status(500).json({
      success: false,
      message: "Failed to create trade",
      error: error.message,
      validationErrors: error.errors,
    });
  }
};

/**
 * Update trade
 */
exports.updateTrade = async (req, res) => {
  try {
    const trade = await Trade.findById(req.params.id);

    if (!trade) {
      return res.status(404).json({
        success: false,
        message: "Trade not found",
      });
    }

    // Check ownership
    if (trade.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this trade",
      });
    }

    // Update fields
    const allowedUpdates = [
      "title",
      "description",
      "category",
      "subcategory",
      "condition",
      "valuation",
      "images",
      "location",
      "preferences",
      "status",
    ];

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        trade[field] = req.body[field];
      }
    });

    await trade.save();

    res.json({
      success: true,
      message: "Trade updated successfully",
      trade,
    });
  } catch (error) {
    console.error("Update trade error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update trade",
      error: error.message,
    });
  }
};

/**
 * Delete trade
 */
exports.deleteTrade = async (req, res) => {
  try {
    const trade = await Trade.findById(req.params.id);

    if (!trade) {
      return res.status(404).json({
        success: false,
        message: "Trade not found",
      });
    }

    // Check ownership
    if (trade.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this trade",
      });
    }

    await trade.deleteOne();

    res.json({
      success: true,
      message: "Trade deleted successfully",
    });
  } catch (error) {
    console.error("Delete trade error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete trade",
      error: error.message,
    });
  }
};

/**
 * Search trades
 */
exports.searchTrades = async (req, res) => {
  try {
    const { q, category, lat, lng, radius = 50 } = req.query;

    let query = { status: "active" };

    // Text search
    if (q) {
      query.$text = { $search: q };
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    // Location-based search
    if (lat && lng) {
      query["location.coordinates"] = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: radius * 1000, // Convert km to meters
        },
      };
    }

    const trades = await Trade.find(query)
      .populate("owner", "name rating profileImage")
      .limit(20);

    res.json({
      success: true,
      count: trades.length,
      trades,
    });
  } catch (error) {
    console.error("Search trades error:", error);
    res.status(500).json({
      success: false,
      message: "Search failed",
      error: error.message,
    });
  }
};

// controllers/trade.controller.js - Update getRecommendations function
/**
 * Get personalized recommendations
 */
exports.getRecommendations = async (req, res) => {
  try {
    console.log("📊 Getting recommendations for user:", req.auth?.userId);

    if (!req.auth || !req.auth.userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    // Find user by Clerk ID
    const user = await User.findOne({ clerkId: req.auth.userId });

    if (!user) {
      console.log("❌ User not found in database");
      return res.json({
        success: true,
        trades: [],
        message: "No recommendations available",
      });
    }

    console.log("👤 Found user:", user._id);

    // Get some random active trades (excluding user's own trades)
    const trades = await Trade.find({
      status: "active",
      owner: { $ne: user._id },
    })
      .populate("owner", "name rating profileImage")
      .sort({ createdAt: -1 })
      .limit(10);

    console.log("✅ Found", trades.length, "recommendations");

    res.json({
      success: true,
      trades,
      count: trades.length,
    });
  } catch (error) {
    console.error("Get recommendations error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get recommendations",
      error: error.message,
    });
  }
};

/**
 * Like a trade
 */
exports.likeTrade = async (req, res) => {
  try {
    const trade = await Trade.findById(req.params.id);

    if (!trade) {
      return res.status(404).json({
        success: false,
        message: "Trade not found",
      });
    }

    const alreadyLiked = trade.likedBy.includes(req.user._id);

    if (alreadyLiked) {
      trade.likedBy = trade.likedBy.filter(
        (id) => id.toString() !== req.user._id.toString()
      );
      trade.likes -= 1;
    } else {
      trade.likedBy.push(req.user._id);
      trade.likes += 1;
    }

    await trade.save();

    res.json({
      success: true,
      liked: !alreadyLiked,
      likes: trade.likes,
    });
  } catch (error) {
    console.error("Like trade error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to like trade",
      error: error.message,
    });
  }
};

/**
 * Add trade to wishlist
 */
exports.addToWishlist = async (req, res) => {
  try {
    const trade = await Trade.findById(req.params.id);

    if (!trade) {
      return res.status(404).json({
        success: false,
        message: "Trade not found",
      });
    }

    const inWishlist = trade.inWishlist.includes(req.user._id);

    if (inWishlist) {
      trade.inWishlist = trade.inWishlist.filter(
        (id) => id.toString() !== req.user._id.toString()
      );
    } else {
      trade.inWishlist.push(req.user._id);
    }

    await trade.save();

    res.json({
      success: true,
      inWishlist: !inWishlist,
    });
  } catch (error) {
    console.error("Wishlist error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update wishlist",
      error: error.message,
    });
  }
};

/**
 * Get user's wishlist
 */
exports.getWishlist = async (req, res) => {
  try {
    const trades = await Trade.find({
      inWishlist: req.user._id,
      status: "active",
    }).populate("owner", "name rating profileImage");

    res.json({
      success: true,
      trades,
    });
  } catch (error) {
    console.error("Get wishlist error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch wishlist",
      error: error.message,
    });
  }
};

/**
 * Get user's own trades
 */
exports.getUserTrades = async (req, res) => {
  try {
    const { status } = req.query;
    const query = { owner: req.user._id };
    
    // Filter by status if provided (active, pending, completed, cancelled)
    if (status) {
      query.status = status;
    }

    const trades = await Trade.find(query)
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      trades,
    });
  } catch (error) {
    console.error("Get user trades error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user trades",
      error: error.message,
    });
  }
};
