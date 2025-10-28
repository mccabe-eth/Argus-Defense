# Argus Defense

**Decentralized P2P Emergency Radio Streaming Platform**

ETHOnline Hackathon 2025

Censorship-resistant platform for streaming emergency radio using libp2p and blockchain-verified ownership.

## Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [Documentation](#documentation)
- [Development](#development)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [Commands](#commands)
- [Support](#support)

## Features

- **100% Decentralized** - libp2p P2P network, no central servers
- **Blockchain Verified** - StreamRegistry smart contract validates ownership
- **Real-time Streaming** - Live audio via GossipSub pubsub
- **Self-Paying Streams** - 60% publisher, 30% bandwidth, 10% DAO
- **IPFS Frontend** - Distributed, censorship-resistant UI

## Quick Start

```bash
# Install dependencies
yarn install

# Start local blockchain
yarn chain

# Deploy contracts
yarn deploy

# Register streams
yarn register:streams

# Set contract address
export STREAM_REGISTRY_CONTRACT=0x1291Be112d480055DaFd8a610b7d1e203891C274

# Test verification
node backend/scripts/testRegistryVerification.js

# Start backend + frontend
yarn dev:full

# Visit: http://localhost:3000/streams
```

## Architecture

```
Frontend (IPFS)
    ↓
libp2p Network (P2P Discovery)
    ↓
Backend Nodes (Anyone can run)
    ↓
StreamRegistry (Ethereum)
```

## Documentation

- **[QUICK_START.md](QUICK_START.md)** - Get running in 5 minutes

### Component Guides
- **[backend/README.md](backend/README.md)** - Backend publisher node
- **[backend/libp2p/README.md](backend/libp2p/README.md)** - P2P networking layer
- **[backend/openmhz/README.md](backend/openmhz/README.md)** - Stream ingestion from OpenMHz
- **[backend/sdr/README.md](backend/sdr/README.md)** - Local SDR capture
- **[frontend/README.md](frontend/README.md)** - Browser P2P client

### Technical Documentation
- **[Documents/ARCHITECTURE.md](Documents/ARCHITECTURE.md)** - System architecture and data flow
- **[Documents/DEPLOYMENT.md](Documents/DEPLOYMENT.md)** - Production deployment guide
- **[Documents/SMART_CONTRACTS.md](Documents/SMART_CONTRACTS.md)** - Smart contract integration
- **[Documents/INCENTIVES.md](Documents/INCENTIVES.md)** - Economic model and revenue splits
- **[Documents/DAILY_LOG.md](Documents/DAILY_LOG.md)** - Development history
- **[Documents/DELETE_COMMANDS.md](Documents/DELETE_COMMANDS.md)** - Cleanup guide for package.json

## Development

```bash
yarn dev:full          # Run everything
yarn p2p:start         # Backend only
yarn dev:frontend      # Frontend only
yarn p2p:diagnose      # Check system health
```

## Deployment

```bash
# Build for IPFS
yarn build:ipfs

# Deploy to IPFS
yarn deploy:ipfs

# Deploy backend to VPS
git clone <repo> && cd backend && yarn install
export STREAM_REGISTRY_CONTRACT=0x...
pm2 start apiServer.js
```

## Project Structure

```
/
├── backend/          # P2P publisher nodes
├── frontend/         # Browser-based P2P listeners
├── Documents/        # Technical documentation
└── Assets/           # Audio files
```

## Commands

| Command | Description |
|---------|-------------|
| `yarn chain` | Start local blockchain |
| `yarn deploy` | Deploy StreamRegistry |
| `yarn register:streams` | Register streams on-chain |
| `yarn dev:full` | Run backend + frontend |
| `yarn build:ipfs` | Build static site |
| `yarn deploy:ipfs` | Upload to IPFS |

## Support

- Issues: [GitHub Issues](https://github.com/mccabe-eth/Argus-Defense/issues)
- Docs: [QUICK_START.md](QUICK_START.md)

Built with Next.js, libp2p, Hardhat, and Ethereum.
