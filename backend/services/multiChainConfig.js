/**
 * Multi-Chain Configuration Service
 * Supports multiple networks and currencies for NFT purchases
 */

// Supported networks configuration
const NETWORKS = {
    ethereum: {
        name: 'Ethereum',
        chainId: 1,
        rpcUrl: 'https://eth.llamarpc.com',
        nativeCurrency: 'ETH',
        explorer: 'https://etherscan.io',
        adminWallet: process.env.ETHEREUM_ADMIN_WALLET || process.env.ADMIN_ADDRESS || '',
        currencies: {
            ETH: { address: 'native', decimals: 18, symbol: 'ETH' },
            WETH: { address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', decimals: 18, symbol: 'WETH' },
            USDT: { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', decimals: 6, symbol: 'USDT' },
            USDC: { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', decimals: 6, symbol: 'USDC' }
        }
    },
    polygon: {
        name: 'Polygon',
        chainId: 137,
        rpcUrl: process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com',
        nativeCurrency: 'POL',
        explorer: 'https://polygonscan.com',
        adminWallet: process.env.ADMIN_ADDRESS || '',
        currencies: {
            POL: { address: 'native', decimals: 18, symbol: 'POL' },
            WETH: { address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619', decimals: 18, symbol: 'WETH' },
            USDT: { address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', decimals: 6, symbol: 'USDT' },
            USDC: { address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', decimals: 6, symbol: 'USDC' }
        }
    },
    bsc: {
        name: 'BNB Smart Chain',
        chainId: 56,
        rpcUrl: 'https://bsc-dataseed.binance.org',
        nativeCurrency: 'BNB',
        explorer: 'https://bscscan.com',
        adminWallet: process.env.BSC_ADMIN_WALLET || process.env.ADMIN_ADDRESS || '',
        currencies: {
            BNB: { address: 'native', decimals: 18, symbol: 'BNB' },
            BUSD: { address: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56', decimals: 18, symbol: 'BUSD' },
            USDT: { address: '0x55d398326f99059fF775485246999027B3197955', decimals: 18, symbol: 'USDT' }
        }
    },
    arbitrum: {
        name: 'Arbitrum One',
        chainId: 42161,
        rpcUrl: 'https://arb1.arbitrum.io/rpc',
        nativeCurrency: 'ETH',
        explorer: 'https://arbiscan.io',
        adminWallet: process.env.ARBITRUM_ADMIN_WALLET || process.env.ADMIN_ADDRESS || '',
        currencies: {
            ETH: { address: 'native', decimals: 18, symbol: 'ETH' },
            USDT: { address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', decimals: 6, symbol: 'USDT' },
            USDC: { address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', decimals: 6, symbol: 'USDC' }
        }
    },
    optimism: {
        name: 'Optimism',
        chainId: 10,
        rpcUrl: 'https://mainnet.optimism.io',
        nativeCurrency: 'ETH',
        explorer: 'https://optimistic.etherscan.io',
        adminWallet: process.env.OPTIMISM_ADMIN_WALLET || process.env.ADMIN_ADDRESS || '',
        currencies: {
            ETH: { address: 'native', decimals: 18, symbol: 'ETH' },
            USDT: { address: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58', decimals: 6, symbol: 'USDT' },
            USDC: { address: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607', decimals: 6, symbol: 'USDC' }
        }
    },
    avalanche: {
        name: 'Avalanche C-Chain',
        chainId: 43114,
        rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
        nativeCurrency: 'AVAX',
        explorer: 'https://snowtrace.io',
        adminWallet: process.env.AVALANCHE_ADMIN_WALLET || process.env.ADMIN_ADDRESS || '',
        currencies: {
            AVAX: { address: 'native', decimals: 18, symbol: 'AVAX' },
            USDT: { address: '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7', decimals: 6, symbol: 'USDT' },
            USDC: { address: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E', decimals: 6, symbol: 'USDC' }
        }
    },
    base: {
        name: 'Base',
        chainId: 8453,
        rpcUrl: 'https://mainnet.base.org',
        nativeCurrency: 'ETH',
        explorer: 'https://basescan.org',
        adminWallet: process.env.BASE_ADMIN_WALLET || process.env.ADMIN_ADDRESS || '',
        currencies: {
            ETH: { address: 'native', decimals: 18, symbol: 'ETH' },
            USDC: { address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', decimals: 6, symbol: 'USDC' }
        }
    }
};

// NFT prices in WETH (base currency)
const NFT_PRICES_WETH = {
    legendary: '0.08',
    ultraRare: '0.024',
    rare: '0.016',
    common: '0.008'  // Real price: ~20 POL or ~$18.40
};

// Get all supported networks
function getSupportedNetworks() {
    return Object.keys(NETWORKS).map(key => ({
        id: key,
        name: NETWORKS[key].name,
        chainId: NETWORKS[key].chainId,
        nativeCurrency: NETWORKS[key].nativeCurrency,
        currencies: Object.keys(NETWORKS[key].currencies)
    }));
}

// Get network configuration
function getNetworkConfig(networkId) {
    return NETWORKS[networkId];
}

// Get supported currencies for a network
function getSupportedCurrencies(networkId) {
    const network = NETWORKS[networkId];
    if (!network) return [];

    return Object.keys(network.currencies).map(symbol => ({
        symbol,
        address: network.currencies[symbol].address,
        decimals: network.currencies[symbol].decimals,
        isNative: network.currencies[symbol].address === 'native'
    }));
}

// Validate network and currency combination
function validateNetworkCurrency(networkId, currency) {
    const network = NETWORKS[networkId];
    if (!network) {
        return { valid: false, error: 'Unsupported network' };
    }

    if (!network.currencies[currency]) {
        return { valid: false, error: `Currency ${currency} not supported on ${network.name}` };
    }

    return { valid: true };
}

// Get admin wallet for specific network
function getAdminWallet(networkId) {
    const network = NETWORKS[networkId];
    if (!network) {
        throw new Error(`Unsupported network: ${networkId}`);
    }

    // Use network-specific wallet or fallback to main ADMIN_ADDRESS
    const adminWallet = network.adminWallet || process.env.ADMIN_ADDRESS;

    if (!adminWallet) {
        console.warn(`⚠️  No admin wallet configured for ${networkId}. Using default ADMIN_ADDRESS.`);
        throw new Error(`Admin wallet not configured. Please set ${networkId.toUpperCase()}_ADMIN_WALLET or ADMIN_ADDRESS in .env`);
    }

    return adminWallet;
}

module.exports = {
    NETWORKS,
    NFT_PRICES_WETH,
    getSupportedNetworks,
    getNetworkConfig,
    getSupportedCurrencies,
    validateNetworkCurrency,
    getAdminWallet
};
