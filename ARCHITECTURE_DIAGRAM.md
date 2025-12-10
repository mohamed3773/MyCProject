# NFT Purchase System - Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND (React)                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌──────────────────┐         ┌──────────────────┐                          │
│  │  NFTCollection   │────────▶│   NFTCard        │                          │
│  │  Component       │         │   Component      │                          │
│  └──────────────────┘         └──────────────────┘                          │
│           │                            │                                     │
│           │ Opens                      │ Triggers                            │
│           ▼                            ▼                                     │
│  ┌─────────────────────────────────────────────┐                            │
│  │         PurchaseModal Component             │                            │
│  │  ┌─────────────────────────────────────┐   │                            │
│  │  │ 1. Get Price Quote                  │   │                            │
│  │  │ 2. Connect MetaMask                 │   │                            │
│  │  │ 3. Send Payment (MATIC)             │   │                            │
│  │  │ 4. Execute Purchase                 │   │                            │
│  │  │ 5. Show Success/Error               │   │                            │
│  │  └─────────────────────────────────────┘   │                            │
│  └─────────────────────────────────────────────┘                            │
│           │                            │                                     │
│           │ API Calls                  │ Web3 Calls                          │
│           ▼                            ▼                                     │
└───────────┼────────────────────────────┼─────────────────────────────────────┘
            │                            │
            │                            │
┌───────────┼────────────────────────────┼─────────────────────────────────────┐
│           │                            │          BLOCKCHAIN                  │
│           │                            │                                      │
│           │                            ▼                                      │
│           │                   ┌──────────────────┐                           │
│           │                   │    MetaMask      │                           │
│           │                   │   (User Wallet)  │                           │
│           │                   └──────────────────┘                           │
│           │                            │                                      │
│           │                            │ Payment Transaction                  │
│           │                            ▼                                      │
│           │                   ┌──────────────────┐                           │
│           │                   │  Polygon Network │                           │
│           │                   │   (Blockchain)   │                           │
│           │                   └──────────────────┘                           │
│           │                            ▲                                      │
│           │                            │ NFT Transfer                         │
│           │                            │                                      │
└───────────┼────────────────────────────┼─────────────────────────────────────┘
            │                            │
            │                            │
┌───────────▼────────────────────────────┼─────────────────────────────────────┐
│                         BACKEND (Node.js/Express)                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌─────────────────────────────────────────────┐                            │
│  │           Purchase Routes                   │                            │
│  │  ┌─────────────────────────────────────┐   │                            │
│  │  │ POST /api/purchase/quote            │   │                            │
│  │  │ POST /api/purchase                  │   │                            │
│  │  │ GET  /api/purchase/history/:address │   │                            │
│  │  │ GET  /api/purchase/stats            │   │                            │
│  │  └─────────────────────────────────────┘   │                            │
│  │              │ Rate Limited                 │                            │
│  └──────────────┼──────────────────────────────┘                            │
│                 │                                                             │
│                 ▼                                                             │
│  ┌─────────────────────────────────────────────┐                            │
│  │        Purchase Controller                  │                            │
│  │  ┌─────────────────────────────────────┐   │                            │
│  │  │ 1. Validate Request                 │   │                            │
│  │  │ 2. Check if NFT is Sold             │   │                            │
│  │  │ 3. Verify Ownership                 │   │                            │
│  │  │ 4. Calculate Price                  │   │                            │
│  │  │ 5. Verify Payment (optional)        │   │                            │
│  │  │ 6. Transfer NFT                     │   │                            │
│  │  │ 7. Record Purchase                  │   │                            │
│  │  └─────────────────────────────────────┘   │                            │
│  └─────────────────────────────────────────────┘                            │
│           │                            │                                     │
│           │                            │                                     │
│           ▼                            ▼                                     │
│  ┌──────────────────┐        ┌──────────────────┐                          │
│  │   Blockchain     │        │    Database      │                          │
│  │    Service       │        │    Service       │                          │
│  │                  │        │                  │                          │
│  │ • Connect RPC    │        │ • Record Purchase│                          │
│  │ • Verify Owner   │        │ • Check Sold     │                          │
│  │ • Transfer NFT   │        │ • Get History    │                          │
│  │ • Verify Payment │        │ • Get Stats      │                          │
│  │ • Get MATIC Price│        │                  │                          │
│  └──────────────────┘        └──────────────────┘                          │
│           │                            │                                     │
│           │                            │                                     │
└───────────┼────────────────────────────┼─────────────────────────────────────┘
            │                            │
            │                            │
            ▼                            ▼
   ┌──────────────────┐        ┌──────────────────┐
   │  Polygon Network │        │    Supabase      │
   │   (via RPC)      │        │    Database      │
   │                  │        │                  │
   │ • ERC-721        │        │ • nft_purchases  │
   │   Contract       │        │   table          │
   │ • transferFrom() │        │ • Indexes        │
   │ • ownerOf()      │        │ • RLS Policies   │
   └──────────────────┘        └──────────────────┘


═══════════════════════════════════════════════════════════════════════════════

                            PURCHASE FLOW SEQUENCE

═══════════════════════════════════════════════════════════════════════════════

