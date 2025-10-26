/**
 * Auto-update streams.json when Assets/ folder changes
 * Scans Assets/ for audio files and updates streams.json accordingly
 */

const fs = require('fs').promises;
const path = require('path');

async function updateStreamsFromAssets() {
  console.log('🔄 Updating streams.json from Assets/ folder...\n');

  const assetsPath = path.join(__dirname, '../../Assets');
  const streamsPath = path.join(__dirname, '../openmhz/streams.json');

  // Read current streams.json
  const streamsData = JSON.parse(await fs.readFile(streamsPath, 'utf-8'));

  // Scan Assets/ folder for audio files
  const files = await fs.readdir(assetsPath);
  const audioFiles = files.filter(f =>
    f.endsWith('.mp3') || f.endsWith('.m4a') || f.endsWith('.wav')
  );

  console.log(`📂 Found ${audioFiles.length} audio files in Assets/\n`);

  // Update streams in local-test system
  if (!streamsData['local-test']) {
    streamsData['local-test'] = {
      system_id: 'local-test',
      total_streams: 0,
      total_talkgroups: 0,
      talkgroups: [],
      streams: []
    };
  }

  const system = streamsData['local-test'];
  const existingStreams = new Map(system.streams.map(s => [s.filename, s]));

  // Update or create streams for each audio file
  const updatedStreams = [];

  audioFiles.forEach((filename, index) => {
    const streamId = `local-${filename.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`;
    const existing = existingStreams.get(filename);

    const stream = {
      stream_id: streamId,
      name: existing?.name || filename.replace(/\.\w+$/, ''),
      description: existing?.description || `Local audio file: ${filename}`,
      audio_url: `http://localhost:3001/assets/${encodeURIComponent(filename)}`,
      system_name: 'local-test',
      talkgroup_id: existing?.talkgroup_id || (1000 + index),
      timestamp: new Date().toISOString(),
      duration: existing?.duration || 0,
      filename: filename,
      src_list: existing?.src_list || [{ src: 1000 + index, pos: 0.0 }],
      metadata: existing?.metadata || {
        star_count: 0,
        call_id: streamId,
        talkgroup_info: {
          num: 1000 + index,
          alpha: `AUDIO_${index + 1}`,
          description: filename,
          tag: 'Local Audio',
          category: 'Information'
        }
      },
      wallet: existing?.wallet || {
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb5',
        contract_address: null,
        mode: 'simple',
        created_at: new Date().toISOString()
      }
    };

    updatedStreams.push(stream);
    console.log(`✅ ${existing ? 'Updated' : 'Added'}: ${filename}`);
  });

  // Update system data
  system.streams = updatedStreams;
  system.total_streams = updatedStreams.length;
  system.generated_at = new Date().toISOString();
  streamsData.last_updated = new Date().toISOString();

  // Write back to streams.json
  await fs.writeFile(streamsPath, JSON.stringify(streamsData, null, 2));

  console.log(`\n✅ Updated streams.json with ${updatedStreams.length} streams`);
  console.log(`📍 Restart backend to publish changes\n`);
}

// Run if called directly
if (require.main === module) {
  updateStreamsFromAssets().catch(console.error);
}

module.exports = { updateStreamsFromAssets };
