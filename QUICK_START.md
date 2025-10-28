# Quick Start Guide

## 🚀 Getting Started

Follow these steps to run the full Argus Defense platform:

```bash
# 1. Install dependencies
yarn install

# 2. Start local blockchain (Terminal 1)
yarn chain

# 3. Deploy smart contracts (Terminal 2)
yarn deploy

# 4. Register streams to the contract (Terminal 2)
yarn register:streams

# 5. Set the contract address (Terminal 2)
export STREAM_REGISTRY_CONTRACT=0x1291Be112d480055DaFd8a610b7d1e203891C274

# 6. Test registry verification (Terminal 2)
node backend/scripts/testRegistryVerification.js

# 7. Start backend + frontend (Terminal 3)
yarn dev:full

# 8. Visit: http://localhost:3000/streams
```

## 📋 All Commands

```bash
# Run both backend + frontend
yarn dev:full

# Or run separately:
yarn p2p:start      # Backend only
yarn dev:frontend   # Frontend only

# Diagnostics
yarn p2p:diagnose   # Check if working
yarn p2p:test       # Test auto-publish

# Blockchain
yarn chain          # Start local blockchain
yarn deploy         # Deploy smart contracts
yarn register:streams  # Register streams to StreamRegistry contract
```

## 💰 Publish a New Stream

```bash
# 1. Start blockchain (Terminal 1)
yarn chain

# 2. Deploy contracts (Terminal 2)
yarn deploy

# 3. Add your audio file
cp your-audio.mp3 Assets/

# 4. Publish stream
yarn hardhat run scripts/publishNewStream.js --args "your-audio.mp3"

# 5. Start backend (Terminal 3)
yarn p2p:start

# 6. Start frontend (Terminal 4)
yarn dev:frontend

# Visit: http://localhost:3000/streams
```

**What happens:**
- ✅ Stream registered on blockchain
- ✅ StreamWallet deployed (earns money)
- ✅ Verified wallet (tamper-proof)
- ✅ Auto-published to P2P
- ✅ 60% to publisher, 30% bandwidth, 10% DAO

## 🧪 Test Streams

Your 5 test streams are in `Assets/`:
1. Argus Defense - Introduction
2. Argus Defense - Project Mission
3. Argus Defense - Secure Platform
4. Argus Defense - Data Aggregation
5. Argus Defense - Scaling Protection

These auto-publish when backend starts!

## 🔍 Verify It's Working

```bash
# Check backend health
curl http://localhost:3001/health

# Check streams publishing
curl http://localhost:3001/api/libp2p/streams

# Check audio accessible
curl -I http://localhost:3001/assets/Argus%20Defense%20-%20Introduction%201.mp3

# Full diagnostics
yarn p2p:diagnose
```

## 🐛 Troubleshooting

**No streams showing?**
```bash
yarn p2p:diagnose
```

**Backend not starting?**
```bash
cd backend
node debug-startup.js
```

**Audio not playing?**
- Check browser console for errors
- Verify file exists: `ls Assets/`

## 📦 Install Dependencies

```bash
# Install all
yarn install

# Or individually
cd frontend && yarn install
cd ../../backend && yarn install
```

## 🌐 Deploy to IPFS

```bash
# Build for IPFS
yarn build:ipfs

# Deploy
yarn deploy:ipfs

# Your site: https://ipfs.io/ipfs/<CID>/streams
```

---

**Next:** See [CONTRACT_GUIDE.md](CONTRACT_GUIDE.md) for smart contracts
