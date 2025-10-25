/**
 * Argus Defense - Global Stream Directory
 * Decentralized stream discovery via libp2p pubsub
 */

import { publishToTopic, subscribeTopic } from './p2pNode.mjs';

// Global directory topic for stream announcements
export const STREAM_DIRECTORY_TOPIC = 'argus-defense/stream-directory';

/**
 * Message types for the stream directory
 */
export const MessageType = {
  ANNOUNCE: 'announce',
  HEARTBEAT: 'heartbeat',
  DEREGISTER: 'deregister',
  QUERY: 'query',
  RESPONSE: 'response'
};

/**
 * Stream Directory Manager
 * Handles stream announcements and discovery
 */
export class StreamDirectory {
  constructor(node) {
    this.node = node;
    this.localStreams = new Map(); // streamId -> metadata
    this.discoveredStreams = new Map(); // streamId -> {metadata, publisher, lastSeen}
    this.heartbeatInterval = null;
    this.cleanupInterval = null;
    this.messageHandlers = new Set();
    this.subscribed = false;
  }

  /**
   * Start the stream directory service
   */
  async start() {
    if (this.subscribed) {
      console.log('⚠️  Stream directory already started');
      return;
    }

    console.log('🌐 Starting global stream directory...');

    // Subscribe to directory topic
    const unsubscribe = await subscribeTopic(this.node, STREAM_DIRECTORY_TOPIC, (data) => {
      this.handleDirectoryMessage(data);
    });

    this.unsubscribe = unsubscribe.unsubscribe;
    this.subscribed = true;

    // Start heartbeat for announced streams
    this.startHeartbeat();

    // Start cleanup for stale streams
    this.startCleanup();

    console.log('✅ Stream directory started');
    console.log(`📍 Peer ID: ${this.node.peerId.toString()}`);
  }

  /**
   * Stop the stream directory service
   */
  async stop() {
    if (!this.subscribed) return;

    console.log('🛑 Stopping stream directory...');

    // Deregister all local streams
    for (const streamId of this.localStreams.keys()) {
      await this.deregisterStream(streamId);
    }

    // Stop intervals
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    // Unsubscribe
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }

    this.subscribed = false;
    this.localStreams.clear();
    this.discoveredStreams.clear();

