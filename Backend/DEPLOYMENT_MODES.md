# Argus Defense - Deployment Modes

## Overview

Argus Defense backend **auto-detects** your network environment and configures itself for optimal P2P connectivity.

## Three Deployment Modes

### 1. Full Node (Public IP) - VPS/Cloud
- **When**: Server has public IP, port 9001 accessible
- **Config**: Listen 0.0.0.0:9001, Announce PUBLIC_IP:9001
- **Setup**: `export LIBP2P_AUTO_PUBLISH=true && node apiServer.js`
- **Firewall**: `sudo ufw allow 9001/tcp`

### 2. Light Node (NAT) - Home/Corporate
- **When**: Behind NAT, no public IP
- **Config**: Uses circuit relay for NAT traversal
- **Setup**: `export LIBP2P_AUTO_PUBLISH=true && node apiServer.js`
- **Firewall**: None needed, works through relay

### 3. Browser (Frontend) - IPFS Static Site
- **When**: User opens frontend from IPFS
- **Config**: Temporary P2P node via WebSocket
- **Connection**: Browser → Bootstrap → Discovers streams

## Development vs Production

**Development** (localhost):
```bash
cd Backend && yarn api:dev
cd Frontend && yarn dev
# Frontend auto-detects localhost, uses HTTP API
```

**Production**:
```bash
# Backend: Deploy to VPS (auto-detects full node)
cd Backend && pm2 start apiServer.js

# Frontend: Deploy to IPFS
cd Frontend && yarn ipfs
# Uses pure P2P discovery
```

## Configuration

```bash
# Environment Variables
LIBP2P_AUTO_PUBLISH=true       # Enable auto-publishing
LIBP2P_PORT=9001               # P2P port (default: 9001)
LIBP2P_PUBLIC_IP=1.2.3.4       # Manual override (optional)
```

## Quick Start

**Full Node** (VPS): Automatically detected, port 9001 opened
**Light Node** (Home): Automatically detected, uses relay
**Update URLs**: Change `http://127.0.0.1:8080/ipfs/` to `https://dweb.link/ipfs/` in streams.json

## Verification

```bash
curl http://localhost:3001/api/libp2p/status
# Shows: mode, peerId, peers, activeStreams
```
