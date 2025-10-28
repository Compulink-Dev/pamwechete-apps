const express = require("express");
const router = express.Router();

// Import route modules
const authRoutes = require("./auth.routes");
const userRoutes = require("./user.routes");
const tradeRoutes = require("./trade.routes");
// const tradeRequestRoutes = require("./tradeRequest.routes");
// const messageRoutes = require("./message.routes");
// const communityRoutes = require("./community.routes");

// Mount routes
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/trades", tradeRoutes);
// router.use('/trade-requests', tradeRequestRoutes);
// router.use('/messages', messageRoutes);
// router.use('/community', communityRoutes);

// Health check for API
router.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "API is running",
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
