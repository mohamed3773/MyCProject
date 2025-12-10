const { ethers } = require('ethers');

/**
 * Blockchain Service for NFT Transactions
 * Handles all blockchain interactions for NFT purchases
 */

// ERC-721 ABI - only the functions we need
const ERC721_ABI = [
    "function ownerOf(uint256 tokenId) view returns (address)",
    "function transferFrom(address from, address to, uint256 tokenId)",
    "function balanceOf(address owner) view returns (uint256)",
    "function approve(address to, uint256 tokenId)",
    "function getApproved(uint256 tokenId) view returns (address)"
];

class BlockchainService {
    constructor() {
        // Polygon Mainnet RPC
        this.rpcUrl = process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com';

        // Your NFT contract address
        this.contractAddress = process.env.NFT_CONTRACT_ADDRESS;

        // Server wallet private key (NEVER expose this!)
        this.privateKey = process.env.PRIVATE_KEY;

        // Server wallet address (the current owner of NFTs)
        this.serverWalletAddress = process.env.SERVER_WALLET_ADDRESS;

        // Check if blockchain features are configured
        if (!this.privateKey || !this.contractAddress || !this.serverWalletAddress) {
            console.warn('⚠️  Blockchain credentials not configured. NFT transfer features will be disabled.');
            console.warn('   To enable blockchain features, set PRIVATE_KEY, NFT_CONTRACT_ADDRESS, and SERVER_WALLET_ADDRESS in .env');
            this.enabled = false;
            return;
        }

        try {
            // Initialize provider and signer
            this.provider = new ethers.JsonRpcProvider(this.rpcUrl);
            this.signer = new ethers.Wallet(this.privateKey, this.provider);

            // Initialize contract instance
            this.contract = new ethers.Contract(
                this.contractAddress,
                ERC721_ABI,
                this.signer
            );

            this.enabled = true;
            console.log('✅ Blockchain Service initialized');
            console.log(`📍 Contract: ${this.contractAddress}`);
            console.log(`👛 Server Wallet: ${this.serverWalletAddress}`);
        } catch (error) {
            console.error('❌ Failed to initialize Blockchain Service:', error.message);
            this.enabled = false;
        }
    }

    /**
     * Get current MATIC price in USD
     * @returns {Promise<number>} Price of 1 MATIC in USD
     */
    async getMaticPrice() {
        try {
            // You can use CoinGecko API or any other price feed
            const response = await fetch(
                'https://api.coingecko.com/api/v3/simple/price?ids=matic-network&vs_currencies=usd'
            );
            const data = await response.json();
            return data['matic-network'].usd;
        } catch (error) {
            console.error('Error fetching MATIC price:', error);
            // Fallback to a fixed price if API fails
            return 0.85; // Approximate MATIC price
        }
    }

    /**
     * Convert USD to MATIC
     * @param {number} usdAmount - Amount in USD
     * @returns {Promise<string>} Amount in MATIC (as string to preserve precision)
     */
    async convertUsdToMatic(usdAmount) {
        const maticPrice = await this.getMaticPrice();
        const maticAmount = usdAmount / maticPrice;
        return maticAmount.toFixed(8); // 8 decimal places
    }

    /**
     * Verify that the server wallet owns the NFT
     * @param {string} tokenId - Token ID to check
     * @returns {Promise<boolean>} True if server owns the NFT
     */
    async verifyOwnership(tokenId) {
        try {
            const owner = await this.contract.ownerOf(tokenId);
            const isOwned = owner.toLowerCase() === this.serverWalletAddress.toLowerCase();

            console.log(`🔍 Token ${tokenId} owner: ${owner}`);
            console.log(`✓ Server owns token: ${isOwned}`);

            return isOwned;
        } catch (error) {
            console.error(`Error verifying ownership for token ${tokenId}:`, error);
            return false;
        }
    }

