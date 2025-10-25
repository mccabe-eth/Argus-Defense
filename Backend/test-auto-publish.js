/**
 * Test Auto-Publish Logic
 * Run this to manually trigger auto-publish and see what happens
 */

const fs = require('fs').promises;
const path = require('path');

// Simulate the auto-publish logic
async function testAutoPublish() {
  console.log('🧪 Testing Auto-Publish Logic\n');

  // Load streams.json
  const dataPath = path.join(__dirname, 'openmhz/streams.json');
  const data = JSON.parse(await fs.readFile(dataPath, 'utf-8'));

  console.log('📂 Loaded streams.json');
  console.log(`   Last updated: ${data.last_updated}\n`);

  // Simulate empty lastKnownStreams (first run)
  const lastKnownStreams = new Set();
  const AUTO_PUBLISH_LIMIT = 5;

  const currentStreams = new Set();
  const newStreams = [];

  // Collect all stream IDs
  for (const [systemKey, systemData] of Object.entries(data)) {
    if (systemKey === 'last_updated') continue;

    console.log(`📡 System: ${systemKey}`);
    console.log(`   Total streams: ${systemData.total_streams}`);

    if (systemData.streams && Array.isArray(systemData.streams)) {
      for (const stream of systemData.streams) {
        currentStreams.add(stream.stream_id);

        // Check if this is a new stream
        if (!lastKnownStreams.has(stream.stream_id)) {
          newStreams.push(stream);
          console.log(`   ✅ NEW: ${stream.stream_id}`);
          console.log(`      Name: ${stream.name}`);
          console.log(`      Audio: ${stream.audio_url}`);
        } else {
          console.log(`   ⏭️  KNOWN: ${stream.stream_id}`);
        }
      }
    }
    console.log('');
  }

  // Summary
  console.log('📊 Summary:');
  console.log(`   Total streams in JSON: ${currentStreams.size}`);
  console.log(`   New streams to publish: ${newStreams.length}`);
  console.log(`   Publish limit: ${AUTO_PUBLISH_LIMIT}`);
  console.log(`   Will publish: ${Math.min(newStreams.length, AUTO_PUBLISH_LIMIT)}\n`);

  if (newStreams.length > 0) {
    const streamsToPublish = newStreams.slice(0, AUTO_PUBLISH_LIMIT);
    console.log('📡 Streams that would be auto-published:\n');
    streamsToPublish.forEach((stream, index) => {
      console.log(`   ${index + 1}. ${stream.name} (${stream.stream_id})`);
      console.log(`      Audio: ${stream.audio_url}`);
      console.log(`      Category: ${stream.metadata?.talkgroup_info?.category || 'N/A'}`);
      console.log('');
    });

    if (newStreams.length > AUTO_PUBLISH_LIMIT) {
      console.log(`   ⚠️  ${newStreams.length - AUTO_PUBLISH_LIMIT} stream(s) would be skipped due to limit\n`);
    }

    console.log('💡 To manually publish these streams:');
    console.log('   1. Start the backend: ./start-p2p.sh');
    console.log('   2. In another terminal, run:\n');
    streamsToPublish.forEach((stream) => {
      console.log(`   curl -X POST http://localhost:3001/api/libp2p/publish \\`);
      console.log(`     -H 'Content-Type: application/json' \\`);
      console.log(`     -d '{"streamId": "${stream.stream_id}", "audioUrl": "${stream.audio_url}"}'`);
      console.log('');
    });
  } else {
    console.log('⚠️  No new streams found! This means:');
    console.log('   - lastKnownStreams already has all streams from streams.json');
    console.log('   - Auto-publish only triggers when streams.json changes\n');
  }
}

// Run the test
testAutoPublish().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
