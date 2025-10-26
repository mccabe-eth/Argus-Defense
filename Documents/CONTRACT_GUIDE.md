# StreamRegistry Smart Contract

## 🎯 Purpose

**Ethereum = Source of Truth for Stream Ownership**

- JSON files can be edited → NOT TRUSTWORTHY
- Smart contract on blockchain → IMMUTABLE & VERIFIABLE

## 📦 What Was Created

### Files Created

1. **`backend/contracts/StreamRegistry.sol`** - Main contract
2. **`backend/deploy/01_deploy_stream_registry.ts`** - Deployment script
3. **`backend/scripts/registerStreams.ts`** - Register streams on-chain
4. **`backend/contracts/streamRegistryIntegration.js`** - Backend verification client

### Key Contract Functions

```solidity
// Compute stream ID (keccak256 hash)
computeStreamId(systemId, talkgroupId, callId) → bytes32

// Get canonical wallet (SOURCE OF TRUTH)
getWallet(streamId) → address

// Register stream (DAO only)
registerStream(systemId, talkgroupId, callId, walletAddress)

// Batch register (gas efficient)
registerStreamBatch(systemIds[], talkgroupIds[], callIds[], wallets[])
```

## 🚀 Quick Start

### 1. Deploy Contract

```bash
cd backend

# Start local blockchain
yarn chain

# Deploy (new terminal)
yarn deploy

# Save the contract address!
```

### 2. Register Streams

```bash
# Register all streams from streams.json
yarn hardhat run scripts/registerStreams.ts

# Contract now stores: streamId → walletAddress
```

### 3. Configure Backend

Add to `backend/.env`:

```bash
STREAM_REGISTRY_CONTRACT=0xYourContractAddress
ETH_RPC_URL=http://localhost:8545
```

### 4. Verify Wallets in API

Modify `backend/apiServer.js`:

```javascript
const { createRegistryClient } = require('./contracts/streamRegistryIntegration');
const registry = createRegistryClient();

// In your API endpoint:
app.get('/api/streams', async (req, res) => {
  const streams = await loadStreamsData();

  // Verify each stream against contract
  for (const stream of streams) {
    if (registry) {
      const enriched = await registry.enrichStreamWithContractData(stream);
      // enriched.wallet.address now comes from blockchain!
    }
  }

  res.json({ streams });
});
```

## 🔍 How It Works

### Stream ID Formula

**Same algorithm on-chain and off-chain:**

```javascript
// Off-chain (JavaScript)
const streamId = ethers.keccak256(
  ethers.solidityPacked(
    ['string', 'uint256', 'string'],
    [systemId, talkgroupId, callId]
  )
);

// On-chain (Solidity)
bytes32 streamId = keccak256(abi.encodePacked(systemId, talkgroupId, callId));
```

### Verification Flow

```
1. Load streams.json → wallet = "0xFAKE..."
2. Compute streamId hash
3. Call contract.getWallet(streamId) → "0xREAL..."
4. Replace JSON wallet with contract wallet
5. Return to frontend with verified=true
```

## 🔐 Access Control

- **DEFAULT_ADMIN_ROLE** - Can grant roles
- **DAO_ROLE** - Can register/update streams
- **REGISTRAR_ROLE** - Reserved for future

**Initially:** Deployer has all roles
**Later:** Transfer DAO_ROLE to multisig/DAO contract

## 📋 Commands

```bash
# Deploy contract
yarn deploy

# Register streams
yarn hardhat run scripts/registerStreams.ts

# Run tests
yarn hardhat test

# Mainnet deployment
yarn deploy --network mainnet
```

## ✅ Benefits

1. **Immutable** - Can't edit blockchain
2. **Transparent** - Anyone can verify
3. **Decentralized** - No trust in JSON
4. **Auditable** - Events track all changes
5. **Future-proof** - Can add royalties, fees, etc.

## 🧪 Integration Example

```javascript
const { StreamRegistryClient } = require('./contracts/streamRegistryIntegration');

const registry = new StreamRegistryClient(
  '0xContractAddress',
  'http://localhost:8545'
);

// Verify a stream
const result = await registry.verifyStreamWallet(stream);

console.log('JSON wallet:', result.jsonWallet);
console.log('Contract wallet:', result.contractWallet);
console.log('Verified:', result.verified);
console.log('Match:', result.match);
console.log('Use this:', result.shouldUse); // ALWAYS the contract wallet
```

## 🎯 Next Steps

1. Deploy contract: `yarn deploy`
2. Register streams: `yarn hardhat run scripts/registerStreams.ts`
3. Update `apiServer.js` to verify wallets
4. Add "Verified" badge to frontend
5. Transfer DAO role to multisig for decentralization

---

**Your wallet addresses are now backed by Ethereum!** 🎉
