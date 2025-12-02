const express = require('express');
const router = express.Router();
const messageController = require('../controllers/message.controller');
const { requireAuth } = require('../middleware/auth');
const User = require('../models/User');

// All routes require authentication
router.use(requireAuth);

// Middleware to populate req.user from req.auth
router.use(async (req, res, next) => {
  try {
    if (req.auth && req.auth.userId) {
      const user = await User.findOne({ clerkId: req.auth.userId });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }
      req.user = user;
    }
    next();
  } catch (error) {
    console.error('Error populating user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to authenticate user',
    });
  }
});

// Get all conversations for current user
router.get('/conversations', messageController.getConversations);

// Get messages for a conversation
router.get('/thread/:conversationId', messageController.getMessageThread);

// Send a message
router.post('/', messageController.sendMessage);

// Delete a message
router.delete('/:messageId', messageController.deleteMessage);

module.exports = router;
