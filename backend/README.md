# OpenSea API Proxy Backend

A secure Node.js backend that proxies requests to the OpenSea API, handling authentication and filtering NFTs by tier.

## 📁 Project Structure

```
backend/
│
├── server.js                    # Express server initialization
├── package.json                 # Dependencies and scripts
├── .env.example                 # Environment variables template
│
├── config/
│   └── env.js                  # Environment configuration & validation
│
├── routes/
│   └── nfts.js                 # NFT API routes
│
├── controllers/
│   └── nftController.js        # Request handlers
│
└── services/
    └── openseaService.js       # OpenSea API integration
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 16.0.0
- npm or yarn
- OpenSea API Key

### Installation

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   
   Create a `.env` file in the backend directory:
   ```bash
   copy .env.example .env
   ```
   
   Then edit the `.env` file with your actual values:
   ```env
   OPENSEA_API_KEY=your_opensea_api_key_here
   PORT=3001
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   ```

4. **Update Collection Slug:**
   
   In `backend/controllers/nftController.js`, replace `'your-collection-slug'` with your actual OpenSea collection slug on lines 15, 35, and 66.

### Running Locally

**Development mode (with auto-restart):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:3001`

### Testing the API

**Health check:**
```bash
curl http://localhost:3001/health
```

**Get all NFTs:**
```bash
curl http://localhost:3001/api/nfts
```

**Get NFTs by tier:**
```bash
curl http://localhost:3001/api/nfts/legendary
curl http://localhost:3001/api/nfts/ultra-rare
curl http://localhost:3001/api/nfts/rare
curl http://localhost:3001/api/nfts/common
```

**Get organized NFTs (all tiers):**
```bash
curl http://localhost:3001/api/nfts/organized
```

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server health check |
| GET | `/api/nfts` | Get all NFTs (up to 100) |
| GET | `/api/nfts/organized` | Get NFTs organized by tier |
| GET | `/api/nfts/:tier` | Get NFTs by specific tier |

### Tier Limits

- **LEGENDARY**: 5 items
- **ULTRA RARE**: 10 items
- **RARE**: 20 items
- **COMMON**: 65 items

## 🌐 Deploying to Render.com

### Step 1: Prepare Your Repository

1. **Initialize Git (if not already done):**
   ```bash
   cd backend
   git init
   git add .
   git commit -m "Initial backend setup"
   ```

2. **Create a `.gitignore` file:**
   ```
   node_modules/
   .env
   *.log
   ```

3. **Push to GitHub:**
   ```bash
   git remote add origin https://github.com/yourusername/yourrepo.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Deploy on Render

1. **Go to [Render.com](https://render.com) and sign in**

2. **Click "New +" → "Web Service"**

3. **Connect your GitHub repository**

4. **Configure the service:**
   - **Name**: `opensea-api-proxy` (or your preferred name)
   - **Environment**: `Node`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: `backend` (if backend is in a subdirectory)
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free or paid (depending on your needs)

5. **Add Environment Variables:**
   
   In the "Environment" section, add:
   - `OPENSEA_API_KEY` = `042h6kuDGFtqSwdXNKJFoMRXqSswkhrPK5lhkwPqd6ASNdTH`
   - `NODE_ENV` = `production`
   - `FRONTEND_URL` = `https://your-frontend-domain.com`
   - `PORT` = `3001` (optional, Render sets this automatically)

6. **Click "Create Web Service"**

7. **Wait for deployment** (usually takes 2-3 minutes)

8. **Your API will be live at:** `https://your-service-name.onrender.com`

### Step 3: Update Frontend

Update your frontend to use the Render URL:
```javascript
const API_URL = 'https://your-service-name.onrender.com/api';
```

## 🔒 Security Features

- ✅ API key stored in environment variables (never exposed to frontend)
- ✅ CORS configured to only accept requests from your frontend
- ✅ Environment variable validation on startup
- ✅ Error handling that doesn't leak sensitive information
- ✅ `.env` file excluded from version control

## 🛠️ Customization

### Change Collection

To fetch NFTs from a different OpenSea collection, update the `collectionSlug` in:
- `backend/controllers/nftController.js` (lines 15, 35, 66)

Or pass it as a query parameter:
```
/api/nfts?collection=your-collection-slug
```

### Adjust Tier Limits

Edit the limits in `backend/services/openseaService.js`:
```javascript
const tierLimits = {
  'legendary': 5,      // Change this
  'ultra-rare': 10,    // Change this
  'rare': 20,          // Change this
  'common': 65         // Change this
};
```

## 📝 Response Format

All successful responses follow this format:
```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "id": "1234",
      "name": "NFT Name",
      "image": "https://...",
      "tier": "LEGENDARY",
      "traits": [...],
      "description": "...",
      "opensea_url": "https://opensea.io/assets/..."
    }
  ]
}
```

## 🐛 Troubleshooting

**Port already in use:**
```bash
# Change PORT in .env file
PORT=3002
```

**Missing environment variables:**
```
Error: Missing required environment variables: OPENSEA_API_KEY
```
Solution: Check your `.env` file exists and contains all required variables.

**OpenSea API errors:**
- Verify your API key is correct
- Check OpenSea API status
- Ensure collection slug is correct

## 📚 Dependencies

- **express**: Web server framework
- **cors**: Cross-origin resource sharing
- **dotenv**: Environment variable management
- **axios**: HTTP client for OpenSea API
- **nodemon**: Development auto-reload (dev only)

## 📄 License

ISC
