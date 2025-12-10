const express = require('express');
const router = express.Router();
const nftController = require('../controllers/nftController');

/**
 * NFT Routes
 */

// GET /nfts/organized - Get NFTs organized by tier
router.get('/organized', nftController.getOrganizedNFTs);

// GET /nfts/user/:walletAddress - Get NFTs owned by specific wallet address
router.get('/user/:walletAddress', nftController.getUserNFTs);

// GET /nfts/:tier - Get NFTs by specific tier
router.get('/:tier', nftController.getNFTsByTier);

// GET /nfts - Get all NFTs
router.get('/', nftController.getAllNFTs);

module.exports = router;
