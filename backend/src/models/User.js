const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      default: null,
    },
    name: {
      type: String,
      trim: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    interests: [
      {
        type: String,
      },
    ],
    offerings: [
      {
        type: String,
      },
    ],
    isVerified: {
      type: Boolean,
      default: false,
    },
    verification: {
      status: {
        type: String,
        enum: ["pending", "under_review", "approved", "rejected"],
        default: "pending",
      },
      documents: [
        {
          type: {
            type: String,
            enum: ["id", "passport", "license", "proof_of_residence"],
          },
          url: String,
          uploadedAt: {
            type: Date,
            default: Date.now,
          },
          aiVerified: Boolean,
          adminVerified: Boolean,
        },
      ],
      phoneVerified: {
        type: Boolean,
        default: false,
      },
      submittedAt: Date,
      reviewedAt: Date,
      reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      rejectionReason: String,
    },
    tradePoints: {
      type: Number,
      default: 0,
    },
    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
    role: {
      type: String,
      enum: ["user", "merchant", "admin", "superadmin"],
      default: "user",
    },
    profileImage: String,
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ clerkId: 1 });
userSchema.index({ "verification.status": 1 });
userSchema.index({ role: 1 });

// Virtual for full name
userSchema.virtual("fullAddress").get(function () {
  if (!this.address) return "";
  const { street, city, state, zipCode, country } = this.address;
  return [street, city, state, zipCode, country].filter(Boolean).join(", ");
});

// Method to check if user can trade
userSchema.methods.canTrade = function () {
  return this.isVerified && this.verification.status === "approved";
};

// Serialize for JSON
userSchema.set("toJSON", { virtuals: true });
userSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("User", userSchema);
