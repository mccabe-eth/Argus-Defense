# Architecture Overview

Argus Defense is a fully decentralized P2P emergency radio streaming platform.

## Components

### Backend (Publisher Nodes)
- **libp2p Node** - TCP transport, GossipSub pubsub, KadDHT discovery
- **Stream Publisher** - Publishes audio to P2P topics
- **Directory Service** - Announces streams via pubsub
- **Express API** - REST endpoints for metadata

### Frontend (Browser Clients)
- **Next.js App** - Static export for IPFS hosting
- **libp2p Browser Node** - WebRTC/WebSockets/WebTransport
- **Stream Discovery** - Queries P2P directory
- **Audio Player** - Real-time P2P audio playback

### Smart Contracts
- **StreamRegistry** - On-chain stream ownership registry
- **StreamWalletV2** - Self-paying wallets with revenue split
- **StreamFactory** - One-click stream + wallet deployment

## Data Flow

### Stream Discovery
```
1. Backend publishes stream
2. Sends ANNOUNCE to argus-defense/stream-directory
3. Browser subscribes to directory topic
4. Browser sends QUERY message
5. Backend responds with stream list
6. Browser displays discovered streams
```

### Audio Streaming
```
1. User clicks "Listen P2P"
2. Browser subscribes to argus-defense/stream/<id>
3. Backend publishes audio chunks
4. Browser receives + buffers audio
5. Audio plays in real-time
```

### Wallet Verification
```
1. Load stream from streams.json
2. Compute streamId = keccak256(systemId, talkgroupId, callId)
3. Query StreamRegistry.getWallet(streamId)
4. Replace JSON wallet with contract wallet
5. Display verified wallet to user
```

## P2P Topics

- `argus-defense/stream-directory` - Global stream discovery
- `argus-defense/stream/<id>` - Individual stream audio

## Message Types

**Directory:**
- ANNOUNCE - New stream available
- HEARTBEAT - Keep alive (every 30s)
- DEREGISTER - Stream going offline
- QUERY - Request stream list
- RESPONSE - Stream list reply

**Stream:**
- metadata - Stream information
- audio - Audio chunk (base64 encoded)
- end - Stream finished

## Tech Stack

**Backend:**
- Node.js, Express
- libp2p (TCP, WebSockets, GossipSub, KadDHT, yamux)
- Hardhat, ethers.js

**Frontend:**
- Next.js 15, React, TypeScript
- libp2p (WebRTC, WebSockets, WebTransport)
- RainbowKit, wagmi, viem
- Tailwind CSS, Zustand

**Contracts:**
- Solidity ^0.8.20
- OpenZeppelin (AccessControl, ReentrancyGuard)

## Network Topology

```
Browser Clients (WebRTC/WSS)
         ↓
    libp2p Network
         ↓
Backend Nodes (TCP/WSS)
         ↓
   Ethereum Mainnet
  (StreamRegistry)
```

## Security

- **Access Control** - Role-based permissions (DAO, Admin, Registrar)
- **Checksum Validation** - All addresses checksummed
- **Reentrancy Guards** - Payment protection
- **Event Logging** - All state changes logged
- **Input Validation** - Required checks on all inputs

## Economics

**Revenue Split:**
- 60% → Publisher
- 30% → Bandwidth Providers
- 10% → DAO Treasury

**Price:** ~0.0001 ETH/minute (~$0.20/hour at $2000 ETH)

## Decentralization

- **No Central Server** - Pure P2P discovery and streaming
- **No Central Registry** - Blockchain-based ownership
- **No Single Point of Failure** - Multiple backend nodes
- **Censorship Resistant** - IPFS frontend, P2P backend
- **Self-Organizing** - Automatic peer discovery
