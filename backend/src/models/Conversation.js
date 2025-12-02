const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }],
  trade: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trade',
    required: true,
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'finished', 'archived'],
    default: 'pending',
  },
  unreadCount: {
    type: Map,
    of: Number,
    default: {},
  },
}, {
  timestamps: true,
});

// Indexes
conversationSchema.index({ participants: 1 });
conversationSchema.index({ trade: 1 });
conversationSchema.index({ updatedAt: -1 });

// Ensure unique conversation per trade between two users
conversationSchema.index(
  { participants: 1, trade: 1 },
  { unique: true }
);

module.exports = mongoose.model('Conversation', conversationSchema);
