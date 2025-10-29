/**
 * Argus Defense - Browser libp2p Node
 * libp2p node configured for browser environments
 */
import { gossipsub } from "@chainsafe/libp2p-gossipsub";
import type { GossipSub } from "@chainsafe/libp2p-gossipsub";
import { noise } from "@chainsafe/libp2p-noise";
import { yamux } from "@chainsafe/libp2p-yamux";
import { bootstrap } from "@libp2p/bootstrap";
import { identify } from "@libp2p/identify";
import { webSockets } from "@libp2p/websockets";
import { Libp2p, createLibp2p } from "libp2p";
import { toString } from "uint8arrays";
import { multiaddr } from "@multiformats/multiaddr";

/**
 * Bootstrap peers for peer discovery
 * Includes both public bootstrap nodes and local backend (for development)
 */
const BOOTSTRAP_PEERS = [
  "/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN",
  "/dnsaddr/bootstrap.libp2p.io/p2p/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa",
  "/dnsaddr/bootstrap.libp2p.io/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb",
  "/dnsaddr/bootstrap.libp2p.io/p2p/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt",
];

/**
 * Get local backend WebSocket address (for development)
 * The Peer ID will be discovered via the directory service
 */
const LOCAL_BACKEND_WS = "ws://127.0.0.1:9002";

export interface StreamMessage {
  type: "metadata" | "audio" | "iq_data" | "end";
  streamId: string;
  timestamp: number;
  chunk?: string;
  data?: string;
  metadata?: any;
  audioUrl?: string;
  source?: string;
  totalBytes?: number;
  totalChunks?: number;
  reason?: string;
}

export interface BrowserNodeConfig {
  // Add custom WebSocket server addresses if running your own bootstrap nodes
  bootstrapPeers?: string[];
}

/**
 * Create a browser-compatible libp2p node
 * Uses WebSockets only (simpler, no relay needed)
 * Browser connects to backend nodes via WebSocket
 */
export async function createBrowserNode(config?: BrowserNodeConfig): Promise<Libp2p> {
  const node = await createLibp2p({
    addresses: {
      listen: [],
    },
    transports: [webSockets()],
    connectionEncrypters: [noise()],
    streamMuxers: [yamux()],
    peerDiscovery: [
      bootstrap({
        list: config?.bootstrapPeers || BOOTSTRAP_PEERS,
        timeout: 10000,
      }) as any,
    ],
    services: {
      identify: identify(),
      pubsub: gossipsub({
        emitSelf: false,
        allowPublishToZeroTopicPeers: true,
      }),
    },
  } as any);

  return node;
}

/**
 * Start a browser libp2p node
 */
export async function startBrowserNode(config?: BrowserNodeConfig): Promise<Libp2p> {
  console.log("🚀 Starting browser libp2p node...");

  const node = await createBrowserNode(config);
  await node.start();

  console.log("✅ Browser libp2p node started!");
  console.log(`📍 Peer ID: ${node.peerId.toString()}`);

  // Log peer events
  node.addEventListener("peer:discovery", evt => {
    console.log(`🔍 Discovered peer: ${evt.detail.id.toString()}`);
  });

  node.addEventListener("peer:connect", evt => {
    console.log(`🤝 Connected to peer: ${evt.detail.toString()}`);
  });

  node.addEventListener("peer:disconnect", evt => {
    console.log(`👋 Disconnected from peer: ${evt.detail.toString()}`);
  });

  // Try to connect to local backend (development mode)
  // This allows browser to discover local streams without needing public backend
  if (typeof window !== "undefined" && window.location.hostname === "localhost") {
    console.log("🔌 Attempting to connect to local backend...");

    // First, fetch the backend's peer ID from the API
    try {
      const response = await fetch("http://localhost:3001/api/libp2p/status");
      if (response.ok) {
        const status = await response.json();
        const backendPeerId = status.peerId;
        const backendAddr = multiaddr(`/ip4/127.0.0.1/tcp/9002/ws/p2p/${backendPeerId}`);

        console.log(`📡 Dialing local backend at: ${backendAddr.toString()}`);
        await node.dial(backendAddr);
        console.log("✅ Connected to local backend!");
      }
    } catch (err) {
      console.warn("⚠️ Could not connect to local backend:", err);
      console.log("   This is normal if backend is not running or on a different machine");
    }
  }

  return node;
}

/**
 * Subscribe to a stream topic
 */
export function subscribeToStream(
  node: Libp2p,
  streamId: string,
  onMessage: (message: StreamMessage) => void,
): () => void {
  const pubsub = node.services.pubsub as GossipSub;

  if (!pubsub) {
    throw new Error("Pubsub service not available");
  }

  const topic = `argus-defense/stream/${streamId}`;

  // Subscribe to the topic
  pubsub.subscribe(topic);

  console.log(`📢 Subscribed to stream: ${streamId}`);

  // Message handler
  const handleMessage = (evt: any) => {
    if (evt.detail.topic === topic) {
      try {
        const text = toString(evt.detail.data);
        const message: StreamMessage = JSON.parse(text);
        onMessage(message);
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    }
  };

  pubsub.addEventListener("message", handleMessage);

  // Return unsubscribe function
  return () => {
    pubsub.removeEventListener("message", handleMessage);
    pubsub.unsubscribe(topic);
    console.log(`🔕 Unsubscribed from stream: ${streamId}`);
  };
}

/**
 * Get the number of peers subscribed to a stream
 */
export function getStreamPeerCount(node: Libp2p, streamId: string): number {
  const pubsub = node.services.pubsub as GossipSub;

  if (!pubsub) {
    return 0;
  }

  const topic = `argus-defense/stream/${streamId}`;
  const peers = pubsub.getSubscribers(topic);
  return peers.length;
}

/**
 * Decode audio chunk from base64
 */
export function decodeAudioChunk(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);

  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return bytes;
}

/**
 * Create an audio blob from chunks
 */
export function createAudioBlob(chunks: Uint8Array[], mimeType = "audio/mpeg"): Blob {
  return new Blob(chunks as BlobPart[], { type: mimeType });
}

/**
 * Create an object URL for audio playback
 */
export function createAudioURL(chunks: Uint8Array[], mimeType = "audio/mpeg"): string {
  const blob = createAudioBlob(chunks, mimeType);
  return URL.createObjectURL(blob);
}
