# OpenMHz Stream Ingestion

Fetches public safety radio streams from OpenMHz.com and assigns blockchain wallets.

## Quick Start

```bash
# Basic ingestion
python3 ingest_openmhz.py --system rhode-island

# With blockchain wallets
python3 ingest_openmhz.py --system rhode-island --assign-wallets --save-registry
```

## What It Does

1. **Fetches streams** from OpenMHz API
2. **Assigns wallets** (optional) - each stream gets unique Ethereum address
3. **Saves registry** (optional) - stores all streams in `streams.json`

## Files

| File | Purpose |
|------|---------|
| `ingest_openmhz.py` | Main ingestion script |
| `streams.json` | Registry of all streams with wallets |
| `openmhz_integration.js` | Node.js wrapper |
| `streamServer_openmhz.js` | WebSocket server |

## Usage

### Basic Ingestion

```bash
python3 ingest_openmhz.py --system rhode-island
```

Output: JSON with stream profiles

### With Wallets + Registry

```bash
python3 ingest_openmhz.py \
  --system rhode-island \
  --assign-wallets \
  --save-registry
```

Output: `streams.json` with wallet addresses

### Filter Talkgroups

```bash
python3 ingest_openmhz.py \
  --system kcers1b \
  --talkgroups 3344,3408
```

## Stream Profile Format

```json
{
  "stream_id": "rhode-island-3344-abc",
  "name": "Fire Dispatch",
  "audio_url": "https://cdn.openmhz.com/...",
  "duration": 15,
  "wallet": {
    "address": "0x742d35Cc...",
    "mode": "simple"
  }
}
```

## Registry File (`streams.json`)

```json
{
  "rhode-island": {
    "system_id": "rhode-island",
    "total_streams": 27,
    "streams": [...]
  },
  "last_updated": "2025-10-23T20:15:33.000Z"
}
```

## Integration

### Read Registry

```python
import json
with open('Backend/sdr/streams.json') as f:
    registry = json.load(f)
streams = registry['rhode-island']['streams']
```

### Send Rewards

```javascript
const ethers = require('ethers');
const stream = registry['rhode-island'].streams[0];

await signer.sendTransaction({
  to: stream.wallet.address,
  value: ethers.parseEther('0.001')
});
```

## Architecture

```
OpenMHz API
    ↓
ingest_openmhz.py (Python)
    ↓
generateStreamWallet.ts (TypeScript) ← assigns wallets
    ↓
streams.json (Registry) ← saved here
    ↓
Frontend/Backend reads this
```

## Wallet Assignment

When `--assign-wallets` is used:

1. Script calls `generateStreamWallet.ts` for each stream
2. TypeScript generates Ethereum wallet
3. Wallet address added to stream profile
4. Saved to `streams.json`

**Result**: Each stream has unique blockchain identity

## CLI Options

```
--system, -s       System ID (required)
--talkgroups, -t   Filter by talkgroup IDs
--assign-wallets   Assign blockchain wallets
--save-registry    Save to streams.json
--output, -o       Output file
--debug, -d        Debug mode
```

## Dependencies

```bash
# Python
pip3 install requests

# Node.js (for wallet assignment)
cd Backend && npm install
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| 403 Forbidden | OpenMHz API is protected by Cloudflare |
| ts-node not found | Run `npm install` in Backend directory |
| No wallets assigned | Check that `generateStreamWallet.ts` exists |

## Examples

### Multiple Systems

```bash
for sys in rhode-island kcers1b dcfd; do
  python3 ingest_openmhz.py \
    --system "$sys" \
    --assign-wallets \
    --save-registry
done
```

### Cron Job (Every 5 Minutes)

```cron
*/5 * * * * cd /path/to/Argus-Defense && python3 Backend/sdr/ingest_openmhz.py --system rhode-island --assign-wallets --save-registry
```

## More Info

- **Full Documentation**: See `Documents/` folder
- **Examples**: See `Assets/` folder
- **Tests**: See `Backend/test/` folder
- **Smart Contract**: `Backend/contracts/StreamWallet.sol`
- **Wallet Generator**: `Backend/scripts/generateStreamWallet.ts`
