const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const PurchaseController = require('../controllers/web3PurchaseController');

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

const priceLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 30, // Limit each IP to 30 price requests per minute
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

// POST /api/purchase/price - Get price for NFT
router.post('/price', priceLimiter, PurchaseController.getPrice);

// GET /api/purchase/check/:tokenId - Check NFT availability
router.get('/check/:tokenId', PurchaseController.checkAvailability);

module.exports = router;
