# Argus Defense - libp2p Integration Guide

This document explains how to use the libp2p integration for decentralized P2P streaming in Argus Defense.

## Overview

Your project now has a **hybrid architecture**:
- **Centralized**: Express API for metadata, listener tracking, and wallet operations
- **Decentralized**: libp2p pubsub for P2P audio stream distribution

## Installation

First, install the dependencies:

```bash
yarn install
```

This will install all the libp2p modules we added to your package.json files.

## Architecture

### Backend Components

1. **[backend/libp2p/p2pNode.mjs](backend/libp2p/p2pNode.mjs)** - Core libp2p node configuration
   - Creates and manages libp2p nodes
   - Configures pubsub (GossipSub)
   - Handles peer discovery via bootstrap nodes

2. **[backend/libp2p/streamPublisher.mjs](backend/libp2p/streamPublisher.mjs)** - Stream publisher
   - Publishes audio streams to libp2p topics
   - Supports OpenMHz streams and local SDR
   - Tracks listener counts and stats

3. **[backend/libp2p/streamSubscriber.mjs](backend/libp2p/streamSubscriber.mjs)** - Stream subscriber
   - Subscribes to stream topics
   - Receives and buffers audio chunks
   - Emits events for stream data

### Frontend Components

1. **[frontend/nextjs/lib/libp2p/browserNode.ts](frontend/nextjs/lib/libp2p/browserNode.ts)** - Browser libp2p node
   - Browser-compatible libp2p configuration
   - WebRTC, WebSockets, and WebTransport support
   - Topic subscription utilities

2. **[frontend/nextjs/hooks/useLibp2pStream.ts](frontend/nextjs/hooks/useLibp2pStream.ts)** - React hook
   - Manages libp2p connection lifecycle
   - Handles stream subscriptions
   - Buffers and plays audio

3. **[frontend/nextjs/components/Libp2pStreamPlayer.tsx](frontend/nextjs/components/Libp2pStreamPlayer.tsx)** - Player component
   - Ready-to-use stream player UI
   - Shows connection status, peer count, data stats
   - Play/pause controls

## Starting the System

### Terminal 1: Start the blockchain
```bash
yarn chain
```

### Terminal 2: Deploy contracts
```bash
yarn deploy
```

### Terminal 3: Start Express API (metadata/tracking)
```bash
cd backend
yarn api
```

### Terminal 4: Start libp2p Publisher (P2P streaming)
```bash
node backend/startPublisher.mjs
```

The publisher will start and make itself available globally for testing. You can then use:
- `publisher.publishOpenMhzStream(streamId, audioUrl, metadata)`
- `publisher.publishLocalSdrStream(streamId, metadata)`
- `publisher.getActiveStreams()`
- `publisher.stopStream(streamId)`

### Terminal 5: Start Frontend
```bash
yarn start
```
