# Web3 NFT Purchase System - Quick Setup Guide

## 🚀 Quick Setup (5 Minutes)

This is a **simplified purchase system** using Web3.js and `transferFrom` for direct NFT transfers.

### ✨ What's Different?

- **No payment required** - Admin transfers NFT directly to buyer
- **Server-side signing** - Private key stays secure on backend
- **Simple flow** - User connects wallet → Confirms purchase → NFT transferred
- **Fixed pricing** - Based on rarity tier

---

## 📋 Step 1: Environment Variables

Edit `backend/.env` and add:

```env
# Web3 Blockchain Configuration
NFT_CONTRACT_ADDRESS=0xYourNFTContractAddress
PRIVATE_KEY=your_private_key_without_0x
ADMIN_ADDRESS=0xYourAdminWalletAddress
POLYGON_RPC_URL=https://polygon-rpc.com
```

### Where to find these:

**NFT_CONTRACT_ADDRESS**
- Your ERC-721 contract address on Polygon
- Example: `0x1234567890abcdef1234567890abcdef12345678`

**PRIVATE_KEY**
- Export from MetaMask: Account Details → Export Private Key
- ⚠️ **IMPORTANT**: Remove the `0x` prefix!
- ⚠️ Use a dedicated admin wallet, NOT your personal wallet!

**ADMIN_ADDRESS**
- The public address of the wallet whose private key you're using
- This wallet must own all the NFTs you want to sell
- Example: `0xabcdef1234567890abcdef1234567890abcdef12`

**POLYGON_RPC_URL**
- Free: `https://polygon-rpc.com`
- Better: Get free RPC from [Alchemy](https://www.alchemy.com/) or [Infura](https://infura.io/)
- For testnet: `https://rpc-mumbai.maticvigil.com`

---

## 📊 Step 2: Pricing Structure

The system uses these fixed prices:

| Rarity | Price (USD) |
|--------|-------------|
| Legendary | $250 |
| Ultra Rare | $75 |
| Rare | $35 |
| Common | $12 |

To change prices, edit `backend/services/web3Service.js`:

```javascript
const PRICES = {
    legendary: "250",
    ultraRare: "75",
    rare: "35",
    common: "12"
};
```

---

## 🧪 Step 3: Test the System

### Start Servers

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
npm run dev
```

### Test Purchase Flow

1. Open browser to `http://localhost:5173`
2. Navigate to NFT Collection
3. Click "Buy NFT" on any NFT
4. Modal opens requesting wallet connection
5. Connect MetaMask
6. Click "Confirm Purchase"
7. Wait for transaction confirmation
8. See success message with Polygonscan link!

---

## 🔍 Verification Checklist

Before testing:

- [ ] All environment variables set in `backend/.env`
- [ ] Private key is correct (without 0x prefix)
- [ ] Admin address matches the private key
- [ ] Contract address is correct
- [ ] Admin wallet owns the NFTs
- [ ] Admin wallet has MATIC for gas fees (~0.01 MATIC per transfer)
- [ ] Backend server starts without errors
- [ ] Frontend server starts without errors
- [ ] MetaMask installed in browser

---

## 🔒 Security Notes

### ✅ What's Secure:

- Private key **NEVER** exposed to frontend
- All signing happens server-side
- Rate limiting prevents abuse (10 purchases per 15 minutes)
- Ownership verified before each transfer
- Address format validation

### ⚠️ Important:

1. **Never commit `.env` file** - It's in `.gitignore`
2. **Use dedicated admin wallet** - Not your personal wallet
3. **Keep private key secure** - Never share or commit it
4. **Fund admin wallet** - Needs MATIC for gas fees
5. **Test on testnet first** - Use Mumbai testnet before mainnet

---

## 📡 API Endpoints

### POST `/api/purchase`
Execute NFT purchase

**Request:**
```json
{
  "tokenId": "1",
  "buyerAddress": "0x...",
  "nftName": "MarsPioneer #L001"
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
    "price": "250",
    "rarity": "legendary",
    "explorerUrl": "https://polygonscan.com/tx/0x..."
  }
}
```

### POST `/api/purchase/price`
Get price for NFT

**Request:**
```json
{
  "nftName": "MarsPioneer #L001"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "rarity": "legendary",
    "price": "250",
    "currency": "USD"
  }
}
```

### GET `/api/purchase/check/:tokenId`
Check if NFT is available

**Response:**
```json
{
  "success": true,
  "data": {
    "tokenId": "1",
    "available": true,
    "message": "NFT is available for purchase"
  }
}
```

---

## 🐛 Troubleshooting

### "Purchase system is not configured"
- Check that all environment variables are set
- Restart backend server
- Verify no typos in variable names

### "Admin does not own token"
- Verify NFTs are in admin wallet
- Check contract address is correct
- Verify admin address matches private key

### "Insufficient funds for gas"
- Add MATIC to admin wallet
- Need ~0.01 MATIC per transaction

### "Transaction reverted"
- Check contract allows transfers
- Verify NFT is not locked/staked
- Check admin wallet has approval

---

## 🎯 How It Works

```
User Flow:
1. User clicks "Buy NFT"
2. SimplePurchaseModal opens
3. User connects MetaMask wallet
4. User sees NFT details and price
5. User clicks "Confirm Purchase"
6. Frontend sends request to backend
7. Backend verifies admin owns NFT
8. Backend calls transferFrom(admin, buyer, tokenId)
9. Transaction confirmed on blockchain
10. Success message shown with Polygonscan link
11. NFT now in buyer's wallet!
```

```
Backend Flow:
POST /api/purchase
  ↓
Validate inputs
  ↓
Check admin owns NFT (ownerOf)
  ↓
Call transferFrom(admin, buyer, tokenId)
  ↓
Wait for confirmation
  ↓
Return transaction hash
```

---

## 📚 Files Created

### Backend:
- `services/web3Service.js` - Web3 blockchain service
- `controllers/web3PurchaseController.js` - Purchase logic
- `routes/web3Purchase.js` - API routes

### Frontend:
- `components/SimplePurchaseModal.jsx` - Purchase UI
- `components/SimplePurchaseModal.d.ts` - TypeScript types

### Updated:
- `backend/server.js` - Added purchase routes
- `backend/.env.example` - Added Web3 config
- `src/components/NFTCollection.tsx` - Uses SimplePurchaseModal

---

## ✨ Ready to Use!

Once environment variables are set:

1. ✅ Backend starts without errors
2. ✅ Frontend shows NFTs
3. ✅ "Buy NFT" button works
4. ✅ Purchase modal opens
5. ✅ NFT transfers to buyer

**Total setup time: ~5 minutes** 🚀

---

## 🆘 Need Help?

1. Check backend console for errors
2. Check browser console for frontend errors
3. Verify all environment variables
4. Test with a single NFT first
5. Use Mumbai testnet before mainnet

---

**Created:** December 9, 2025  
**Version:** 1.0.0  
**Status:** ✅ Ready to Use
