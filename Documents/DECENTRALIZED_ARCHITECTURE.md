# Argus Defense - Fully Decentralized P2P Architecture

## 🌐 Overview

Every instance (backend/browser) runs as a libp2p node. No central servers, no databases, pure peer-to-peer.

## 🏗️ Core Components

### Backend
- **`libp2p/p2pNode.mjs`** - libp2p node with gossipsub, KadDHT, TCP
- **`libp2p/streamDirectory.mjs`** - Global directory via pubsub topic
- **`libp2p/streamPublisher.mjs`** - Publishes streams + auto-announces

### Frontend
- **`lib/libp2p/browserNode.ts`** - Browser libp2p (WebRTC/WebSockets/WebTransport)
- **`lib/libp2p/streamDirectory.ts`** - P2P stream discovery
- **`components/StreamPlayer.tsx`** - Pure P2P audio playback
- **`app/streams/page.tsx`** - P2P-only UI (no API calls)

## 🔄 How It Works

### Publishers (Backend)
```
1. Start libp2p node
2. Join global directory: argus-defense/stream-directory
3. Publish stream to: argus-defense/stream/<id>
4. Announce to directory (with heartbeats every 30s)
5. Deregister on shutdown
```

### Listeners (Browser)
```
1. Load /streams → Start libp2p browser node
2. Subscribe to global directory
3. Query network for streams (pure P2P)
4. Display discovered streams
5. Click "Listen" → Subscribe to stream topic
6. Receive + play audio via P2P
```

## 📡 Directory Protocol

**Topic:** `argus-defense/stream-directory`

**Messages:**
- `ANNOUNCE` - Stream available
- `HEARTBEAT` - Keep alive (30s interval)
- `DEREGISTER` - Stream offline
- `QUERY` - Request streams
- `RESPONSE` - Reply with streams

**Auto-cleanup:** Stale streams removed after 2 minutes

## 🚀 Running Nodes

**Backend Publisher:**
```bash
cd Backend && node apiServer.js
```

**Frontend Listener:**
```bash
cd Frontend/nextjs && yarn dev
# Open: http://localhost:3000/streams
```

## ✅ Features

- **100% Decentralized** - No servers, no central registry
- **Self-Organizing** - Peers discover each other automatically
- **Censorship Resistant** - No single point of failure
- **Browser Native** - Works directly in browsers (WebRTC)
- **Real-Time** - Live updates via gossipsub
- **Privacy** - No accounts, no tracking, ephemeral peer IDs

## 🔮 Next: Smart Contracts

Smart contracts will add trust layer:
- Verify stream ownership
- Manage wallets
- Distribute rewards automatically
- Reputation system

**Current:** Fully decentralized P2P ✅
**Next:** Add blockchain verification layer

---
**Built with:** libp2p, Next.js, TypeScript
**Status:** Production Ready (P2P Core)
