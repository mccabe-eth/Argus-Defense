# Argus Defense

**Fully Decentralized P2P Emergency Radio Streaming**

ETHOnline Hackathon 2025

A censorship-resistant platform for streaming emergency radio communications using libp2p. No central servers, no single point of failure.

## Features

- **100% Decentralized** - Runs on libp2p P2P network, no central servers
- **Censorship Resistant** - IPFS-hosted frontend, distributed backend nodes
- **Global Discovery** - Automatic stream discovery via GossipSub pubsub
- **Real-time Streaming** - Live audio streaming directly peer-to-peer
- **Emergency Focused** - Fire, Police, EMS radio communications
- **Web3 Integration** - Wallet support for stream monetization

## Quick Start (P2P Mode)

### 1. Start Backend (Publisher Node)

```bash
cd Backend
npm install
./start-p2p.sh
```

This starts a libp2p node that publishes radio streams to the P2P network.

### 2. Start Frontend (in new terminal)

```bash
cd Frontend/nextjs
npm install
npm run dev
```

### 3. Open Browser

Visit **http://localhost:3000/streams**

You should see streams appear within 30 seconds!

## How It Works

1. Backend nodes ingest radio streams from OpenMHz (or local SDR)
2. Backend announces streams to global directory via libp2p pubsub
3. Browsers start libp2p nodes and query the directory
4. Users click "Listen P2P" to subscribe to stream topics
5. Audio chunks stream directly peer-to-peer in real-time

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for full production deployment guide.

---

## Legacy Setup (Python + Node.js)

Argus Defense also includes legacy Python components for SDR capture and data processing.

### 1. Clone the Repository
```bash
git clone https://github.com/mccabe-eth/Argus-Defense.git
cd Argus-Defense
```

### 2. Run Setup Script
macOS / Linux
```bash
chmod +x setup.sh
source setup.sh
```

Windows (PowerShell)
```bash
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
./setup.ps1
```

These scripts will:

Create and activate a Python virtual environment (venv/)

Install all Python dependencies from requirements.txt

Install all Node.js dependencies from package.json

### 3. Verify Installation
Check Python Environment

Make sure your virtual environment is active:
```bash
which python
```

It should show a path like:
```bash
.../Argus-Defense/venv/bin/python
```

Then verify dependencies:
```bash
pip list
```

Check Node.js Environment

Verify Node.js version:
```bash
node -v
```

Confirm packages installed correctly:
```bash
yarn info --name-only
```

### 4. Run the Project

Run:
```bash
yarn chain
```

Open new terminal and run:
```bash
yarn deploy
```

Open new terminal and run:
```bash
yarn start
```

If your project includes a Python backend:
```bash
python app.py
```

Both should start without errors.

### 5. Verify Everything is Working

No errors or missing module warnings in the terminal.

Both Python and Node servers (if applicable) start correctly.

venv/ and node_modules/ exist locally but are not committed (check .gitignore).

### 6. Deactivate and Cleanup

When finished:
```bash
deactivate
```

To clean your environment completely:
```bash
rm -rf venv node_modules
```
