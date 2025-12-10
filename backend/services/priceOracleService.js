const axios = require('axios');

/**
 * Price Oracle Service
 * Converts NFT prices from WETH to any supported currency
 */

class PriceOracleService {
    constructor() {
        this.priceCache = new Map();
        this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
    }

    /**
     * Get current price of a token in USD
     * @param {string} symbol - Token symbol (ETH, BNB, MATIC, etc.)
     * @returns {Promise<number>} Price in USD
     */
    async getTokenPriceUSD(symbol) {
        // Check cache first
        const cached = this.priceCache.get(symbol);
        if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
            return cached.price;
        }

        try {
            // Map symbols to CoinGecko IDs
            const coinGeckoIds = {
                'ETH': 'ethereum',
                'WETH': 'weth',
                'POL': 'pol-polygon',  // POL (Polygon Ecosystem Token)
                'MATIC': 'matic-network',  // Legacy MATIC
                'BNB': 'binancecoin',
                'AVAX': 'avalanche-2',
                'USDT': 'tether',
                'USDC': 'usd-coin',
                'BUSD': 'binance-usd',
                'DAI': 'dai'
            };

            const coinId = coinGeckoIds[symbol] || symbol.toLowerCase();

            console.log(`🔍 Fetching price for ${symbol} (CoinGecko ID: ${coinId})...`);

            const response = await axios.get(
                `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`,
                { timeout: 5000 }
            );

            const price = response.data[coinId]?.usd;

            if (!price) {
                console.warn(`⚠️  Price not found for ${symbol} (ID: ${coinId})`);
                throw new Error(`Price not found for ${symbol}`);
            }

            // Cache the price
            this.priceCache.set(symbol, {
                price,
                timestamp: Date.now()
            });

            console.log(`📊 ${symbol} price: $${price} (from CoinGecko)`);
            return price;

        } catch (error) {
            console.error(`❌ Error fetching price for ${symbol}:`, error.message);

            // Fallback prices (updated to current market values)
            const fallbackPrices = {
                'ETH': 2300,
                'WETH': 2300,
                'POL': 0.1281,  // Updated: Current POL price (Dec 2025)
                'MATIC': 0.1281,  // Legacy: Same as POL
                'BNB': 310,
                'AVAX': 35,
                'USDT': 1,
                'USDC': 1,
                'BUSD': 1
            };

            const fallbackPrice = fallbackPrices[symbol] || 1;
            console.warn(`⚠️  Using fallback price for ${symbol}: $${fallbackPrice}`);
            return fallbackPrice;
        }
    }

    /**
     * Convert WETH amount to target currency
     * @param {string} wethAmount - Amount in WETH
     * @param {string} targetCurrency - Target currency symbol
     * @returns {Promise<string>} Converted amount
     */
    async convertFromWETH(wethAmount, targetCurrency) {
        try {
            const wethPrice = await this.getTokenPriceUSD('WETH');
            const targetPrice = await this.getTokenPriceUSD(targetCurrency);

            const wethInUSD = parseFloat(wethAmount) * wethPrice;
            const amountInTarget = wethInUSD / targetPrice;

            console.log(`💱 Converting ${wethAmount} WETH → ${amountInTarget.toFixed(8)} ${targetCurrency}`);
            console.log(`   WETH: $${wethPrice}, ${targetCurrency}: $${targetPrice}`);

            return amountInTarget.toFixed(8);

        } catch (error) {
            console.error('Currency conversion error:', error);
            throw new Error('Failed to convert currency');
        }
    }

    /**
     * Get NFT price in specific currency
     * @param {string} rarity - NFT rarity (legendary, ultraRare, rare, common)
     * @param {string} currency - Target currency
     * @param {string} basePrice - Base price in WETH
     * @returns {Promise<Object>} Price information
     */
    async getNFTPriceInCurrency(rarity, currency, basePrice) {
        try {
            const priceInCurrency = await this.convertFromWETH(basePrice, currency);
            const wethPriceUSD = await this.getTokenPriceUSD('WETH');
            const currencyPriceUSD = await this.getTokenPriceUSD(currency);
            const priceUSD = parseFloat(basePrice) * wethPriceUSD;

            return {
                rarity,
                basePrice: basePrice,
                baseCurrency: 'WETH',
                targetCurrency: currency,
                priceInTargetCurrency: priceInCurrency,
                priceUSD: priceUSD.toFixed(2),
                exchangeRate: {
                    wethUSD: wethPriceUSD,
                    targetUSD: currencyPriceUSD
                }
            };

        } catch (error) {
            console.error('Error calculating NFT price:', error);
            throw error;
        }
    }

    /**
     * Clear price cache
     */
    clearCache() {
        this.priceCache.clear();
        console.log('🗑️  Price cache cleared');
    }
}

// Export singleton instance
let priceOracleService = null;

function getPriceOracleService() {
    if (!priceOracleService) {
        priceOracleService = new PriceOracleService();
    }
    return priceOracleService;
}

module.exports = {
    getPriceOracleService,
    PriceOracleService
};
