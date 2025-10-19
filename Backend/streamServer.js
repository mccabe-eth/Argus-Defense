import { spawn } from "child_process";
import WebSocket, { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });
console.log("WebSocket SDR stream server running on ws://localhost:8080");

const py = spawn("python", ["backend/sdr/sim-capture.py"]);

wss.on("connection", (ws) => {
  console.log("Client connected.");
  py.stdout.on("data", (data) => ws.send(data));  // Stream IQ data
  ws.on("close", () => console.log("Client disconnected."));
});

py.stderr.on("data", (d) => console.error("SDR error:", d.toString()));
