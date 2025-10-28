# Smart Contracts Guide

On-chain stream registry and self-paying wallets.

## StreamRegistry

**Purpose:** Immutable source of truth for stream ownership

### Key Functions

```solidity
// Compute deterministic stream ID
function computeStreamId(
    string memory systemId,
    uint256 talkgroupId,
    string memory callId
) public pure returns (bytes32);

// Get canonical wallet address
function getWallet(bytes32 streamId) public view returns (address);

// Register stream (DAO only)
function registerStream(
    string memory systemId,
    uint256 talkgroupId,
    string memory callId,
    address wallet
) public onlyRole(DAO_ROLE);

// Batch register (gas efficient)
function registerStreamBatch(
    string[] memory systemIds,
    uint256[] memory talkgroupIds,
    string[] memory callIds,
    address[] memory wallets
) public onlyRole(DAO_ROLE);
```

### Access Control

- `DEFAULT_ADMIN_ROLE` - Grant/revoke roles
- `DAO_ROLE` - Register/update streams
- `REGISTRAR_ROLE` - Reserved for future use

### Deploy & Register

```bash
# Deploy contract
yarn chain
yarn deploy

# Register streams from streams.json
yarn register:streams

# Verify
node backend/scripts/testRegistryVerification.js
```

### Configuration

```bash
# backend/.env
STREAM_REGISTRY_CONTRACT=0x...
ETH_RPC_URL=http://localhost:8545
```

## StreamWalletV2

**Purpose:** Self-paying wallet with automatic revenue distribution

### Revenue Split

```
Payment (100%)
├─ Publisher (60%)
├─ Bandwidth Providers (30%)
└─ DAO Treasury (10%)
```

### Key Functions

```solidity
// Listener pays for access
function payForListening(uint256 minutes) external payable;

// Track bandwidth contribution
function recordBandwidth(address provider, uint256 bytes_) external;

// Get pricing
function getPricePerMinute() public pure returns (uint256);  // 0.0001 ETH

// Get metrics
function getMetrics() public view returns (
    uint256 totalEarnings,
    uint256 totalListeners,
    uint256 totalMinutes,
    uint256 bandwidthProviders
);
```

## StreamFactory

**Purpose:** One-click stream + wallet deployment

### Flow

```javascript
// Deploy stream with wallet
const { streamId, walletAddress } = await factory.createStream(
    "rhode-island",
    3344,
    "abc123"
);

// Automatic:
// 1. Deploys StreamWalletV2
// 2. Registers in StreamRegistry
// 3. Returns addresses
```

## Backend Integration

### Verify Wallets

```javascript
const { createRegistryClient } = require('./contracts/streamRegistryIntegration');
const registry = createRegistryClient();

// Verify stream against blockchain
const result = await registry.verifyStreamWallet(stream);

if (!result.match) {
    // JSON was tampered - use blockchain wallet
    stream.wallet.address = result.contractWallet;
}
```

### Track Bandwidth

```javascript
// Report every 1GB
if (bandwidthStats[peer] > 1_000_000_000) {
    await streamWallet.recordBandwidth(
        peer,
        bandwidthStats[peer]
    );
    bandwidthStats[peer] = 0;
}
```

## Frontend Integration

### Pay for Listening

```typescript
const streamWallet = new ethers.Contract(
    stream.wallet.address,
    STREAM_WALLET_ABI,
    signer
);

// Pay for 30 minutes
const pricePerMinute = await streamWallet.getPricePerMinute();
await streamWallet.payForListening(30, {
    value: pricePerMinute * 30n
});
```

### Display Verification

```tsx
<div className="wallet-info">
    <span>{stream.wallet.address}</span>
    {stream.wallet.verified && <Badge>✓ Verified</Badge>}
</div>
```

## Gas Optimization

**Batch Operations:**
- `registerStreamBatch()` saves ~60% gas vs individual calls
- Pack multiple streams into single transaction

**Event Indexing:**
```solidity
event StreamCreated(
    bytes32 indexed streamId,
    address indexed publisher,
    address wallet
);
```

## Testing

```bash
# Run contract tests
yarn hardhat test

# Test integration
node backend/scripts/testRegistryVerification.js

# Local deployment
yarn chain
yarn deploy
```

## Production Deployment

```bash
# Deploy to mainnet
yarn deploy --network mainnet

# Verify on Etherscan
yarn hardhat verify --network mainnet DEPLOYED_ADDRESS

# Transfer DAO role to multisig
await registry.grantRole(DAO_ROLE, MULTISIG_ADDRESS);
await registry.renounceRole(DEFAULT_ADMIN_ROLE, deployer);
```

## Security

- All addresses checksummed
- Reentrancy guards on payments
- Role-based access control
- Input validation with require statements
- Event logging for all state changes

## Files

- `backend/contracts/StreamRegistry.sol` - Main registry
- `backend/contracts/StreamWalletV2.sol` - Self-paying wallet
- `backend/contracts/StreamFactory.sol` - Factory deployer
- `backend/deploy/01_deploy_stream_registry.ts` - Deployment
- `backend/scripts/registerStreams.ts` - Batch registration
- `backend/contracts/streamRegistryIntegration.js` - Backend client
