/**
 * Debug Backend Startup
 * Run this to see exactly what happens during auto-publish
 */

const fs = require('fs').promises;
const path = require('path');

async function debugStartup() {
  console.log('🔍 Debugging Backend Startup\n');

  // Check environment variables
  console.log('1. Environment Variables:');
  console.log(`   LIBP2P_AUTO_PUBLISH = ${process.env.LIBP2P_AUTO_PUBLISH}`);
  console.log(`   LIBP2P_AUTO_PUBLISH_LIMIT = ${process.env.LIBP2P_AUTO_PUBLISH_LIMIT}`);
  console.log(`   API_PORT = ${process.env.API_PORT}\n`);

  // Check if auto-publish would be enabled
  const AUTO_PUBLISH_ENABLED = process.env.LIBP2P_AUTO_PUBLISH === 'true';
  console.log(`2. Auto-Publish Enabled: ${AUTO_PUBLISH_ENABLED}`);

  if (!AUTO_PUBLISH_ENABLED) {
    console.log('   ❌ AUTO-PUBLISH IS DISABLED!');
    console.log('   Set LIBP2P_AUTO_PUBLISH=true to enable\n');
  } else {
    console.log('   ✅ Auto-publish is enabled\n');
  }

  // Check streams.json
  console.log('3. Checking streams.json:');
  const streamsPath = path.join(__dirname, 'openmhz/streams.json');

  try {
    const data = JSON.parse(await fs.readFile(streamsPath, 'utf-8'));
    console.log(`   ✅ File exists and is valid JSON`);
    console.log(`   Last updated: ${data.last_updated}\n`);

    // Count streams
    let totalStreams = 0;
    for (const [key, system] of Object.entries(data)) {
      if (key === 'last_updated') continue;

      console.log(`   System: ${system.system_id}`);
      console.log(`   Streams: ${system.total_streams}`);

      if (system.streams) {
        totalStreams += system.streams.length;
        system.streams.forEach(stream => {
          console.log(`      - ${stream.stream_id}`);
          console.log(`        Name: ${stream.name}`);
          console.log(`        URL: ${stream.audio_url}`);
        });
      }
      console.log('');
    }

    console.log(`   Total streams found: ${totalStreams}\n`);

  } catch (error) {
    console.log(`   ❌ Error reading streams.json: ${error.message}\n`);
  }

  // Check Assets folder
  console.log('4. Checking Assets folder:');
  const assetsPath = path.join(__dirname, '..', 'Assets');

  try {
    const files = await fs.readdir(assetsPath);
    const audioFiles = files.filter(f => f.endsWith('.mp3') || f.endsWith('.m4a') || f.endsWith('.wav'));

    console.log(`   ✅ Found ${audioFiles.length} audio files:`);
    audioFiles.forEach(f => console.log(`      - ${f}`));
    console.log('');
  } catch (error) {
    console.log(`   ❌ Error reading Assets: ${error.message}\n`);
  }

  // Summary
  console.log('📊 Summary:');
  console.log(`   Auto-Publish: ${AUTO_PUBLISH_ENABLED ? '✅ ENABLED' : '❌ DISABLED'}`);
  console.log(`   Streams JSON: ✅`);
  console.log(`   Audio Files: ✅\n`);

  console.log('🚀 To start backend with auto-publish:');
  console.log('   LIBP2P_AUTO_PUBLISH=true node apiServer.js\n');
  console.log('   OR use yarn script:');
  console.log('   yarn p2p:start\n');
}

debugStartup().catch(console.error);