    /**
     * Transfer NFT from server wallet to buyer
     * @param {string} tokenId - Token ID to transfer
     * @param {string} buyerAddress - Buyer's wallet address
     * @returns {Promise<Object>} Transaction receipt
     */
    async transferNFT(tokenId, buyerAddress) {
        try {
            console.log(`🚀 Initiating transfer of token ${tokenId} to ${buyerAddress}`);

            // Verify ownership before transfer
            const isOwned = await this.verifyOwnership(tokenId);
            if (!isOwned) {
                throw new Error(`Server does not own token ${tokenId}`);
            }

            // Execute the transfer
            const tx = await this.contract.transferFrom(
                this.serverWalletAddress,
                buyerAddress,
                tokenId
            );

            console.log(`⏳ Transaction sent: ${tx.hash}`);
            console.log('⏳ Waiting for confirmation...');

            // Wait for transaction confirmation
            const receipt = await tx.wait();

            console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`);

            return {
                success: true,
                txHash: tx.hash,
                blockNumber: receipt.blockNumber,
                gasUsed: receipt.gasUsed.toString(),
                from: this.serverWalletAddress,
                to: buyerAddress,
                tokenId: tokenId
            };

        } catch (error) {
            console.error('❌ Transfer failed:', error);

            // Parse error message for better user feedback
            let errorMessage = 'Transfer failed';

            if (error.message.includes('insufficient funds')) {
                errorMessage = 'Server wallet has insufficient funds for gas';
            } else if (error.message.includes('not own')) {
                errorMessage = 'NFT is no longer owned by server';
            } else if (error.message.includes('revert')) {
                errorMessage = 'Transaction reverted by contract';
            }

            throw new Error(errorMessage);
        }
    }

    /**
     * Get gas estimate for transfer
     * @param {string} tokenId - Token ID
     * @param {string} buyerAddress - Buyer address
     * @returns {Promise<string>} Estimated gas in MATIC
     */
    async estimateTransferGas(tokenId, buyerAddress) {
        try {
            const gasEstimate = await this.contract.transferFrom.estimateGas(
                this.serverWalletAddress,
                buyerAddress,
                tokenId
            );

            const gasPrice = await this.provider.getFeeData();
            const gasCost = gasEstimate * gasPrice.gasPrice;
            const gasCostInMatic = ethers.formatEther(gasCost);

            return gasCostInMatic;
        } catch (error) {
            console.error('Error estimating gas:', error);
            return '0.01'; // Fallback estimate
        }
    }

    /**
     * Verify payment transaction
     * @param {string} txHash - Transaction hash of payment
     * @param {string} expectedAmount - Expected amount in MATIC
     * @returns {Promise<boolean>} True if payment is valid
     */
    async verifyPayment(txHash, expectedAmount) {
        try {
            const tx = await this.provider.getTransaction(txHash);

            if (!tx) {
                console.log('❌ Transaction not found');
                return false;
            }

            // Verify transaction is confirmed
            const receipt = await tx.wait();
            if (!receipt || receipt.status !== 1) {
                console.log('❌ Transaction failed or not confirmed');
                return false;
            }

            // Verify recipient is server wallet
            if (tx.to.toLowerCase() !== this.serverWalletAddress.toLowerCase()) {
                console.log('❌ Payment not sent to server wallet');
                return false;
            }

            // Verify amount (with 1% tolerance for gas fluctuations)
            const paidAmount = parseFloat(ethers.formatEther(tx.value));
            const expected = parseFloat(expectedAmount);
            const tolerance = expected * 0.01; // 1% tolerance

            if (Math.abs(paidAmount - expected) > tolerance) {
                console.log(`❌ Amount mismatch: paid ${paidAmount}, expected ${expected}`);
                return false;
            }

            console.log('✅ Payment verified successfully');
            return true;

        } catch (error) {
            console.error('Error verifying payment:', error);
            return false;
        }
    }

    /**
     * Get wallet balance
     * @param {string} address - Wallet address
     * @returns {Promise<string>} Balance in MATIC
     */
    async getBalance(address) {
        try {
            const balance = await this.provider.getBalance(address);
            return ethers.formatEther(balance);
        } catch (error) {
            console.error('Error getting balance:', error);
            return '0';
        }
    }
}

// Export singleton instance
let blockchainService = null;

function getBlockchainService() {
    if (!blockchainService) {
        blockchainService = new BlockchainService();
    }
    return blockchainService;
}

module.exports = {
    getBlockchainService,
    BlockchainService
};
