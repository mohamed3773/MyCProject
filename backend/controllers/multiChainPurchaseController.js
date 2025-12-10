const { getSupportedNetworks, getNetworkConfig, validateNetworkCurrency, getAdminWallet, NFT_PRICES_WETH } = require('../services/multiChainConfig');
const { getPriceOracleService } = require('../services/priceOracleService');
const { getMultiChainWeb3Service } = require('../services/multiChainWeb3Service');
const { getWeb3Service } = require('../services/web3Service'); // For NFT transfer on Polygon

/**
 * Multi-Chain Purchase Controller
 * Handles NFT purchases across multiple networks and currencies
 */

/**
 * Determine rarity from NFT name
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
    }
    return 'common';
}

class MultiChainPurchaseController {
    /**
     * Get supported networks and currencies
     * GET /api/multichain/networks
     */
    static async getNetworks(req, res) {
        try {
            const networks = getSupportedNetworks();

            return res.status(200).json({
                success: true,
                data: {
                    networks,
                    totalNetworks: networks.length
                }
            });
        } catch (error) {
            console.error('Error fetching networks:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to fetch networks'
            });
        }
    }

    /**
     * Get price quote in specific currency
     * POST /api/multichain/price
     */
    static async getPriceQuote(req, res) {
        try {
            const { tokenId, nftName, network, currency } = req.body;

            // Validation
            if (!network || !currency) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing network or currency'
                });
            }

            // Validate network and currency
            const validation = validateNetworkCurrency(network, currency);
            if (!validation.valid) {
                return res.status(400).json({
                    success: false,
                    error: validation.error
                });
            }

            // Get rarity and base price
            const rarity = getRarityFromName(nftName);
            const basePriceWETH = NFT_PRICES_WETH[rarity];

            console.log(`\n💰 Price Quote Request:`);
            console.log(`   NFT: ${nftName}`);
            console.log(`   Rarity: ${rarity}`);
            console.log(`   Base Price: ${basePriceWETH} WETH`);
            console.log(`   Network: ${network}`);
            console.log(`   Currency: ${currency}`);

            // Get price in target currency
            const priceOracle = getPriceOracleService();
            const priceInfo = await priceOracle.getNFTPriceInCurrency(rarity, currency, basePriceWETH);

            // Get network config
            const networkConfig = getNetworkConfig(network);
            const adminWallet = getAdminWallet(network);

            return res.status(200).json({
                success: true,
                data: {
                    tokenId,
                    nftName,
                    rarity,
                    network: {
                        id: network,
                        name: networkConfig.name,
                        chainId: networkConfig.chainId
                    },
                    currency: {
                        symbol: currency,
                        address: networkConfig.currencies[currency].address,
                        decimals: networkConfig.currencies[currency].decimals
                    },
                    pricing: {
                        basePriceWETH: priceInfo.basePrice,
                        priceInCurrency: priceInfo.priceInTargetCurrency,
                        priceUSD: priceInfo.priceUSD,
                        exchangeRate: priceInfo.exchangeRate
                    },
                    payment: {
                        adminWallet,
                        amount: priceInfo.priceInTargetCurrency,
                        currency: currency
                    }
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
     * Execute multi-chain NFT purchase
     * POST /api/multichain/purchase
     */
    static async executePurchase(req, res) {
        try {
            const {
                tokenId,
                nftName,
                buyerAddress,
                network,
                currency,
                paymentTxHash,
                expectedAmount
            } = req.body;

            console.log(`\n🛒 Multi-Chain Purchase Request:`);
            console.log(`   Token ID: ${tokenId}`);
            console.log(`   NFT: ${nftName}`);
            console.log(`   Buyer: ${buyerAddress}`);
            console.log(`   Payment Network: ${network}`);
            console.log(`   Payment Currency: ${currency}`);
            console.log(`   Payment TX: ${paymentTxHash}`);

            // Validation
            if (!tokenId || !buyerAddress || !network || !currency || !paymentTxHash) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required fields'
                });
            }

            // Validate address format
            const web3Service = getMultiChainWeb3Service();
            if (!web3Service.isValidAddress(buyerAddress)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid buyer address format'
                });
            }

            // Validate transaction hash
            if (!web3Service.isValidTxHash(paymentTxHash)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid transaction hash format'
                });
            }

            // Validate network and currency
            const validation = validateNetworkCurrency(network, currency);
            if (!validation.valid) {
                return res.status(400).json({
                    success: false,
                    error: validation.error
                });
            }

            // Get network config
            const networkConfig = getNetworkConfig(network);
            const adminWallet = getAdminWallet(network);
            const currencyInfo = networkConfig.currencies[currency];

            // Step 1: Verify payment on the payment network
            console.log(`\n🔍 Step 1: Verifying payment on ${networkConfig.name}...`);

            const verificationResult = await web3Service.verifyPayment(network, paymentTxHash, {
                buyerAddress,
                adminWallet,
                amount: expectedAmount,
                currency: currencyInfo
            });

            if (!verificationResult.valid) {
                console.error('❌ Payment verification failed');
                return res.status(400).json({
                    success: false,
                    error: 'Payment verification failed',
                    details: verificationResult.error || 'Invalid payment transaction'
                });
            }

            console.log('✅ Payment verified successfully');

            // Step 2: Transfer NFT on Polygon network
            console.log(`\n🚀 Step 2: Transferring NFT on Polygon...`);

            const polygonWeb3Service = getWeb3Service();

            if (!polygonWeb3Service.enabled) {
                return res.status(503).json({
                    success: false,
                    error: 'NFT transfer service not available',
                    message: 'Polygon Web3 service is not configured'
                });
            }

            // Transfer NFT
            const transferResult = await polygonWeb3Service.transferNFT(tokenId, buyerAddress);

            if (!transferResult.success) {
                return res.status(500).json({
                    success: false,
                    error: 'NFT transfer failed',
                    paymentVerified: true,
                    paymentTx: paymentTxHash
                });
            }

            console.log('✅ NFT transferred successfully');

            // Get explorer URLs
            const paymentExplorerUrl = web3Service.getExplorerUrl(network, paymentTxHash);
            const nftExplorerUrl = polygonWeb3Service.getExplorerUrl(transferResult.transactionHash);

            // Success response
            const response = {
                success: true,
                message: 'NFT purchased successfully across chains!',
                data: {
                    tokenId,
                    buyerAddress,
                    payment: {
                        network: networkConfig.name,
                        currency: currency,
                        amount: expectedAmount,
                        txHash: paymentTxHash,
                        explorerUrl: paymentExplorerUrl,
                        confirmations: verificationResult.transaction.confirmations
                    },
                    nftTransfer: {
                        network: 'Polygon',
                        txHash: transferResult.transactionHash,
                        blockNumber: transferResult.blockNumber,
                        explorerUrl: nftExplorerUrl
                    },
                    summary: {
                        paidOn: networkConfig.name,
                        paidWith: currency,
                        receivedOn: 'Polygon',
                        tokenId: tokenId
                    }
                }
            };

            console.log(`\n✅ Purchase completed successfully!`);
            console.log(`   Payment TX: ${paymentTxHash} (${networkConfig.name})`);
            console.log(`   NFT Transfer TX: ${transferResult.transactionHash} (Polygon)\n`);

            return res.status(200).json(response);

        } catch (error) {
            console.error('❌ Multi-chain purchase error:', error);
            return res.status(500).json({
                success: false,
                error: 'Purchase failed',
                message: error.message,
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    }

    /**
     * Check transaction status
     * GET /api/multichain/transaction/:network/:txHash
     */
    static async checkTransaction(req, res) {
        try {
            const { network, txHash } = req.params;

            const web3Service = getMultiChainWeb3Service();

            const tx = await web3Service.getTransaction(network, txHash);
            const receipt = await web3Service.getTransactionReceipt(network, txHash);

            return res.status(200).json({
                success: true,
                data: {
                    transaction: tx,
                    receipt,
                    explorerUrl: web3Service.getExplorerUrl(network, txHash)
                }
            });

        } catch (error) {
            console.error('Error checking transaction:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to check transaction'
            });
        }
    }
}

module.exports = MultiChainPurchaseController;
