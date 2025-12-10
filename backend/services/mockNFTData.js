/**
 * Mock NFT Data Service
 * Provides sample NFT data when OpenSea API is unavailable
 */

const generateMockNFTs = () => {
    const mockNFTs = [];

    // Legendary NFTs (5)
    for (let i = 1; i <= 5; i++) {
        mockNFTs.push({
            identifier: `legendary-${i}`,
            name: `Legendary Mars Pioneer #${i}`,
            image_url: `https://via.placeholder.com/400/FF6B35/FFFFFF?text=Legendary+${i}`,
            description: `A legendary Mars Pioneer with exceptional abilities`,
            traits: [
                { trait_type: 'TIER', value: 'LEGENDARY' },
                { trait_type: 'Role', value: 'Commander' },
                { trait_type: 'Power', value: '100' }
            ],
            collection: 'MarsPioneers',
            contract: '0x11a0529137A6fae3C117Aee0cE389C5113e1Bf21',
            token_standard: 'ERC721'
        });
    }

    // Ultra Rare NFTs (10)
    for (let i = 1; i <= 10; i++) {
        mockNFTs.push({
            identifier: `ultrarare-${i}`,
            name: `Ultra Rare Mars Pioneer #${i}`,
            image_url: `https://via.placeholder.com/400/9B59B6/FFFFFF?text=Ultra+Rare+${i}`,
            description: `An ultra rare Mars Pioneer with special skills`,
            traits: [
                { trait_type: 'TIER', value: 'ULTRA RARE' },
                { trait_type: 'Role', value: 'Engineer' },
                { trait_type: 'Power', value: '75' }
            ],
            collection: 'MarsPioneers',
            contract: '0x11a0529137A6fae3C117Aee0cE389C5113e1Bf21',
            token_standard: 'ERC721'
        });
    }

    // Rare NFTs (20)
    for (let i = 1; i <= 20; i++) {
        mockNFTs.push({
            identifier: `rare-${i}`,
            name: `Rare Mars Pioneer #${i}`,
            image_url: `https://via.placeholder.com/400/3498DB/FFFFFF?text=Rare+${i}`,
            description: `A rare Mars Pioneer ready for adventure`,
            traits: [
                { trait_type: 'TIER', value: 'RARE' },
                { trait_type: 'Role', value: 'Scientist' },
                { trait_type: 'Power', value: '50' }
            ],
            collection: 'MarsPioneers',
            contract: '0x11a0529137A6fae3C117Aee0cE389C5113e1Bf21',
            token_standard: 'ERC721'
        });
    }

    // Common NFTs (65)
    for (let i = 1; i <= 65; i++) {
        mockNFTs.push({
            identifier: `common-${i}`,
            name: `Common Mars Pioneer #${i}`,
            image_url: `https://via.placeholder.com/400/95A5A6/FFFFFF?text=Common+${i}`,
            description: `A common Mars Pioneer colonist`,
            traits: [
                { trait_type: 'TIER', value: 'COMMON' },
                { trait_type: 'Role', value: 'Colonist' },
                { trait_type: 'Power', value: '25' }
            ],
            collection: 'MarsPioneers',
            contract: '0x11a0529137A6fae3C117Aee0cE389C5113e1Bf21',
            token_standard: 'ERC721'
        });
    }

    return mockNFTs;
};

module.exports = {
    generateMockNFTs
};
