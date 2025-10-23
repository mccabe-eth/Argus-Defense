/**
 * Enhanced Stream Server with OpenMHz Integration
 * Provides both local SDR streams and OpenMHz remote streams
 */

import { spawn } from "child_process";
import WebSocket, { WebSocketServer } from "ws";
import OpenMHZIntegration from "./openmhz_integration.js";

const wss = new WebSocketServer({ port: 8080 });
const openmhz = new OpenMHZIntegration();

console.log("WebSocket SDR stream server running on ws://localhost:8080");
console.log("Supports both local SDR and OpenMHz remote streams");

// Track active connections and their stream types
const connections = new Map();

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
    const profile = await openmhz.ingestSystem(systemId, {
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
    const py = spawn("python3", ["backend/sdr/sim-capture.py"]);

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
    openmhz.streamAudio(audioUrl, ws);

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
    const talkgroups = await openmhz.getTalkgroups(systemId);

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
