# SDR Integration

Local software-defined radio (SDR) capture and processing.

## Components

- **sim-capture.py** - Simulate SDR capture
- **capture.py** - Real SDR capture (requires hardware)
- **decode-sim.py** - Decode simulated signals
- **streamServer.js** - Stream SDR audio to P2P network

## Usage

```bash
# Simulate capture
python3 sim-capture.py

# Stream to P2P
node streamServer.js
```

## Requirements

- Python 3.x
- numpy, scipy (for signal processing)
- RTL-SDR hardware (for real capture)

## See Also

- [openmhz/README.md](../openmhz/README.md) - Cloud-based alternative
