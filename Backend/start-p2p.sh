#!/bin/bash
# Start Argus Defense P2P Backend
# This script starts the API server with libp2p auto-publishing enabled

echo "🚀 Starting Argus Defense P2P Backend..."
echo ""
echo "Configuration:"
echo "  Auto-publish: ENABLED"
echo "  Auto-publish limit: 5 streams per update"
echo "  API Port: 3001"
echo ""

# Enable auto-publishing of streams to the P2P network
export LIBP2P_AUTO_PUBLISH=true
export LIBP2P_AUTO_PUBLISH_LIMIT=5
export API_PORT=3001

# Start the API server
node apiServer.js
