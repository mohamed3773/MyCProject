const openseaService = require('../services/openseaService');
const { getDatabaseService } = require('../services/databaseService');

/**
 * NFT Controller
 * Handles NFT-related requests and responses
 */

/**
 * Mark NFTs as sold based on database records
 * @param {Array} nfts - Array of NFT objects
 * @returns {Promise<Array>} NFTs with updated status
 */
async function markSoldNFTs(nfts) {
    try {
        const databaseService = getDatabaseService();
        const soldTokenIds = await databaseService.getSoldTokenIds();

        return nfts.map(nft => ({
            ...nft,
            status: soldTokenIds.includes(nft.identifier) ? 'sold' : (nft.status || 'Available')
        }));
    } catch (error) {
        console.error('Error marking sold NFTs:', error);
        // Return NFTs unchanged if database check fails
        return nfts;
    }
}

/**
 * Get all NFTs organized by tier
 * GET /api/nfts
 */
const getAllNFTs = async (req, res) => {
    try {
        const collectionSlug = req.query.collection || 'marspioneers';
        let nfts = await openseaService.getAllNFTs(collectionSlug);

        // Mark sold NFTs
        nfts = await markSoldNFTs(nfts);

        res.json({
            success: true,
            count: nfts.length,
            data: nfts
        });
    } catch (error) {
        console.error('Error in getAllNFTs controller:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch NFTs',
            message: error.message
        });
    }
};

/**
 * Get NFTs by tier
 * GET /api/nfts/:tier
 */
const getNFTsByTier = async (req, res) => {
    try {
        const { tier } = req.params;
        const collectionSlug = req.query.collection || 'marspioneers';

        // Validate tier parameter
        const validTiers = ['legendary', 'ultra-rare', 'rare', 'common'];
        if (!validTiers.includes(tier.toLowerCase())) {
            return res.status(400).json({
                success: false,
                error: 'Invalid tier',
                message: `Tier must be one of: ${validTiers.join(', ')}`
            });
        }

        let nfts = await openseaService.getNFTsForTier(collectionSlug, tier);

        // Mark sold NFTs
        nfts = await markSoldNFTs(nfts);

        res.json({
            success: true,
            tier: tier,
            count: nfts.length,
            data: nfts
        });
    } catch (error) {
        console.error(`Error in getNFTsByTier controller (${req.params.tier}):`, error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch NFTs for tier',
            message: error.message
        });
    }
};

/**
 * Get NFTs organized by all tiers
 * GET /api/nfts/organized
 */
const getOrganizedNFTs = async (req, res) => {
    try {
        const collectionSlug = req.query.collection || 'marspioneers';

        const organizedNFTs = await openseaService.getNFTsByTier(collectionSlug);

        res.json({
            success: true,
            total: organizedNFTs.total,
            data: {
                legendary: organizedNFTs.legendary,
                ultraRare: organizedNFTs.ultraRare,
                rare: organizedNFTs.rare,
                common: organizedNFTs.common
            }
        });
    } catch (error) {
        console.error('Error in getOrganizedNFTs controller:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch organized NFTs',
            message: error.message
        });
    }
};

/**
 * Get NFTs owned by a specific wallet address
 * GET /api/nfts/user/:walletAddress
 */
const getUserNFTs = async (req, res) => {
    try {
        const { walletAddress } = req.params;

        // Validate wallet address format (basic check)
        if (!walletAddress || !walletAddress.startsWith('0x') || walletAddress.length !== 42) {
            return res.status(400).json({
                success: false,
                error: 'Invalid wallet address format',
                message: 'Wallet address must be a valid Ethereum address'
            });
        }

        console.log(`\n📦 Fetching ALL NFTs for wallet: ${walletAddress}`);
        console.log(`   Using direct OpenSea API call (no filter)`);

        // Get ALL user's NFTs from OpenSea (no collection filter)
        const userNFTs = await openseaService.getUserNFTs(walletAddress);

        console.log(`✅ Returning ${userNFTs.length} total NFTs to frontend`);

        res.json({
            success: true,
            walletAddress,
            count: userNFTs.length,
            nfts: userNFTs
        });
    } catch (error) {
        console.error(`Error in getUserNFTs controller (${req.params.walletAddress}):`, error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch user NFTs',
            message: error.message
        });
    }
};

module.exports = {
    getAllNFTs,
    getNFTsByTier,
    getOrganizedNFTs,
    getUserNFTs
};
