# NFT Purchase System - Setup Checklist

## 📋 Pre-Deployment Checklist

Use this checklist to ensure everything is configured correctly before testing or deploying the NFT purchase system.

---

## ✅ Phase 1: Database Setup

- [ ] **Supabase Project Created**
  - Project is active and accessible
  - URL: `https://mwlxeljisdcgzboahxxb.supabase.co`

- [ ] **Database Migration Applied**
  - Ran SQL from `supabase/migrations/002_nft_purchases.sql`
  - Table `nft_purchases` exists
  - Indexes created successfully
  - RLS policies enabled

- [ ] **Database Verification**
  ```sql
  -- Run this to verify table exists
  SELECT * FROM nft_purchases LIMIT 1;
  ```

- [ ] **Service Role Key Obtained**
  - Found in: Supabase Dashboard → Settings → API
  - Copied the `service_role` key (NOT anon key)

---

## ✅ Phase 2: Blockchain Setup

- [ ] **Server Wallet Created**
  - Created a NEW wallet (not personal wallet)
  - Exported private key from MetaMask
  - Removed "0x" prefix from private key
  - Wallet address noted

- [ ] **Server Wallet Funded**
  - Added MATIC to server wallet for gas fees
  - Recommended: At least 1 MATIC
  - Network: Polygon Mainnet (or Mumbai for testing)

- [ ] **NFTs Transferred to Server Wallet**
  - All 100 NFTs are in the server wallet
  - Verified on PolygonScan
  - Contract address noted

- [ ] **RPC Endpoint Selected**
  - Using: `https://polygon-rpc.com` (free)
  - OR: Custom RPC from Alchemy/Infura (recommended)

---

## ✅ Phase 3: Environment Configuration

- [ ] **Backend .env File Created**
  - File exists at: `backend/.env`
  - File is in `.gitignore`

- [ ] **All Variables Set**
  ```env
  # Check each variable is set:
  PORT=3001
  NODE_ENV=development
  FRONTEND_URL=http://localhost:5173
  OPENSEA_API_KEY=✓
  PRIVATE_KEY=✓ (without 0x prefix)
  NFT_CONTRACT_ADDRESS=✓
  SERVER_WALLET_ADDRESS=✓
  POLYGON_RPC_URL=✓
  SUPABASE_URL=✓
  SUPABASE_SERVICE_KEY=✓
  ```

- [ ] **Variables Verified**
  - Private key matches server wallet address
  - Contract address is correct
  - Supabase URL is correct
  - Service key is the service_role key

---

## ✅ Phase 4: Dependencies

- [ ] **Backend Dependencies Installed**
  ```bash
  cd backend
  npm install
  # Should include:
  # - ethers@^6.9.0
  # - express-rate-limit
  # - @supabase/supabase-js
  ```

- [ ] **Frontend Dependencies Installed**
  ```bash
  npm install
  # Should include:
  # - ethers@^6.9.0
  ```

- [ ] **No Installation Errors**
  - All packages installed successfully
  - No peer dependency warnings

---

## ✅ Phase 5: Server Startup

- [ ] **Backend Server Starts**
  ```bash
  cd backend
  npm run dev
  # Should see:
  # ✅ Blockchain Service initialized
  # ✅ Database Service initialized
  # 🚀 Server running on port 3001
  ```

- [ ] **No Environment Variable Warnings**
  - No "Missing required environment variables" errors
  - No "Missing optional environment variables" warnings

- [ ] **Frontend Server Starts**
  ```bash
  npm run dev
  # Should start on http://localhost:5173
  ```

- [ ] **No TypeScript Errors**
  - PurchaseModal.d.ts recognized
  - No import errors

---

## ✅ Phase 6: API Testing

- [ ] **Health Check Works**
  ```bash
  curl http://localhost:3001/health
  # Should return: {"status":"healthy"}
  ```

- [ ] **NFTs Endpoint Works**
  ```bash
  curl http://localhost:3001/api/nfts
  # Should return NFT list with sold status
  ```

- [ ] **Quote Endpoint Works**
  ```bash
  curl -X POST http://localhost:3001/api/purchase/quote \
    -H "Content-Type: application/json" \
    -d '{"tokenId":"1","nftName":"MarsPioneer #L001"}'
  # Should return price quote
  ```

- [ ] **Purchase Endpoint Accessible**
  ```bash
  curl -X POST http://localhost:3001/api/purchase \
    -H "Content-Type: application/json" \
    -d '{"tokenId":"1","buyerAddress":"0x..."}'
  # Should return error (expected without payment)
  ```

---

## ✅ Phase 7: Frontend Testing

- [ ] **NFT Collection Loads**
  - Navigate to http://localhost:5173
  - NFT collection displays
  - NFTs show correct status (Available/Sold)

