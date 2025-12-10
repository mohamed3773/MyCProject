const { getBlockchainService } = require('../services/blockchainService');
const { getDatabaseService } = require('../services/databaseService');

/**
 * Rarity-based pricing in USD
 */
const RARITY_PRICES = {
    'Legendary': 250,
    'Ultra Rare': 75,
    'Rare': 25,
    'Common': 5
};

/**
 * Determine rarity from NFT name
 * @param {string} name - NFT name
 * @returns {string} Rarity tier
 */
function getRarityFromName(name) {
    const nameLower = name.toLowerCase();

    if (nameLower.includes('legendary') || nameLower.startsWith('l')) {
        return 'Legendary';
    } else if (nameLower.includes('ultra') || nameLower.startsWith('ur')) {
        return 'Ultra Rare';
    } else if (nameLower.includes('rare') || nameLower.startsWith('r')) {
        return 'Rare';
    } else {
        return 'Common';
    }
}

/**
 * Purchase NFT Controller
 * Handles the complete purchase flow
 */
class PurchaseController {
    /**
     * Initiate NFT purchase
     * POST /api/purchase
     */
    static async purchaseNFT(req, res) {
        try {
            const { tokenId, buyerAddress, nftName, paymentTxHash } = req.body;

            // Validation
            if (!tokenId || !buyerAddress) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required fields: tokenId and buyerAddress'
                });
            }

            // Validate Ethereum address format
            if (!/^0x[a-fA-F0-9]{40}$/.test(buyerAddress)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid buyer address format'
                });
            }

            console.log(`\n🛒 Purchase Request:`);
            console.log(`   Token ID: ${tokenId}`);
            console.log(`   Buyer: ${buyerAddress}`);
            console.log(`   NFT Name: ${nftName || 'Unknown'}`);

            // Initialize services
            const blockchainService = getBlockchainService();
            const databaseService = getDatabaseService();

            // Step 1: Check if NFT is already sold
            const isSold = await databaseService.isNFTSold(tokenId);
            if (isSold) {
                return res.status(409).json({
                    success: false,
                    error: 'This NFT has already been sold'
                });
            }

            // Step 2: Verify server owns the NFT
            const isOwned = await blockchainService.verifyOwnership(tokenId);
            if (!isOwned) {
                return res.status(404).json({
                    success: false,
                    error: 'NFT not available for purchase'
                });
            }

            // Step 3: Determine rarity and price
            const rarity = nftName ? getRarityFromName(nftName) : 'Common';
            const priceUsd = RARITY_PRICES[rarity];
            const priceMatic = await blockchainService.convertUsdToMatic(priceUsd);

            console.log(`   Rarity: ${rarity}`);
            console.log(`   Price: $${priceUsd} USD (${priceMatic} MATIC)`);

            // Step 4: Verify payment if transaction hash provided
            if (paymentTxHash) {
                console.log(`   Verifying payment: ${paymentTxHash}`);
                const paymentValid = await blockchainService.verifyPayment(
                    paymentTxHash,
                    priceMatic
                );

                if (!paymentValid) {
                    return res.status(400).json({
                        success: false,
                        error: 'Payment verification failed'
                    });
                }
            }

            // Step 5: Transfer NFT to buyer
            console.log(`\n🚀 Executing NFT transfer...`);
            const transferResult = await blockchainService.transferNFT(
                tokenId,
                buyerAddress
            );

            if (!transferResult.success) {
                return res.status(500).json({
                    success: false,
                    error: 'NFT transfer failed'
                });
            }

            // Step 6: Record purchase in database
            console.log(`\n💾 Recording purchase in database...`);
            const purchaseRecord = await databaseService.recordPurchase({
                tokenId,
                buyerAddress: buyerAddress.toLowerCase(),
                txHash: transferResult.txHash,
                priceUsd,
                priceMatic,
                rarity
            });

            console.log(`\n✅ Purchase completed successfully!`);
            console.log(`   Transaction: ${transferResult.txHash}`);
            console.log(`   Block: ${transferResult.blockNumber}\n`);

            // Return success response
            return res.status(200).json({
                success: true,
                message: 'NFT purchased successfully',
                data: {
                    tokenId,
                    buyerAddress,
                    txHash: transferResult.txHash,
                    blockNumber: transferResult.blockNumber,
                    priceUsd,
                    priceMatic,
                    rarity,
                    purchaseId: purchaseRecord.id,
                    polygonScanUrl: `https://polygonscan.com/tx/${transferResult.txHash}`
                }
            });

        } catch (error) {
            console.error('❌ Purchase error:', error);

            return res.status(500).json({
                success: false,
                error: error.message || 'Purchase failed',
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    }

    /**
     * Get price quote for an NFT
     * POST /api/purchase/quote
     */
    static async getPriceQuote(req, res) {
        try {
            const { tokenId, nftName } = req.body;

            if (!tokenId) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing tokenId'
                });
            }

            const blockchainService = getBlockchainService();
            const databaseService = getDatabaseService();

            // Check if blockchain service is enabled
            if (!blockchainService.enabled) {
                return res.status(503).json({
                    success: false,
                    error: 'Purchase system is not configured yet',
                    message: 'The NFT purchase system requires blockchain configuration. Please contact the administrator.'
                });
            }

            // Check if already sold
            const isSold = await databaseService.isNFTSold(tokenId);
            if (isSold) {
                return res.status(409).json({
                    success: false,
                    error: 'This NFT has already been sold'
                });
            }

            // Determine rarity and price
            const rarity = nftName ? getRarityFromName(nftName) : 'Common';
            const priceUsd = RARITY_PRICES[rarity];
            const priceMatic = await blockchainService.convertUsdToMatic(priceUsd);
            const maticPrice = await blockchainService.getMaticPrice();

            return res.status(200).json({
                success: true,
                data: {
                    tokenId,
                    rarity,
                    priceUsd,
                    priceMatic,
                    maticPriceUsd: maticPrice,
                    serverWallet: process.env.SERVER_WALLET_ADDRESS || 'Not configured'
                }
            });

        } catch (error) {
            console.error('Error getting price quote:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to get price quote',
                message: error.message
            });
        }
    }

    /**
     * Get purchase history for a buyer
     * GET /api/purchase/history/:address
     */
    static async getPurchaseHistory(req, res) {
        try {
            const { address } = req.params;

            if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid wallet address'
                });
            }

            const databaseService = getDatabaseService();
            const purchases = await databaseService.getPurchasesByBuyer(address);

            return res.status(200).json({
                success: true,
                count: purchases.length,
                data: purchases
            });

        } catch (error) {
            console.error('Error fetching purchase history:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to fetch purchase history'
            });
        }
    }

    /**
     * Get purchase statistics
     * GET /api/purchase/stats
     */
    static async getStats(req, res) {
        try {
            const databaseService = getDatabaseService();
            const stats = await databaseService.getPurchaseStats();

            return res.status(200).json({
                success: true,
                data: stats
            });

        } catch (error) {
            console.error('Error fetching stats:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to fetch statistics'
            });
        }
    }
}

module.exports = PurchaseController;
