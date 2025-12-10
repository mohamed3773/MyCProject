const axios = require("axios");

// Wallet address that contains your 100 NFTs
const WALLET_ADDRESS = "0x0a9037401fd7fa6c0937c89a5d504ddb684c4be8";

// Base endpoint that WORKS 100%
const BASE_URL = `https://api.opensea.io/api/v2/chain/polygon/account/${WALLET_ADDRESS}/nfts`;

/**
 * Fetch ALL NFTs from OpenSea with pagination support
 * Loops through all pages until no next cursor is returned
 */
async function getAllNFTs() {
    try {
        let allNFTs = [];
        let nextCursor = null;
        let pageNumber = 0;

        console.log("🔄 Starting to fetch NFTs with pagination...");

        // Loop until there's no next cursor
        do {
            pageNumber++;

            // Build URL with cursor if we have one
            const url = nextCursor
                ? `${BASE_URL}?next=${nextCursor}`
                : BASE_URL;

            console.log(`📄 Fetching page ${pageNumber}...`);

            const response = await axios.get(url, {
                headers: {
                    "X-API-KEY": process.env.OPENSEA_API_KEY
                },
                timeout: 20000
            });

            // Get NFTs from current page
            const pageNFTs = response.data.nfts || [];

            // Merge with existing NFTs
            allNFTs = allNFTs.concat(pageNFTs);

            console.log(`✓ Page ${pageNumber}: Got ${pageNFTs.length} NFTs. Total: ${allNFTs.length}`);

            // Get next cursor for pagination
            nextCursor = response.data.next || null;

        } while (nextCursor); // Continue while there's a next cursor

        console.log(`✅ Pagination complete! Total NFTs: ${allNFTs.length}`);

        return allNFTs;

    } catch (error) {
        console.error("OpenSea API Error (getAllNFTs):", error.message);
        throw error;
    }
}

/**
 * Organize NFTs by tier based on the name (Lxxx, URxxx, Rxxx, Cxxx)
 * Uses paginated getAllNFTs to get complete dataset
 */
async function getNFTsByTier() {
    try {
        // Use paginated getAllNFTs to get all NFTs
        const all = await getAllNFTs();

        const organized = {
            legendary: [],
            ultraRare: [],
            rare: [],
            common: [],
            total: all.length
        };

        all.forEach(nft => {
            const name = nft.name?.toLowerCase() || "";

            if (name.includes("legendary") || name.startsWith("l")) {
                organized.legendary.push(nft);
            } else if (name.includes("ultra") || name.startsWith("ur")) {
                organized.ultraRare.push(nft);
            } else if (name.includes("rare") || name.startsWith("r")) {
                organized.rare.push(nft);
            } else if (name.includes("common") || name.startsWith("c")) {
                organized.common.push(nft);
            }
        });

        return organized;

    } catch (error) {
        console.error("OpenSea API Error (getNFTsByTier):", error.message);
        throw error;
    }
}

/**
 * Fetch NFTs filtered by tier
 */
async function getNFTsForTier(tier) {
    const all = await getNFTsByTier();

    const key = tier.toLowerCase();

    switch (key) {
        case "legendary":
            return all.legendary;
        case "ultra-rare":
        case "ultra":
        case "ultrarare":
            return all.ultraRare;
        case "rare":
            return all.rare;
        case "common":
            return all.common;
        default:
            return [];
    }
}

/**
 * Get ALL NFTs owned by a specific wallet address
 * Direct OpenSea API call - returns ALL NFTs regardless of collection
 * @param {string} walletAddress - The wallet address to query
 */
async function getUserNFTs(walletAddress) {
    try {
        console.log(`\n🔍 Fetching ALL NFTs from OpenSea for wallet: ${walletAddress}`);
        console.log(`   Direct API call - no filtering`);

        // Build OpenSea API URL for specific wallet
        const url = `https://api.opensea.io/api/v2/chain/polygon/account/${walletAddress}/nfts`;

        let allUserNFTs = [];
        let nextCursor = null;
        let pageNumber = 0;

        // Loop through all pages to get COMPLETE collection
        do {
            pageNumber++;

            const requestUrl = nextCursor
                ? `${url}?next=${nextCursor}`
                : url;

            console.log(`  📄 Fetching page ${pageNumber} from OpenSea...`);

            const response = await axios.get(requestUrl, {
                headers: {
                    "X-API-KEY": process.env.OPENSEA_API_KEY
                },
                timeout: 20000
            });

            const pageNFTs = response.data.nfts || [];

            // ✅ NO FILTER - Return ALL NFTs from OpenSea
            // This includes NFTs from ANY collection, ANY contract
            allUserNFTs = allUserNFTs.concat(pageNFTs);

            console.log(`  ✓ Page ${pageNumber}: Received ${pageNFTs.length} NFTs from OpenSea`);
            console.log(`  📊 Total accumulated: ${allUserNFTs.length} NFTs`);

            nextCursor = response.data.next || null;

        } while (nextCursor);

        console.log(`✅ Complete! Total NFTs found: ${allUserNFTs.length}`);

        // Safe collection count (filter out undefined/null)
        const collections = allUserNFTs
            .map(nft => nft.collection)
            .filter(collection => collection);
        const uniqueCollections = [...new Set(collections)].length;

        console.log(`   Collections: ${uniqueCollections} different collections\n`);

        return allUserNFTs;

    } catch (error) {
        console.error(`❌ OpenSea API Error (getUserNFTs for ${walletAddress}):`, error.message);

        // Return empty array instead of throwing to avoid breaking the UI
        return [];
    }
}

module.exports = {
    getAllNFTs,
    getNFTsByTier,
    getNFTsForTier,
    getUserNFTs
};
