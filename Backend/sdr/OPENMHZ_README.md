# OpenMHz Integration for Argus Defense

This module provides integration with OpenMHz.com for ingesting and streaming public safety radio communications.

## Components

### 1. `ingest_openmhz.py`
Python script that queries the OpenMHz API and generates stream profiles.

#### Features
- Query systems by ID (e.g., "rhode-island", "kcers1b")
- Filter by specific talkgroups or talkgroup groups
- Fetch recent call metadata and audio URLs
- Generate structured stream profiles
- CLI and programmatic interfaces

#### Usage

##### Command Line
```bash
# Get all recent calls from Rhode Island
python ingest_openmhz.py --system rhode-island

# Filter specific talkgroups
python ingest_openmhz.py --system kcers1b --talkgroups 3344,3408,44912

# Filter by group
python ingest_openmhz.py --system kcers1b --group fire-dispatch

# Output as text
python ingest_openmhz.py --system rhode-island --format text

# Save to file
python ingest_openmhz.py --system rhode-island --output streams.json
```

##### Programmatic
```python
from ingest_openmhz import OpenMHZClient, StreamProfileGenerator

# Initialize client
client = OpenMHZClient("rhode-island")

# Get recent calls
calls = client.get_recent_calls()

# Get talkgroups
talkgroups = client.get_talkgroups()

# Generate stream profiles
for call in calls:
    profile = StreamProfileGenerator.generate_stream_profile(
        call, "rhode-island"
    )
    print(profile)
```

### 2. `openmhz_integration.js`
Node.js module that provides integration between the Python script and the stream server.

#### Features
- Ingest systems and get stream profiles
- List available streams
- Get talkgroup information
- Stream audio from OpenMHz to WebSocket clients

#### Usage
```javascript
const OpenMHZIntegration = require('./openmhz_integration.js');
const openmhz = new OpenMHZIntegration();

// Ingest a system
const profile = await openmhz.ingestSystem('rhode-island');

// Get available streams
const streams = await openmhz.getAvailableStreams('rhode-island');

// Get talkgroups
const talkgroups = await openmhz.getTalkgroups('rhode-island');

// Stream audio to WebSocket
openmhz.streamAudio(audioUrl, websocket);
```

### 3. `streamServer_openmhz.js`
Enhanced WebSocket server that supports both local SDR and OpenMHz streams.

#### Features
- WebSocket-based API for frontend clients
- List available systems
- Query streams by system/talkgroup
- Start/stop streaming
- Get talkgroup metadata

#### Running the Server
```bash
node streamServer_openmhz.js
```

The server listens on `ws://localhost:8080`.

#### Client Protocol

##### List Systems
```json
{
  "type": "list_systems"
}
```

Response:
```json
{
  "type": "systems_list",
  "systems": [
    {
      "id": "rhode-island",
      "name": "Rhode Island",
      "type": "openmhz"
    }
  ]
}
```

##### Get Streams
```json
{
  "type": "get_streams",
  "payload": {
    "systemId": "rhode-island",
    "talkgroupIds": [3344, 3408],  // Optional
    "groupId": "fire-dispatch"      // Optional
  }
}
```

Response:
```json
{
  "type": "streams_list",
  "systemId": "rhode-island",
  "totalStreams": 10,
  "streams": [
    {
      "stream_id": "rhode-island-3344-abc123",
      "name": "Providence Fire Dispatch",
      "description": "System: rhode-island | Duration: 15s | Radios: 3",
      "audio_url": "https://cdn.openmhz.com/...",
      "talkgroup_id": 3344,
      "timestamp": "2025-10-23T12:34:56.000Z",
      "duration": 15
    }
  ]
}
```

##### Start Stream
```json
{
  "type": "start_stream",
  "payload": {
    "streamType": "openmhz",
    "streamId": "rhode-island-3344-abc123",
    "systemId": "rhode-island",
    "audioUrl": "https://cdn.openmhz.com/..."
  }
}
```

