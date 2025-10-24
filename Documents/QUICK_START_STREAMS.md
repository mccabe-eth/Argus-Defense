# Quick Start - Radio Streams Feature

## One-Time Setup

```bash
# From project root
yarn install
```

## Run the App (3 Terminals)

**All commands from project root:**

### Terminal 1: Blockchain
```bash
yarn chain
```

### Terminal 2: API Server ⚠️ REQUIRED
```bash
yarn api
```
**Must see:** `🚀 Argus Defense API Server running on http://localhost:3001`

### Terminal 3: Frontend
```bash
yarn start
```

## Access

Visit: **http://localhost:3000/streams**

## Troubleshooting

### "Failed to fetch" error?
→ API server (Terminal 2) is not running. Start it with `yarn api`

### Still not working?
1. Check `curl http://localhost:3001/health` returns JSON
2. Refresh browser after starting API server
3. Check browser console (F12) for errors

See [STREAMS_SETUP.md](../STREAMS_SETUP.md) for full documentation.
