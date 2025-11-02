/**
 * Argus Defense - Stream Publisher
 * Publishes audio streams to libp2p pubsub topics
 */

import { startNode, publishToTopic, getTopicPeers } from './p2pNode.mjs';
import { StreamDirectory } from './streamDirectory.mjs';
import { getNodeConfig } from './nodeDetection.mjs';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Stream Publisher class
 * Manages publishing audio streams to libp2p pubsub
 */
export default class StreamPublisher {
  constructor() {
    this.node = null;
    this.directory = null;
    this.activeStreams = new Map();
    this.streamStats = new Map();
  }

  /**
   * Initialize the publisher node
   */
  async start() {
    if (this.node) {
      console.log('⚠️  Publisher already started');
      return;
    }

    // Auto-detect environment and configure appropriately
    console.log('🎙️  Starting Stream Publisher...');
    const config = await getNodeConfig();

    console.log(`   Mode: ${config.mode.toUpperCase()}`);

    this.node = await startNode({
      listen: config.listen,
      announce: config.announce,
      enableRelay: config.enableRelay
    });

    // Initialize stream directory
    this.directory = new StreamDirectory(this.node);
    await this.directory.start();

    console.log('✅ Stream Publisher ready!');
    console.log(`📍 Publisher Peer ID: ${this.node.peerId.toString()}`);
    console.log(`🌍 Node Mode: ${config.mode.toUpperCase()}`);
  }

  /**
   * Stop the publisher node
   */
  async stop() {
    if (!this.node) {
      return;
    }

    console.log('🛑 Stopping all streams...');

    // Stop all active streams
    for (const [streamId] of this.activeStreams) {
      await this.stopStream(streamId);
    }

    // Stop stream directory
    if (this.directory) {
      await this.directory.stop();
      this.directory = null;
    }

    // Stop the node
    await this.node.stop();
    this.node = null;

    console.log('✅ Stream Publisher stopped');
  }

