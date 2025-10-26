# Argus Defense - Technical Guide

## Architecture Overview

### Components

1. **StreamRegistry.sol** - On-chain source of truth for stream ownership
2. **StreamWalletV2.sol** - Self-paying wallets with revenue distribution
3. **StreamFactory.sol** - One-click stream creation + wallet deployment
4. **Backend P2P Nodes** - Publish streams via libp2p
5. **Frontend (IPFS)** - Browser becomes P2P node, discovers streams

### Tech Stack

**Smart Contracts:**
- Solidity ^0.8.20
- Hardhat deployment
- OpenZeppelin (access control, security)

**Backend:**
- Node.js
- libp2p (TCP transport, GossipSub)
- yamux (stream multiplexing)

**Frontend:**
- Next.js (static export)
- libp2p (WebSocket transport)
- React + TypeScript

## P2P Network

### Topics

```javascript
// Global directory (discovery)
'argus-defense/stream-directory'

// Individual streams
'argus-defense/stream/<streamId>'
```

### Message Types

**Directory Messages:**
- `ANNOUNCE` - Backend announces new stream
- `HEARTBEAT` - Every 30s to stay alive
- `DEREGISTER` - Remove stream
- `QUERY` - Browser requests streams
- `RESPONSE` - Backend sends stream list

**Stream Messages:**
- `metadata` - Stream info
- `audio` - Audio chunk (base64)
- `end` - Stream finished

### Discovery Flow

```
1. Backend publishes stream
   ↓
2. Sends ANNOUNCE to directory topic
   ↓
3. Browser subscribes to directory
   ↓
4. Browser sends QUERY
   ↓
5. Backend responds with stream list
   ↓
6. Browser subscribes to stream topic
   ↓
7. Audio chunks flow P2P
```

## Smart Contracts

### StreamRegistry

**Purpose:** On-chain registry of streams and wallets

**Key Functions:**
```solidity
computeStreamId(systemId, talkgroupId, callId) → bytes32
getWallet(streamId) → address
registerStream(systemId, talkgroupId, callId, wallet)
```

**Access Control:**
- `DEFAULT_ADMIN_ROLE` - Grant/revoke roles
- `DAO_ROLE` - Register streams
- `REGISTRAR_ROLE` - Reserved

### StreamWalletV2

**Purpose:** Self-paying wallet with automatic revenue split

**Revenue Distribution:**
```
Payment (100%)
  ├─ Publisher (60%)
  ├─ Bandwidth Providers (30%)
  └─ DAO Treasury (10%)
```

**Key Functions:**
```solidity
payForListening(minutes) payable  // Listener pays
recordBandwidth(provider, bytes_)  // Track contributions
getMetrics() → (earnings, listeners, minutes, providers)
getPricePerMinute() → 0.0001 ETH
```

### StreamFactory

**Purpose:** Automated stream + wallet deployment

**Flow:**
```
createStream(systemId, talkgroupId, callId)
  ↓
1. Deploy StreamWallet
  ↓
2. Register in StreamRegistry
  ↓
3. Return streamId + walletAddress
```

## Backend Integration

### Stream Publishing

```javascript
// Auto-publish on startup
const publisher = new StreamPublisher();
await publisher.start();

// Reads streams.json, publishes each stream
const streams = loadStreamsData();
for (const stream of streams) {
  await publisher.publishOpenMhzStream(
    stream.stream_id,
    stream.audio_url,
    stream.metadata
  );
}
```

### Wallet Verification

```javascript
const { createRegistryClient } = require('./contracts/streamRegistryIntegration');

const registry = createRegistryClient();

// Verify wallet against blockchain
const result = await registry.verifyStreamWallet(stream);

if (!result.match) {
  // JSON was tampered! Use blockchain wallet instead
  stream.wallet.address = result.contractWallet;
}
```

### Bandwidth Tracking

```javascript
// Track bytes relayed
pubsub.addEventListener('message', async (evt) => {
  const bytes = evt.detail.data.length;
  bandwidthStats[peer] += bytes;

  // Report to contract every 1GB
  if (bandwidthStats[peer] > 1_000_000_000) {
    await streamWallet.recordBandwidth(peer, bandwidthStats[peer]);
    bandwidthStats[peer] = 0;
  }
});
```

## Frontend Integration

### Browser P2P Node

```typescript
import { createBrowserNode } from '~/lib/libp2p/browserNode';

const node = await createBrowserNode();
// Now browser is a P2P node!
```

### Stream Discovery

```typescript
import { BrowserStreamDirectory } from '~/lib/libp2p/streamDirectory';

const directory = new BrowserStreamDirectory(node);
await directory.start();

// Query for streams
const streams = await directory.queryStreams();
```

### Payment Integration

```typescript
const streamWallet = new ethers.Contract(
  stream.wallet.address,
  STREAM_WALLET_ABI,
  signer
);

// Pay for 30 minutes
const pricePerMinute = await streamWallet.getPricePerMinute();
await streamWallet.payForListening(30, {
  value: pricePerMinute * 30n
});
```

## Deployment

### Contracts

```bash
# Local testing
yarn chain
yarn deploy

# Mainnet
yarn deploy --network mainnet
```

### Backend Node

```bash
# Development
yarn p2p:start

# Production (PM2)
pm2 start backend/apiServer.js --name argus-backend
pm2 save
```

### Frontend (IPFS)

```bash
# Build
yarn build:ipfs

# Deploy
yarn deploy:ipfs

# Or manual
ipfs add -r Frontend/nextjs/out
```

## Environment Variables

```bash
# Backend
LIBP2P_AUTO_PUBLISH=true
LIBP2P_AUTO_PUBLISH_LIMIT=5
API_PORT=3001
STREAM_REGISTRY_CONTRACT=0x...
ETH_RPC_URL=http://localhost:8545

# Frontend
NEXT_PUBLIC_IPFS_BUILD=true
NEXT_PUBLIC_STREAM_REGISTRY=0x...
```

## Gas Optimization

**Batch Operations:**
```solidity
// Instead of multiple registerStream() calls
registerStreamBatch(systemIds[], talkgroupIds[], callIds[], wallets[])
// Saves ~60% gas
```

**Event Indexing:**
```solidity
event StreamCreated(
  bytes32 indexed streamId,  // Indexed for fast lookup
  address indexed publisher,
  address wallet
);
```

## Security Considerations

1. **Checksum Validation** - All addresses checksummed
2. **Reentrancy Guards** - On payment functions
3. **Access Control** - Role-based permissions
4. **Input Validation** - Require statements
5. **Event Logging** - All state changes logged

## Testing

```bash
# Smart contracts
yarn hardhat test

# Backend integration
node backend/scripts/testRegistryVerification.js

# Full system
yarn dev:full
curl http://localhost:3001/health
```

---

**For more:** See smart contract source code in `backend/contracts/`
