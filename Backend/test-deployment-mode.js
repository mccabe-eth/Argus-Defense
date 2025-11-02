/**
 * Test script to verify deployment mode detection
 * Run: node test-deployment-mode.js
 */

import { detectPublicIP, getNodeConfig } from './libp2p/nodeDetection.mjs';

async function testDeploymentMode() {
  console.log('🧪 Testing Argus Defense Deployment Mode Detection\n');

  // Test IP detection
  console.log('Step 1: Detecting network environment...');
  const detection = await detectPublicIP();

  console.log('\n📊 Detection Results:');
  console.log(`   Mode: ${detection.mode}`);
  console.log(`   Public IP: ${detection.ip || 'None (behind NAT)'}`);
  console.log(`   Source: ${detection.source}`);

  // Test node configuration
  console.log('\nStep 2: Generating node configuration...');
  const config = await getNodeConfig();

  console.log('\n⚙️  Node Configuration:');
  console.log(`   Mode: ${config.mode.toUpperCase()}`);
  console.log(`   Listen: ${config.listen.join(', ')}`);
  console.log(`   Announce: ${config.announce.length > 0 ? config.announce.join(', ') : 'None (using relay)'}`);
  console.log(`   Relay: ${config.enableRelay ? 'Enabled' : 'Disabled'}`);

  // Summary
  console.log('\n✅ Deployment Mode Summary:');
  if (config.mode === 'full') {
    console.log('   🌐 FULL NODE - Ready for production deployment');
    console.log('   → You can publish streams directly to the P2P network');
    console.log('   → Other nodes can connect directly to you');
    console.log('   → Ensure port 9001 is open in your firewall');
  } else {
    console.log('   🏠 LIGHT NODE - Ready for NAT/home deployment');
    console.log('   → You will connect via circuit relay');
    console.log('   → No port forwarding needed');
    console.log('   → You can still publish streams to the network');
  }

  console.log('\n🚀 Ready to start: LIBP2P_AUTO_PUBLISH=true node apiServer.js\n');
}

testDeploymentMode().catch(console.error);
