require("dotenv").config();   // تحميل متغيرات .env أولاً

const express = require('express');
const cors = require('cors');
const config = require('./config/env');
const nftRoutes = require('./routes/nfts');
const purchaseRoutes = require('./routes/purchase');
const web3PurchaseRoutes = require('./routes/web3Purchase');
const multiChainPurchaseRoutes = require('./routes/multiChainPurchase');

// ===== DEBUG WEB3 CONFIG =====
console.log("=================================");
console.log("🔧 WEB3 CONFIG CHECK");
console.log("🔗 RPC URL:", process.env.POLYGON_RPC_URL || "❌ MISSING");
console.log("🔑 PRIVATE KEY:", process.env.PRIVATE_KEY ? "✔️ LOADED" : "❌ EMPTY");
console.log("📝 CONTRACT:", process.env.NFT_CONTRACT_ADDRESS || "❌ MISSING");
console.log("👤 ADMIN:", process.env.ADMIN_ADDRESS || "❌ MISSING");
console.log("=================================\n");

// تنبيه قوي في حال عدم وجود Private Key
if (!process.env.PRIVATE_KEY) {
    console.warn("🚨 WARNING: PRIVATE_KEY is EMPTY — Purchase system will NOT work.");
    console.warn("📝 Please add the required variables to backend/.env");
    console.warn("📚 Check WEB3_PURCHASE_SETUP.md for details");
}

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
    origin: config.frontendUrl,
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: config.nodeEnv
    });
});

// API Routes
app.use('/api/nfts', nftRoutes);
app.use('/api/multichain', multiChainPurchaseRoutes); // Multi-chain purchase system (NEW)
app.use('/api/purchase', web3PurchaseRoutes); // Single-chain Web3 purchase
app.use('/api/purchase-old', purchaseRoutes); // Backup ethers.js system

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'OpenSea API Proxy Server',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            nfts: {
                all: '/api/nfts',
                organized: '/api/nfts/organized',
                byTier: '/api/nfts/:tier (legendary, ultra-rare, rare, common)'
            }
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found',
        path: req.path
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: config.nodeEnv === 'development' ? err.message : 'Something went wrong'
    });
});

// Start Server
const PORT = config.port;
app.listen(PORT, () => {
    console.log("=================================");
    console.log(`🚀 OpenSea API Proxy Server`);
    console.log(`📡 Environment: ${config.nodeEnv}`);
    console.log(`🌐 Server running on port ${PORT}`);
    console.log(`🔗 Local: http://localhost:${PORT}`);
    console.log("=================================");
});

module.exports = app;
