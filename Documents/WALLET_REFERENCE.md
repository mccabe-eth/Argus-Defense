# OpenMHz + Blockchain Integration - Quick Reference

## One Command to Rule Them All

```bash
python3 Backend/sdr/ingest_openmhz.py \
  --system rhode-island \
  --assign-wallets \
  --save-registry
```

**This does everything**:
1. ✅ Fetches streams from OpenMHz
2. ✅ Assigns blockchain wallet to each stream
3. ✅ Saves to `streams.json` registry
4. ✅ Ready for frontend integration

---

## File Locations

| File | Purpose | When to Use |
|------|---------|-------------|
| `streams.json` | Master registry | Read this in your frontend/backend |
| `stream_wallets.json` | Internal wallet data | Don't expose publicly (has private keys!) |
| `wallets/*.json` | Individual wallet files | Backup/recovery only |

---

## Reading the Registry

### Python
```python
import json
with open('Backend/sdr/streams.json') as f:
    registry = json.load(f)
streams = registry['rhode-island']['streams']
wallet_address = streams[0]['wallet']['address']
```

### JavaScript/Node.js
```javascript
const registry = require('./Backend/sdr/streams.json');
const streams = registry['rhode-island'].streams;
const walletAddress = streams[0].wallet.address;
```

### Frontend (React/Vue/etc)
```javascript
fetch('/api/streams')  // Your backend serves streams.json
  .then(res => res.json())
  .then(registry => {
    const streams = registry['rhode-island'].streams;
    streams.forEach(stream => {
      console.log(`${stream.name}: ${stream.wallet.address}`);
    });
  });
```

---

## Sending Rewards

```javascript
const ethers = require('ethers');

// Get stream wallet
const stream = registry['rhode-island'].streams[0];

// Send 0.001 ETH reward
await signer.sendTransaction({
  to: stream.wallet.address,
  value: ethers.parseEther('0.001')
});
```

---

## CLI Quick Reference

### Basic Ingestion (No Wallets)
```bash
python3 ingest_openmhz.py --system rhode-island
```

### With Wallet Assignment
```bash
python3 ingest_openmhz.py --system rhode-island --assign-wallets
```

### Full Pipeline (Wallets + Registry)
```bash
python3 ingest_openmhz.py \
  --system rhode-island \
  --assign-wallets \
  --save-registry
```

### With Filters
```bash
# Specific talkgroups
python3 ingest_openmhz.py \
  --system kcers1b \
  --talkgroups 3344,3408 \
  --assign-wallets \
  --save-registry

# Specific group
python3 ingest_openmhz.py \
  --system dcfd \
  --group fire-dispatch \
  --assign-wallets \
  --save-registry
```

### Debug Mode
```bash
python3 ingest_openmhz.py \
  --system rhode-island \
  --assign-wallets \
  --save-registry \
  --debug
```

---

## Manual Wallet Generation

```bash
ts-node Backend/scripts/generateStreamWallet.ts \
  --streamId "my-stream-123" \
  --streamName "My Custom Stream" \
  --mode simple
```

---

## Stream Profile Structure

```json
{
  "stream_id": "rhode-island-3344-abc",
  "name": "Fire Dispatch",
  "audio_url": "https://cdn.openmhz.com/...",
  "talkgroup_id": 3344,
  "duration": 15,
  "timestamp": "2025-10-23T19:58:53.000Z",
  "wallet": {
    "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb5",
    "mode": "simple",
    "created_at": "2025-10-23T20:15:30.123Z"
  }
}
```

---

## Common Tasks

### Update Registry Every 5 Minutes
```bash
# Add to crontab
*/5 * * * * cd /path/to/Argus-Defense && python3 Backend/sdr/ingest_openmhz.py --system rhode-island --assign-wallets --save-registry
```

### Ingest Multiple Systems
```bash
#!/bin/bash
systems=("rhode-island" "kcers1b" "dcfd")
for sys in "${systems[@]}"; do
  python3 Backend/sdr/ingest_openmhz.py \
    --system "$sys" \
    --assign-wallets \
    --save-registry
done
```

