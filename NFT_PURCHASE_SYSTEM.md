# NFT Purchase System - Complete Implementation Guide

## 🎯 Overview

This document describes the complete NFT purchase system that enables users to buy NFTs directly through blockchain transactions using MetaMask, without relying on OpenSea API for purchases.

## 📋 System Architecture

### Backend Components

1. **Blockchain Service** (`backend/services/blockchainService.js`)
   - Handles all blockchain interactions
   - Manages NFT transfers using ethers.js
   - Verifies ownership and payments
   - Converts USD to MATIC pricing

2. **Database Service** (`backend/services/databaseService.js`)
   - Manages purchase records in Supabase
   - Tracks sold NFTs
   - Provides purchase history and statistics

3. **Purchase Controller** (`backend/controllers/purchaseController.js`)
   - Orchestrates the complete purchase flow
   - Validates requests and ownership
   - Executes blockchain transfers
   - Records purchases in database

4. **Purchase Routes** (`backend/routes/purchase.js`)
   - POST `/api/purchase` - Execute NFT purchase
   - POST `/api/purchase/quote` - Get price quote
   - GET `/api/purchase/history/:address` - Get purchase history
   - GET `/api/purchase/stats` - Get purchase statistics
   - Includes rate limiting for security

### Frontend Components

1. **PurchaseModal** (`src/components/PurchaseModal.jsx`)
   - Multi-step purchase flow UI
   - MetaMask integration
   - Real-time transaction tracking
   - Success/error handling

2. **NFTCollection** (`src/components/NFTCollection.tsx`)
   - Integrated with PurchaseModal
   - Updates NFT status after purchase
   - Displays sold NFTs correctly

3. **NFTCard** (`src/components/NFTCard.jsx`)
   - Shows "Buy NFT" button for available NFTs
   - Shows "Sold" button for sold NFTs
   - Triggers purchase modal

### Database Schema

**Table: `nft_purchases`**
```sql
- id (UUID, primary key)
- token_id (TEXT, indexed)
- buyer_address (TEXT, indexed)
- tx_hash (TEXT, unique, indexed)
- price_usd (DECIMAL)
- price_matic (DECIMAL)
- rarity (TEXT)
- purchase_date (TIMESTAMP)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

## 💰 Pricing Structure

| Rarity      | Price (USD) |
|-------------|-------------|
| Legendary   | $250        |
| Ultra Rare  | $75         |
| Rare        | $25         |
| Common      | $5          |

Prices are automatically converted to MATIC using live exchange rates.

## 🔐 Security Features

1. **Private Key Protection**
   - Private key stored only in backend environment variables
   - Never exposed to frontend
   - Used only for server-side signing

2. **Rate Limiting**
   - Purchase endpoint: 10 requests per 15 minutes per IP
   - Quote endpoint: 30 requests per minute per IP

3. **Validation**
   - Ownership verification before transfer
   - Payment verification (optional)
   - Duplicate purchase prevention
   - Ethereum address format validation

4. **Error Handling**
   - Insufficient funds detection
   - Already sold detection
   - RPC error handling
   - Transaction revert detection

## 🚀 Setup Instructions

### 1. Database Setup

Run the migration to create the purchases table:

```bash
# Apply the migration in Supabase dashboard or using Supabase CLI
supabase db push
```

Or manually run the SQL from:
`supabase/migrations/002_nft_purchases.sql`

### 2. Environment Variables

Update `backend/.env` with the following:

```env
# Existing variables
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
OPENSEA_API_KEY=your_opensea_api_key

# New blockchain variables
PRIVATE_KEY=your_private_key_without_0x_prefix
NFT_CONTRACT_ADDRESS=0xYourNFTContractAddress
SERVER_WALLET_ADDRESS=0xYourServerWalletAddress
POLYGON_RPC_URL=https://polygon-rpc.com

