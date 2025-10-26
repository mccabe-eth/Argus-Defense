# Backend Publisher Demo

## 🎯 Publish Your Stream

### Quick Demo

```bash
# 1. Start blockchain
yarn chain

# 2. Deploy contracts (new terminal)
yarn deploy

# 3. Add audio
cp your-audio.mp3 Assets/

# 4. Publish (deploys wallet + registers)
yarn hardhat run scripts/publishNewStream.js --args "your-audio.mp3"

# 5. Start backend
yarn p2p:start

# 6. Start frontend
yarn dev:frontend

# Visit: http://localhost:3000/streams
```

## ✅ What Happens

1. StreamWallet deployed on blockchain
2. Stream registered (verified, tamper-proof)
3. Auto-published to P2P network
4. Ready to earn: 60% publisher, 30% bandwidth, 10% DAO

## 🧪 Verify It Works

```bash
# Check wallet verified
curl http://localhost:3001/api/streams | jq '.streams[0].wallet'

# Check P2P publishing
curl http://localhost:3001/api/libp2p/streams

# Test verification
node backend/scripts/testRegistryVerification.js
```

## 🌐 Production

```bash
# Deploy backend to VPS
git clone https://github.com/you/Argus-Defense
cd Argus-Defense/backend
npm install
export STREAM_REGISTRY_CONTRACT=0x...
pm2 start apiServer.js

# Deploy frontend to IPFS
yarn build:ipfs
yarn deploy:ipfs
```

**Done! You're running a decentralized radio station.**
