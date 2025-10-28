# Frontend - Browser P2P Client

Next.js application that runs as a libp2p node in the browser.

## Quick Start

```bash
# From project root
yarn dev:frontend

# Or manually
cd frontend
yarn install
yarn dev

# Visit: http://localhost:3000/streams
```

## Features

- **P2P Discovery** - Browser discovers streams via libp2p
- **Audio Streaming** - Real-time audio playback from P2P network
- **Wallet Integration** - RainbowKit + wagmi for Web3
- **IPFS Ready** - Static export for decentralized hosting

## Key Pages

- `/` - Landing page
- `/streams` - Stream discovery and playback
- `/dashboard` - Threat intelligence dashboard
- `/governance` - DAO governance interface

## Build for IPFS

```bash
# From project root
yarn build:ipfs
yarn deploy:ipfs

# Access at: https://ipfs.io/ipfs/<CID>/streams
```

## Configuration

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_IPFS_BUILD=false
NEXT_PUBLIC_STREAM_REGISTRY=0x...
```

## Development

```bash
yarn dev          # Start dev server
yarn build        # Production build
yarn lint         # Run ESLint
yarn format       # Format with Prettier
```

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- libp2p (browser)
- RainbowKit + wagmi
- Zustand (state)