### Check Wallet Balance
```javascript
const ethers = require('ethers');
const provider = new ethers.JsonRpcProvider('https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY');

const stream = registry['rhode-island'].streams[0];
const balance = await provider.getBalance(stream.wallet.address);
console.log(`Balance: ${ethers.formatEther(balance)} ETH`);
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `ts-node not found` | `cd Backend && npm install` |
| `Wallet generation failed` | Check that ethers.js is installed |
| `403 Forbidden from API` | Use `--debug` flag, see API docs |
| `Slow wallet assignment` | Normal - ~1 sec per wallet. Cached on second run. |

---

## File Overview

```
Steps 1-3: Stream Ingestion
├── ingest_openmhz.py          # Fetches streams from OpenMHz
├── openmhz_integration.js     # Node.js wrapper
└── streamServer_openmhz.js    # WebSocket server

Step 4: Wallet Assignment
├── contracts/StreamWallet.sol         # Smart contract
├── scripts/generateStreamWallet.ts    # Wallet generator
└── sdr/stream_wallets.json            # Wallet registry

Step 5: Stream Registry
└── sdr/streams.json                   # ⭐ MASTER REGISTRY

Documentation
├── sdr/OPENMHZ_README.md              # Complete OpenMHz guide
├── sdr/WALLET_ASSIGNMENT_GUIDE.md     # Wallet assignment guide
├── sdr/STEPS_4_5_SUMMARY.md           # Steps 4 & 5 summary
└── sdr/QUICK_REFERENCE.md             # This file
```

---

## Testing

### Test Without API (Mock Data)
```bash
cd Backend/sdr
python3 test_ingest_mock.py
```

### Test Wallet Generation
```bash
cd Backend
ts-node scripts/generateStreamWallet.ts \
  --streamId "test-123" \
  --streamName "Test"
```

### Check Registry
```bash
cat Backend/sdr/streams.json | python3 -m json.tool
```

---

## What Each Component Does

| Component | What It Does | When to Use |
|-----------|--------------|-------------|
| `ingest_openmhz.py` | Fetches streams from OpenMHz | Always - this is the main script |
| `generateStreamWallet.ts` | Creates blockchain wallets | Automatically called by Python with `--assign-wallets` |
| `streams.json` | Stores all streams + wallets | Read this in your app to display streams |
| `StreamWallet.sol` | Smart contract template | Deploy when you need on-chain features |

---

## Implementation Checklist

- [x] Stream ingestion from OpenMHz
- [x] Stream profile generation
- [x] Blockchain wallet assignment
- [x] Registry storage (streams.json)
- [ ] Install Node.js dependencies (`npm install`)
- [ ] Run first ingestion with wallets
- [ ] Integrate frontend with streams.json
- [ ] Implement reward distribution
- [ ] Deploy to production

---

## Quick Start (First Time Setup)

```bash
# 1. Install dependencies
cd Backend
npm install

# 2. Test wallet generation
ts-node scripts/generateStreamWallet.ts \
  --streamId "test-123" \
  --streamName "Test"

# 3. Run ingestion with wallet assignment
cd ..
python3 Backend/sdr/ingest_openmhz.py \
  --system rhode-island \
  --assign-wallets \
  --save-registry

# 4. Check the registry
cat Backend/sdr/streams.json

# 5. Success! You now have streams with blockchain wallets.
```

---

## Need More Info?

- **Complete Guide**: [WALLET_ASSIGNMENT_GUIDE.md](./WALLET_ASSIGNMENT_GUIDE.md)
- **Steps 4 & 5 Details**: [STEPS_4_5_SUMMARY.md](./STEPS_4_5_SUMMARY.md)
- **OpenMHz API**: [OPENMHZ_README.md](./OPENMHZ_README.md)
- **Examples**: [example_streams_with_wallets.json](./example_streams_with_wallets.json)
