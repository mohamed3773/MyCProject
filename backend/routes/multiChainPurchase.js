const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const MultiChainPurchaseController = require('../controllers/multiChainPurchaseController');

/**
 * Rate limiters for multi-chain purchase endpoints
 */
const purchaseLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 purchases per window
    message: {
        success: false,
        error: 'Too many purchase requests. Please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

const quoteLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 50, // 50 quotes per minute
    message: {
        success: false,
        error: 'Too many requests. Please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Multi-Chain Purchase Routes
 */

// GET /api/multichain/networks - Get supported networks and currencies
router.get('/networks', MultiChainPurchaseController.getNetworks);

// POST /api/multichain/price - Get price quote in specific currency
router.post('/price', quoteLimiter, MultiChainPurchaseController.getPriceQuote);

// POST /api/multichain/purchase - Execute multi-chain purchase
router.post('/purchase', purchaseLimiter, MultiChainPurchaseController.executePurchase);

// GET /api/multichain/transaction/:network/:txHash - Check transaction status
router.get('/transaction/:network/:txHash', MultiChainPurchaseController.checkTransaction);

module.exports = router;
