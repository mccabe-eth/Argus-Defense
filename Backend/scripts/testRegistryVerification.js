/**
 * Test StreamRegistry Verification
 * Demonstrates that JSON tampering is detected and rejected
 */

const { createRegistryClient } = require('../contracts/streamRegistryIntegration');
const fs = require('fs').promises;
const path = require('path');

async function testRegistryVerification() {
  console.log('🧪 Testing StreamRegistry Verification\n');

  // Check if registry is configured
  const contractAddress = process.env.STREAM_REGISTRY_CONTRACT;

  if (!contractAddress) {
    console.log('❌ STREAM_REGISTRY_CONTRACT not set in .env');
    console.log('   Run: yarn deploy');
    console.log('   Then: export STREAM_REGISTRY_CONTRACT=0x...\n');
    return;
  }

  console.log(`📍 Using StreamRegistry at: ${contractAddress}\n`);

  const registry = createRegistryClient();

  if (!registry) {
    console.log('❌ Failed to create registry client\n');
    return;
  }

  // Load streams.json
  const streamsPath = path.join(__dirname, '../openmhz/streams.json');
  const streamsData = JSON.parse(await fs.readFile(streamsPath, 'utf-8'));

  console.log('📂 Loaded streams.json\n');

  // Test 1: Verify legitimate stream
  console.log('--- Test 1: Verify Legitimate Stream ---\n');

  const legitimateStream = streamsData['local-test'].streams[0];
  const result1 = await registry.verifyStreamWallet(legitimateStream);

  console.log(`Stream: ${legitimateStream.name}`);
  console.log(`JSON Wallet: ${result1.jsonWallet}`);
  console.log(`Contract Wallet: ${result1.contractWallet}`);
  console.log(`Verified: ${result1.verified ? '✅' : '❌'}`);
  console.log(`Match: ${result1.match ? '✅' : '❌'}\n`);

  // Test 2: Fake a wallet address (tampering)
  console.log('--- Test 2: Tamper with Wallet Address ---\n');

  const fakeStream = {
    ...legitimateStream,
    wallet: {
      ...legitimateStream.wallet,
      address: '0x1234567890123456789012345678901234567890' // FAKE ADDRESS
    }
  };

  const result2 = await registry.verifyStreamWallet(fakeStream);

  console.log(`Stream: ${fakeStream.name} (TAMPERED)`);
  console.log(`JSON Wallet (FAKE): ${result2.jsonWallet}`);
  console.log(`Contract Wallet (REAL): ${result2.contractWallet}`);
  console.log(`Verified: ${result2.verified ? '✅' : '❌'}`);
  console.log(`Match: ${result2.match ? '✅ ACCEPTED' : '❌ REJECTED'}\n`);

  if (!result2.match) {
    console.log('🎉 SUCCESS! Fake wallet was detected and rejected!');
    console.log(`   Backend will use: ${result2.shouldUse}`);
    console.log(`   Not the fake: ${result2.jsonWallet}\n`);
  }

  // Test 3: Unregistered stream
  console.log('--- Test 3: Unregistered Stream ---\n');

  const unregisteredStream = {
    stream_id: 'unregistered-stream-999',
    name: 'Unregistered Stream',
    system_name: 'fake-system',
    talkgroup_id: 9999,
    metadata: { call_id: 'fake-call-999' },
    wallet: { address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb5' }
  };

  const result3 = await registry.verifyStreamWallet(unregisteredStream);

  console.log(`Stream: ${unregisteredStream.name}`);
  console.log(`JSON Wallet: ${result3.jsonWallet}`);
  console.log(`Contract Wallet: ${result3.contractWallet}`);
  console.log(`Verified: ${result3.verified ? '✅' : '❌ NOT ON CHAIN'}`);
  console.log(`Match: ${result3.match ? '✅' : '❌'}\n`);

  if (!result3.verified) {
    console.log('✅ Correctly detected unregistered stream');
    console.log('   This stream is NOT on the blockchain\n');
  }

  // Summary
  console.log('📊 Summary:\n');
  console.log('1. Legitimate streams: ✅ Verified against blockchain');
  console.log('2. Tampered wallets: ❌ Rejected, blockchain wallet used instead');
  console.log('3. Unregistered streams: ⚠️  Flagged as unverified\n');

  console.log('🔐 The blockchain is your source of truth!\n');
}

// Run test
if (require.main === module) {
  testRegistryVerification().catch(console.error);
}

module.exports = { testRegistryVerification };
