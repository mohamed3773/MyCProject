require('dotenv').config();

/**
 * Environment configuration module
 * Loads and validates environment variables
 */

const requiredEnvVars = [
    'OPENSEA_API_KEY',
    'PORT'
];

// Optional but recommended for purchase functionality
const optionalEnvVars = [
    'PRIVATE_KEY',
    'NFT_CONTRACT_ADDRESS',
    'SERVER_WALLET_ADDRESS',
    'POLYGON_RPC_URL',
    'SUPABASE_URL',
    'SUPABASE_SERVICE_KEY'
];

// Validate required environment variables
const validateEnv = () => {
    const missing = requiredEnvVars.filter(varName => !process.env[varName]);

    if (missing.length > 0) {
        throw new Error(
            `Missing required environment variables: ${missing.join(', ')}\n` +
            'Please check your .env file.'
        );
    }

    // Warn about missing optional variables
    const missingOptional = optionalEnvVars.filter(varName => !process.env[varName]);
    if (missingOptional.length > 0) {
        console.warn(
            `⚠️  Warning: Missing optional environment variables: ${missingOptional.join(', ')}\n` +
            'Purchase functionality may not work without these.'
        );
    }
};

// Run validation
validateEnv();

// Export configuration
module.exports = {
    openseaApiKey: process.env.OPENSEA_API_KEY,
    port: process.env.PORT || 3001,
    nodeEnv: process.env.NODE_ENV || 'development',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',

    // Blockchain configuration
    privateKey: process.env.PRIVATE_KEY,
    nftContractAddress: process.env.NFT_CONTRACT_ADDRESS,
    serverWalletAddress: process.env.SERVER_WALLET_ADDRESS,
    polygonRpcUrl: process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com',

    // Database configuration
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY
};
