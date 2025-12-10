const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const PurchaseController = require('../controllers/purchaseController');

/**
 * Rate limiter for purchase endpoints
 * Prevents abuse and spam
 */
const purchaseLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 purchase requests per window
    message: {
        success: false,
        error: 'Too many purchase requests. Please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

const quoteLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 30, // Limit each IP to 30 quote requests per minute
    message: {
        success: false,
        error: 'Too many requests. Please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Purchase Routes
 */

// POST /api/purchase - Execute NFT purchase
router.post('/', purchaseLimiter, PurchaseController.purchaseNFT);

// POST /api/purchase/quote - Get price quote for NFT
router.post('/quote', quoteLimiter, PurchaseController.getPriceQuote);

// GET /api/purchase/history/:address - Get purchase history for wallet
router.get('/history/:address', PurchaseController.getPurchaseHistory);

// GET /api/purchase/stats - Get purchase statistics
router.get('/stats', PurchaseController.getStats);

module.exports = router;
