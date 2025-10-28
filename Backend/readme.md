# Backend - P2P Publisher Node

Publishes emergency radio streams to the libp2p network with blockchain verification.

## Quick Start

```bash
# From project root
yarn p2p:start

# Or manually
cd backend
yarn install
LIBP2P_AUTO_PUBLISH=true node apiServer.js
```

## Components

- **[libp2p/](libp2p/)** - P2P networking layer
- **[openmhz/](openmhz/)** - OpenMHz stream ingestion
- **[sdr/](sdr/)** - Local SDR capture scripts
- **[contracts/](contracts/)** - Smart contracts (StreamRegistry)
- **[scripts/](scripts/)** - Deployment and management

## API Endpoints

```
GET  /health                  # Health check
GET  /api/streams             # All streams
GET  /api/libp2p/status       # P2P node info
GET  /api/libp2p/streams      # Active P2P streams
POST /api/listen/start        # Track listener
POST /api/listen/stop         # Stop tracking
```

## Configuration

```bash
# .env
LIBP2P_AUTO_PUBLISH=true
LIBP2P_AUTO_PUBLISH_LIMIT=5
API_PORT=3001
STREAM_REGISTRY_CONTRACT=0x...
ETH_RPC_URL=http://localhost:8545
```

## Smart Contracts

```bash
# Deploy
yarn chain
yarn deploy

# Register streams
yarn register:streams

# Verify
node scripts/testRegistryVerification.js
```

## See Also

- [libp2p/README.md](libp2p/README.md) - P2P networking
- [openmhz/README.md](openmhz/README.md) - Stream ingestion
- [sdr/README.md](sdr/README.md) - SDR capture
