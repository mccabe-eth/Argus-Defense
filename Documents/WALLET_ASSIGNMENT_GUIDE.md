# Blockchain Wallet Assignment for Streams - Complete Guide

## Overview

This guide explains how Steps 4 and 5 work together to assign blockchain wallets to audio streams and maintain a registry.

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│  1. OpenMHz API                                          │
│     Returns call/talkgroup data                          │
└────────────────┬─────────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────────┐
│  2. ingest_openmhz.py                                    │
│     - Fetches streams                                    │
│     - For each stream...                                 │
└────────────────┬─────────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────────┐
│  3. generateStreamWallet.ts (called by Python)           │
│     - Creates Ethereum wallet                            │
│     - Returns wallet address                             │
│     - Saves to stream_wallets.json                       │
└────────────────┬─────────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────────┐
│  4. Stream Profile (with wallet address)                 │
│     {                                                     │
│       "stream_id": "rhode-island-3344-abc",              │
│       "name": "Fire Dispatch",                           │
│       "wallet": {                                        │
│         "address": "0x1234...",                          │
│         "mode": "simple"                                 │
│       }                                                  │
│     }                                                    │
└────────────────┬─────────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────────┐
│  5. streams.json Registry                                │
│     Master list of all streams with wallet addresses     │
└──────────────────────────────────────────────────────────┘
```

## Step 4: Wallet Assignment

### How It Works

When `--assign-wallets` flag is used, the Python script:

1. **For each stream**, calls the TypeScript wallet generator:
   ```bash
   ts-node scripts/generateStreamWallet.ts \
     --streamId "rhode-island-3344-abc123" \
     --streamName "Providence Fire Dispatch" \
     --mode simple
   ```

2. **Wallet generator** (TypeScript):
   - Checks if wallet already exists for this stream_id
   - If exists: returns existing wallet
   - If new: creates Ethereum wallet using ethers.js
   - Saves wallet to `Backend/sdr/wallets/` directory
   - Updates `Backend/sdr/stream_wallets.json` registry
   - Returns wallet data as JSON

3. **Python** parses the JSON output and adds wallet info to stream profile

### Wallet Modes

**Simple Mode** (default, recommended):
- Creates a standard Ethereum wallet (address + private key)
- No deployment, no gas costs
- Fast and simple
- Suitable for receiving payments

**Contract Mode** (future):
- Deploys a `StreamWallet` smart contract
- Requires network connection and gas
- More features (metadata, events, etc.)
- Suitable for complex reward logic

## Step 5: Stream Registry

### Registry File: `Backend/sdr/streams.json`

Master registry of all ingested streams with their wallet addresses.

**Structure**:
```json
{
  "rhode-island": {
    "system_id": "rhode-island",
    "total_streams": 27,
    "total_talkgroups": 15,
    "streams": [
      {
        "stream_id": "rhode-island-3344-abc123",
        "name": "Providence Fire Dispatch",
        "audio_url": "https://cdn.openmhz.com/...",
        "talkgroup_id": 3344,
        "wallet": {
          "address": "0x1234567890abcdef...",
          "mode": "simple",
          "created_at": "2025-10-23T20:15:00Z"
        }
      }
    ],
    "generated_at": "2025-10-23T20:15:00Z"
  },
  "last_updated": "2025-10-23T20:15:00Z"
}
```

### Usage

**Save to registry**:
```bash
python3 ingest_openmhz.py \
  --system rhode-island \
  --assign-wallets \
  --save-registry
```

**Read registry in other services**:
```python
import json

with open('Backend/sdr/streams.json') as f:
    registry = json.load(f)

# Get all streams for a system
streams = registry['rhode-island']['streams']

# Find stream by ID
stream = next(s for s in streams if s['stream_id'] == 'rhode-island-3344-abc')

