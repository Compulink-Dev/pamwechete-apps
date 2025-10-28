const express = require("express");
const router = express.Router();
const { requireAuth, requireVerified } = require("../middleware/auth");
// const tradeRequestController = require('../controllers/tradeRequest.controller');

// Protected routes
router.use(requireAuth);

// Placeholder routes - you'll need to implement the controller
router.get("/", (req, res) => {
  res.json({ message: "Trade requests endpoint - implement controller" });
});

router.post("/", requireVerified, (req, res) => {
  res.json({ message: "Create trade request - implement controller" });
});

router.get("/:id", (req, res) => {
  res.json({ message: "Get trade request by ID - implement controller" });
});

router.put("/:id", requireVerified, (req, res) => {
  res.json({ message: "Update trade request - implement controller" });
});

module.exports = router;
