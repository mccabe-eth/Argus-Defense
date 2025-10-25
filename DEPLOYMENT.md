# Argus Defense - Deployment Guide

## What Is This?

Argus Defense is a **fully decentralized P2P app** for streaming emergency radio. No central servers, no censorship.

- **Backend nodes** = Publish radio streams to libp2p network
- **Frontend (IPFS)** = Static website that runs as P2P node in your browser
- **Discovery** = Nodes find each other automatically via GossipSub pubsub

## Quick Start (Local Testing)

```bash
# 1. Start Backend (publishes streams to P2P network)
cd Backend
npm install
./start-p2p.sh

# 2. Start Frontend (in a new terminal)
cd Frontend/nextjs
npm install
npm run dev

# 3. Visit http://localhost:3000/streams
# You should see streams appear within 30 seconds
```

**Troubleshooting:** If you see "No streams discovered":
- Check backend is running: `curl http://localhost:3001/health`
- Verify streams exist: `cat Backend/openmhz/streams.json`
- Check logs for errors

## Production Deployment

### Step 1: Deploy Backend Nodes

Run on a server with public IP. Port 9001 must be open.

```bash
cd Backend
npm install

# Enable auto-publishing
export LIBP2P_AUTO_PUBLISH=true
export LIBP2P_AUTO_PUBLISH_LIMIT=5

node apiServer.js
```

**Recommended:** Run 3+ backend nodes on different servers for redundancy.

### Step 2: Deploy Frontend to IPFS

```bash
cd Frontend/nextjs
npm install

# Build for IPFS
export NEXT_PUBLIC_IPFS_BUILD=true
npm run build

# Deploy to IPFS (option 1: auto)
npm run ipfs

# Deploy to IPFS (option 2: manual)
ipfs add -r out
# Your site is now at: https://ipfs.io/ipfs/<CID>
```

**Alternative IPFS Services:**
- [Pinata](https://pinata.cloud) - Upload `/out` folder
- [Web3.Storage](https://web3.storage) - Upload `/out` folder
- [Fleek](https://fleek.co) - Auto-deploy from GitHub

### Step 3: Configure Bootstrap Peers

Update `Frontend/nextjs/lib/libp2p/browserNode.ts` with your backend IPs:

```typescript
bootstrap({
  list: [
    '/ip4/YOUR_SERVER_IP/tcp/9001/p2p/YOUR_PEER_ID',
    // Add more backend nodes here
  ]
})
```

Get your Peer ID by running: `curl http://localhost:3001/api/libp2p/status`

## How It Works

1. User loads website from IPFS
2. Browser starts libp2p node and connects to bootstrap peers
3. Browser subscribes to global directory topic: `argus-defense/stream-directory`
4. Backend nodes announce their streams via pubsub
5. User clicks "Listen P2P" and subscribes to stream topic
6. Backend streams audio chunks directly to browser via libp2p

## WebSockets vs WebRTC

We use **WebSockets only** (not WebRTC):
- No relay servers needed
- Browser connects directly to backend nodes
- Simpler and more reliable

For production, use `wss://` (secure WebSockets) with nginx/Caddy reverse proxy.

## Scaling

**Multiple Backend Nodes:**
- Redundancy if one goes down
- Geographic distribution for faster connections
- Load balancing across nodes

**Monitoring:**
```bash
curl http://localhost:3001/health                          # Health check
curl http://localhost:3001/api/libp2p/status               # Node status
curl http://localhost:3001/api/libp2p/streams              # Active streams
curl http://localhost:3001/api/libp2p/directory/discovered # Discovered streams
```

## Users Access Via:

- IPFS Gateway: `https://ipfs.io/ipfs/<CID>/streams`
- IPFS Domain: `https://<CID>.ipfs.dweb.link/streams`
- Brave Browser: `ipfs://<CID>/streams`
- ENS Domain: `https://yourdomain.eth` (after ENS setup)

## Next Steps

- [ ] Deploy 3+ backend nodes on public servers
- [ ] Build and upload frontend to IPFS
- [ ] Share IPFS CID with users
- [ ] Optional: Register ENS domain pointing to IPFS CID
- [ ] Optional: Set up SSL reverse proxy for backend nodes
