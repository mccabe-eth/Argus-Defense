/**
 * Argus Defense - Start Publisher
 * Starts the libp2p stream publisher
 */

import StreamPublisher from './libp2p/streamPublisher.mjs';

async function main() {
  const publisher = new StreamPublisher();

  try {
    console.log('🚀 Starting Argus Defense Stream Publisher...\n');

    await publisher.start();

    console.log('\n✅ Publisher is ready!');
    console.log('\nExample usage:');
    console.log('  publisher.publishOpenMhzStream(streamId, audioUrl, metadata)');
    console.log('  publisher.publishLocalSdrStream(streamId, metadata)');
    console.log('  publisher.getActiveStreams()');
    console.log('  publisher.stopStream(streamId)');
    console.log('\nPress Ctrl+C to stop.\n');

    // Make publisher available globally for testing
    global.publisher = publisher;

    // Keep the process running
    process.on('SIGINT', async () => {
      console.log('\n\n🛑 Shutting down publisher...');
      await publisher.stop();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('\n\n🛑 Shutting down publisher...');
      await publisher.stop();
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Failed to start publisher:', error);
    process.exit(1);
  }
}

main().catch(console.error);
