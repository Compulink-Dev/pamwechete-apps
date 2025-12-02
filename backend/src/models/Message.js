const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
    index: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  content: {
    type: String,
    required: true,
    maxlength: 1000,
  },
  type: {
    type: String,
    enum: ['text', 'image', 'trade_offer', 'system'],
    default: 'text',
  },
  readBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  metadata: {
    tradeOffer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trade',
    },
    imageUrl: String,
  },
}, {
  timestamps: true,
});

// Indexes
messageSchema.index({ conversation: 1, createdAt: -1 });
messageSchema.index({ sender: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
