#!/bin/bash
# Diagnose P2P Backend Issues

echo "=== Argus Defense P2P Diagnostics ==="
echo ""

# Check if backend is running
echo "1. Checking if backend is running..."
if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo "   ✅ Backend is running"
else
    echo "   ❌ Backend is NOT running"
    echo "      Run: cd Backend && ./start-p2p.sh"
    exit 1
fi
echo ""

# Check environment variables
echo "2. Checking backend configuration..."
curl -s http://localhost:3001/api/libp2p/status | grep -q "running" && echo "   ✅ libp2p publisher is running" || echo "   ⚠️  libp2p publisher may not be started"
echo ""

# Check streams.json exists
echo "3. Checking streams.json..."
if [ -f "openmhz/streams.json" ]; then
    STREAM_COUNT=$(cat openmhz/streams.json | grep -o '"stream_id"' | wc -l)
    echo "   ✅ streams.json exists"
    echo "   📊 Found $STREAM_COUNT streams in streams.json"
else
    echo "   ❌ streams.json NOT found"
    exit 1
fi
echo ""

# Check active P2P streams
echo "4. Checking active P2P streams..."
ACTIVE=$(curl -s http://localhost:3001/api/libp2p/streams | grep -o '"total_streams":[0-9]*' | cut -d':' -f2)
echo "   📡 Active P2P streams: $ACTIVE"
echo ""

# Check discovered streams
echo "5. Checking discovered streams in directory..."
DISCOVERED=$(curl -s http://localhost:3001/api/libp2p/directory/discovered | grep -o '"total":[0-9]*' | cut -d':' -f2)
echo "   🔍 Discovered streams: $DISCOVERED"
echo ""

# Get detailed status
echo "6. Detailed libp2p status:"
curl -s http://localhost:3001/api/libp2p/status | json_pp 2>/dev/null || curl -s http://localhost:3001/api/libp2p/status
echo ""

# Recommendations
echo "=== Recommendations ==="
if [ "$ACTIVE" = "0" ]; then
    echo ""
    echo "⚠️  No streams are being published!"
    echo ""
    echo "To manually publish a stream:"
    echo "  1. First, start the publisher:"
    echo "     curl -X POST http://localhost:3001/api/libp2p/start"
    echo ""
    echo "  2. Then publish a stream:"
    echo "     curl -X POST http://localhost:3001/api/libp2p/publish \\"
    echo "       -H 'Content-Type: application/json' \\"
    echo "       -d '{\"streamId\": \"rhode-island-3344-abc123def456\", \"audioUrl\": \"https://cdn.openmhz.com/rhode-island/2025/10/23/3344-1729713045-abc123.m4a\"}'"
    echo ""
    echo "  3. Check if it worked:"
    echo "     curl http://localhost:3001/api/libp2p/streams"
    echo ""
else
    echo "✅ Everything looks good! $ACTIVE stream(s) are being published."
fi