# Supabase variables
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
```

**⚠️ IMPORTANT SECURITY NOTES:**
- Never commit your `.env` file to version control
- Use a dedicated wallet for the server (not your personal wallet)
- Ensure the server wallet has sufficient MATIC for gas fees
- Keep your private key secure and never share it

### 3. Install Dependencies

Backend:
```bash
cd backend
npm install
```

Frontend:
```bash
npm install
```

### 4. Start the Servers

Backend:
```bash
cd backend
npm run dev
```

Frontend:
```bash
npm run dev
```

## 📖 Purchase Flow

### User Journey

1. **Browse NFTs**
   - User views NFT collection
   - NFTs show "Buy NFT" button if available
   - NFTs show "Sold" button if already purchased

2. **Initiate Purchase**
   - User clicks "Buy NFT"
   - Purchase modal opens
   - System fetches price quote from backend

3. **Price Quote**
   - Backend determines rarity from NFT name
   - Converts USD price to MATIC
   - Returns quote to frontend

4. **Payment**
   - User connects MetaMask (if not connected)
   - User approves MATIC payment transaction
   - Payment sent to server wallet
   - Frontend waits for confirmation

5. **NFT Transfer**
   - Frontend calls `/api/purchase` with payment details
   - Backend verifies payment (optional)
   - Backend verifies ownership
   - Backend executes `transferFrom` on smart contract
   - NFT transferred to buyer's wallet

6. **Record Purchase**
   - Backend records purchase in database
   - Returns transaction hash and details
   - Frontend updates UI to show NFT as sold

7. **Success**
   - User sees success message
   - Link to view transaction on PolygonScan
   - NFT now appears as "Sold" in collection

### Technical Flow

```
Frontend                Backend                 Blockchain              Database
   |                       |                         |                      |
   |-- Get Quote --------->|                         |                      |
   |<-- Price Quote -------|                         |                      |
   |                       |                         |                      |
   |-- Send Payment -------|------------------------>|                      |
   |<-- Payment Confirmed -|                         |                      |
   |                       |                         |                      |
   |-- Execute Purchase -->|                         |                      |
   |                       |-- Verify Ownership ---->|                      |
   |                       |<-- Owner Confirmed -----|                      |
   |                       |                         |                      |
   |                       |-- Transfer NFT -------->|                      |
   |                       |<-- Transfer Confirmed --|                      |
   |                       |                         |                      |
   |                       |-- Record Purchase ------|--------------------->|
   |                       |<-- Purchase Recorded ---|                      |
   |                       |                         |                      |
   |<-- Success Response --|                         |                      |
```

## 🧪 Testing

### Test Purchase Flow

1. **Prerequisites**
   - MetaMask installed and configured for Polygon
   - Test wallet with MATIC for gas + purchase price
   - Backend server running
   - Frontend server running

2. **Test Steps**
   ```bash
   # 1. Navigate to NFT Collection
   http://localhost:5173

   # 2. Click "Buy NFT" on any available NFT
   # 3. Review price quote in modal
   # 4. Click "Purchase with MetaMask"
   # 5. Approve payment in MetaMask
   # 6. Wait for transaction confirmation
   # 7. Verify success message
   # 8. Check PolygonScan link
   # 9. Verify NFT shows as "Sold"
   ```

3. **Verify Database**
   ```sql
   SELECT * FROM nft_purchases ORDER BY purchase_date DESC LIMIT 10;
   ```

### Test API Endpoints

```bash
# Get price quote
curl -X POST http://localhost:3001/api/purchase/quote \
  -H "Content-Type: application/json" \
  -d '{"tokenId": "1", "nftName": "MarsPioneer #L001"}'

# Get purchase history
curl http://localhost:3001/api/purchase/history/0xYourWalletAddress