- [ ] **Buy Button Visible**
  - "Buy NFT" button shows for available NFTs
  - "Sold" button shows for sold NFTs
  - Buttons are properly styled

- [ ] **Purchase Modal Opens**
  - Click "Buy NFT"
  - Modal opens
  - Price quote loads
  - No console errors

- [ ] **MetaMask Detection**
  - MetaMask installed in browser
  - MetaMask configured for Polygon network
  - Test wallet has MATIC

---

## ✅ Phase 8: Test Purchase

- [ ] **Test Wallet Prepared**
  - Test wallet has MATIC
  - Test wallet connected to Polygon
  - Amount: ~$10 worth of MATIC + gas

- [ ] **Execute Test Purchase**
  - Click "Buy NFT" on a Common NFT ($5)
  - Review price quote
  - Click "Purchase with MetaMask"
  - Approve payment in MetaMask
  - Wait for confirmation
  - NFT transfer executes
  - Success message appears

- [ ] **Verify Purchase**
  - NFT shows as "Sold" in UI
  - Transaction link works (PolygonScan)
  - Database record created:
    ```sql
    SELECT * FROM nft_purchases ORDER BY purchase_date DESC LIMIT 1;
    ```
  - NFT transferred to test wallet (verify on PolygonScan)

---

## ✅ Phase 9: Error Handling

- [ ] **Test Already Sold**
  - Try to buy the same NFT again
  - Should show "already sold" error

- [ ] **Test Insufficient Funds**
  - Try to buy with wallet that has no MATIC
  - Should show appropriate error

- [ ] **Test Wallet Rejection**
  - Start purchase, reject in MetaMask
  - Should handle gracefully

- [ ] **Test Network Error**
  - Disconnect internet briefly
  - Should show network error

---

## ✅ Phase 10: Security Verification

- [ ] **Private Key Not Exposed**
  - Check browser DevTools → Network tab
  - Private key never sent to frontend
  - Only public addresses visible

- [ ] **Rate Limiting Works**
  - Make 11 purchase requests quickly
  - 11th request should be rate limited

- [ ] **Validation Works**
  - Try invalid wallet address
  - Should return validation error

- [ ] **Database Security**
  - Try to access database from frontend
  - Should only work with service key

---

## ✅ Phase 11: Production Preparation

- [ ] **Environment Variables Secured**
  - `.env` file in `.gitignore`
  - No sensitive data in git history
  - Production values ready

- [ ] **RPC Endpoint Upgraded**
  - Using dedicated RPC (Alchemy/Infura)
  - Not using public RPC in production

- [ ] **Server Wallet Secured**
  - Private key stored securely
  - Backup of private key exists
  - Wallet has sufficient MATIC

- [ ] **Monitoring Setup**
  - Error logging configured
  - Transaction monitoring ready
  - Alert system planned

- [ ] **Backup Plan**
  - Database backup configured
  - Recovery procedure documented
  - Support contact established

---

## ✅ Phase 12: Documentation Review

- [ ] **Read All Documentation**
  - [ ] NFT_PURCHASE_SYSTEM.md
  - [ ] QUICK_SETUP_PURCHASE.md
  - [ ] NFT_PURCHASE_SYSTEM_SUMMARY.md
  - [ ] ARCHITECTURE_DIAGRAM.md

- [ ] **Understand Architecture**
  - Know how purchase flow works
  - Understand security measures
  - Know how to troubleshoot

- [ ] **API Reference Reviewed**
  - Know all endpoints
  - Understand request/response formats
  - Know rate limits

---

## 🎯 Final Verification

Before going live, verify:

- [ ] All checklist items above are complete
- [ ] Test purchase completed successfully
- [ ] Error handling tested
- [ ] Security verified
- [ ] Documentation reviewed
- [ ] Team trained on system
- [ ] Support process established
- [ ] Monitoring in place

---

## 📞 Support Resources

If you encounter issues:

1. **Check Documentation**
   - NFT_PURCHASE_SYSTEM.md (comprehensive guide)
   - QUICK_SETUP_PURCHASE.md (quick start)

2. **Check Logs**
   - Backend console for server errors
   - Browser console for frontend errors
   - Supabase logs for database errors

3. **Verify Configuration**
   - Environment variables correct
   - Database migration applied
   - Dependencies installed

4. **Test Components**
   - API endpoints individually
   - Database queries directly
   - Blockchain connection

---

## ✨ Ready to Launch!

Once all items are checked:

✅ **System is ready for testing**  
✅ **System is ready for production** (after thorough testing)  
✅ **Team is ready to support users**

---

**Last Updated:** December 9, 2025  
**Version:** 1.0.0  
**Status:** Ready for Deployment
