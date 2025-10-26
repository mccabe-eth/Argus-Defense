/**
 * Complete workflow for publishing a new audio stream
 * Steps: Scan Assets → Update JSON → Register on-chain → Deploy wallet → Publish P2P
 */

const fs = require('fs').promises;
const path = require('path');
const { ethers } = require('hardhat');

async function publishNewStream(audioFilename) {
  console.log('\n🚀 Publishing New Stream - Full Workflow\n');
  console.log(`📁 Audio file: ${audioFilename}\n`);

  // Step 1: Generate stream metadata
  console.log('Step 1: Generating metadata...');
  const streamId = `local-${audioFilename.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`;
  const systemId = 'local-test';
  const talkgroupId = Date.now() % 10000; // Unique ID
  const callId = streamId;

  console.log(`   Stream ID: ${streamId}`);
  console.log(`   System: ${systemId}`);
  console.log(`   Talkgroup: ${talkgroupId}\n`);

  // Step 2: Update streams.json
  console.log('Step 2: Updating streams.json...');
  const streamsPath = path.join(__dirname, '../openmhz/streams.json');
  const streamsData = JSON.parse(await fs.readFile(streamsPath, 'utf-8'));

  const newStream = {
    stream_id: streamId,
    name: audioFilename.replace(/\.\w+$/, ''),
    description: `Local audio: ${audioFilename}`,
    audio_url: `http://localhost:3001/assets/${encodeURIComponent(audioFilename)}`,
    system_name: systemId,
    talkgroup_id: talkgroupId,
    timestamp: new Date().toISOString(),
    duration: 0,
    filename: audioFilename,
    src_list: [{ src: talkgroupId, pos: 0.0 }],
    metadata: {
      star_count: 0,
      call_id: callId,
      talkgroup_info: {
        num: talkgroupId,
        alpha: `AUDIO_${talkgroupId}`,
        description: audioFilename,
        tag: 'Local',
        category: 'Information'
      }
    },
    wallet: {
      address: ethers.ZeroAddress, // Will be updated after deployment
      contract_address: null,
      mode: 'incentivized',
      created_at: new Date().toISOString()
    }
  };

  if (!streamsData['local-test']) {
    streamsData['local-test'] = {
      system_id: 'local-test',
      total_streams: 0,
      streams: [],
      talkgroups: []
    };
  }

  streamsData['local-test'].streams.push(newStream);
  streamsData['local-test'].total_streams = streamsData['local-test'].streams.length;
  streamsData.last_updated = new Date().toISOString();

  await fs.writeFile(streamsPath, JSON.stringify(streamsData, null, 2));
  console.log('   ✅ streams.json updated\n');

  // Step 3: Deploy StreamWallet and register on-chain
  console.log('Step 3: Deploying StreamWallet and registering...');

  const [deployer] = await ethers.getSigners();
  const publisherAddress = deployer.address;

  try {
    const StreamFactory = await ethers.getContract('StreamFactory');

    console.log(`   Publisher: ${publisherAddress}`);
    console.log('   Deploying wallet...');

    const tx = await StreamFactory.createStream(systemId, talkgroupId, callId);
    const receipt = await tx.wait();

    // Get StreamCreated event
    const event = receipt.logs.find(log => {
      try {
        const parsed = StreamFactory.interface.parseLog(log);
        return parsed.name === 'StreamCreated';
      } catch { return false; }
    });

    if (event) {
      const parsed = StreamFactory.interface.parseLog(event);
      const walletAddress = parsed.args.wallet;

      console.log(`   ✅ Wallet deployed: ${walletAddress}`);
      console.log(`   ✅ Stream registered on-chain\n`);

      // Update streams.json with wallet address
      const updatedStreamsData = JSON.parse(await fs.readFile(streamsPath, 'utf-8'));
      const stream = updatedStreamsData['local-test'].streams.find(s => s.stream_id === streamId);
      if (stream) {
        stream.wallet.address = walletAddress;
        stream.wallet.contract_address = walletAddress;
        await fs.writeFile(streamsPath, JSON.stringify(updatedStreamsData, null, 2));
        console.log('   ✅ Wallet address saved to streams.json\n');
      }

      // Step 4: Verify on blockchain
      console.log('Step 4: Verifying on blockchain...');
      const StreamRegistry = await ethers.getContract('StreamRegistry');
      const onChainStreamId = await StreamRegistry.computeStreamId(systemId, talkgroupId, callId);
      const onChainWallet = await StreamRegistry.getWallet(onChainStreamId);
      const isActive = await StreamRegistry.isStreamActive(onChainStreamId);

      console.log(`   Stream ID: ${onChainStreamId}`);
      console.log(`   Wallet: ${onChainWallet}`);
      console.log(`   Active: ${isActive ? '✅' : '❌'}\n`);

      // Step 5: Ready to publish via P2P
      console.log('Step 5: Ready for P2P publishing');
      console.log('   ⚡ Restart backend to auto-publish:');
      console.log('      yarn p2p:start\n');

      return {
        streamId,
        walletAddress,
        onChainStreamId,
        success: true
      };
    }
  } catch (error) {
    console.error('   ❌ Error:', error.message);
    return { success: false, error: error.message };
  }
}

// CLI usage
if (require.main === module) {
  const audioFile = process.argv[2];

  if (!audioFile) {
    console.log('Usage: node publishNewStream.js <audio-filename.mp3>');
    console.log('Example: node publishNewStream.js "My New Stream.mp3"');
    process.exit(1);
  }

  publishNewStream(audioFile)
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { publishNewStream };
