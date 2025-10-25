# Blockchain Wallet Guide

Automated wallet assignment for emergency radio streams to enable listener rewards.

## Overview

Each stream gets a unique Ethereum wallet address where listeners can send tips/rewards. The system supports:
- Automatic wallet generation per stream
- Simple mode (basic addresses)
- Smart contract mode (advanced features - coming soon)
- Persistent wallet registry

## Quick Start

```bash
# Generate wallets during ingestion
cd backend/openmhz
python3 ingest_openmhz.py --system rhode-island --assign-wallets --save-registry

# View generated wallets
cat streams.json | python3 -m json.tool
```

## How It Works

1. **Ingestion** - `ingest_openmhz.py` fetches streams from OpenMHz
2. **ID Generation** - Each stream gets unique ID: `{system}-{talkgroup}-{callId}`
3. **Wallet Creation** - Ethereum wallet generated from stream ID (deterministic)
4. **Registry Update** - Wallet added to stream profile in `streams.json`
5. **Frontend Access** - API serves wallet addresses to UI

## Wallet Structure

```json
{
  "wallet": {
    "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb5",
    "contract_address": null,
    "mode": "simple",
    "created_at": "2025-10-23T20:15:30.123Z"
  }
}
```

**Fields:**
- `address` - Ethereum wallet address (0x...)
- `contract_address` - Smart contract address (null in simple mode)
- `mode` - "simple" or "contract"
- `created_at` - Timestamp of wallet creation

## Wallet Modes

### Simple Mode (Current)
- Basic Ethereum addresses
- Generated deterministically from stream ID
- No private keys stored
- View-only (for displaying to users)
- Lightweight and fast

**Use case:** Display wallet addresses in UI for users to send tips manually.

### Contract Mode (Future)
- Smart contract per stream
- Automated reward distribution
- Track listener metrics on-chain
- Split rewards among multiple parties

**Use case:** Automated reward distribution based on listen time.

## Usage Examples

### Basic: Assign Wallets
```bash
python3 ingest_openmhz.py --system rhode-island --assign-wallets
```

### With Registry: Save to streams.json
```bash
python3 ingest_openmhz.py --system rhode-island --assign-wallets --save-registry
```

### Multiple Systems
```bash
for system in rhode-island chicago sf_bay_area; do
  python3 ingest_openmhz.py --system $system --assign-wallets --save-registry
done
```

## Integration

### Frontend (React/Next.js)

```typescript
// Fetch streams with wallets
const response = await fetch('http://localhost:3001/api/streams');
const data = await response.json();

// Display wallet address
data.streams.forEach(stream => {
  console.log(`${stream.name}: ${stream.wallet.address}`);
});
```

### Backend (Node.js)

```javascript
const fs = require('fs');

// Read registry
const streams = JSON.parse(
  fs.readFileSync('backend/openmhz/streams.json', 'utf-8')
);

// Get wallet for stream
const stream = streams['rhode-island'].streams[0];
console.log(stream.wallet.address);
```

### Python

```python
import json

# Read registry
with open('backend/openmhz/streams.json') as f:
    streams = json.load(f)

# Get wallet
stream = streams['rhode-island']['streams'][0]
print(stream['wallet']['address'])
```

## Registry File: streams.json

**Location:** `backend/openmhz/streams.json`

**Structure:**
```json
{
  "rhode-island": {
    "system_id": "rhode-island",
    "streams": [
      {
        "stream_id": "rhode-island-3344-abc123",
        "name": "Fire Dispatch",
        "wallet": {
          "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb5",
          "mode": "simple"
        }
      }
    ]
  },
  "last_updated": "2025-10-23T20:15:33.000Z"
}
```

**Reading the registry:**

```bash
# Pretty print
cat backend/openmhz/streams.json | python3 -m json.tool

# Get specific system
cat backend/openmhz/streams.json | jq '.["rhode-island"]'

# List all wallets
cat backend/openmhz/streams.json | jq '.[].streams[].wallet.address'
```

## Automation

### Cron Job: Update Every 5 Minutes
```bash
*/5 * * * * cd /path/to/Argus-Defense && python3 backend/openmhz/ingest_openmhz.py --system rhode-island --assign-wallets --save-registry
```

### Batch Script: Multiple Systems
```bash
#!/bin/bash
for system in rhode-island chicago sf_bay_area; do
  echo "Updating $system..."
  python3 backend/openmhz/ingest_openmhz.py \
    --system $system \
    --assign-wallets \
    --save-registry
done
echo "All systems updated"
```

## API Integration

The API server (`backend/apiServer.js`) serves wallet data via REST:

```bash
# Get all streams with wallets
curl http://localhost:3001/api/streams

# Get specific system
curl http://localhost:3001/api/streams/rhode-island

# Get specific stream
curl http://localhost:3001/api/stream/rhode-island-3344-abc123
```

Response includes wallet:
```json
{
  "stream_id": "rhode-island-3344-abc123",
  "name": "Fire Dispatch",
  "wallet": {
    "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb5"
  }
}
```

## Security

### Simple Mode (Current)
- No private keys generated or stored
- Addresses are view-only
- Safe to display publicly
- Users send funds manually to displayed address

### Best Practices
- Don't commit `streams.json` with real wallet addresses to public repos
- Use environment variables for sensitive contract addresses
- Validate all wallet addresses before displaying
- Log wallet generation for audit trail

## Troubleshooting

**"No wallet addresses generated"**
- Add `--assign-wallets` flag to ingestion command
- Check Python script completes without errors

**"Wallet address is null"**
- Run ingestion with `--assign-wallets --save-registry`
- Verify streams.json contains wallet objects

**"Different address each time"**
- Wallet generation is deterministic from stream_id
- If stream_id changes, wallet changes
- Use `--save-registry` to persist wallets

**"Want to use real wallets with private keys"**
- Current implementation is view-only for security
- For real wallet control, implement contract mode
- See smart contract development guide (coming soon)

## Future Features

### Smart Contract Mode
- Deploy contract per stream
- Automated reward splitting
- On-chain listener metrics
- Governance for stream owners

### Reward Distribution
- Track listen time on-chain
- Proportional reward distribution
- Automated payouts
- Staking mechanisms

### Analytics
- Track total rewards per stream
- Popular stream metrics
- Listener engagement data
- Revenue dashboards

## File Structure

```
backend/openmhz/
├── ingest_openmhz.py          # Wallet generation logic
└── streams.json               # Registry with wallet addresses

backend/
├── apiServer.js               # Serves wallet data via REST
└── contracts/
    └── StreamWallet.sol       # (Future) Smart contract
```

## API Reference

### Python Function
```python
def assign_wallet(stream_id: str, mode: str = 'simple') -> dict:
    """
    Generate wallet for stream.

    Args:
        stream_id: Unique stream identifier
        mode: 'simple' or 'contract'

    Returns:
        {
            'address': '0x...',
            'contract_address': None,
            'mode': 'simple',
            'created_at': '2025-10-23T20:15:30.123Z'
        }
    """
```

### Command Line
```bash
python3 ingest_openmhz.py \
  --system SYSTEM \
  --assign-wallets \
  --save-registry
```

## Next Steps

- See `backend/openmhz/README.md` for OpenMHz ingestion
- See `Documents/STREAMS_SETUP.md` for full system setup
- See `backend/apiServer.js` for API implementation
