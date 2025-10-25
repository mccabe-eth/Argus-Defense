/**
 * Argus Defense - Stream Subscriber
 * Subscribes to and receives audio streams from libp2p pubsub
 */

import { startNode, subscribeTopic, getTopicPeers } from './p2pNode.mjs';
import EventEmitter from 'events';

/**
 * Stream Subscriber class
 * Manages subscribing to audio streams from libp2p pubsub
 */
export default class StreamSubscriber extends EventEmitter {
  constructor() {
    super();
    this.node = null;
    this.subscriptions = new Map();
    this.streamBuffers = new Map();
  }

  /**
   * Initialize the subscriber node
   */
  async start() {
    if (this.node) {
      console.log('⚠️  Subscriber already started');
      return;
    }

    console.log('🎧 Starting Stream Subscriber...');
    this.node = await startNode({
      listen: [
        '/ip4/0.0.0.0/tcp/9003',
        '/ip4/0.0.0.0/tcp/9004/ws'
      ]
    });

    console.log('✅ Stream Subscriber ready!');
    console.log(`📍 Subscriber Peer ID: ${this.node.peerId.toString()}`);

    this.emit('ready', {
      peerId: this.node.peerId.toString()
    });
  }

  /**
   * Stop the subscriber node
   */
  async stop() {
    if (!this.node) {
      return;
    }

    console.log('🛑 Unsubscribing from all streams...');

    // Unsubscribe from all topics
    for (const [streamId, subscription] of this.subscriptions) {
      subscription.unsubscribe();
    }

    this.subscriptions.clear();
    this.streamBuffers.clear();

    // Stop the node
    await this.node.stop();
    this.node = null;

    console.log('✅ Stream Subscriber stopped');
    this.emit('stopped');
  }

  /**
   * Subscribe to a stream
   * @param {string} streamId - Stream ID to subscribe to
   * @returns {Object} Subscription info
   */
  async subscribeToStream(streamId) {
    if (!this.node) {
      throw new Error('Subscriber not started. Call start() first.');
    }

    if (this.subscriptions.has(streamId)) {
      console.log(`⚠️  Already subscribed to stream: ${streamId}`);
      return this.subscriptions.get(streamId);
    }

    const topic = `argus-defense/stream/${streamId}`;

    console.log(`📡 Subscribing to stream: ${streamId}`);
    console.log(`   Topic: ${topic}`);

    // Initialize stream buffer
    this.streamBuffers.set(streamId, {
      metadata: null,
      chunks: [],
      totalBytes: 0,
      startTime: null,
      ended: false
    });

    // Subscribe to the topic
    const subscription = await subscribeTopic(this.node, topic, (message) => {
      this.handleStreamMessage(streamId, message);
    });

    this.subscriptions.set(streamId, {
      streamId,
      topic,
      subscription,
      startTime: Date.now()
    });

    console.log(`✅ Subscribed to stream: ${streamId}`);

    this.emit('subscribed', {
      streamId,
      topic,
      peerId: this.node.peerId.toString()
    });

    return {
      streamId,
      topic,
      peerId: this.node.peerId.toString()
    };
  }

