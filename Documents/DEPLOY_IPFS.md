# Deploy to IPFS - Quick Guide

## 🔴 Fix: No Streams Showing

```bash
# Check what's wrong
cd backend && node debug-startup.js

# Start backend with auto-publish
LIBP2P_AUTO_PUBLISH=true node apiServer.js

# Watch for: "✅ Auto-published stream: ..."
```

## 🚀 Deploy to IPFS

### Build

```bash
# From project root
yarn build:ipfs

# Creates: Frontend/nextjs/out/
```

### Deploy

**Option 1: Automatic**
```bash
yarn deploy:ipfs
# Gets CID automatically
```

**Option 2: Manual IPFS**
```bash
cd Frontend/nextjs
ipfs add -r out
# Note the CID
```

**Option 3: Web Services**
- [Pinata](https://pinata.cloud) - Upload `/out` folder
- [Web3.Storage](https://web3.storage) - Upload `/out` folder
- [Fleek](https://fleek.co) - Auto-deploy from GitHub

### Access

```
https://ipfs.io/ipfs/YOUR_CID/streams
https://YOUR_CID.ipfs.dweb.link/streams
https://cloudflare-ipfs.com/ipfs/YOUR_CID/streams
```

## ⚠️ Backend Still Required!

IPFS = **Frontend only** (HTML/JS/CSS)

For streams to work:
1. Backend must run somewhere (your laptop/VPS)
2. Backend publishes streams to libp2p network
3. Frontend (IPFS) connects to backend via libp2p

### Run Backend Locally

```bash
cd backend
./start-p2p.sh

# Keep running - becomes P2P node
```

### Deploy Backend to VPS

```bash
# SSH to server
git clone https://github.com/you/Argus-Defense
cd Argus-Defense/backend
npm install

# Keep running with PM2
npm install -g pm2
pm2 start apiServer.js --name argus-backend
pm2 save
```

## 🧪 Test Workflow

```bash
# Terminal 1
cd backend && LIBP2P_AUTO_PUBLISH=true node apiServer.js

# Terminal 2
cd Frontend/nextjs && yarn dev

# Visit: http://localhost:3000/streams
# Should see 5 streams!
```

## ✅ Expected Results

**Backend logs:**
```
🚀 libp2p auto-publisher started
📡 Found 5 new stream(s)
✅ Auto-published stream: local-intro-001
```

**Frontend shows:**
- Connected Peers: 1+
- Discovered Streams: 5
- Click "Listen P2P" → audio plays

## 🔧 Troubleshooting

```bash
# No streams?
curl http://localhost:3001/api/libp2p/streams

# Connection failed?
curl http://localhost:3001/health

# Auto-diagnose
yarn p2p:diagnose
```

## 📋 Checklist

- [ ] Backend auto-publishes 5 streams
- [ ] Frontend discovers streams
- [ ] Audio plays
- [ ] IPFS build succeeds
- [ ] Can access via IPFS gateway
