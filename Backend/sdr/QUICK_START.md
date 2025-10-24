# Quick Start Guide

## One Command

```bash
python3 Backend/sdr/ingest_openmhz.py \
  --system rhode-island \
  --assign-wallets \
  --save-registry
```

**This does everything:**
- ✅ Fetches streams
- ✅ Assigns wallets
- ✅ Saves to `streams.json`

## Step-by-Step

### 1. Install Dependencies

```bash
# Python
pip3 install requests

# Node.js (for wallets)
cd Backend && npm install
```

### 2. Run Ingestion

```bash
python3 Backend/sdr/ingest_openmhz.py \
  --system rhode-island \
  --assign-wallets \
  --save-registry
```

### 3. Check Output

```bash
cat Backend/sdr/streams.json
```

### 4. Use in Your App

```javascript
const registry = require('./Backend/sdr/streams.json');
const streams = registry['rhode-island'].streams;

streams.forEach(stream => {
  console.log(`${stream.name}: ${stream.wallet.address}`);
});
```

## Common Commands

```bash
# Just fetch streams (no wallets)
python3 ingest_openmhz.py --system rhode-island

# Filter specific talkgroups
python3 ingest_openmhz.py --system kcers1b --talkgroups 3344,3408

# Debug mode
python3 ingest_openmhz.py --system rhode-island --debug
```

## Troubleshooting

**403 Error:** OpenMHz API protected by Cloudflare (normal)

**ts-node not found:** Run `cd Backend && npm install`

## More Info

See [README.md](./README.md) for complete documentation.
