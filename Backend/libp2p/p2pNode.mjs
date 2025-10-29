/**
 * Argus Defense - libp2p Node with Pubsub
 * Modern libp2p node for decentralized stream distribution
 */

import { createLibp2p } from 'libp2p';
import { tcp } from '@libp2p/tcp';
import { webSockets } from '@libp2p/websockets';
import * as filters from '@libp2p/websockets/filters';
import { mplex } from '@libp2p/mplex';
import { noise } from '@chainsafe/libp2p-noise';
import { gossipsub } from '@chainsafe/libp2p-gossipsub';
import { bootstrap } from '@libp2p/bootstrap';
import { identify } from '@libp2p/identify';
import { kadDHT } from '@libp2p/kad-dht';
import { fromString } from 'uint8arrays/from-string';
import { multiaddr } from '@multiformats/multiaddr';

/**
 * Bootstrap peers for peer discovery
 * Using public libp2p bootstrap nodes
 */
export const BOOTSTRAP_PEERS = [
  '/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN',
  '/dnsaddr/bootstrap.libp2p.io/p2p/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa',
  '/dnsaddr/bootstrap.libp2p.io/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb',
  '/dnsaddr/bootstrap.libp2p.io/p2p/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt'
];

/**
 * Create and configure a libp2p node
 * @param {Object} options - Configuration options
 * @returns {Promise<Libp2p>} Configured libp2p node
 */
export async function createNode(options = {}) {
  // Convert string addresses to multiaddr objects
  const defaultAddrs = [multiaddr('/ip4/0.0.0.0/tcp/9001')];
  const listenAddrs = options.listen
    ? (Array.isArray(options.listen) ? options.listen.map(addr =>
        typeof addr === 'string' ? multiaddr(addr) : addr
      ) : [multiaddr(options.listen)])
    : defaultAddrs;

  const node = await createLibp2p({
    addresses: {
      listen: listenAddrs
    },
    transports: [
      tcp(),
      webSockets()  // WebSocket for browser compatibility
    ],
    connectionEncrypters: [
      noise()
    ],
    streamMuxers: [
      mplex()
    ],
    peerDiscovery: [
      bootstrap({
        list: BOOTSTRAP_PEERS,
        timeout: 10000,
        interval: 60000
      })
    ],
    services: {
      identify: identify(),
      pubsub: gossipsub({
        emitSelf: false,
        allowPublishToZeroTopicPeers: true,
        // Enable message signing for authenticity
        signMessages: true,
        // Strict message signing validation
        strictSigning: true,
        // Enable flood publishing (helps with initial discovery)
        floodPublish: true,
        // Improve gossip heartbeat interval
        heartbeatInterval: 1000,
        // Ensure messages propagate even with few peers
        scoreParams: {
          topicScoreCap: 32.72,
          appSpecificScore: 1.0
        }
      }),
      dht: kadDHT({
        clientMode: false
      })
    }
  });

  return node;
}

/**
 * Start a libp2p node
 * @param {Object} options - Configuration options
 * @returns {Promise<Libp2p>} Started libp2p node
 */
export async function startNode(options = {}) {
  const node = await createNode(options);

  await node.start();

  console.log('🚀 Libp2p node started!');
  console.log(`📍 Peer ID: ${node.peerId.toString()}`);
  console.log('🎧 Listening on:');
  node.getMultiaddrs().forEach((addr) => {
    console.log(`   ${addr.toString()}`);
  });

  // Log peer discovery events
  node.addEventListener('peer:discovery', (evt) => {
    const peer = evt.detail;
    console.log(`🔍 Discovered peer: ${peer.id.toString()}`);
  });

  // Log peer connection events
  node.addEventListener('peer:connect', (evt) => {
    const connection = evt.detail;
    console.log(`🤝 Connected to peer: ${connection.remotePeer.toString()}`);
  });

  // Log peer disconnection events
  node.addEventListener('peer:disconnect', (evt) => {
    const connection = evt.detail;
    console.log(`👋 Disconnected from peer: ${connection.remotePeer.toString()}`);
  });

  return node;
}

/**
 * Subscribe to a topic and handle messages
 * @param {Libp2p} node - The libp2p node
 * @param {string} topic - Topic to subscribe to
 * @param {Function} onMessage - Callback for incoming messages
 */
export async function subscribeTopic(node, topic, onMessage) {
  const pubsub = node.services.pubsub;

  if (!pubsub) {
    throw new Error('Pubsub service not available');
  }

  // Subscribe to the topic
  pubsub.subscribe(topic);

  console.log(`📢 Subscribed to topic: ${topic}`);

  // Handle incoming messages
  pubsub.addEventListener('message', (evt) => {
    if (evt.detail.topic === topic) {
      const msg = evt.detail;

      // Parse message data
      const data = {
        from: msg.from.toString(),
        data: msg.data,
        timestamp: Date.now(),
        topic: msg.topic
      };

      // Call the message handler
      if (onMessage) {
        onMessage(data);
      }
    }
  });

  return {
    topic,
    unsubscribe: () => {
      pubsub.unsubscribe(topic);
      console.log(`🔕 Unsubscribed from topic: ${topic}`);
    }
  };
}

/**
 * Publish a message to a topic
 * @param {Libp2p} node - The libp2p node
 * @param {string} topic - Topic to publish to
 * @param {Uint8Array|Buffer|string} message - Message to publish
 */
export async function publishToTopic(node, topic, message) {
  const pubsub = node.services.pubsub;

  if (!pubsub) {
    throw new Error('Pubsub service not available');
  }

  // Convert message to Uint8Array if needed
  let data;
  if (typeof message === 'string') {
    data = fromString(message);
  } else if (Buffer.isBuffer(message)) {
    data = new Uint8Array(message);
  } else {
    data = message;
  }

  // Get subscriber count before publishing
  const peers = getTopicPeers(node, topic);
  console.log(`[DEBUG] Publishing to ${topic} (${peers.length} subscribers)`);

  // Publish the message
  await pubsub.publish(topic, data);
}

/**
 * Get the list of peers subscribed to a topic
 * @param {Libp2p} node - The libp2p node
 * @param {string} topic - Topic to check
 * @returns {Array<string>} List of peer IDs
 */
export function getTopicPeers(node, topic) {
  const pubsub = node.services.pubsub;

  if (!pubsub) {
    return [];
  }

  const peers = pubsub.getSubscribers(topic);
  return peers.map(peer => peer.toString());
}

/**
 * Get the list of topics this node is subscribed to
 * @param {Libp2p} node - The libp2p node
 * @returns {Array<string>} List of topics
 */
export function getSubscribedTopics(node) {
  const pubsub = node.services.pubsub;

  if (!pubsub) {
    return [];
  }

  return pubsub.getTopics();
}
