const express = require('express');
const router = express.Router();
const messageController = require('../controllers/message.controller');
const { requireAuth } = require('../middleware/auth');

// All routes require authentication
router.use(requireAuth);

// Get all conversations for current user
router.get('/conversations', messageController.getConversations);

// Get messages for a conversation
router.get('/thread/:conversationId', messageController.getMessageThread);

// Send a message
router.post('/', messageController.sendMessage);

// Delete a message
router.delete('/:messageId', messageController.deleteMessage);

module.exports = router;
