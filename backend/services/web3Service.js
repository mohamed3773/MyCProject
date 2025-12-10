const { Web3 } = require('web3');

/**
 * Web3 Blockchain Service for NFT Transfers
 * Handles NFT transfers using transferFrom
 */

// ERC-721 ABI - only transferFrom function
const ERC721_ABI = [
    {
        "constant": false,
        "inputs": [
            { "name": "from", "type": "address" },
            { "name": "to", "type": "address" },
            { "name": "tokenId", "type": "uint256" }
        ],
        "name": "transferFrom",
        "outputs": [],
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [{ "name": "tokenId", "type": "uint256" }],
        "name": "ownerOf",
        "outputs": [{ "name": "", "type": "address" }],
        "type": "function"
    }
];

// Price mapping based on rarity
const PRICES = {
    legendary: "250",
    ultraRare: "75",
    rare: "35",
    common: "12"
};

class Web3Service {
    constructor() {
        // Load configuration from environment
        this.rpcUrl = process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com';
        this.contractAddress = process.env.NFT_CONTRACT_ADDRESS;
        this.privateKey = process.env.PRIVATE_KEY;
        this.adminAddress = process.env.ADMIN_ADDRESS;

        // Check if all required configs are present
        if (!this.contractAddress || !this.privateKey || !this.adminAddress) {
            console.warn('⚠️  Blockchain configuration incomplete. Purchase features will be disabled.');
            console.warn('   Required: NFT_CONTRACT_ADDRESS, PRIVATE_KEY, ADMIN_ADDRESS');
            this.enabled = false;
            return;
        }

        try {
            // Initialize Web3 with correct syntax
            this.web3 = new Web3(this.rpcUrl);

            // Add admin account from private key
            const privateKeyWithPrefix = this.privateKey.startsWith('0x') ? this.privateKey : '0x' + this.privateKey;
            const account = this.web3.eth.accounts.privateKeyToAccount(privateKeyWithPrefix);

            this.web3.eth.accounts.wallet.add(account);
            this.web3.eth.defaultAccount = account.address;

            // Initialize contract
            this.contract = new this.web3.eth.Contract(ERC721_ABI, this.contractAddress);

            this.enabled = true;
            console.log('✅ Web3 Service initialized');
            console.log(`📍 Contract: ${this.contractAddress}`);
            console.log(`👛 Admin Wallet: ${this.adminAddress}`);
        } catch (error) {
            console.error('❌ Failed to initialize Web3 Service:', error.message);
            this.enabled = false;
        }
    }

    /**
     * Get price for a rarity tier
     * @param {string} rarity - Rarity tier (legendary, ultraRare, rare, common)
     * @returns {string} Price in USD
     */
    getPrice(rarity) {
        const rarityKey = rarity.toLowerCase().replace(/\s+/g, '');
        return PRICES[rarityKey] || PRICES.common;
    }

    /**
     * Verify that admin owns the NFT
     * @param {string} tokenId - Token ID to check
     * @returns {Promise<boolean>} True if admin owns the NFT
     */
    async verifyOwnership(tokenId) {
        if (!this.enabled) {
            throw new Error('Web3 service not enabled');
        }

        try {
            const owner = await this.contract.methods.ownerOf(tokenId).call();
            const isOwned = owner.toLowerCase() === this.adminAddress.toLowerCase();

            console.log(`🔍 Token ${tokenId} owner: ${owner}`);
            console.log(`✓ Admin owns token: ${isOwned}`);

            return isOwned;
        } catch (error) {
            console.error(`Error verifying ownership for token ${tokenId}:`, error.message);
            return false;
        }
    }

    /**
     * Transfer NFT from admin to buyer
     * @param {string} tokenId - Token ID to transfer
     * @param {string} buyerAddress - Buyer's wallet address
     * @returns {Promise<Object>} Transaction result
     */
    async transferNFT(tokenId, buyerAddress) {
        if (!this.enabled) {
            throw new Error('Web3 service not enabled. Please configure blockchain settings.');
        }

        try {
            console.log(`🚀 Initiating transfer of token ${tokenId} to ${buyerAddress}`);

            // Verify ownership before transfer
            const isOwned = await this.verifyOwnership(tokenId);
            if (!isOwned) {
                throw new Error(`Admin does not own token ${tokenId}`);
            }

            // Prepare transaction
            const tx = this.contract.methods.transferFrom(
                this.adminAddress,
                buyerAddress,
                tokenId
            );

            // Estimate gas
            const gasEstimate = await tx.estimateGas({ from: this.adminAddress });
            console.log(`⛽ Estimated gas: ${gasEstimate}`);

            // Convert BigInt to Number and add 20% buffer
            const gasLimit = Math.floor(Number(gasEstimate) * 1.2);
            console.log(`⛽ Gas limit (with buffer): ${gasLimit}`);

            // Get current gas prices from network
            const feeData = await this.web3.eth.getGasPrice();
            const baseFee = Number(feeData);

            // For Polygon, we need higher tips
            const maxPriorityFeePerGas = BigInt(Math.floor(baseFee * 1.5)); // 50% more for priority
            const maxFeePerGas = BigInt(Math.floor(baseFee * 2)); // 2x for max fee

            console.log(`⛽ Base fee: ${baseFee} wei`);
            console.log(`⛽ Max priority fee: ${maxPriorityFeePerGas} wei`);
            console.log(`⛽ Max fee: ${maxFeePerGas} wei`);

            // Send transaction with EIP-1559 gas parameters
            const receipt = await tx.send({
                from: this.adminAddress,
                gas: gasLimit,
                maxPriorityFeePerGas: maxPriorityFeePerGas.toString(),
                maxFeePerGas: maxFeePerGas.toString(),
            });

            console.log(`✅ Transaction confirmed: ${receipt.transactionHash}`);
            console.log(`📦 Block number: ${receipt.blockNumber}`);

            return {
                success: true,
                transactionHash: receipt.transactionHash,
                blockNumber: receipt.blockNumber,
                status: receipt.status,
                from: this.adminAddress,
                to: buyerAddress,
                tokenId: tokenId
            };

        } catch (error) {
            console.error('❌ Transfer failed:', error);

            // Parse error message
            let errorMessage = 'Transfer failed';
            if (error.message.includes('insufficient funds')) {
                errorMessage = 'Admin wallet has insufficient funds for gas';
            } else if (error.message.includes('not own')) {
                errorMessage = 'NFT is no longer owned by admin';
            } else if (error.message.includes('revert')) {
                errorMessage = 'Transaction reverted by contract';
            } else if (error.message.includes('gas')) {
                errorMessage = 'Gas estimation failed. ' + error.message;
            } else {
                errorMessage = error.message;
            }

            throw new Error(errorMessage);
        }
    }

    /**
     * Get Polygonscan URL for transaction
     * @param {string} txHash - Transaction hash
     * @returns {string} Polygonscan URL
     */
    getExplorerUrl(txHash) {
        // Detect network (mainnet or testnet)
        const isTestnet = this.rpcUrl.includes('mumbai') || this.rpcUrl.includes('testnet');
        const baseUrl = isTestnet ? 'https://mumbai.polygonscan.com' : 'https://polygonscan.com';
        return `${baseUrl}/tx/${txHash}`;
    }
}

// Export singleton instance
let web3Service = null;

function getWeb3Service() {
    if (!web3Service) {
        web3Service = new Web3Service();
    }
    return web3Service;
}

module.exports = {
    getWeb3Service,
    Web3Service,
    PRICES
};