User                Frontend            Backend             Blockchain          Database
 │                     │                   │                     │                 │
 │  Click "Buy NFT"    │                   │                     │                 │
 ├────────────────────▶│                   │                     │                 │
 │                     │                   │                     │                 │
 │                     │  GET /quote       │                     │                 │
 │                     ├──────────────────▶│                     │                 │
 │                     │                   │  Check if Sold      │                 │
 │                     │                   ├────────────────────────────────────▶│
 │                     │                   │◀────────────────────────────────────┤
 │                     │                   │  Get MATIC Price    │                 │
 │                     │                   ├────────────────────▶│                 │
 │                     │                   │◀────────────────────┤                 │
 │                     │  Price Quote      │                     │                 │
 │                     │◀──────────────────┤                     │                 │
 │  Show Quote         │                   │                     │                 │
 │◀────────────────────┤                   │                     │                 │
 │                     │                   │                     │                 │
 │  Approve Purchase   │                   │                     │                 │
 ├────────────────────▶│                   │                     │                 │
 │                     │  Connect Wallet   │                     │                 │
 │                     ├──────────────────▶│                     │                 │
 │  MetaMask Popup     │                   │                     │                 │
 │◀────────────────────┤                   │                     │                 │
 │  Approve Connection │                   │                     │                 │
 ├────────────────────▶│                   │                     │                 │
 │                     │                   │                     │                 │
 │                     │  Send Payment TX  │                     │                 │
 │                     ├────────────────────────────────────────▶│                 │
 │  MetaMask Popup     │                   │                     │                 │
 │◀────────────────────┤                   │                     │                 │
 │  Approve Payment    │                   │                     │                 │
 ├────────────────────▶│                   │                     │                 │
 │                     │                   │  Payment Confirmed  │                 │
 │                     │◀────────────────────────────────────────┤                 │
 │                     │                   │                     │                 │
 │                     │  POST /purchase   │                     │                 │
 │                     ├──────────────────▶│                     │                 │
 │                     │                   │  Verify Ownership   │                 │
 │                     │                   ├────────────────────▶│                 │
 │                     │                   │◀────────────────────┤                 │
 │                     │                   │  Transfer NFT       │                 │
 │                     │                   ├────────────────────▶│                 │
 │                     │                   │  TX Confirmed       │                 │
 │                     │                   │◀────────────────────┤                 │
 │                     │                   │  Record Purchase    │                 │
 │                     │                   ├────────────────────────────────────▶│
 │                     │                   │◀────────────────────────────────────┤
 │                     │  Success Response │                     │                 │
 │                     │◀──────────────────┤                     │                 │
 │  Show Success       │                   │                     │                 │
 │◀────────────────────┤                   │                     │                 │
 │  + PolygonScan Link │                   │                     │                 │
 │                     │                   │                     │                 │


═══════════════════════════════════════════════════════════════════════════════

                              SECURITY LAYERS

═══════════════════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────────────────────┐
│                          Layer 1: Frontend Validation                        │
│  • MetaMask connection check                                                 │
│  • Wallet address format validation                                          │
│  • User confirmation before transactions                                     │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          Layer 2: Rate Limiting                              │
│  • 10 purchase requests per 15 minutes per IP                                │
│  • 30 quote requests per minute per IP                                       │
│  • Prevents spam and abuse                                                   │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          Layer 3: Backend Validation                         │
│  • Request format validation                                                 │
│  • Ethereum address format check                                             │
│  • Required fields validation                                                │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          Layer 4: Business Logic                             │
│  • Check if NFT already sold (database)                                      │
│  • Verify server owns the NFT (blockchain)                                   │
│  • Verify payment amount (optional)                                          │
│  • Duplicate purchase prevention                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          Layer 5: Blockchain Security                        │
│  • Smart contract validation                                                 │
│  • Ownership verification                                                    │
│  • Transaction signing with private key (server-side only)                   │
│  • Gas estimation and validation                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          Layer 6: Database Security                          │
│  • Row Level Security (RLS) policies                                         │
│  • Service role key for backend access                                       │
│  • Indexed queries for performance                                           │
│  • Unique constraints on tx_hash                                             │
└─────────────────────────────────────────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════════════════

                              DATA FLOW

═══════════════════════════════════════════════════════════════════════════════

NFT Data Flow:
┌──────────────┐
│   OpenSea    │  (Read NFT metadata)
│     API      │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Backend    │  (Fetch NFTs, add sold status)
│   Service    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Frontend   │  (Display NFTs with Buy buttons)
│     UI       │
└──────────────┘

Purchase Data Flow:
┌──────────────┐
│     User     │  (Initiates purchase)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   MetaMask   │  (Signs payment transaction)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Polygon    │  (Processes payment)
│   Network    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Backend    │  (Transfers NFT, records purchase)
│   Server     │
└──────┬───────┘
       │
       ├──────────────────┐
       │                  │
       ▼                  ▼
┌──────────────┐   ┌──────────────┐
│   Polygon    │   │   Supabase   │
│   Network    │   │   Database   │
│ (NFT Transfer)   │  (Record)    │
└──────────────┘   └──────────────┘
```

---

**Key Points:**

1. **Private Key Security**: Private key is ONLY on backend, never exposed to frontend
2. **Multi-Layer Validation**: 6 layers of security checks
3. **Atomic Operations**: Purchase is all-or-nothing (transfer + record)
4. **Real-time Updates**: UI updates immediately after successful purchase
5. **Transparent Pricing**: Live MATIC conversion shown to user
6. **Transaction Proof**: PolygonScan link for verification
