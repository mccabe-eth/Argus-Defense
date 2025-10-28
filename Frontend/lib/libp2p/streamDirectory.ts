/**
 * Argus Defense - Browser Stream Directory
 * Decentralized stream discovery via libp2p pubsub (Browser version)
 */
import type { GossipSub } from "@chainsafe/libp2p-gossipsub";
import type { Libp2p } from "libp2p";
import { fromString, toString } from "uint8arrays";

// Global directory topic for stream announcements
export const STREAM_DIRECTORY_TOPIC = "argus-defense/stream-directory";

/**
 * Message types for the stream directory
 */
export enum MessageType {
  ANNOUNCE = "announce",
  HEARTBEAT = "heartbeat",
  DEREGISTER = "deregister",
  QUERY = "query",
  RESPONSE = "response",
}

export interface StreamMetadata {
  name: string;
  audioUrl?: string;
  source?: string;
  system_name?: string;
  category?: string;
  talkgroup_id?: number;
  duration?: number;
  timestamp?: string;
  topic?: string;
  publisher?: string;
  publisherAddrs?: string[];
  [key: string]: any;
}

export interface DiscoveredStream {
  streamId: string;
  metadata: StreamMetadata;
  publisher: string;
  lastSeen: number;
  age: number;
}

export interface DirectoryMessage {
  type: MessageType;
  streamId?: string;
  metadata?: StreamMetadata;
  publisher?: string;
  timestamp?: number;
  filter?: any;
  requestId?: string;
  from?: string;
  streams?: any[];
}

/**
 * Stream Directory Manager for Browser
 * Handles stream announcements and discovery
 */
export class BrowserStreamDirectory {
  private node: Libp2p;
  private discoveredStreams: Map<string, { metadata: StreamMetadata; publisher: string; lastSeen: number }>;
  private cleanupInterval: NodeJS.Timeout | null;
  private messageHandlers: Set<(message: DirectoryMessage, fromPeer: string) => void>;
  private subscribed: boolean;
  private unsubscribe: (() => void) | null;

  constructor(node: Libp2p) {
    this.node = node;
    this.discoveredStreams = new Map();
    this.cleanupInterval = null;
    this.messageHandlers = new Set();
    this.subscribed = false;
    this.unsubscribe = null;
  }

  /**
   * Start the stream directory service
   */
  async start(): Promise<void> {
    if (this.subscribed) {
      console.log("⚠️  Stream directory already started");
      return;
    }

    console.log("🌐 Starting browser stream directory...");

    const pubsub = this.node.services.pubsub as GossipSub;
    if (!pubsub) {
      throw new Error("Pubsub service not available");
    }

    // Subscribe to directory topic
    pubsub.subscribe(STREAM_DIRECTORY_TOPIC);

    // Handle incoming messages
    const handleMessage = (evt: any) => {
      if (evt.detail.topic === STREAM_DIRECTORY_TOPIC) {
        this.handleDirectoryMessage(evt.detail);
      }
    };

    pubsub.addEventListener("message", handleMessage);

    this.unsubscribe = () => {
      pubsub.removeEventListener("message", handleMessage);
      pubsub.unsubscribe(STREAM_DIRECTORY_TOPIC);
    };

    this.subscribed = true;

    // Start cleanup for stale streams
    this.startCleanup();

    console.log("✅ Browser stream directory started");
    console.log(`📍 Peer ID: ${this.node.peerId.toString()}`);
  }

  /**
   * Stop the stream directory service
   */
  async stop(): Promise<void> {
    if (!this.subscribed) return;

    console.log("🛑 Stopping browser stream directory...");

    // Stop cleanup interval
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
    this.discoveredStreams.clear();

    console.log("✅ Browser stream directory stopped");
  }

  /**
   * Query for available streams
   */
  async queryStreams(filter: any = {}): Promise<DiscoveredStream[]> {
    if (!this.subscribed) {
      throw new Error("Stream directory not started");
    }

    console.log("🔍 Querying available streams...");

    const pubsub = this.node.services.pubsub as GossipSub;

    const query: DirectoryMessage = {
      type: MessageType.QUERY,
      filter,
      requestId: `${this.node.peerId.toString()}-${Date.now()}`,
      from: this.node.peerId.toString(),
      timestamp: Date.now(),
    };

    await pubsub.publish(STREAM_DIRECTORY_TOPIC, fromString(JSON.stringify(query)));

    // Return currently discovered streams
    return this.getDiscoveredStreams(filter);
  }

