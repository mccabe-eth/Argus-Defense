# OpenMHz Integration - Quick Start Guide

## TL;DR

```bash
# Test the ingestion (works offline with mock data)
python3 test_ingest_mock.py

# Start the stream server
node streamServer_openmhz.js

# Connect from frontend: ws://localhost:8080
```

## 30-Second Overview

This integration allows you to:
1. Query OpenMHz for public safety radio streams
2. Get metadata about talkgroups and recent calls
3. Stream audio to your Argus Defense frontend

## Quick Test

```bash
cd Backend/sdr

# Run mock test (no internet needed)
python3 test_ingest_mock.py

# Expected output:
# ✓ Successfully generated system profile
# Profile Summary:
#   System ID: test-system
#   Total Talkgroups: 3
#   Total Streams: 3
```

## Command Line Usage

```bash
# Get streams from a system (if API accessible)
python3 ingest_openmhz.py --system rhode-island

# With specific talkgroups
python3 ingest_openmhz.py --system kcers1b --talkgroups 3344,3408

# Human-readable output
python3 ingest_openmhz.py --system dcfd --format text

# Debug mode
python3 ingest_openmhz.py --system risconn --debug
```

## Start the Server

```bash
node streamServer_openmhz.js
# Server runs on ws://localhost:8080
```

## Frontend Example

```javascript
// Connect to server
const ws = new WebSocket('ws://localhost:8080');

// Get available streams
ws.send(JSON.stringify({
  type: 'get_streams',
  payload: { systemId: 'rhode-island' }
}));

// Receive streams
ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  if (msg.type === 'streams_list') {
    console.log('Streams:', msg.streams);
  }
};

// Play a stream
ws.send(JSON.stringify({
  type: 'start_stream',
  payload: {
    streamType: 'openmhz',
    streamId: 'rhode-island-3344-abc123',
    audioUrl: 'https://cdn.openmhz.com/...'
  }
}));
```

## Stream Profile Format

Each stream looks like this:

```json
{
  "stream_id": "rhode-island-3344-abc123",
  "name": "Providence Fire Dispatch",
  "description": "System: rhode-island | Duration: 15s | Radios: 3",
  "audio_url": "https://cdn.openmhz.com/.../file.m4a",
  "talkgroup_id": 3344,
  "duration": 15,
  "timestamp": "2025-10-23T19:30:45.000Z"
}
```

## Common Issues

### "403 Forbidden" Error
OpenMHz API is behind Cloudflare protection. Run the mock test instead:
```bash
python3 test_ingest_mock.py
```

### "requests module not found"
Install dependencies:
```bash
pip3 install requests
```

### "ws module not found"
Install Node.js dependencies:
```bash
npm install ws
```

## Files You Need

**Python Script**: `ingest_openmhz.py`
- Queries OpenMHz API
- Generates stream profiles
- CLI interface

**Node.js Module**: `openmhz_integration.js`
- Wraps Python script
- Provides async methods

**Stream Server**: `streamServer_openmhz.js`
- WebSocket server
- Handles frontend connections
- Streams audio

**Mock Test**: `test_ingest_mock.py`
- Tests without API
- Demonstrates functionality

## Full Documentation

- **[OPENMHZ_README.md](./OPENMHZ_README.md)** - Complete guide
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Technical details

## API Messages

### List Systems
```json
{"type": "list_systems"}
```

### Get Streams
```json
{
  "type": "get_streams",
  "payload": {"systemId": "rhode-island"}
}
```

### Get Talkgroups
```json
{
  "type": "get_talkgroups",
  "payload": {"systemId": "rhode-island"}
}
```

### Start Stream
```json
{
  "type": "start_stream",
  "payload": {
    "streamType": "openmhz",
    "streamId": "...",
    "audioUrl": "..."
  }
}
```

### Stop Stream
```json
{"type": "stop_stream"}
```

## What Works

✅ Stream profile generation
✅ Metadata handling
✅ Error handling
✅ CLI interface
✅ WebSocket server
✅ Mock testing

## What Doesn't

⚠️ Direct API access (Cloudflare blocks it)

**Solution**: Use mock test or implement Socket.IO interface

## Getting Help

Run the test script:
```bash
./test_openmhz.sh
```

It will check:
- Python installation
- Required libraries
- API connectivity
- Node.js setup

## That's It!

You now have a working OpenMHz integration that can:
1. Ingest radio streams from OpenMHz
2. Generate stream profiles with metadata
3. Serve streams to your frontend via WebSocket

Test it with the mock data, then integrate with your Argus Defense frontend!