  /**
   * Handle incoming stream messages
   * @param {string} streamId - Stream ID
   * @param {Object} message - Incoming message
   */
  handleStreamMessage(streamId, message) {
    try {
      const buffer = this.streamBuffers.get(streamId);
      if (!buffer) return;

      // Parse message data
      let data;
      try {
        const text = Buffer.from(message.data).toString('utf-8');
        data = JSON.parse(text);
      } catch (error) {
        console.error(`❌ Failed to parse message:`, error);
        return;
      }

      // Handle different message types
      switch (data.type) {
        case 'metadata':
          buffer.metadata = data.metadata;
          buffer.startTime = data.timestamp;
          console.log(`📋 Received metadata for stream ${streamId}`);
          this.emit('metadata', {
            streamId,
            metadata: data.metadata,
            audioUrl: data.audioUrl,
            source: data.source
          });
          break;

        case 'audio':
          // Decode base64 audio chunk
          const audioChunk = Buffer.from(data.chunk, 'base64');
          buffer.chunks.push({
            data: audioChunk,
            timestamp: data.timestamp
          });
          buffer.totalBytes += audioChunk.length;

          this.emit('audio', {
            streamId,
            chunk: audioChunk,
            timestamp: data.timestamp,
            totalBytes: buffer.totalBytes
          });
          break;

        case 'iq_data':
          // Decode base64 IQ data
          const iqData = Buffer.from(data.data, 'base64');
          buffer.chunks.push({
            data: iqData,
            timestamp: data.timestamp
          });
          buffer.totalBytes += iqData.length;

          this.emit('iq_data', {
            streamId,
            data: iqData,
            timestamp: data.timestamp,
            totalBytes: buffer.totalBytes
          });
          break;

        case 'end':
          buffer.ended = true;
          console.log(`🏁 Stream ${streamId} ended`);
          console.log(`   Total bytes: ${data.totalBytes || buffer.totalBytes}`);
          console.log(`   Total chunks: ${data.totalChunks || buffer.chunks.length}`);

          this.emit('end', {
            streamId,
            totalBytes: data.totalBytes || buffer.totalBytes,
            totalChunks: data.totalChunks || buffer.chunks.length,
            reason: data.reason
          });
          break;

        default:
          console.log(`⚠️  Unknown message type: ${data.type}`);
      }
    } catch (error) {
      console.error(`❌ Error handling message:`, error);
    }
  }

  /**
   * Unsubscribe from a stream
   * @param {string} streamId - Stream ID to unsubscribe from
   */
  async unsubscribeFromStream(streamId) {
    const subscription = this.subscriptions.get(streamId);

    if (!subscription) {
      console.log(`⚠️  Not subscribed to stream: ${streamId}`);
      return;
    }

    console.log(`🔕 Unsubscribing from stream: ${streamId}`);

    subscription.subscription.unsubscribe();
    this.subscriptions.delete(streamId);
    this.streamBuffers.delete(streamId);

    console.log(`✅ Unsubscribed from stream: ${streamId}`);

    this.emit('unsubscribed', { streamId });
  }

  /**
   * Get stream buffer
   * @param {string} streamId - Stream ID
   * @returns {Object|null} Stream buffer
   */
  getStreamBuffer(streamId) {
    return this.streamBuffers.get(streamId) || null;
  }

  /**
   * Get active subscriptions
   * @returns {Array} List of active subscriptions
   */
  getSubscriptions() {
    const subscriptions = [];

    for (const [streamId, sub] of this.subscriptions) {
      const buffer = this.streamBuffers.get(streamId);
      const peers = getTopicPeers(this.node, sub.topic);

      subscriptions.push({
        streamId,
        topic: sub.topic,
        metadata: buffer?.metadata,
        bytesReceived: buffer?.totalBytes || 0,
        chunksReceived: buffer?.chunks.length || 0,
        ended: buffer?.ended || false,
        peers: peers.length,
        uptime: Date.now() - sub.startTime
      });
    }

    return subscriptions;
  }

  /**
   * Get subscriber info
   * @returns {Object} Subscriber information
   */
  getInfo() {
    if (!this.node) {
      return { status: 'stopped' };
    }

    return {
      status: 'running',
      peerId: this.node.peerId.toString(),
      addresses: this.node.getMultiaddrs().map(addr => addr.toString()),
      activeSubscriptions: this.subscriptions.size,
      peers: this.node.getPeers().length
    };
  }

  /**
   * Create a readable stream for a subscribed stream
   * Useful for piping audio data to a player
   * @param {string} streamId - Stream ID
   * @returns {ReadableStream} Readable stream
   */
  createReadableStream(streamId) {
    const { Readable } = await import('stream');

    const readable = new Readable({
      read() {
        // Data will be pushed via events
      }
    });

    // Listen for audio chunks and push to stream
    const audioHandler = ({ streamId: sid, chunk }) => {
      if (sid === streamId) {
        readable.push(chunk);
      }
    };

    const endHandler = ({ streamId: sid }) => {
      if (sid === streamId) {
        readable.push(null); // Signal end of stream
        this.removeListener('audio', audioHandler);
        this.removeListener('end', endHandler);
      }
    };

    this.on('audio', audioHandler);
    this.on('end', endHandler);

    return readable;
  }
}
