const { getWeb3Service } = require('../services/web3Service');

/**
 * Purchase Controller
 * Handles NFT purchase requests
 */

/**
 * Determine rarity from NFT name
 * @param {string} name - NFT name
 * @returns {string} Rarity tier
 */
function getRarityFromName(name) {
    if (!name) return 'common';

    const nameLower = name.toLowerCase();

    if (nameLower.includes('legendary') || nameLower.startsWith('marspioneer #l')) {
        return 'legendary';
    } else if (nameLower.includes('ultra') || nameLower.startsWith('marspioneer #ur')) {
        return 'ultraRare';
    } else if (nameLower.includes('rare') || nameLower.startsWith('marspioneer #r')) {
        return 'rare';
    } else {
        return 'common';
    }
}

class PurchaseController {
    /**
     * Purchase NFT
     * POST /api/purchase
     */
    static async purchaseNFT(req, res) {
        try {
            const { tokenId, buyerAddress, nftName } = req.body;

            // Validation
            if (!tokenId) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing tokenId'
                });
            }

            if (!buyerAddress) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing buyerAddress'
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

            // Get Web3 service
            const web3Service = getWeb3Service();

            // Check if service is enabled
            if (!web3Service.enabled) {
                return res.status(503).json({
                    success: false,
                    error: 'Purchase system is not configured',
                    message: 'The NFT purchase system requires blockchain configuration. Please contact the administrator.'
                });
            }

            // Determine rarity and price
            const rarity = getRarityFromName(nftName);
            const price = web3Service.getPrice(rarity);

            console.log(`   Rarity: ${rarity}`);
            console.log(`   Price: $${price} USD`);

            // Verify admin owns the NFT
            console.log(`\n🔍 Verifying ownership...`);
            const isOwned = await web3Service.verifyOwnership(tokenId);

            if (!isOwned) {
                return res.status(404).json({
                    success: false,
                    error: 'NFT not available for purchase',
                    message: 'This NFT is not owned by the admin or has already been sold.'
                });
            }

            // Transfer NFT to buyer
            console.log(`\n🚀 Executing NFT transfer...`);
            const transferResult = await web3Service.transferNFT(tokenId, buyerAddress);

            if (!transferResult.success) {
                return res.status(500).json({
                    success: false,
                    error: 'NFT transfer failed'
                });
            }

            // Get explorer URL
            const explorerUrl = web3Service.getExplorerUrl(transferResult.transactionHash);

            console.log(`\n✅ Purchase completed successfully!`);
            console.log(`   Transaction: ${transferResult.transactionHash}`);
            console.log(`   Block: ${transferResult.blockNumber}\n`);

            // Return success response (convert BigInt to string)
            return res.status(200).json({
                success: true,
                message: 'NFT purchased successfully',
                data: {
                    tokenId: String(tokenId),
                    buyerAddress,
                    txHash: transferResult.transactionHash,
                    blockNumber: Number(transferResult.blockNumber),
                    status: transferResult.status === true || transferResult.status === 1n || transferResult.status === '0x1',
                    price: price,
                    rarity: rarity,
                    explorerUrl: explorerUrl
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
     * Get price for an NFT
     * POST /api/purchase/price
     */
    static async getPrice(req, res) {
        try {
            const { nftName } = req.body;

            const web3Service = getWeb3Service();

            if (!web3Service.enabled) {
                return res.status(503).json({
                    success: false,
                    error: 'Purchase system is not configured'
                });
            }

            const rarity = getRarityFromName(nftName);
            const price = web3Service.getPrice(rarity);

            return res.status(200).json({
                success: true,
                data: {
                    rarity,
                    price,
                    currency: 'USD'
                }
            });

        } catch (error) {
            console.error('Error getting price:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to get price'
            });
        }
    }

    /**
     * Check NFT availability
     * GET /api/purchase/check/:tokenId
     */
    static async checkAvailability(req, res) {
        try {
            const { tokenId } = req.params;

            if (!tokenId) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing tokenId'
                });
            }

            const web3Service = getWeb3Service();

            if (!web3Service.enabled) {
                return res.status(503).json({
                    success: false,
                    error: 'Purchase system is not configured'
                });
            }

            const isAvailable = await web3Service.verifyOwnership(tokenId);

            return res.status(200).json({
                success: true,
                data: {
                    tokenId,
                    available: isAvailable,
                    message: isAvailable ? 'NFT is available for purchase' : 'NFT is not available'
                }
            });

        } catch (error) {
            console.error('Error checking availability:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to check availability'
            });
        }
    }
}

module.exports = PurchaseController;