  /**
   * Publish an OpenMHz stream to a libp2p topic
   * @param {string} streamId - Unique stream identifier
   * @param {string} audioUrl - URL of the audio stream
   * @param {Object} metadata - Stream metadata
   */
  async publishOpenMhzStream(streamId, audioUrl, metadata = {}) {
    if (!this.node) {
      throw new Error('Publisher not started. Call start() first.');
    }

    if (this.activeStreams.has(streamId)) {
      throw new Error(`Stream ${streamId} is already being published`);
    }

    const topic = `argus-defense/stream/${streamId}`;

    console.log(`🚀 Publishing OpenMHz stream: ${streamId}`);
    console.log(`   Topic: ${topic}`);
    console.log(`   Audio URL: ${audioUrl}`);

    // Publish metadata first
    const metadataMsg = JSON.stringify({
      type: 'metadata',
      streamId,
      audioUrl,
      metadata,
      timestamp: Date.now()
    });

    await publishToTopic(this.node, topic, metadataMsg);

    // Fetch and stream audio data
    const protocol = audioUrl.startsWith('https') ? https : http;

    const streamInfo = {
      streamId,
      topic,
      audioUrl,
      metadata,
      startTime: Date.now(),
      bytesPublished: 0,
      chunksPublished: 0
    };

    this.activeStreams.set(streamId, streamInfo);
    this.streamStats.set(streamId, {
      listeners: 0,
      bytesPublished: 0,
      duration: 0
    });

    // Announce stream to the global directory
    if (this.directory) {
      await this.directory.announceStream(streamId, {
        name: metadata.name || streamId,
        audioUrl,
        source: 'openmhz',
        system_name: metadata.system_name,
        category: metadata.category,
        talkgroup_id: metadata.talkgroup_id,
        duration: metadata.duration,
        timestamp: metadata.timestamp,
        ...metadata
      });
    }

    const request = protocol.get(audioUrl, (response) => {
      if (response.statusCode !== 200) {
        console.error(`❌ Failed to fetch audio: ${response.statusCode}`);
        this.activeStreams.delete(streamId);
        return;
      }

      console.log(`✅ Streaming audio from ${audioUrl}`);

      // Stream audio chunks to pubsub
      response.on('data', async (chunk) => {
        try {
          // Create a message with the audio chunk
          const message = {
            type: 'audio',
            streamId,
            chunk: chunk.toString('base64'),
            timestamp: Date.now()
          };

          await publishToTopic(this.node, topic, JSON.stringify(message));

          streamInfo.bytesPublished += chunk.length;
          streamInfo.chunksPublished++;

          // Update stats every 100 chunks
          if (streamInfo.chunksPublished % 100 === 0) {
            const listeners = getTopicPeers(this.node, topic).length;
            console.log(`📊 Stream ${streamId}: ${streamInfo.chunksPublished} chunks, ${streamInfo.bytesPublished} bytes, ${listeners} listeners`);
            this.streamStats.set(streamId, {
              listeners,
              bytesPublished: streamInfo.bytesPublished,
              duration: Date.now() - streamInfo.startTime
            });
          }
        } catch (error) {
          console.error(`❌ Error publishing chunk:`, error);
        }
      });

      response.on('end', async () => {
        console.log(`🏁 Stream ${streamId} ended`);

        // Publish end message
        const endMsg = JSON.stringify({
          type: 'end',
          streamId,
          timestamp: Date.now(),
          totalBytes: streamInfo.bytesPublished,
          totalChunks: streamInfo.chunksPublished
        });

        await publishToTopic(this.node, topic, endMsg);
        this.activeStreams.delete(streamId);
      });

      response.on('error', (error) => {
        console.error(`❌ Stream error:`, error);
        this.activeStreams.delete(streamId);
      });

      streamInfo.request = request;
    });

    request.on('error', (error) => {
      console.error(`❌ Request error:`, error);
      this.activeStreams.delete(streamId);
    });

    return {
      streamId,
      topic,
      peerId: this.node.peerId.toString()
    };
  }

  /**
   * Publish a local SDR stream to a libp2p topic
   * @param {string} streamId - Unique stream identifier
   * @param {Object} metadata - Stream metadata
   */
  async publishLocalSdrStream(streamId, metadata = {}) {
    if (!this.node) {
      throw new Error('Publisher not started. Call start() first.');
    }

    if (this.activeStreams.has(streamId)) {
      throw new Error(`Stream ${streamId} is already being published`);
    }

    const topic = `argus-defense/stream/${streamId}`;

    console.log(`🚀 Publishing local SDR stream: ${streamId}`);
    console.log(`   Topic: ${topic}`);

    // Publish metadata first
    const metadataMsg = JSON.stringify({
      type: 'metadata',
      streamId,
      source: 'local_sdr',
      metadata,
      timestamp: Date.now()
    });

    await publishToTopic(this.node, topic, metadataMsg);

    // Start SDR capture process
    const pythonScript = path.join(__dirname, '../sdr/sim-capture.py');
    const py = spawn('python3', [pythonScript]);

    const streamInfo = {
      streamId,
      topic,
      source: 'local_sdr',
      metadata,
      process: py,
      startTime: Date.now(),
      bytesPublished: 0,
      chunksPublished: 0
    };

    this.activeStreams.set(streamId, streamInfo);

    // Stream IQ data to pubsub
    py.stdout.on('data', async (data) => {
      try {
        const message = {
          type: 'iq_data',
          streamId,
          data: data.toString('base64'),
          timestamp: Date.now()
        };

        await publishToTopic(this.node, topic, JSON.stringify(message));

        streamInfo.bytesPublished += data.length;
        streamInfo.chunksPublished++;

        if (streamInfo.chunksPublished % 50 === 0) {
          const listeners = getTopicPeers(this.node, topic).length;
          console.log(`📊 SDR Stream ${streamId}: ${streamInfo.chunksPublished} chunks, ${listeners} listeners`);
        }
      } catch (error) {
        console.error(`❌ Error publishing IQ data:`, error);
      }
    });

    py.stderr.on('data', (data) => {
      console.error(`⚠️  SDR error: ${data.toString()}`);
    });

    py.on('close', async (code) => {
      console.log(`🏁 SDR stream ${streamId} ended with code ${code}`);

      const endMsg = JSON.stringify({
        type: 'end',
        streamId,
        timestamp: Date.now(),
        totalBytes: streamInfo.bytesPublished,
        totalChunks: streamInfo.chunksPublished
      });

      await publishToTopic(this.node, topic, endMsg);
      this.activeStreams.delete(streamId);
    });

    return {
      streamId,
      topic,
      peerId: this.node.peerId.toString()
    };
  }