  /**
   * Get discovered streams (optionally filtered)
   */
  getDiscoveredStreams(filter: any = {}): DiscoveredStream[] {
    const streams: DiscoveredStream[] = [];

    for (const [streamId, info] of this.discoveredStreams) {
      // Apply filters
      if (filter.publisher && info.publisher !== filter.publisher) continue;
      if (filter.system && info.metadata?.system_name !== filter.system) continue;
      if (filter.category && info.metadata?.category !== filter.category) continue;

      streams.push({
        streamId,
        ...info.metadata,
        metadata: info.metadata,
        publisher: info.publisher,
        lastSeen: info.lastSeen,
        age: Date.now() - info.lastSeen,
      });
    }

    return streams.sort((a, b) => b.lastSeen - a.lastSeen);
  }

  /**
   * Get stream count
   */
  getStreamCount(): { discovered: number; total: number } {
    return {
      discovered: this.discoveredStreams.size,
      total: this.discoveredStreams.size,
    };
  }

  /**
   * Handle incoming directory messages
   */
  private handleDirectoryMessage(data: any): void {
    try {
      const message: DirectoryMessage = JSON.parse(toString(data.data));
      const fromPeer = data.from ? data.from.toString() : "";

      // Ignore our own messages
      if (fromPeer === this.node.peerId.toString()) {
        return;
      }

      switch (message.type) {
        case MessageType.ANNOUNCE:
          this.handleAnnouncement(message, fromPeer);
          break;

        case MessageType.HEARTBEAT:
          this.handleHeartbeat(message);
          break;

        case MessageType.DEREGISTER:
          this.handleDeregister(message);
          break;

        case MessageType.RESPONSE:
          this.handleResponse(message, fromPeer);
          break;

        default:
          console.log("Unknown message type:", message.type);
      }

      // Notify handlers
      this.notifyHandlers(message, fromPeer);
    } catch (error) {
      console.error("Error handling directory message:", error);
    }
  }

  /**
   * Handle stream announcement
   */
  private handleAnnouncement(message: DirectoryMessage, _fromPeer: string): void {
    if (!message.streamId || !message.metadata) return;

    console.log(`📢 Discovered stream: ${message.streamId} from ${_fromPeer.slice(0, 20)}...`);

    this.discoveredStreams.set(message.streamId, {
      metadata: message.metadata,
      publisher: _fromPeer,
      lastSeen: Date.now(),
    });
  }

  /**
   * Handle heartbeat
   */
  private handleHeartbeat(message: DirectoryMessage): void {
    if (!message.streamId) return;

    if (this.discoveredStreams.has(message.streamId)) {
      const info = this.discoveredStreams.get(message.streamId)!;
      info.lastSeen = Date.now();
      this.discoveredStreams.set(message.streamId, info);
    }
  }

  /**
   * Handle deregister
   */
  private handleDeregister(message: DirectoryMessage): void {
    if (!message.streamId) return;

    console.log(`🔕 Stream deregistered: ${message.streamId}`);
    this.discoveredStreams.delete(message.streamId);
  }

  /**
   * Handle query response
   */
  private handleResponse(message: DirectoryMessage, _fromPeer: string): void {
    if (!message.streams || !Array.isArray(message.streams)) return;

    for (const stream of message.streams) {
      this.discoveredStreams.set(stream.streamId, {
        metadata: stream.metadata,
        publisher: _fromPeer,
        lastSeen: Date.now(),
      });
    }
  }

  /**
   * Add message handler
   */
  onMessage(handler: (message: DirectoryMessage, fromPeer: string) => void): () => void {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  /**
   * Notify message handlers
   */
  private notifyHandlers(message: DirectoryMessage, fromPeer: string): void {
    for (const handler of this.messageHandlers) {
      try {
        handler(message, fromPeer);
      } catch (error) {
        console.error("Error in message handler:", error);
      }
    }
  }

  /**
   * Start cleanup interval
   */
  private startCleanup(): void {
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

export default BrowserStreamDirectory;