For local SDR:
```json
{
  "type": "start_stream",
  "payload": {
    "streamType": "local_sdr"
  }
}
```

##### Stop Stream
```json
{
  "type": "stop_stream"
}
```

##### Get Talkgroups
```json
{
  "type": "get_talkgroups",
  "payload": {
    "systemId": "rhode-island"
  }
}
```

## Stream Profile Format

Each stream profile contains:

```json
{
  "stream_id": "unique-identifier",
  "name": "Human-readable name",
  "description": "Detailed description with metadata",
  "audio_url": "Direct CDN URL to audio file",
  "system_name": "System short name/ID",
  "talkgroup_id": 12345,
  "timestamp": "ISO 8601 timestamp",
  "duration": 15,
  "filename": "relative/path/to/file.mp3",
  "src_list": [
    {"src": 123, "pos": 0.0},
    {"src": 456, "pos": 5.2}
  ],
  "metadata": {
    "star_count": 0,
    "call_id": "internal-id",
    "talkgroup_info": {
      "num": 12345,
      "alpha": "ALPHA_TAG",
      "description": "Talkgroup description",
      "tag": "Fire Dispatch",
      "category": "Emergency Services"
    }
  }
}
```

## Finding System IDs

OpenMHz system IDs are typically the short name from the URL:
- `https://openmhz.com/system/rhode-island` → `rhode-island`
- `https://openmhz.com/system/kcers1b` → `kcers1b`

Common systems:
- `rhode-island` - Rhode Island Statewide
- `kcers1b` - Kansas City
- `nyc-citywide` - New York City
- `chi_cfd` - Chicago Fire Department

Visit https://openmhz.com/systems to browse available systems.

### Important Notes About API Access

1. **Cloudflare Protection**: The OpenMHz API is behind Cloudflare protection and may block direct programmatic access (403 Forbidden errors). This is a common anti-scraping measure. Potential solutions:
   - Use browser automation (Selenium, Puppeteer) to bypass protection
   - Contact OpenMHz for API access credentials
   - Use the website's Socket.IO interface instead of REST API
   - Access via a browser extension or authenticated session

2. **Public Access**: Some OpenMHz systems may have restricted API access or require authentication. If you receive a 403 Forbidden error, the system may not be publicly accessible via the API.

3. **System Availability**: Not all systems listed on the website may be active. Systems need to have recent uploads to appear in API results.

4. **Finding Active Systems**: To find currently active systems:
   - Visit https://openmhz.com/systems
   - Look for systems with recent activity (green indicator)
   - Use the short name from the URL (e.g., `https://openmhz.com/system/loudoun` → `loudoun`)

5. **Testing Without API Access**:
   - Run the mock test: `python3 test_ingest_mock.py`
   - Example stream profile: [example_stream_profile.json](./example_stream_profile.json)
   - Mock test demonstrates full functionality with sample data

## API Endpoints Reference

### OpenMHz REST API

**Get Recent Calls:**
```
GET https://api.openmhz.com/{system}/calls/newer?time={timestamp}&filter-type={type}&filter-code={codes}
```

Parameters:
- `system`: System short name
- `time`: Unix timestamp without decimal (e.g., 1609533015681)
- `filter-type`: Either "talkgroup" or "group"
- `filter-code`: Comma-separated IDs for talkgroups, or single ID for groups

**Get Talkgroups:**
```
GET https://api.openmhz.com/{system}/talkgroups
```

**Get System Info:**
```
GET https://api.openmhz.com/{system}/system
```

## Dependencies

### Python
```bash
pip install requests
```

Already included in [requirements.txt](../../requirements.txt).

### Node.js
```bash
npm install ws
```

## Testing

### Mock Test (Recommended)

Test the ingestion logic without API access:
```bash
# Run the mock test with sample data
python3 test_ingest_mock.py
```

