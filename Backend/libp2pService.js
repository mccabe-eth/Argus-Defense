/**
 * Argus Defense - libp2p Service Bridge
 * CommonJS bridge to the ES module StreamPublisher
 */

let StreamPublisher;
let publisherInstance = null;

/**
 * Initialize the StreamPublisher module
 * Uses dynamic import to load ES modules in CommonJS context
 */
async function initializePublisher() {
  if (!StreamPublisher) {
    const module = await import('./libp2p/streamPublisher.mjs');
    StreamPublisher = module.default;
  }
}

/**
 * Start the libp2p publisher node
 * Creates a singleton instance if it doesn't exist
 * @returns {Promise<Object>} Publisher info
 */
async function startPublisher() {
  try {
    await initializePublisher();

    if (publisherInstance) {
      console.log('⚠️  Publisher already running');
      return publisherInstance.getInfo();
    }

    publisherInstance = new StreamPublisher();
    await publisherInstance.start();

    console.log('✅ libp2p Publisher started successfully');
    return publisherInstance.getInfo();
  } catch (error) {
    console.error('❌ Failed to start publisher:', error);
    throw error;
  }
}

/**
 * Stop the libp2p publisher node
 * @returns {Promise<void>}
 */
async function stopPublisher() {
  try {
    if (!publisherInstance) {
      console.log('⚠️  Publisher not running');
      return;
    }

    await publisherInstance.stop();
    publisherInstance = null;

    console.log('✅ libp2p Publisher stopped successfully');
  } catch (error) {
    console.error('❌ Failed to stop publisher:', error);
    throw error;
  }
}

/**
 * Publish an OpenMHz stream to libp2p
 * @param {string} streamId - Unique stream identifier
 * @param {string} audioUrl - URL of the audio stream
 * @param {Object} metadata - Stream metadata
 * @returns {Promise<Object>} Stream publication info
 */
async function publishStream(streamId, audioUrl, metadata = {}) {
  try {
    if (!publisherInstance) {
      throw new Error('Publisher not started. Call startPublisher() first.');
    }

    const result = await publisherInstance.publishOpenMhzStream(streamId, audioUrl, metadata);
    console.log(`✅ Stream ${streamId} published to libp2p`);
    return result;
  } catch (error) {
    console.error(`❌ Failed to publish stream ${streamId}:`, error);
    throw error;
  }
}

/**
 * Stop publishing a specific stream
 * @param {string} streamId - Stream ID to stop
 * @returns {Promise<void>}
 */
async function stopStream(streamId) {
  try {
    if (!publisherInstance) {
      throw new Error('Publisher not started');
    }

    await publisherInstance.stopStream(streamId);
    console.log(`✅ Stream ${streamId} stopped`);
  } catch (error) {
    console.error(`❌ Failed to stop stream ${streamId}:`, error);
    throw error;
  }
}

/**
 * Get list of active P2P streams
 * @returns {Array} List of active streams
 */
function getActiveStreams() {
  if (!publisherInstance) {
    return [];
  }

  return publisherInstance.getActiveStreams();
}

/**
 * Get publisher information
 * @returns {Object} Publisher info (peerId, status, active streams, etc.)
 */
function getPublisherInfo() {
  if (!publisherInstance) {
    return {
      status: 'stopped',
      peerId: null,
      activeStreams: 0,
      peers: 0
    };
  }

  return publisherInstance.getInfo();
}

/**
 * Check if a stream is being published via libp2p
 * @param {string} streamId - Stream ID to check
 * @returns {boolean} True if stream is active on libp2p
 */
function isStreamPublished(streamId) {
  if (!publisherInstance) {
    return false;
  }

  const activeStreams = publisherInstance.getActiveStreams();
  return activeStreams.some(stream => stream.streamId === streamId);
}

/**
 * Get peer count for a specific stream
 * @param {string} streamId - Stream ID
 * @returns {number} Number of peers listening to the stream
 */
function getStreamPeerCount(streamId) {
  if (!publisherInstance) {
    return 0;
  }

  const activeStreams = publisherInstance.getActiveStreams();
  const stream = activeStreams.find(s => s.streamId === streamId);
  return stream ? stream.listeners : 0;
}

/**
 * Query the global stream directory
 * @param {Object} filter - Optional filter criteria
 * @returns {Promise<Array>} List of discovered streams
 */
async function queryDirectory(filter = {}) {
  if (!publisherInstance) {
    throw new Error('Publisher not started');
  }

  return await publisherInstance.queryDirectory(filter);
}

/**
 * Get discovered streams from the directory
 * @param {Object} filter - Optional filter criteria
 * @returns {Array} List of discovered streams
 */
function getDiscoveredStreams(filter = {}) {
  if (!publisherInstance) {
    return [];
  }

  return publisherInstance.getDiscoveredStreams(filter);
}

module.exports = {
  startPublisher,
  stopPublisher,
  publishStream,
  stopStream,
  getActiveStreams,
  getPublisherInfo,
  isStreamPublished,
  getStreamPeerCount,
  queryDirectory,
  getDiscoveredStreams
};
