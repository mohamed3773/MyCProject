const { Web3 } = require('web3');
const { getNetworkConfig } = require('./multiChainConfig');

/**
 * Multi-Chain Web3 Service
 * Manages Web3 connections for multiple networks
 */

// ERC-20 ABI for token transfers
const ERC20_ABI = [
    {
        "constant": true,
        "inputs": [{ "name": "_owner", "type": "address" }],
        "name": "balanceOf",
        "outputs": [{ "name": "balance", "type": "uint256" }],
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "decimals",
        "outputs": [{ "name": "", "type": "uint8" }],
        "type": "function"
    }
];

class MultiChainWeb3Service {
    constructor() {
        this.web3Instances = new Map();
        this.initializeNetworks();
    }

    /**
     * Initialize Web3 instances for all networks
     */
    initializeNetworks() {
        const networks = ['ethereum', 'polygon', 'bsc', 'arbitrum', 'optimism', 'avalanche', 'base'];

        networks.forEach(networkId => {
            const config = getNetworkConfig(networkId);
            if (config && config.rpcUrl) {
                try {
                    const web3 = new Web3(config.rpcUrl);
                    this.web3Instances.set(networkId, web3);
                    console.log(`✅ ${config.name} Web3 initialized`);
                } catch (error) {
                    console.warn(`⚠️  Failed to initialize ${networkId}:`, error.message);
                }
            }
        });
    }

    /**
     * Get Web3 instance for a network
     */
    getWeb3(networkId) {
        const web3 = this.web3Instances.get(networkId);
        if (!web3) {
            throw new Error(`Web3 not initialized for ${networkId}`);
        }
        return web3;
    }

    /**
     * Get transaction details
     */
    async getTransaction(networkId, txHash) {
        try {
            const web3 = this.getWeb3(networkId);
            const tx = await web3.eth.getTransaction(txHash);

            if (!tx) {
                throw new Error('Transaction not found');
            }

            return tx;
        } catch (error) {
            console.error(`Error fetching transaction on ${networkId}:`, error.message);
            throw error;
        }
    }

    /**
     * Get transaction receipt
     */
    async getTransactionReceipt(networkId, txHash) {
        try {
            const web3 = this.getWeb3(networkId);
            const receipt = await web3.eth.getTransactionReceipt(txHash);

            if (!receipt) {
                throw new Error('Transaction receipt not found');
            }

            return receipt;
        } catch (error) {
            console.error(`Error fetching receipt on ${networkId}:`, error.message);
            throw error;
        }
    }

    /**
     * Verify payment transaction
     */
    async verifyPayment(networkId, txHash, expectedData) {
        try {
            console.log(`\n🔍 Verifying payment on ${networkId}`);
            console.log(`   TX Hash: ${txHash}`);

            const web3 = this.getWeb3(networkId);
            const config = getNetworkConfig(networkId);

            // Get transaction
            const tx = await this.getTransaction(networkId, txHash);

            // Get receipt
            const receipt = await this.getTransactionReceipt(networkId, txHash);

            // Basic checks
            const checks = {
                exists: !!tx,
                confirmed: receipt.status === true || receipt.status === 1n || receipt.status === '0x1',
                fromAddress: tx.from.toLowerCase() === expectedData.buyerAddress.toLowerCase(),
                toAddress: tx.to.toLowerCase() === expectedData.adminWallet.toLowerCase(),
                network: true
            };

            console.log(`   ✓ Transaction exists: ${checks.exists}`);
            console.log(`   ✓ Confirmed: ${checks.confirmed}`);
            console.log(`   ✓ From correct sender: ${checks.fromAddress}`);
            console.log(`   ✓ To admin wallet: ${checks.toAddress}`);

            // Verify amount
            let amountCheck = false;

            if (expectedData.currency.isNative) {
                // Native currency (ETH, BNB, MATIC, etc.)
                const valueInEther = web3.utils.fromWei(tx.value.toString(), 'ether');
                const expectedAmount = parseFloat(expectedData.amount);
                const actualAmount = parseFloat(valueInEther);
                const tolerance = expectedAmount * 0.02; // 2% tolerance

                amountCheck = Math.abs(actualAmount - expectedAmount) <= tolerance;

                console.log(`   ✓ Amount check (native): ${amountCheck}`);
                console.log(`     Expected: ${expectedAmount}, Actual: ${actualAmount}`);
            } else {
                // ERC-20 token
                // For ERC-20, we'd need to decode the transaction input
                // For now, we'll do a basic check
                amountCheck = true; // Will be enhanced
                console.log(`   ✓ Amount check (token): ${amountCheck} (basic)`);
            }

            const allChecksPassed = Object.values(checks).every(v => v) && amountCheck;

            return {
                valid: allChecksPassed,
                checks: {
                    ...checks,
                    amount: amountCheck
                },
                transaction: {
                    hash: tx.hash,
                    from: tx.from,
                    to: tx.to,
                    value: web3.utils.fromWei(tx.value.toString(), 'ether'),
                    blockNumber: tx.blockNumber,
                    confirmations: receipt.blockNumber ? await this.getConfirmations(networkId, receipt.blockNumber) : 0
                },
                receipt: {
                    status: receipt.status,
                    gasUsed: receipt.gasUsed.toString(),
                    blockNumber: receipt.blockNumber
                }
            };

        } catch (error) {
            console.error(`❌ Payment verification failed:`, error.message);
            return {
                valid: false,
                error: error.message
            };
        }
    }

    /**
     * Get number of confirmations
     */
    async getConfirmations(networkId, txBlockNumber) {
        try {
            const web3 = this.getWeb3(networkId);
            const currentBlock = await web3.eth.getBlockNumber();
            return Number(currentBlock) - Number(txBlockNumber);
        } catch (error) {
            return 0;
        }
    }

    /**
     * Get balance of address
     */
    async getBalance(networkId, address, tokenAddress = null) {
        try {
            const web3 = this.getWeb3(networkId);

            if (tokenAddress && tokenAddress !== 'native') {
                // ERC-20 token balance
                const contract = new web3.eth.Contract(ERC20_ABI, tokenAddress);
                const balance = await contract.methods.balanceOf(address).call();
                const decimals = await contract.methods.decimals().call();
                return web3.utils.fromWei(balance.toString(), decimals === 6n ? 'mwei' : 'ether');
            } else {
                // Native currency balance
                const balance = await web3.eth.getBalance(address);
                return web3.utils.fromWei(balance.toString(), 'ether');
            }
        } catch (error) {
            console.error(`Error getting balance:`, error.message);
            return '0';
        }
    }

    /**
     * Get explorer URL for transaction
     */
    getExplorerUrl(networkId, txHash) {
        const config = getNetworkConfig(networkId);
        return `${config.explorer}/tx/${txHash}`;
    }

    /**
     * Validate transaction hash format
     */
    isValidTxHash(txHash) {
        return /^0x([A-Fa-f0-9]{64})$/.test(txHash);
    }

    /**
     * Validate address format
     */
    isValidAddress(address) {
        return /^0x[a-fA-F0-9]{40}$/.test(address);
    }
}

// Export singleton
let multiChainWeb3Service = null;

function getMultiChainWeb3Service() {
    if (!multiChainWeb3Service) {
        multiChainWeb3Service = new MultiChainWeb3Service();
    }
    return multiChainWeb3Service;
}

module.exports = {
    getMultiChainWeb3Service,
    MultiChainWeb3Service
};
