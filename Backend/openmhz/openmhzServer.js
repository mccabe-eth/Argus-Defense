/**
 * Enhanced Stream Server with OpenMHz Integration
 * Provides both local SDR streams and OpenMHz remote streams
 * Combines WebSocket server and OpenMHz Python ingestion directly
 */

const { spawn } = require("child_process");
const WebSocket = require("ws");
const path = require("path");
const http = require("http");
const https = require("https");

const { WebSocketServer } = WebSocket;
const wss = new WebSocketServer({ port: 8080 });

console.log("WebSocket SDR stream server running on ws://localhost:8080");
console.log("Supports both local SDR and OpenMHz remote streams");

// Track active connections and their stream types
const connections = new Map();

// Path to Python ingestion script
const pythonScript = path.join(__dirname, 'ingest_openmhz.py');

/**
 * Ingest a system and get stream profiles by calling Python script
 * @param {string} systemId - The OpenMHz system ID (e.g., 'rhode-island')
 * @param {Object} options - Ingestion options
 * @param {Array<number>} options.talkgroupIds - Optional talkgroup IDs to filter
 * @param {string} options.groupId - Optional group ID to filter
 * @returns {Promise<Object>} System profile with available streams
 */
async function ingestSystem(systemId, options = {}) {
  return new Promise((resolve, reject) => {
    const args = ['--system', systemId, '--format', 'json'];

    // Add optional filters
    if (options.talkgroupIds && options.talkgroupIds.length > 0) {
      args.push('--talkgroups', options.talkgroupIds.join(','));
    }
    if (options.groupId) {
      args.push('--group', options.groupId);
    }

    // Spawn Python process
    const process = spawn('python3', [pythonScript, ...args]);

    let stdout = '';
    let stderr = '';

    process.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    process.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    process.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Ingestion failed: ${stderr}`));
        return;
      }

      try {
        const profile = JSON.parse(stdout);
        resolve(profile);
      } catch (error) {
        reject(new Error(`Failed to parse output: ${error.message}`));
      }
    });

    process.on('error', (error) => {
      reject(new Error(`Failed to start ingestion: ${error.message}`));
    });
  });
}

/**
 * Get talkgroups for a system
 * @param {string} systemId - The OpenMHz system ID
 * @returns {Promise<Array>} List of talkgroups
 */
async function getTalkgroups(systemId) {
  const profile = await ingestSystem(systemId);
  return profile.talkgroups;
}

/**
 * Stream audio from OpenMHz to WebSocket clients
 * @param {string} audioUrl - The audio URL from OpenMHz
 * @param {WebSocket} ws - WebSocket connection to stream to
 * @returns {void}
 */
function streamAudio(audioUrl, ws) {
  const protocol = audioUrl.startsWith('https') ? https : http;

  const request = protocol.get(audioUrl, (response) => {
    if (response.statusCode !== 200) {
      ws.send(JSON.stringify({
        type: 'error',
        message: `Failed to fetch audio: ${response.statusCode}`
      }));
      return;
    }

    // Notify client that streaming is starting
    ws.send(JSON.stringify({
      type: 'stream_start',
      contentType: response.headers['content-type']
    }));

    // Pipe audio data to WebSocket
    response.on('data', (chunk) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(chunk);
      }
    });

    response.on('end', () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'stream_end' }));
      }
    });

    response.on('error', (error) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'error',
          message: error.message
        }));
      }
    });
  });

  request.on('error', (error) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'error',
        message: error.message
      }));
    }
  });

  // Handle client disconnect
  ws.on('close', () => {
    request.destroy();
  });
}

// WebSocket connection handler
wss.on("connection", (ws, req) => {
  const clientId = Math.random().toString(36).substring(7);
  console.log(`Client connected: ${clientId}`);

  connections.set(clientId, {
    ws,
    streamType: null,
    streamId: null
  });

  // Handle incoming messages from clients
  ws.on("message", async (message) => {
    try {
      const data = JSON.parse(message.toString());
      await handleClientMessage(clientId, ws, data);
    } catch (error) {
      console.error(`Error handling message from ${clientId}:`, error);
      ws.send(JSON.stringify({
        type: "error",
        message: error.message
      }));
    }
  });

  ws.on("close", () => {
    console.log(`Client disconnected: ${clientId}`);
    connections.delete(clientId);
  });

  // Send welcome message
  ws.send(JSON.stringify({
    type: "connected",
    clientId,
    message: "Connected to Argus Defense Stream Server",
    capabilities: ["local_sdr", "openmhz"]
  }));
});

/**
 * Handle messages from clients
 */
async function handleClientMessage(clientId, ws, data) {
  const { type, payload } = data;

  switch (type) {
    case "list_systems":
      // In a real implementation, this would query available systems
      // For now, send a sample response
      ws.send(JSON.stringify({
        type: "systems_list",
        systems: [
          { id: "rhode-island", name: "Rhode Island", type: "openmhz" },
          { id: "kcers1b", name: "KCERS 1B", type: "openmhz" },
          { id: "local_sdr", name: "Local SDR", type: "local" }
        ]
      }));
      break;

    case "get_streams":
      await handleGetStreams(clientId, ws, payload);
      break;

    case "start_stream":
      await handleStartStream(clientId, ws, payload);
      break;

    case "stop_stream":
      handleStopStream(clientId, ws);
      break;

    case "get_talkgroups":
      await handleGetTalkgroups(clientId, ws, payload);
      break;

    default:
      ws.send(JSON.stringify({
        type: "error",
        message: `Unknown message type: ${type}`
      }));
  }
}

/**
 * Handle request to get available streams
 */
async function handleGetStreams(clientId, ws, payload) {
  const { systemId, talkgroupIds, groupId } = payload;

  if (!systemId) {
    ws.send(JSON.stringify({
      type: "error",
      message: "systemId is required"
    }));
    return;
  }

  try {
    console.log(`Fetching streams for system: ${systemId}`);
    const profile = await ingestSystem(systemId, {
      talkgroupIds,
      groupId
    });

    ws.send(JSON.stringify({
      type: "streams_list",
      systemId,
      totalStreams: profile.total_streams,
      streams: profile.streams
    }));

    console.log(`Sent ${profile.total_streams} streams to ${clientId}`);
  } catch (error) {
    console.error(`Error fetching streams:`, error);
    ws.send(JSON.stringify({
      type: "error",
      message: `Failed to fetch streams: ${error.message}`
    }));
  }
}

/**
 * Handle request to start streaming
 */
async function handleStartStream(clientId, ws, payload) {
  const { streamType, streamId, systemId, audioUrl } = payload;

  const connection = connections.get(clientId);
  if (!connection) return;

  // Stop any existing stream
  handleStopStream(clientId, ws);

  console.log(`Starting ${streamType} stream for ${clientId}: ${streamId || 'local'}`);

  if (streamType === "local_sdr") {
    // Start local SDR stream
    const py = spawn("python3", [path.join(__dirname, "../sdr/sim-capture.py")]);

    py.stdout.on("data", (data) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(data);
      }
    });

    py.stderr.on("data", (d) => {
      console.error("SDR error:", d.toString());
    });

    connection.streamType = "local_sdr";
    connection.process = py;

    ws.send(JSON.stringify({
      type: "stream_started",
      streamType: "local_sdr"
    }));

  } else if (streamType === "openmhz") {
    // Start OpenMHz stream
    if (!audioUrl) {
      ws.send(JSON.stringify({
        type: "error",
        message: "audioUrl is required for OpenMHz streams"
      }));
      return;
    }

    connection.streamType = "openmhz";
    connection.streamId = streamId;

    // Stream the audio
    streamAudio(audioUrl, ws);

  } else {
    ws.send(JSON.stringify({
      type: "error",
      message: `Unknown stream type: ${streamType}`
    }));
  }
}

/**
 * Handle request to stop streaming
 */
function handleStopStream(clientId, ws) {
  const connection = connections.get(clientId);
  if (!connection) return;

  if (connection.process) {
    connection.process.kill();
    connection.process = null;
  }

  connection.streamType = null;
  connection.streamId = null;

  console.log(`Stopped stream for ${clientId}`);

  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      type: "stream_stopped"
    }));
  }
}

/**
 * Handle request to get talkgroups
 */
async function handleGetTalkgroups(clientId, ws, payload) {
  const { systemId } = payload;

  if (!systemId) {
    ws.send(JSON.stringify({
      type: "error",
      message: "systemId is required"
    }));
    return;
  }

  try {
    console.log(`Fetching talkgroups for system: ${systemId}`);
    const talkgroups = await getTalkgroups(systemId);

    ws.send(JSON.stringify({
      type: "talkgroups_list",
      systemId,
      totalTalkgroups: talkgroups.length,
      talkgroups
    }));

    console.log(`Sent ${talkgroups.length} talkgroups to ${clientId}`);
  } catch (error) {
    console.error(`Error fetching talkgroups:`, error);
    ws.send(JSON.stringify({
      type: "error",
      message: `Failed to fetch talkgroups: ${error.message}`
    }));
  }
}

// Handle server errors
wss.on("error", (error) => {
  console.error("WebSocket server error:", error);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\nShutting down server...");

  // Stop all active streams
  for (const [clientId, connection] of connections) {
    if (connection.process) {
      connection.process.kill();
    }
    connection.ws.close();
  }

  wss.close(() => {
    console.log("Server shut down");
    process.exit(0);
  });
});

console.log("\nServer ready. Waiting for connections...");
console.log("\nExample client messages:");
console.log('  {"type": "list_systems"}');
console.log('  {"type": "get_streams", "payload": {"systemId": "rhode-island"}}');
console.log('  {"type": "start_stream", "payload": {"streamType": "openmhz", "streamId": "...", "audioUrl": "..."}}');
console.log('  {"type": "stop_stream"}');