# Get statistics
curl http://localhost:3001/api/purchase/stats
```

## 🔧 Troubleshooting

### Common Issues

1. **"MetaMask is not installed"**
   - Install MetaMask browser extension
   - Refresh the page

2. **"Server does not own token"**
   - Verify NFT is in server wallet
   - Check `SERVER_WALLET_ADDRESS` is correct
   - Verify contract address is correct

3. **"Insufficient funds for gas"**
   - Server wallet needs MATIC for gas
   - Add MATIC to server wallet

4. **"Payment verification failed"**
   - Check payment was sent to correct address
   - Verify amount matches quote
   - Check transaction was confirmed

5. **"Transaction reverted"**
   - Check contract allows transfers
   - Verify server wallet approved contract
   - Check NFT is not locked/staked

### Debug Mode

Enable detailed logging:

```javascript
// In backend/services/blockchainService.js
console.log('Debug:', {
    tokenId,
    buyerAddress,
    serverWallet: this.serverWalletAddress,
    contractAddress: this.contractAddress
});
```

## 📊 Monitoring

### Key Metrics to Track

1. **Purchase Success Rate**
   ```sql
   SELECT 
     COUNT(*) as total_purchases,
     COUNT(DISTINCT buyer_address) as unique_buyers
   FROM nft_purchases;
   ```

2. **Revenue by Rarity**
   ```sql
   SELECT 
     rarity,
     COUNT(*) as sales,
     SUM(price_usd) as total_revenue
   FROM nft_purchases
   GROUP BY rarity;
   ```

3. **Recent Purchases**
   ```sql
   SELECT * FROM nft_purchases 
   ORDER BY purchase_date DESC 
   LIMIT 20;
   ```

## 🚨 Production Checklist

Before deploying to production:

- [ ] Secure private key in production environment
- [ ] Use production RPC endpoint (not public)
- [ ] Enable HTTPS for all endpoints
- [ ] Set up proper CORS policies
- [ ] Configure rate limiting appropriately
- [ ] Set up monitoring and alerts
- [ ] Test with real transactions on testnet first
- [ ] Ensure server wallet has sufficient MATIC
- [ ] Set up automatic gas fee monitoring
- [ ] Configure backup RPC endpoints
- [ ] Set up transaction failure alerts
- [ ] Test error handling thoroughly
- [ ] Document recovery procedures
- [ ] Set up database backups
- [ ] Configure logging and analytics

## 📝 API Reference

### POST /api/purchase

Execute NFT purchase.

**Request:**
```json
{
  "tokenId": "1",
  "buyerAddress": "0x...",
  "nftName": "MarsPioneer #L001",
  "paymentTxHash": "0x..." // Optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "NFT purchased successfully",
  "data": {
    "tokenId": "1",
    "buyerAddress": "0x...",
    "txHash": "0x...",
    "blockNumber": 12345,
    "priceUsd": 250,
    "priceMatic": "294.1176",
    "rarity": "Legendary",
    "purchaseId": "uuid",
    "polygonScanUrl": "https://polygonscan.com/tx/0x..."
  }
}
```

### POST /api/purchase/quote

Get price quote for NFT.

**Request:**
```json
{
  "tokenId": "1",
  "nftName": "MarsPioneer #L001"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tokenId": "1",
    "rarity": "Legendary",
    "priceUsd": 250,
    "priceMatic": "294.1176",
    "maticPriceUsd": 0.85,
    "serverWallet": "0x..."
  }
}
```

### GET /api/purchase/history/:address

Get purchase history for a wallet.

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": "uuid",
      "token_id": "1",
      "buyer_address": "0x...",
      "tx_hash": "0x...",
      "price_usd": 250,
      "price_matic": "294.1176",
      "rarity": "Legendary",
      "purchase_date": "2025-12-09T09:00:00Z"
    }
  ]
}
```

### GET /api/purchase/stats

Get purchase statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalSales": 25,
    "totalRevenue": 3750,
    "salesByRarity": {
      "Legendary": 5,
      "Ultra Rare": 10,
      "Rare": 8,
      "Common": 2
    }
  }
}
```

## 🎓 Additional Resources

- [Ethers.js Documentation](https://docs.ethers.org/)
- [Polygon Network](https://polygon.technology/)
- [MetaMask Documentation](https://docs.metamask.io/)
- [Supabase Documentation](https://supabase.com/docs)
- [ERC-721 Standard](https://eips.ethereum.org/EIPS/eip-721)

## 📞 Support

For issues or questions:
1. Check this documentation
2. Review error logs in backend console
3. Check browser console for frontend errors
4. Verify environment variables are set correctly
5. Test with a small transaction first

---

**Last Updated:** December 9, 2025
**Version:** 1.0.0
