const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { requireAuth } = require("../middleware/auth");

// Public routes
router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/logout", userController.logout);

// Protected routes
router.use(requireAuth);
router.get("/verify-token", userController.verifyToken);
router.get("/profile", userController.getCurrentUser);
router.get("/me", userController.getCurrentUser);

module.exports = router;
