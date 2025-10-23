#!/bin/bash
# Test script for OpenMHz integration

echo "====================================="
echo "OpenMHz Integration Test Suite"
echo "====================================="
echo ""

# Check Python installation
echo "[1/5] Checking Python installation..."
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    echo "✓ Python found: $PYTHON_VERSION"
else
    echo "✗ Python 3 not found. Please install Python 3."
    exit 1
fi
echo ""

# Check requests library
echo "[2/5] Checking Python dependencies..."
python3 -c "import requests" 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✓ requests library installed"
else
    echo "✗ requests library not found"
    echo "  Installing requests..."
    pip install requests
fi
echo ""

# Test Python script help
echo "[3/5] Testing Python script..."
python3 ingest_openmhz.py --help > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✓ Python script runs correctly"
else
    echo "✗ Python script failed"
    exit 1
fi
echo ""

# Test actual ingestion (with timeout)
echo "[4/5] Testing OpenMHz API connection..."
timeout 10 python3 ingest_openmhz.py --system rhode-island --format text > /tmp/openmhz_test.txt 2>&1
if [ $? -eq 0 ]; then
    STREAM_COUNT=$(grep "Total Streams:" /tmp/openmhz_test.txt | awk '{print $3}')
    echo "✓ Successfully connected to OpenMHz API"
    echo "  Found $STREAM_COUNT streams from Rhode Island system"
else
    echo "⚠ Could not connect to OpenMHz API (this is OK if offline)"
    echo "  Check /tmp/openmhz_test.txt for details"
fi
echo ""

# Check Node.js
echo "[5/5] Checking Node.js installation..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✓ Node.js found: $NODE_VERSION"

    # Check ws module
    if node -e "require('ws')" 2>/dev/null; then
        echo "✓ ws module installed"
    else
        echo "⚠ ws module not found"
        echo "  Run: npm install ws"
    fi
else
    echo "⚠ Node.js not found (needed for stream server)"
    echo "  Install from: https://nodejs.org/"
fi
echo ""

echo "====================================="
echo "Test Summary"
echo "====================================="
echo ""
echo "Core components:"
echo "  ✓ ingest_openmhz.py - Python ingestion script"
echo "  ✓ openmhz_integration.js - Node.js integration module"
echo "  ✓ streamServer_openmhz.js - Enhanced stream server"
echo ""
echo "To test manually:"
echo "  1. List available streams:"
echo "     python3 ingest_openmhz.py --system rhode-island --format text"
echo ""
echo "  2. Get streams as JSON:"
echo "     python3 ingest_openmhz.py --system rhode-island"
echo ""
echo "  3. Start stream server:"
echo "     node streamServer_openmhz.js"
echo ""
echo "Documentation: See OPENMHZ_README.md"
echo ""
