# Deployment Guide

Complete guide for deploying Argus Defense to production.

## Local Testing

```bash
yarn install
yarn chain
yarn deploy
yarn register:streams
export STREAM_REGISTRY_CONTRACT=0x1291Be112d480055DaFd8a610b7d1e203891C274
node backend/scripts/testRegistryVerification.js
yarn dev:full
```

Visit: http://localhost:3000/streams

## Production Deployment

### 1. Deploy Smart Contracts

```bash
# Mainnet
yarn deploy --network mainnet

# Save contract address
export STREAM_REGISTRY_CONTRACT=0x...
```

### 2. Deploy Backend Nodes

Run on VPS with public IP (port 9001 open):

```bash
git clone https://github.com/mccabe-eth/Argus-Defense
cd backend
yarn install

# Configure
cat > .env << EOL
LIBP2P_AUTO_PUBLISH=true
LIBP2P_AUTO_PUBLISH_LIMIT=5
API_PORT=3001
STREAM_REGISTRY_CONTRACT=0x...
ETH_RPC_URL=https://mainnet.infura.io/v3/YOUR_KEY
EOL

# Run with PM2
yarn install -g pm2
pm2 start apiServer.js --name argus-backend
pm2 save
pm2 startup
```

Recommended: Run 3+ nodes on different servers for redundancy.

### 3. Deploy Frontend to IPFS

```bash
# First time deployment (initializes config + builds + uploads):
yarn ipfs
# Output: 🚀 Upload complete! Your site is now available at: https://community.bgipfs.com/ipfs/<CID>

# Subsequent deployments (faster, just builds + uploads):
yarn deploy:ipfs
# Output: CID and access URL
```

**What happens:**
- `yarn ipfs` (first time):
  - Initializes `.bgipfs.json` config file in frontend/
  - Builds static export optimized for IPFS (frontend/out/)
  - Uploads to BuildGuild IPFS service
  - Returns CID with formatted success message

- `yarn deploy:ipfs` (subsequent deploys):
  - Builds static export (assumes config already exists)
  - Uploads to IPFS
  - Returns CID

**Why IPFS?**
- The entire site becomes content-addressed and immutable
- Can be accessed via any IPFS gateway (ipfs.io, dweb.link, community.bgipfs.com)
- Users can pin the content to help distribute and preserve it
- No centralized hosting required - truly decentralized
- Each deployment gets a unique CID based on content hash

**Alternative IPFS Services:**
- [Pinata](https://pinata.cloud) - Upload `frontend/out/` folder (persistent pinning)
- [Web3.Storage](https://web3.storage) - Upload `frontend/out/` folder (free pinning)
- [Fleek](https://fleek.co) - Auto-deploy from GitHub (CI/CD)
- Manual IPFS CLI: `cd frontend && ipfs add -r out`

**Troubleshooting Gateway Timeouts:**

If you get "504 Gateway Timeout" when accessing your CID:

1. **Try different IPFS gateways** (gateway load varies):
   ```
   https://ipfs.io/ipfs/<CID>
   https://dweb.link/ipfs/<CID>
   https://gateway.pinata.cloud/ipfs/<CID>
   https://cloudflare-ipfs.com/ipfs/<CID>
   https://4everland.io/ipfs/<CID>
   ```

2. **Verify content is available** (check providers):
   ```bash
   # Visit: https://cid.contact/<your-CID>
   # Shows which IPFS nodes are serving your content
   ```

3. **Access via local IPFS node** (fastest, most reliable):
   ```bash
   # If you have IPFS Desktop or kubo installed:
   ipfs cat /ipfs/<CID>/index.html
   # Or access via local gateway: http://127.0.0.1:8080/ipfs/<CID>
   ```

**Note:** Gateway timeouts are usually temporary. The content is available on IPFS (BuildGuild pins it), but public gateways can be slow or overloaded. Wait a few minutes and try a different gateway, or use IPFS Desktop for instant access.

### 4. Configure Bootstrap Peers

Update `frontend/lib/libp2p/browserNode.ts`:

```typescript
bootstrap({
  list: [
    '/ip4/YOUR_SERVER_IP/tcp/9001/p2p/YOUR_PEER_ID',
    '/ip4/BACKUP_IP/tcp/9001/p2p/BACKUP_PEER_ID',
  ]
})
```

Get Peer ID: `curl http://YOUR_SERVER:3001/api/libp2p/status`

## Access Methods

- IPFS Gateway: `https://ipfs.io/ipfs/<CID>/streams`
- IPFS Domain: `https://<CID>.ipfs.dweb.link/streams`
- Brave Browser: `ipfs://<CID>/streams`
- ENS Domain: `https://yourdomain.eth` (after ENS setup)

## Monitoring

```bash
# Backend health
curl http://localhost:3001/health

# Node status
curl http://localhost:3001/api/libp2p/status

# Active streams
curl http://localhost:3001/api/libp2p/streams

# Discovered streams
curl http://localhost:3001/api/libp2p/directory/discovered
```

## Scaling

**Multiple Backend Nodes:**
- Geographic distribution for faster connections
- Redundancy if one node goes down
- Load balancing across the network

**SSL/TLS (Production):**
Use nginx or Caddy for secure WebSockets:

```nginx
server {
    listen 443 ssl;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

## Security Checklist

- [ ] Contracts deployed to mainnet
- [ ] Backend nodes on public IPs
- [ ] SSL/TLS for production WebSockets
- [ ] Environment variables secured
- [ ] PM2 configured for auto-restart
- [ ] Firewall rules configured
- [ ] Monitoring alerts set up
- [ ] Backup nodes running

## Troubleshooting

**No streams discovered:**
```bash
yarn p2p:diagnose
curl http://localhost:3001/api/libp2p/streams
```

**Connection refused:**
```bash
# Check backend is running
pm2 status
pm2 logs argus-backend

# Check firewall
sudo ufw status
```

**IPFS build fails:**
```bash
rm -rf .next out
yarn build:ipfs
```

## Custom Domain (Optional)

### ENS Domain
1. Register ENS domain (e.g., argus-defense.eth)
2. Point ContentHash to `ipfs://<CID>`
3. Access via `https://argus-defense.eth`

### DNS + IPFS
```bash
# Add DNS TXT record
_dnslink.yourdomain.com TXT "dnslink=/ipfs/<CID>"

# Access via
https://yourdomain.com
```

## Update Deployment

```bash
# Make changes
git pull

# Rebuild frontend
yarn build:ipfs
yarn deploy:ipfs  # Get new CID

# Update backend
git pull && pm2 restart argus-backend

# Update ENS/DNS with new CID
```