    console.log('✅ Stream directory stopped');
  }

  /**
   * Announce a stream to the network
   */
  async announceStream(streamId, metadata) {
    if (!this.subscribed) {
      throw new Error('Stream directory not started');
    }

    console.log(`📢 Announcing stream: ${streamId}`);

    const announcement = {
      type: MessageType.ANNOUNCE,
      streamId,
      metadata: {
        ...metadata,
        topic: `argus-defense/stream/${streamId}`,
        publisher: this.node.peerId.toString(),
        publisherAddrs: this.node.getMultiaddrs().map(addr => addr.toString()),
        timestamp: Date.now()
      }
    };

    // Store locally
    this.localStreams.set(streamId, announcement.metadata);

    // Publish announcement
    await publishToTopic(this.node, STREAM_DIRECTORY_TOPIC, JSON.stringify(announcement));

    console.log(`✅ Stream announced: ${streamId}`);
  }

  /**
   * Send heartbeat for active streams
   */
  async sendHeartbeat() {
    if (!this.subscribed || this.localStreams.size === 0) return;

    for (const [streamId, metadata] of this.localStreams) {
      const heartbeat = {
        type: MessageType.HEARTBEAT,
        streamId,
        publisher: this.node.peerId.toString(),
        timestamp: Date.now()
      };

      await publishToTopic(this.node, STREAM_DIRECTORY_TOPIC, JSON.stringify(heartbeat));
    }
  }

  /**
   * Deregister a stream from the network
   */
  async deregisterStream(streamId) {
    if (!this.subscribed) return;

    console.log(`🔕 Deregistering stream: ${streamId}`);

    const deregister = {
      type: MessageType.DEREGISTER,
      streamId,
      publisher: this.node.peerId.toString(),
      timestamp: Date.now()
    };

    this.localStreams.delete(streamId);

    await publishToTopic(this.node, STREAM_DIRECTORY_TOPIC, JSON.stringify(deregister));

    console.log(`✅ Stream deregistered: ${streamId}`);
  }

  /**
   * Query for available streams
   */
  async queryStreams(filter = {}) {
    if (!this.subscribed) {
      throw new Error('Stream directory not started');
    }

    console.log('🔍 Querying available streams...');

    const query = {
      type: MessageType.QUERY,
      filter,
      requestId: `${this.node.peerId.toString()}-${Date.now()}`,
      from: this.node.peerId.toString(),
      timestamp: Date.now()
    };

    await publishToTopic(this.node, STREAM_DIRECTORY_TOPIC, JSON.stringify(query));

    // Return currently discovered streams
    return this.getDiscoveredStreams(filter);
  }

  /**
   * Get discovered streams (optionally filtered)
   */
  getDiscoveredStreams(filter = {}) {
    const streams = [];

    for (const [streamId, info] of this.discoveredStreams) {
      // Apply filters
      if (filter.publisher && info.publisher !== filter.publisher) continue;
      if (filter.system && info.metadata?.system_name !== filter.system) continue;
      if (filter.category && info.metadata?.category !== filter.category) continue;

      streams.push({
        streamId,
        ...info.metadata,
        publisher: info.publisher,
        lastSeen: info.lastSeen,
        age: Date.now() - info.lastSeen
      });
    }

    return streams.sort((a, b) => b.lastSeen - a.lastSeen);
  }

  /**
   * Get local (published) streams
   */
  getLocalStreams() {
    const streams = [];
    for (const [streamId, metadata] of this.localStreams) {
      streams.push({
        streamId,
        ...metadata,
        isLocal: true
      });
    }
    return streams;
  }

  /**
   * Get stream count
   */
  getStreamCount() {
    return {
      local: this.localStreams.size,
      discovered: this.discoveredStreams.size,
      total: this.localStreams.size + this.discoveredStreams.size
    };
  }

  /**
   * Handle incoming directory messages
   */
  handleDirectoryMessage(data) {
    try {
      const message = JSON.parse(data.data.toString());
      const fromPeer = data.from;

      // Ignore our own messages
      if (fromPeer === this.node.peerId.toString()) {
        return;
      }

      switch (message.type) {
        case MessageType.ANNOUNCE:
          this.handleAnnouncement(message, fromPeer);
          break;

        case MessageType.HEARTBEAT:
          this.handleHeartbeat(message, fromPeer);
          break;

        case MessageType.DEREGISTER:
          this.handleDeregister(message, fromPeer);
          break;

        case MessageType.QUERY:
          this.handleQuery(message, fromPeer);
          break;

        case MessageType.RESPONSE:
          this.handleResponse(message, fromPeer);
          break;

        default:
          console.log('Unknown message type:', message.type);
      }

      // Notify handlers
      this.notifyHandlers(message, fromPeer);
    } catch (error) {
      console.error('Error handling directory message:', error);
    }
  }

  /**
   * Handle stream announcement
   */
  handleAnnouncement(message, fromPeer) {
    const { streamId, metadata } = message;

    console.log(`📢 Discovered stream: ${streamId} from ${fromPeer.slice(0, 20)}...`);

    this.discoveredStreams.set(streamId, {
      metadata,
      publisher: fromPeer,
      lastSeen: Date.now()
    });
  }

  /**
   * Handle heartbeat
   */
  handleHeartbeat(message, fromPeer) {
    const { streamId } = message;

    if (this.discoveredStreams.has(streamId)) {
      const info = this.discoveredStreams.get(streamId);
      info.lastSeen = Date.now();
      this.discoveredStreams.set(streamId, info);
    }
  }

  /**
   * Handle deregister
   */
  handleDeregister(message, fromPeer) {
    const { streamId } = message;

    console.log(`🔕 Stream deregistered: ${streamId}`);

    this.discoveredStreams.delete(streamId);
  }

  /**
   * Handle query
   */
  async handleQuery(message, fromPeer) {
    const { filter, requestId } = message;

    // Respond with our local streams that match
    if (this.localStreams.size > 0) {
      const matchingStreams = [];

      for (const [streamId, metadata] of this.localStreams) {
        // Apply filters
        if (filter.publisher && this.node.peerId.toString() !== filter.publisher) continue;
        if (filter.system && metadata.system_name !== filter.system) continue;
        if (filter.category && metadata.category !== filter.category) continue;

        matchingStreams.push({
          streamId,
          metadata
        });
      }

      if (matchingStreams.length > 0) {
        const response = {
          type: MessageType.RESPONSE,
          requestId,
          streams: matchingStreams,
          from: this.node.peerId.toString(),
          timestamp: Date.now()
        };

        await publishToTopic(this.node, STREAM_DIRECTORY_TOPIC, JSON.stringify(response));
      }
    }
  }

  /**
   * Handle query response
   */
  handleResponse(message, fromPeer) {
    const { streams } = message;

    if (streams && Array.isArray(streams)) {
      for (const stream of streams) {
        this.discoveredStreams.set(stream.streamId, {
          metadata: stream.metadata,
          publisher: fromPeer,
          lastSeen: Date.now()
        });
      }
    }
  }

  /**
   * Add message handler
   */
  onMessage(handler) {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  /**
   * Notify message handlers
   */
  notifyHandlers(message, fromPeer) {
    for (const handler of this.messageHandlers) {
      try {
        handler(message, fromPeer);
      } catch (error) {
        console.error('Error in message handler:', error);
      }
    }
  }

  /**
   * Start heartbeat interval
   */
  startHeartbeat() {
    // Send heartbeat every 30 seconds
    this.heartbeatInterval = setInterval(() => {
      this.sendHeartbeat().catch(error => {
        console.error('Error sending heartbeat:', error);
      });
    }, 30000);
  }

  /**
   * Start cleanup interval
   */
  startCleanup() {
    // Clean up stale streams every 60 seconds
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      const STALE_THRESHOLD = 2 * 60 * 1000; // 2 minutes

      for (const [streamId, info] of this.discoveredStreams) {
        if (now - info.lastSeen > STALE_THRESHOLD) {
          console.log(`🗑️  Removing stale stream: ${streamId}`);
          this.discoveredStreams.delete(streamId);
        }
      }
    }, 60000);
  }
}

export default StreamDirectory;
