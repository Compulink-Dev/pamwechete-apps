const mongoose = require("mongoose");

const tradeSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Electronics",
        "Fashion",
        "Books",
        "Sports",
        "Art",
        "Music",
        "Gaming",
        "Jewelry",
        "Tools",
        "Furniture",
        "Collectibles",
        "Toys",
        "Home Decor",
        "Outdoor Gear",
        "Vehicles",
        "Services",
        "Skills",
        "Other",
      ],
      index: true,
    },
    subcategory: String,
    images: [
      {
        url: { type: String, required: true },
        isMain: { type: Boolean, default: false },
        caption: { type: String },
      },
    ],
    condition: {
      type: String,
      enum: ["new", "like_new", "good", "fair", "poor"],
      required: true,
      default: "good",
    },
    tradeType: {
      type: String,
      enum: ["product", "service", "skill"],
      required: true,
      default: "product",
    },
    // Valuation details
    valuation: {
      baseValue: {
        type: Number,
        required: true,
        min: 0,
      },
      currency: {
        type: String,
        default: "USD",
      },
      age: {
        type: Number,
        default: 0, // Add default value for age
      }, // in months
      quality: {
        type: Number,
        min: 1,
        max: 10,
        default: 5,
      },
      brand: String,
    },
    // Calculated trade points - SINGLE DEFINITION
    tradePoints: {
      type: Number,
      default: 0, // Start with 0, will be calculated in pre-save
      min: 1, // Minimum 1 point
    },
    // Location
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        index: "2dsphere",
      },
      address: String,
      city: String,
      state: String,
      country: String,
    },
    // Preferences for trade
    preferences: {
      lookingFor: [String],
      tradeType: {
        type: String,
        enum: ["in_person", "online", "both"],
        default: "both",
      },
      maxDistance: Number, // in km
    },
    // Status
    status: {
      type: String,
      enum: ["active", "pending", "completed", "cancelled", "expired"],
      default: "active",
      index: true,
    },
    // Stats
    views: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
    likedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // Wishlist
    inWishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // Trading history
    tradedWith: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        tradedAt: Date,
        rating: Number,
      },
    ],
    expiresAt: {
      type: Date,
      default: () => new Date(+new Date() + 90 * 24 * 60 * 60 * 1000), // 90 days
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
tradeSchema.index({ owner: 1, status: 1 });
tradeSchema.index({ category: 1, status: 1 });
tradeSchema.index({ tradePoints: -1 });
tradeSchema.index({ createdAt: -1 });
tradeSchema.index({ "location.coordinates": "2dsphere" });

// Static method to calculate trade points
tradeSchema.statics.calculateTradePoints = function (
  valuation,
  condition,
  category
) {
  const { baseValue, age = 0, quality = 5 } = valuation;

  // Condition multiplier
  const conditionMultipliers = {
    new: 1.0,
    like_new: 0.9,
    good: 0.75,
    fair: 0.6,
    poor: 0.4,
  };

  // Age depreciation (5% per year for first 5 years)
  const years = age / 12;
  const ageDepreciation =
    years <= 5 ? baseValue * 0.05 * years : baseValue * 0.25;

  // Quality multiplier (0.5 to 1.5)
  const qualityMultiplier = 0.5 + quality / 10;

  // Category demand bonus (simplified)
  const demandBonuses = {
    Electronics: 1.2,
    Vehicles: 1.5,
    Jewelry: 1.3,
    Art: 1.4,
    Services: 1.1,
    default: 1.0,
  };
  const demandBonus = demandBonuses[category] || demandBonuses.default;

  // Calculate final points
  const conditionMultiplier = conditionMultipliers[condition] || 0.5;
  const points =
    baseValue * conditionMultiplier * qualityMultiplier * demandBonus -
    ageDepreciation;

  return Math.max(Math.round(points), 1); // Minimum 1 point
};

// Pre-save hook to calculate trade points
tradeSchema.pre("save", function (next) {
  if (
    this.isModified("valuation") ||
    this.isModified("condition") ||
    this.isModified("category") ||
    this.isNew
  ) {
    console.log("🔢 Calculating trade points...");
    console.log("📊 Valuation:", this.valuation);
    console.log("🔧 Condition:", this.condition);
    console.log("🏷️ Category:", this.category);

    const calculatedPoints = this.constructor.calculateTradePoints(
      this.valuation,
      this.condition,
      this.category
    );

    console.log("✅ Calculated points:", calculatedPoints);
    this.tradePoints = calculatedPoints;
  }
  next();
});

// Method to increment views
tradeSchema.methods.incrementViews = function () {
  this.views += 1;
  return this.save();
};

// Serialize for JSON
tradeSchema.set("toJSON", { virtuals: true });
tradeSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Trade", tradeSchema);