  /**
   * Stop a specific stream
   * @param {string} streamId - Stream ID to stop
   */
  async stopStream(streamId) {
    const streamInfo = this.activeStreams.get(streamId);

    if (!streamInfo) {
      console.log(`⚠️  Stream ${streamId} not found`);
      return;
    }

    console.log(`🛑 Stopping stream: ${streamId}`);

    // Stop HTTP request if exists
    if (streamInfo.request) {
      streamInfo.request.destroy();
    }

    // Kill Python process if exists
    if (streamInfo.process) {
      streamInfo.process.kill();
    }

    // Publish end message
    const endMsg = JSON.stringify({
      type: 'end',
      streamId,
      timestamp: Date.now(),
      reason: 'stopped'
    });

    await publishToTopic(this.node, streamInfo.topic, endMsg);

    // Deregister from directory
    if (this.directory) {
      await this.directory.deregisterStream(streamId);
    }

    this.activeStreams.delete(streamId);
    this.streamStats.delete(streamId);

    console.log(`✅ Stream ${streamId} stopped`);
  }

  /**
   * Get active streams
   * @returns {Array} List of active streams
   */
  getActiveStreams() {
    const streams = [];

    for (const [streamId, info] of this.activeStreams) {
      const stats = this.streamStats.get(streamId) || {};
      const listeners = getTopicPeers(this.node, info.topic).length;

      streams.push({
        streamId,
        topic: info.topic,
        source: info.source || 'openmhz',
        metadata: info.metadata,
        bytesPublished: info.bytesPublished,
        chunksPublished: info.chunksPublished,
        listeners,
        uptime: Date.now() - info.startTime
      });
    }

    return streams;
  }

  /**
   * Get publisher info
   * @returns {Object} Publisher information
   */
  getInfo() {
    if (!this.node) {
      return { status: 'stopped' };
    }

    const directoryInfo = this.directory ? this.directory.getStreamCount() : { local: 0, discovered: 0, total: 0 };

    return {
      status: 'running',
      peerId: this.node.peerId.toString(),
      addresses: this.node.getMultiaddrs().map(addr => addr.toString()),
      activeStreams: this.activeStreams.size,
      peers: this.node.getPeers().length,
      directory: directoryInfo
    };
  }

  /**
   * Query the global stream directory
   * @param {Object} filter - Optional filter criteria
   * @returns {Promise<Array>} List of discovered streams
   */
  async queryDirectory(filter = {}) {
    if (!this.directory) {
      throw new Error('Directory not initialized');
    }

    return await this.directory.queryStreams(filter);
  }

  /**
   * Get discovered streams from the directory
   * @param {Object} filter - Optional filter criteria
   * @returns {Array} List of discovered streams
   */
  getDiscoveredStreams(filter = {}) {
    if (!this.directory) {
      return [];
    }

    return this.directory.getDiscoveredStreams(filter);
  }

  /**
   * Get the stream directory instance
   * @returns {StreamDirectory} Stream directory
   */
  getDirectory() {
    return this.directory;
  }
}
