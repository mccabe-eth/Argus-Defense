# libp2p Integration

P2P networking layer for decentralized stream distribution.

## Components

- **p2pNode.mjs** - Core libp2p node (TCP, GossipSub, KadDHT)
- **streamPublisher.mjs** - Publish streams to P2P network
- **streamSubscriber.mjs** - Subscribe to stream topics
- **streamDirectory.mjs** - Global discovery via pubsub

## Topics

```
argus-defense/stream-directory   # Stream discovery
argus-defense/stream/<id>        # Individual streams
```

## Message Types

**Directory:**
- `ANNOUNCE` - New stream available
- `HEARTBEAT` - Keep alive (30s)
- `DEREGISTER` - Stream offline
- `QUERY` - Request streams
- `RESPONSE` - Stream list

**Stream:**
- `metadata` - Stream info
- `audio` - Audio chunk (base64)
- `end` - Stream finished

## Usage

```javascript
// Backend
import { createP2PNode } from './p2pNode.mjs';
const node = await createP2PNode();

// Frontend
import { createBrowserNode } from '~/lib/libp2p/browserNode';
const node = await createBrowserNode();
```

## Configuration

```javascript
// Backend: TCP + WebSockets
transports: [tcp(), webSockets()]

// Frontend: WebRTC + WebSockets + WebTransport
transports: [webRTC(), webSockets(), webTransport()]
```
