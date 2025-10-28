const express = require('express');
const router = express.Router();
const tradeController = require('../controllers/trade.controller');
const { requireAuth, requireVerified } = require('../middleware/auth');

// Public routes
router.get('/', tradeController.getAllTrades);
router.get('/search', tradeController.searchTrades);
router.get('/:id', tradeController.getTradeById);

// Protected routes (require authentication)
router.use(requireAuth);

// Routes that require verified account
router.post('/', requireVerified, tradeController.createTrade);
router.put('/:id', requireVerified, tradeController.updateTrade);
router.delete('/:id', requireVerified, tradeController.deleteTrade);

// Trade interactions
router.get('/recommendations', tradeController.getRecommendations);
router.post('/:id/like', tradeController.likeTrade);
router.post('/:id/wishlist', tradeController.addToWishlist);
router.get('/wishlist', tradeController.getWishlist);

module.exports = router;
