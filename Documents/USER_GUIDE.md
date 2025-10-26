# Argus Defense - User Guide

## What Is This?

**Argus Defense** is a fully decentralized emergency radio streaming platform. No central servers, no censorship, powered by blockchain and P2P technology.

## Quick Start

```bash
# Run everything
yarn install
yarn dev:full

# Visit: http://localhost:3000/streams
```

## How It Works

### For Listeners

1. Visit website (on IPFS or localhost)
2. Browser becomes a P2P node automatically
3. Discovers streams from the network
4. Click "Listen P2P" to stream audio
5. Optionally pay to support publishers

### For Publishers

1. Add audio file to `Assets/`
2. Run publish script (deploys wallet on blockchain)
3. Start backend node (publishes to P2P network)
4. Earn 60% of listener payments automatically

### Architecture

```
Your Browser (P2P Node)
    ↓
libp2p Network (Decentralized)
    ↓
Backend Nodes (Anyone can run)
    ↓
Ethereum Blockchain (Source of truth)
```

## Key Features

### 1. Decentralized Discovery
- No central registry
- Streams announce via pubsub
- Automatic peer discovery

### 2. Blockchain Verified
- Stream ownership on Ethereum
- Tamper-proof wallet addresses
- Smart contracts handle payments

### 3. Self-Paying Streams
- Listeners pay per minute
- 60% → Publisher
- 30% → Bandwidth providers
- 10% → DAO treasury

### 4. Censorship Resistant
- Frontend on IPFS (distributed)
- Backend nodes (anyone can run)
- No single point of failure

## Commands

```bash
# Development
yarn dev:full          # Run everything
yarn p2p:start         # Backend only
yarn dev:frontend      # Frontend only

# Blockchain
yarn chain             # Local blockchain
yarn deploy            # Deploy contracts

# Publishing
yarn hardhat run scripts/publishNewStream.js --args "audio.mp3"

# Testing
yarn p2p:diagnose      # Check if working
yarn p2p:test          # Test auto-publish

# Deployment
yarn build:ipfs        # Build for IPFS
yarn deploy:ipfs       # Upload to IPFS
```

## Troubleshooting

### No streams showing
```bash
yarn p2p:diagnose
# Check: Backend running? Auto-publish enabled?
```

### Connection failed
```bash
curl http://localhost:3001/health
# Backend must be running on port 3001
```

### Audio not playing
- Check browser console
- Verify file exists: `ls Assets/`
- Test URL: `http://localhost:3001/assets/filename.mp3`

## Where Is Everything?

```
Assets/                     # Your audio files
Backend/
  ├── contracts/           # Smart contracts
  ├── libp2p/             # P2P networking
  ├── openmhz/streams.json # Stream metadata
  └── scripts/            # Publishing scripts

Frontend/nextjs/
  ├── app/streams/        # Streams page
  ├── components/         # UI components
  └── lib/libp2p/         # Browser P2P code
```

## Economics

**Stream earning 3 ETH/day:**
- Publisher: 1.8 ETH (~$3600)
- Bandwidth nodes: 0.9 ETH (~$1800)
- DAO: 0.3 ETH (~$600)

**Price:** ~$0.20/hour at $2000 ETH

## Next Steps

1. **Test locally:** `yarn dev:full`
2. **Publish stream:** Add audio + run script
3. **Deploy contracts:** `yarn deploy`
4. **Deploy frontend:** `yarn deploy:ipfs`
5. **Run backend node:** On VPS for 24/7

---

**See Also:**
- [QUICK_START.md](../QUICK_START.md) - Quick commands
- [CONTRACT_GUIDE.md](CONTRACT_GUIDE.md) - Smart contracts
- [DEPLOYMENT.md](../DEPLOYMENT.md) - Production deployment
