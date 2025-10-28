# Incentives & Self-Sustaining Economy

## 🎯 Vision
Make Argus Defense a **self-paying, community-governed network** where anyone can publish streams, earn money, and participate in governance.

## 💰 Phase 1: Self-Paying Streams

**StreamWallet.sol** - Each stream has its own wallet that receives payments

**Revenue Split:**
- Publisher: 60% (runs the stream)
- Bandwidth Providers: 30% (relay P2P data)
- DAO Treasury: 10% (network upgrades)

**How It Works:**
```javascript
// Listener pays for stream access
streamWallet.payForListening(30); // 30 minutes
// Auto-splits payment between publisher, bandwidth providers, DAO
```

**Economics Example:**
- 1000 listeners/day × 30 min × 0.0001 ETH/min = 3 ETH/day
- Publisher earns: 1.8 ETH (~$3600)
- Bandwidth nodes: 0.9 ETH (~$1800 split among relayers)
- DAO: 0.3 ETH (~$600 for treasury)

## 🗳️ Phase 2: DAO Governance

**Community votes on:**
- Stream registrations
- Revenue split percentages
- Bootstrap node lists
- Network upgrades
- Treasury allocation

**Voting Power:**
- Token-based (1 ARGUS = 1 vote)
- Or contribution-based (bandwidth, uptime)
- Or quadratic (sqrt of tokens)

## 🪙 Phase 3: Token Economy

**ARGUS Token** rewards:
- Publishing streams: 1 token/hour uptime
- Providing bandwidth: 0.1 token/GB relayed
- Running bootstrap nodes: 10 tokens/day
- Bug bounties: 100-1000 tokens

**Token Uses:**
- DAO voting power
- Priority stream access
- Premium features
- Stream naming rights

## 🛠️ Implementation

### Deploy StreamWallet
```bash
yarn deploy:stream-wallet --stream-id local-intro-001
```

### Backend Tracks Bandwidth
```javascript
// Report bandwidth to contract
await streamWallet.recordBandwidth(peerAddress, bytesRelayed);
```

### Frontend Payment UI
```typescript
// When clicking "Listen P2P"
const cost = pricePerMinute * estimatedMinutes;
await streamWallet.payForListening(minutes, { value: cost });
```

## 📊 Result

**Self-sustaining network where:**
- Publishers profit from streams
- Bandwidth providers earn passive income
- DAO treasury funds growth
- No central authority needed

---

**Anyone can publish, earn, and govern the global radio grid.** 🌍
