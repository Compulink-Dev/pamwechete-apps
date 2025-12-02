const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const Trade = require('../models/Trade');

/**
 * Get all conversations for current user
 */
exports.getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
    })
      .populate('participants', 'name profileImage')
      .populate('trade', 'title images owner')
      .populate('lastMessage')
      .sort({ updatedAt: -1 })
      .lean();

    // Filter out current user from participants list
    const formatted = conversations.map(conv => ({
      ...conv,
      participants: conv.participants.filter(
        p => p._id.toString() !== req.user._id.toString()
      ),
      unreadCount: conv.unreadCount?.get(req.user._id.toString()) || 0,
    }));

    res.json({
      success: true,
      conversations: formatted,
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversations',
      error: error.message,
    });
  }
};

/**
 * Get messages for a conversation
 */
exports.getMessageThread = async (req, res) => {
  try {
    const { conversationId } = req.params;

    // Verify user is participant
    const conversation = await Conversation.findById(conversationId)
      .populate('participants', 'name profileImage')
      .populate('trade', 'title images owner');

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found',
      });
    }

    if (!conversation.participants.some(p => p._id.toString() === req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this conversation',
      });
    }

    // Get messages
    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'name profileImage')
      .sort({ createdAt: 1 })
      .lean();

    // Mark messages as read
    await Message.updateMany(
      {
        conversation: conversationId,
        sender: { $ne: req.user._id },
        readBy: { $ne: req.user._id },
      },
      { $addToSet: { readBy: req.user._id } }
    );

    // Reset unread count for current user
    conversation.unreadCount.set(req.user._id.toString(), 0);
    await conversation.save();

    res.json({
      success: true,
      conversation,
      messages,
    });
  } catch (error) {
    console.error('Get message thread error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
      error: error.message,
    });
  }
};

/**
 * Send a message
 */
exports.sendMessage = async (req, res) => {
  try {
    const { conversationId, recipientId, tradeId, content, type = 'text' } = req.body;

    let conversation;

    // If conversationId provided, use it
    if (conversationId) {
      conversation = await Conversation.findById(conversationId);
      
      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: 'Conversation not found',
        });
      }

      // Verify user is participant
      if (!conversation.participants.some(p => p._id.toString() === req.user._id.toString())) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to send message to this conversation',
        });
      }
    } else if (recipientId && tradeId) {
      // Create or find conversation
      conversation = await Conversation.findOne({
        participants: { $all: [req.user._id, recipientId] },
        trade: tradeId,
      });

      if (!conversation) {
        // Create new conversation
        conversation = new Conversation({
          participants: [req.user._id, recipientId],
          trade: tradeId,
          unreadCount: {
            [req.user._id.toString()]: 0,
            [recipientId.toString()]: 0,
          },
        });
        await conversation.save();
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'Either conversationId or both recipientId and tradeId are required',
      });
    }

    // Create message
    const message = new Message({
      conversation: conversation._id,
      sender: req.user._id,
      content,
      type,
      readBy: [req.user._id],
    });

    await message.save();

    // Update conversation
    conversation.lastMessage = message._id;
    conversation.status = 'active';
    conversation.updatedAt = new Date();

    // Increment unread count for other participants
    conversation.participants.forEach(participantId => {
      if (participantId.toString() !== req.user._id.toString()) {
        const currentCount = conversation.unreadCount.get(participantId.toString()) || 0;
        conversation.unreadCount.set(participantId.toString(), currentCount + 1);
      }
    });

    await conversation.save();

    // Populate message before sending
    await message.populate('sender', 'name profileImage');

    // Emit socket event if available
    if (req.app.io) {
      const otherParticipants = conversation.participants.filter(
        p => p.toString() !== req.user._id.toString()
      );
      
      otherParticipants.forEach(participantId => {
        req.app.io.to(participantId.toString()).emit('new-message', {
          conversation: conversation._id,
          message,
        });
      });
    }

    res.status(201).json({
      success: true,
      message,
      conversation: await Conversation.findById(conversation._id)
        .populate('participants', 'name profileImage')
        .populate('trade', 'title images'),
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message,
    });
  }
};

/**
 * Delete a message
 */
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    // Only sender can delete
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this message',
      });
    }

    await message.deleteOne();

    res.json({
      success: true,
      message: 'Message deleted successfully',
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message',
      error: error.message,
    });
  }
};
