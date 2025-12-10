# Quick Setup Guide - NFT Purchase System

## ⚡ Quick Start (5 Minutes)

### 1. Database Setup

Go to your Supabase dashboard and run this SQL:

```sql
-- Create NFT purchases table
CREATE TABLE IF NOT EXISTS nft_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_id TEXT NOT NULL,
    buyer_address TEXT NOT NULL,
    tx_hash TEXT NOT NULL UNIQUE,
    price_usd DECIMAL(10, 2) NOT NULL,
    price_matic DECIMAL(18, 8) NOT NULL,
    rarity TEXT NOT NULL,
    purchase_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_nft_purchases_token_id ON nft_purchases(token_id);
CREATE INDEX idx_nft_purchases_buyer_address ON nft_purchases(buyer_address);
CREATE INDEX idx_nft_purchases_tx_hash ON nft_purchases(tx_hash);

ALTER TABLE nft_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON nft_purchases FOR SELECT USING (true);
CREATE POLICY "Allow insert for authenticated users" ON nft_purchases FOR INSERT WITH CHECK (true);
```

### 2. Environment Variables

Edit `backend/.env` and add these variables:

```env
# Blockchain Configuration
PRIVATE_KEY=your_wallet_private_key_here
NFT_CONTRACT_ADDRESS=0xYourContractAddress
SERVER_WALLET_ADDRESS=0xYourWalletAddress
POLYGON_RPC_URL=https://polygon-rpc.com

# Supabase Configuration
SUPABASE_URL=https://mwlxeljisdcgzboahxxb.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key_here
```

**Where to find these values:**

- **PRIVATE_KEY**: Export from MetaMask (Account Details → Export Private Key)
  - ⚠️ Use a dedicated wallet, NOT your personal wallet!
  - Remove the "0x" prefix
  
- **NFT_CONTRACT_ADDRESS**: Your ERC-721 contract address on Polygon

- **SERVER_WALLET_ADDRESS**: The public address of the wallet whose private key you're using

- **POLYGON_RPC_URL**: 
  - Free: `https://polygon-rpc.com`
  - Better: Get free RPC from [Alchemy](https://www.alchemy.com/) or [Infura](https://infura.io/)

- **SUPABASE_SERVICE_KEY**: 
  - Go to Supabase Dashboard → Settings → API
  - Copy the `service_role` key (NOT the anon key!)

### 3. Verify Installation

Check that dependencies are installed:

```bash
cd backend
npm list ethers express-rate-limit @supabase/supabase-js
```

If any are missing:
```bash
npm install
```

### 4. Test the System

Start both servers:

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
npm run dev
```

Visit `http://localhost:5173` and try to buy an NFT!

## 🔍 Verification Checklist

Before testing purchases:

- [ ] Database table created successfully
- [ ] All environment variables set in `backend/.env`
- [ ] Private key is correct (without 0x prefix)
- [ ] Server wallet address matches the private key
- [ ] Contract address is correct
- [ ] Supabase service key is correct
- [ ] Backend server starts without errors
- [ ] Frontend server starts without errors
- [ ] MetaMask is installed in browser
- [ ] Test wallet has MATIC for gas + purchase

## 🧪 Quick Test

1. Open browser to `http://localhost:5173`
2. Navigate to NFT Collection
3. Click "Buy NFT" on any available NFT
4. Check that the price quote loads
5. (Optional) Complete a test purchase with a small amount

## ⚠️ Important Security Notes

1. **Never commit `.env` file** - It's already in `.gitignore`
2. **Use a dedicated wallet** - Don't use your personal wallet as the server wallet
3. **Keep private key secure** - Never share it or commit it to git
4. **Fund the server wallet** - It needs MATIC for gas fees
5. **Test on testnet first** - Use Polygon Mumbai testnet before mainnet

## 🐛 Common Issues

### "Missing environment variables"
- Check that `backend/.env` exists
- Verify all required variables are set
- Restart the backend server

### "Failed to connect to database"
- Verify `SUPABASE_URL` is correct
- Verify `SUPABASE_SERVICE_KEY` is the service role key (not anon key)
- Check Supabase project is active

### "Server does not own token"
- Verify the NFTs are in the server wallet
- Check `SERVER_WALLET_ADDRESS` matches the wallet that owns the NFTs
- Verify `NFT_CONTRACT_ADDRESS` is correct

### "Insufficient funds for gas"
- Add MATIC to the server wallet
- Server wallet needs ~0.01 MATIC per transaction

## 📚 Next Steps

Once the basic system is working:

1. Review the full documentation: `NFT_PURCHASE_SYSTEM.md`
2. Test error scenarios (insufficient funds, already sold, etc.)
3. Set up monitoring and alerts
4. Plan your production deployment
5. Test on Polygon Mumbai testnet before mainnet

## 🆘 Need Help?

1. Check backend console for error messages
2. Check browser console for frontend errors
3. Review `NFT_PURCHASE_SYSTEM.md` for detailed troubleshooting
4. Verify all environment variables are correct
5. Test API endpoints directly with curl

---

**Setup Time:** ~5 minutes  
**First Purchase:** ~2 minutes  
**Total:** ~7 minutes to working system! 🚀