This demonstrates:
- Stream profile generation
- Talkgroup metadata handling
- JSON output formatting
- All core functionality

### Live API Test

If you have API access, test with real systems:
```bash
# Test with debug output
python3 ingest_openmhz.py --system rhode-island --debug --format text

# Test with specific talkgroups
python3 ingest_openmhz.py --system kcers1b --talkgroups 3344,3408 --debug

# Save output to file
python3 ingest_openmhz.py --system dcfd --output streams.json
```

### Node.js Integration Test

Test the stream server:
```bash
# Run the enhanced server
node streamServer_openmhz.js

# In another terminal, use wscat to test:
npm install -g wscat
wscat -c ws://localhost:8080

# Send test messages:
> {"type": "list_systems"}
> {"type": "get_streams", "payload": {"systemId": "rhode-island"}}
```

## Frontend Integration

### React Example
```javascript
const ws = new WebSocket('ws://localhost:8080');

ws.onopen = () => {
  // Request available systems
  ws.send(JSON.stringify({ type: 'list_systems' }));
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);

  switch (message.type) {
    case 'systems_list':
      console.log('Available systems:', message.systems);
      // Update dropdown with systems
      break;

    case 'streams_list':
      console.log('Available streams:', message.streams);
      // Display streams in UI
      break;

    case 'stream_start':
      console.log('Stream started');
      // Show audio player
      break;

    // Handle other message types...
  }
};

// When user selects a system from dropdown
function onSystemSelected(systemId) {
  ws.send(JSON.stringify({
    type: 'get_streams',
    payload: { systemId }
  }));
}

// When user clicks play on a stream
function onPlayStream(stream) {
  ws.send(JSON.stringify({
    type: 'start_stream',
    payload: {
      streamType: 'openmhz',
      streamId: stream.stream_id,
      systemId: stream.system_name,
      audioUrl: stream.audio_url
    }
  }));
}
```

## Architecture Flow

```
Frontend (Browser)
    |
    | WebSocket
    v
streamServer_openmhz.js
    |
    | Spawns Python process
    v
ingest_openmhz.py
    |
    | HTTPS Requests
    v
OpenMHz API (api.openmhz.com)
    |
    v
Returns stream metadata + audio URLs
    |
    v
streamServer streams audio to WebSocket
    |
    v
Frontend plays audio
```

## Error Handling

The integration includes error handling for:
- Network failures when contacting OpenMHz API
- Invalid system IDs
- Empty or zero-length calls
- Python script failures
- WebSocket disconnections

Errors are returned in this format:
```json
{
  "type": "error",
  "message": "Description of error"
}
```

## Rate Limiting

Be mindful of OpenMHz API rate limits:
- Cache system and talkgroup metadata
- Don't poll for new calls more frequently than every 5-10 seconds
- Use talkgroup/group filters to reduce response size

## Future Enhancements

Potential improvements:
1. **Real-time updates**: Use Socket.IO to get live calls instead of polling
2. **Caching**: Cache talkgroup metadata and recent calls
3. **Database integration**: Store call history locally
4. **Audio transcription**: Use speech-to-text on recorded calls
5. **Alert system**: Notify on specific talkgroup activity
6. **Recording**: Save calls locally for later playback
7. **Multi-system monitoring**: Monitor multiple systems simultaneously

## Troubleshooting

**"Failed to start ingestion":**
- Ensure Python 3 is installed: `python3 --version`
- Verify requests library: `pip install requests`

**"Failed to fetch system info":**
- Check system ID is correct
- Verify OpenMHz API is accessible: `curl https://api.openmhz.com/rhode-island/system`

**"No streams available":**
- System may not have recent activity
- Try increasing time window in `get_recent_calls()`
- Check if system is active on openmhz.com

**WebSocket connection fails:**
- Ensure server is running: `node streamServer_openmhz.js`
- Check port 8080 is not in use
- Verify firewall allows connections

## License

Part of the Argus Defense project.
