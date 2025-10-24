#!/usr/bin/env ts-node
/**
 * generateStreamWallet.ts
 *
 * Creates or retrieves a blockchain wallet for an audio stream
 * Can be called from Python ingestion script or used standalone
 *
 * Usage:
 *   ts-node scripts/generateStreamWallet.ts --streamId "rhode-island-3344-abc" --streamName "Fire Dispatch" --metadata '{...}'
 *   ts-node scripts/generateStreamWallet.ts --streamId "rhode-island-3344-abc" --mode simple
 */

import { ethers } from "ethers";
import * as fs from "fs";
import * as path from "path";

// Configuration
const WALLETS_DIR = path.join(__dirname, "../sdr/wallets");
const REGISTRY_FILE = path.join(__dirname, "../sdr/stream_wallets.json");

interface StreamWalletData {
  streamId: string;
  streamName: string;
  walletAddress: string;
  privateKey?: string; // Only stored for simple mode
  contractAddress?: string; // Only for deployed contract mode
  createdAt: string;
  mode: "simple" | "contract";
  metadata?: string;
}

interface WalletRegistry {
  [streamId: string]: StreamWalletData;
}

/**
 * Parse command line arguments
 */
function parseArgs(): { streamId: string; streamName?: string; metadata?: string; mode: "simple" | "contract" } {
  const args = process.argv.slice(2);
  const parsed: any = { mode: "simple" }; // Default to simple mode

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--streamId" && args[i + 1]) {
      parsed.streamId = args[i + 1];
      i++;
    } else if (args[i] === "--streamName" && args[i + 1]) {
      parsed.streamName = args[i + 1];
      i++;
    } else if (args[i] === "--metadata" && args[i + 1]) {
      parsed.metadata = args[i + 1];
      i++;
    } else if (args[i] === "--mode" && args[i + 1]) {
      parsed.mode = args[i + 1];
      i++;
    }
  }

  if (!parsed.streamId) {
    console.error("Error: --streamId is required");
    console.log("Usage: ts-node scripts/generateStreamWallet.ts --streamId <id> [--streamName <name>] [--metadata <json>] [--mode simple|contract]");
    process.exit(1);
  }

  return parsed;
}

/**
 * Load the wallet registry
 */
function loadRegistry(): WalletRegistry {
  if (fs.existsSync(REGISTRY_FILE)) {
    const data = fs.readFileSync(REGISTRY_FILE, "utf-8");
    return JSON.parse(data);
  }
  return {};
}

/**
 * Save the wallet registry
 */
function saveRegistry(registry: WalletRegistry): void {
  // Ensure directory exists
  const dir = path.dirname(REGISTRY_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(REGISTRY_FILE, JSON.stringify(registry, null, 2), "utf-8");
}

/**
 * Create a simple Ethereum wallet (no contract deployment)
 * Faster and cheaper, suitable for basic reward routing
 */
function createSimpleWallet(
  streamId: string,
  streamName: string,
  metadata?: string
): StreamWalletData {
  console.log(`Creating simple wallet for stream: ${streamId}`);

  // Generate a new random wallet
  const wallet = ethers.Wallet.createRandom();

  // Create wallet data
  const walletData: StreamWalletData = {
    streamId,
    streamName,
    walletAddress: wallet.address,
    privateKey: wallet.privateKey, // Store for simple mode (should encrypt in production!)
    createdAt: new Date().toISOString(),
    mode: "simple",
    metadata,
  };

  // Save encrypted wallet file
  if (!fs.existsSync(WALLETS_DIR)) {
    fs.mkdirSync(WALLETS_DIR, { recursive: true });
  }

  const walletFilePath = path.join(WALLETS_DIR, `${streamId.replace(/[^a-zA-Z0-9-]/g, "_")}.json`);
  fs.writeFileSync(
    walletFilePath,
    JSON.stringify({
      address: wallet.address,
      privateKey: wallet.privateKey, // In production, use encryption!
      streamId,
      streamName,
      createdAt: walletData.createdAt,
    }, null, 2),
    "utf-8"
  );

  console.log(`✓ Simple wallet created: ${wallet.address}`);
  console.log(`✓ Wallet file saved: ${walletFilePath}`);

  return walletData;
}

/**
 * Deploy a StreamWallet contract (requires network connection and gas)
 * More features, but slower and costs gas
 */
async function deployStreamWalletContract(
  streamId: string,
  streamName: string,
  metadata?: string
): Promise<StreamWalletData> {
  console.log(`Deploying StreamWallet contract for stream: ${streamId}`);
  console.log("Note: This requires a local Hardhat node or network connection");

  // This would require:
  // 1. Connection to a network (hardhat local, testnet, mainnet)
  // 2. Deployer account with ETH for gas
  // 3. Deployed StreamWallet contract bytecode

  // For now, return a placeholder
  // In production, you would use hardhat-deploy or ethers to deploy
  console.warn("⚠️  Contract deployment not yet implemented in this script");
  console.warn("⚠️  Falling back to simple wallet mode");

  return createSimpleWallet(streamId, streamName, metadata);
}

/**
 * Main function
 */
async function main() {
  const { streamId, streamName, metadata, mode } = parseArgs();

  console.log("=".repeat(60));
  console.log("Stream Wallet Generator");
  console.log("=".repeat(60));
  console.log(`Stream ID: ${streamId}`);
  console.log(`Stream Name: ${streamName || "Unknown"}`);
  console.log(`Mode: ${mode}`);
  console.log("");

  // Load existing registry
  const registry = loadRegistry();

  // Check if wallet already exists for this stream
  if (registry[streamId]) {
    console.log(`✓ Wallet already exists for stream: ${streamId}`);
    console.log(`  Address: ${registry[streamId].walletAddress}`);
    console.log(`  Created: ${registry[streamId].createdAt}`);
    console.log("");

    // Output as JSON for Python to parse
    console.log("JSON_OUTPUT_START");
    console.log(JSON.stringify(registry[streamId]));
    console.log("JSON_OUTPUT_END");

    return;
  }

  // Create new wallet based on mode
  let walletData: StreamWalletData;

  if (mode === "contract") {
    walletData = await deployStreamWalletContract(streamId, streamName || "Unknown Stream", metadata);
  } else {
    walletData = createSimpleWallet(streamId, streamName || "Unknown Stream", metadata);
  }

  // Add to registry
  registry[streamId] = walletData;
  saveRegistry(registry);

  console.log("");
  console.log("✓ Wallet registered successfully");
  console.log(`  Registry: ${REGISTRY_FILE}`);
  console.log("");

  // Output as JSON for Python to parse
  console.log("JSON_OUTPUT_START");
  console.log(JSON.stringify(walletData));
  console.log("JSON_OUTPUT_END");
}

// Run if called directly
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Error:", error);
      process.exit(1);
    });
}

// Export for use as module
export { main, createSimpleWallet, loadRegistry, saveRegistry };
