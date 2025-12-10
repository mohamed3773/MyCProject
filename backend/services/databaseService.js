const { createClient } = require('@supabase/supabase-js');

/**
 * Database Service for NFT Purchases
 * Handles all database operations using Supabase
 */

class DatabaseService {
    constructor() {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY; // Use service key for backend

        if (!supabaseUrl || !supabaseServiceKey) {
            console.warn('⚠️  Supabase credentials not configured. Database features will be disabled.');
            console.warn('   To enable database features, set SUPABASE_URL and SUPABASE_SERVICE_KEY in .env');
            this.enabled = false;
            return;
        }

        this.supabase = createClient(supabaseUrl, supabaseServiceKey);
        this.enabled = true;
        console.log('✅ Database Service initialized');
    }

    /**
     * Record a successful NFT purchase
     * @param {Object} purchaseData - Purchase details
     * @returns {Promise<Object>} Created purchase record
     */
    async recordPurchase(purchaseData) {
        try {
            const { data, error } = await this.supabase
                .from('nft_purchases')
                .insert([{
                    token_id: purchaseData.tokenId,
                    buyer_address: purchaseData.buyerAddress,
                    tx_hash: purchaseData.txHash,
                    price_usd: purchaseData.priceUsd,
                    price_matic: purchaseData.priceMatic,
                    rarity: purchaseData.rarity
                }])
                .select()
                .single();

            if (error) {
                console.error('Database error:', error);
                throw new Error(`Failed to record purchase: ${error.message}`);
            }

            console.log(`✅ Purchase recorded: Token ${purchaseData.tokenId}`);
            return data;

        } catch (error) {
            console.error('Error recording purchase:', error);
            throw error;
        }
    }

    /**
     * Check if an NFT has been sold
     * @param {string} tokenId - Token ID to check
     * @returns {Promise<boolean>} True if NFT is sold
     */
    async isNFTSold(tokenId) {
        if (!this.enabled) {
            return false; // If database is disabled, assume not sold
        }

        try {
            const { data, error } = await this.supabase
                .from('nft_purchases')
                .select('id')
                .eq('token_id', tokenId)
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
                console.error('Database error:', error);
                return false;
            }

            return !!data;

        } catch (error) {
            console.error('Error checking NFT status:', error);
            return false;
        }
    }

    /**
     * Get all purchases for a specific buyer
     * @param {string} buyerAddress - Buyer's wallet address
     * @returns {Promise<Array>} List of purchases
     */
    async getPurchasesByBuyer(buyerAddress) {
        try {
            const { data, error } = await this.supabase
                .from('nft_purchases')
                .select('*')
                .eq('buyer_address', buyerAddress.toLowerCase())
                .order('purchase_date', { ascending: false });

            if (error) {
                console.error('Database error:', error);
                throw new Error(`Failed to fetch purchases: ${error.message}`);
            }

            return data || [];

        } catch (error) {
            console.error('Error fetching purchases:', error);
            throw error;
        }
    }

    /**
     * Get purchase details by transaction hash
     * @param {string} txHash - Transaction hash
     * @returns {Promise<Object|null>} Purchase details or null
     */
    async getPurchaseByTxHash(txHash) {
        try {
            const { data, error } = await this.supabase
                .from('nft_purchases')
                .select('*')
                .eq('tx_hash', txHash)
                .single();

            if (error && error.code !== 'PGRST116') {
                console.error('Database error:', error);
                throw new Error(`Failed to fetch purchase: ${error.message}`);
            }

            return data;

        } catch (error) {
            console.error('Error fetching purchase:', error);
            return null;
        }
    }

    /**
     * Get all sold NFT token IDs
     * @returns {Promise<Array<string>>} Array of sold token IDs
     */
    async getSoldTokenIds() {
        if (!this.enabled) {
            return []; // If database is disabled, return empty array
        }

        try {
            const { data, error } = await this.supabase
                .from('nft_purchases')
                .select('token_id');

            if (error) {
                console.error('Database error:', error);
                return [];
            }

            return data.map(item => item.token_id);

        } catch (error) {
            console.error('Error fetching sold tokens:', error);
            return [];
        }
    }

    /**
     * Get purchase statistics
     * @returns {Promise<Object>} Statistics object
     */
    async getPurchaseStats() {
        try {
            const { data, error } = await this.supabase
                .from('nft_purchases')
                .select('rarity, price_usd');

            if (error) {
                console.error('Database error:', error);
                return {
                    totalSales: 0,
                    totalRevenue: 0,
                    salesByRarity: {}
                };
            }

            const stats = {
                totalSales: data.length,
                totalRevenue: data.reduce((sum, item) => sum + parseFloat(item.price_usd), 0),
                salesByRarity: {}
            };

            // Count sales by rarity
            data.forEach(item => {
                if (!stats.salesByRarity[item.rarity]) {
                    stats.salesByRarity[item.rarity] = 0;
                }
                stats.salesByRarity[item.rarity]++;
            });

            return stats;

        } catch (error) {
            console.error('Error fetching stats:', error);
            return {
                totalSales: 0,
                totalRevenue: 0,
                salesByRarity: {}
            };
        }
    }
}

// Export singleton instance
let databaseService = null;

function getDatabaseService() {
    if (!databaseService) {
        databaseService = new DatabaseService();
    }
    return databaseService;
}

module.exports = {
    getDatabaseService,
    DatabaseService
};