# Get wallet address
wallet_address = stream['wallet']['address']
```

## Files Created

### 1. Smart Contract: `StreamWallet.sol`

Location: `Backend/contracts/StreamWallet.sol`

A deployable contract representing a stream's on-chain identity.

**Features**:
- Receive ETH (listener rewards)
- Withdraw funds (only creator)
- Store metadata
- Emit events

**When deployed**:
- Each stream gets its own contract instance
- Contract address becomes the stream's wallet
- More features but costs gas

### 2. Wallet Generator: `generateStreamWallet.ts`

Location: `Backend/scripts/generateStreamWallet.ts`

TypeScript script that creates/retrieves wallets for streams.

**Can be called**:
- From Python (subprocess)
- From command line
- From other Node.js code

**Output**:
```json
{
  "streamId": "rhode-island-3344-abc",
  "streamName": "Fire Dispatch",
  "walletAddress": "0x1234...",
  "mode": "simple",
  "createdAt": "2025-10-23T20:15:00Z"
}
```

### 3. Updated Ingestion Script: `ingest_openmhz.py`

Added:
- `WalletAssigner` class - handles wallet generation
- `--assign-wallets` flag - enable wallet assignment
- `--save-registry` flag - save to streams.json
- `--backend-dir` flag - specify Backend directory path

### 4. Wallet Registry: `stream_wallets.json`

Location: `Backend/sdr/stream_wallets.json`

Internal registry mapping stream IDs to wallet data.

```json
{
  "rhode-island-3344-abc123": {
    "streamId": "rhode-island-3344-abc123",
    "streamName": "Providence Fire Dispatch",
    "walletAddress": "0x1234567890abcdef...",
    "privateKey": "0xabcd...",
    "createdAt": "2025-10-23T20:15:00Z",
    "mode": "simple"
  }
}
```

**⚠️ Security Note**: In production, private keys should be encrypted!

### 5. Wallet Files: `Backend/sdr/wallets/*.json`

Individual wallet files for each stream (for backup/recovery).

```json
{
  "address": "0x1234567890abcdef...",
  "privateKey": "0xabcd...",
  "streamId": "rhode-island-3344-abc123",
  "streamName": "Providence Fire Dispatch",
  "createdAt": "2025-10-23T20:15:00Z"
}
```

### 6. Streams Registry: `Backend/sdr/streams.json`

Public-facing registry for frontend and other services.

## Usage Examples

### Basic Ingestion (No Wallet Assignment)

```bash
python3 ingest_openmhz.py --system rhode-island
```

Output: Stream profiles without wallet addresses

### With Wallet Assignment

```bash
python3 ingest_openmhz.py \
  --system rhode-island \
  --assign-wallets
```

Output: Stream profiles WITH wallet addresses

### With Wallet Assignment + Registry

```bash
python3 ingest_openmhz.py \
  --system rhode-island \
  --assign-wallets \
  --save-registry
```

Output:
- Stream profiles with wallets
- Saved to `streams.json`
- Ready for frontend consumption

### Manual Wallet Generation

```bash
ts-node Backend/scripts/generateStreamWallet.ts \
  --streamId "custom-stream-123" \
  --streamName "My Custom Stream" \
  --mode simple
```

## Integration with Frontend

### Reading the Registry

```javascript
// In your frontend or backend service
const fs = require('fs');
const registry = JSON.parse(
  fs.readFileSync('Backend/sdr/streams.json', 'utf-8')
);

// Get streams for a system
const streams = registry['rhode-island'].streams;

// Display in UI
streams.forEach(stream => {
  console.log(`${stream.name}: ${stream.wallet.address}`);
});
```

### Sending Listener Rewards

```javascript
const ethers = require('ethers');

// Get stream wallet address
const stream = registry['rhode-island'].streams[0];
const walletAddress = stream.wallet.address;

// Send reward
const tx = await signer.sendTransaction({
  to: walletAddress,
  value: ethers.parseEther('0.001') // 0.001 ETH reward
});

console.log(`Sent reward to ${stream.name}: ${tx.hash}`);
```

## Automated Workflow

### Complete Pipeline

```bash
#!/bin/bash
# Ingest streams and assign wallets for multiple systems

systems=("rhode-island" "kcers1b" "dcfd")

for system in "${systems[@]}"; do
  echo "Processing $system..."

  python3 Backend/sdr/ingest_openmhz.py \
    --system "$system" \
    --assign-wallets \
    --save-registry

  echo "✓ $system complete"
done

echo "✓ All systems ingested with wallet assignment"
echo "Registry: Backend/sdr/streams.json"
```

### Cron Job Example

```cron
# Update streams every 5 minutes
*/5 * * * * cd /path/to/Argus-Defense && python3 Backend/sdr/ingest_openmhz.py --system rhode-island --assign-wallets --save-registry
```

## Testing

### Test Wallet Generation Only

```bash
cd Backend
ts-node scripts/generateStreamWallet.ts \
  --streamId "test-123" \
  --streamName "Test Stream"
