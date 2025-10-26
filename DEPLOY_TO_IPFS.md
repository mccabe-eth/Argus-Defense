# Deploy to IPFS - Complete Guide

## 🎯 Goal

Publish your frontend to IPFS so anyone can access it via `https://ipfs.io/ipfs/<CID>/streams`

## 📋 Prerequisites

```bash
yarn install
```

## 🚀 Deployment Steps

### Step 1: Build for IPFS

```bash
# From project root
yarn build:ipfs

# This creates: Frontend/nextjs/out/
```

### Step 2: Deploy to IPFS

**Option A: Automatic (Recommended)**

```bash
yarn deploy:ipfs

# Output: 🚀 Your site is at: https://ipfs.io/ipfs/Qm.../streams
```

**Option B: Manual (IPFS CLI)**

```bash
# Install IPFS CLI: https://docs.ipfs.tech/install/command-line/

cd Frontend/nextjs
ipfs add -r out

# Copy the CID (starts with Qm...)
# Visit: https://ipfs.io/ipfs/<CID>/streams
```

**Option C: Web Services**

1. **Pinata** (https://pinata.cloud)
   - Sign up → Upload folder
   - Select `Frontend/nextjs/out`
   - Get CID

2. **Web3.Storage** (https://web3.storage)
   - Sign up → Upload folder
   - Select `Frontend/nextjs/out`
   - Get CID

3. **Fleek** (https://fleek.co)
   - Connect GitHub
   - Auto-deploy on push
   - Gets domain + CID

### Step 3: Access Your Site

```bash
# IPFS Gateway
https://ipfs.io/ipfs/<CID>/streams

# Faster gateway
https://<CID>.ipfs.dweb.link/streams

# Cloudflare
https://cloudflare-ipfs.com/ipfs/<CID>/streams
```

## ⚠️ Important: Backend Still Required!

**IPFS only hosts the frontend (HTML/JS/CSS)**

For streams to work, you need:

### Local Testing

```bash
# Keep backend running
yarn p2p:start

# Users connect to your local node
```

### Production

Deploy backend to a server:

```bash
# SSH to VPS
git clone https://github.com/you/Argus-Defense
cd Argus-Defense/backend
npm install

# Run with PM2
npm install -g pm2
pm2 start apiServer.js --name argus-backend
pm2 save
pm2 startup
```

Update `Frontend/nextjs/lib/libp2p/browserNode.ts`:

```typescript
peerDiscovery: [
  bootstrap({
    list: [
      '/ip4/YOUR_SERVER_IP/tcp/9001/p2p/YOUR_PEER_ID',
      // Add more backend nodes
    ]
  })
]
```

## 🧪 Test Deployment

```bash
# 1. Start backend locally
yarn p2p:start

# 2. Visit IPFS site
# https://ipfs.io/ipfs/<CID>/streams

# 3. Should see streams!
```

## 📊 Expected Flow

```
User visits IPFS site
  ↓
Loads HTML/JS from IPFS (distributed)
  ↓
Browser becomes libp2p node
  ↓
Connects to your backend via WebSockets
  ↓
Discovers streams via pubsub
  ↓
Plays audio P2P!
```

## ✅ Success Checklist

- [ ] Built frontend: `yarn build:ipfs`
- [ ] Deployed to IPFS
- [ ] Got CID (like Qm...)
- [ ] Can access via gateway
- [ ] Backend running somewhere
- [ ] Streams appear on IPFS site

## 🌐 Optional: Custom Domain

### Using ENS

```bash
# Register ENS domain (e.g., argus-defense.eth)
# Point ContentHash to: ipfs://<CID>
# Access via: https://argus-defense.eth
```

### Using DNS + IPFS

```bash
# Add DNS TXT record:
# _dnslink.yourdomain.com TXT "dnslink=/ipfs/<CID>"

# Access via:
# https://yourdomain.com
```

## 🔄 Update Deployment

```bash
# Make changes to frontend
# Rebuild and redeploy
yarn build:ipfs
yarn deploy:ipfs

# Get NEW CID
# Share new link!
```

---

**Next:** See [BACKEND_DEMO.md](BACKEND_DEMO.md) for running a publisher node