```

Expected output:
```
============================================================
Stream Wallet Generator
============================================================
Stream ID: test-123
Stream Name: Test Stream
Mode: simple

Creating simple wallet for stream: test-123
✓ Simple wallet created: 0x1234567890abcdef...
✓ Wallet file saved: /path/to/wallets/test-123.json

✓ Wallet registered successfully
  Registry: /path/to/stream_wallets.json

JSON_OUTPUT_START
{"streamId":"test-123","streamName":"Test Stream","walletAddress":"0x1234...","mode":"simple","createdAt":"..."}
JSON_OUTPUT_END
```

### Test Full Pipeline with Mock Data

```bash
cd Backend/sdr
python3 test_ingest_mock.py
```

This will:
- Generate stream profiles
- Assign wallets (if ts-node available)
- Show complete output

## Security Considerations

### Private Key Storage

**Current Implementation** (Development):
- Private keys stored in plaintext JSON files
- **NOT suitable for production!**

**Production Recommendations**:
1. **Encrypt private keys** using a master password
2. **Use hardware wallets** or key management services (AWS KMS, etc.)
3. **Implement** proper access controls on wallet files
4. **Never commit** wallet files to git (already in .gitignore)

### Wallet Access

**Who has access**:
- Stream creator (deployer) can withdraw funds
- Anyone can send funds to the wallet
- Private keys stored locally only

**Best practices**:
- Rotate keys periodically
- Use multi-sig for high-value wallets
- Implement spending limits
- Monitor for suspicious activity

## Troubleshooting

### "ts-node not found"

Install TypeScript and ts-node:
```bash
cd Backend
npm install
```

### "Wallet generation failed"

Check that:
1. TypeScript is installed
2. ethers.js is installed
3. Backend directory structure is correct

### "Cannot write to streams.json"

Check file permissions:
```bash
chmod 644 Backend/sdr/streams.json
```

### Wallet assignment is slow

This is normal - each wallet generation takes ~1 second.

For 27 streams: ~27 seconds total.

**Optimization**: Wallets are cached - second run is instant!

## Next Steps

### Immediate

1. ✅ Smart contract created (`StreamWallet.sol`)
2. ✅ Wallet generator script (`generateStreamWallet.ts`)
3. ✅ Python integration (`ingest_openmhz.py`)
4. ✅ Registry system (`streams.json`)

### Short-term

1. **Deploy StreamWallet contract** to testnet
2. **Implement contract mode** in wallet generator
3. **Add encryption** for private keys
4. **Create frontend** to display streams with wallets

### Long-term

1. **Automated reward distribution** based on listen time
2. **Multi-sig wallets** for high-value streams
3. **Analytics dashboard** showing wallet balances
4. **Withdrawal interface** for stream creators

## Summary

You now have a complete blockchain wallet assignment system:

- ✅ Each stream gets a unique Ethereum wallet
- ✅ Wallet addresses stored in stream profiles
- ✅ Centralized registry (`streams.json`) for easy access
- ✅ Automated assignment during ingestion
- ✅ Ready for listener reward routing

**To use**:
```bash
python3 ingest_openmhz.py \
  --system rhode-island \
  --assign-wallets \
  --save-registry
```

**Result**: All streams now have blockchain identities and can receive rewards!
