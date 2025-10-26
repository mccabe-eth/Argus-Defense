import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

/**
 * Register streams from streams.json to the StreamRegistry contract
 * This script reads the off-chain JSON and registers them on-chain
 */
async function main() {
  console.log("\n🔗 Registering Streams to StreamRegistry Contract\n");

  // Get the deployed contract
  const StreamRegistry = await ethers.getContract("StreamRegistry") as any;
  const contractAddress = await StreamRegistry.getAddress();

  console.log(`📍 StreamRegistry address: ${contractAddress}\n`);

  // Load streams.json
  const streamsPath = path.join(__dirname, "../openmhz/streams.json");
  const streamsData = JSON.parse(fs.readFileSync(streamsPath, "utf-8"));

  console.log("📂 Loading streams from streams.json...\n");

  // Prepare batch registration data
  const systemIds: string[] = [];
  const talkgroupIds: bigint[] = [];
  const callIds: string[] = [];
  const wallets: string[] = [];

  // Extract streams from all systems
  for (const [systemKey, systemData] of Object.entries(streamsData)) {
    if (systemKey === "last_updated") continue;

    const system = systemData as any;

    console.log(`📡 System: ${system.system_id}`);
    console.log(`   Streams: ${system.total_streams}\n`);

    if (system.streams && Array.isArray(system.streams)) {
      for (const stream of system.streams) {
        // Parse stream ID to extract components
        // Format: {systemId}-{talkgroupId}-{callId}
        const parts = stream.stream_id.split("-");
        const systemId = system.system_id;
        const talkgroupId = stream.talkgroup_id || parseInt(parts[parts.length - 2] || "0");
        const callId = stream.metadata?.call_id || parts[parts.length - 1] || stream.stream_id;

        // Get wallet address
        let walletAddress = stream.wallet?.address || ethers.ZeroAddress;

        if (walletAddress === ethers.ZeroAddress) {
          console.log(`   ⚠️  Skipping ${stream.stream_id}: No wallet address`);
          continue;
        }

        // Fix checksum by normalizing to lowercase then back to checksummed
        try {
          walletAddress = ethers.getAddress(walletAddress.toLowerCase());
        } catch (error) {
          console.log(`   ⚠️  Skipping ${stream.stream_id}: Invalid address format`);
          continue;
        }

        systemIds.push(systemId);
        talkgroupIds.push(BigInt(talkgroupId));
        callIds.push(callId);
        wallets.push(walletAddress);

        console.log(`   ✅ Prepared: ${stream.name}`);
        console.log(`      System: ${systemId}`);
        console.log(`      Talkgroup: ${talkgroupId}`);
        console.log(`      Call ID: ${callId}`);
        console.log(`      Wallet: ${walletAddress}\n`);
      }
    }
  }

  if (systemIds.length === 0) {
    console.log("❌ No streams to register\n");
    return;
  }

  console.log(`\n📊 Summary: ${systemIds.length} streams to register\n`);

  // Register in batches (to avoid gas limits)
  const BATCH_SIZE = 10;

  for (let i = 0; i < systemIds.length; i += BATCH_SIZE) {
    const end = Math.min(i + BATCH_SIZE, systemIds.length);
    const batchSystemIds = systemIds.slice(i, end);
    const batchTalkgroupIds = talkgroupIds.slice(i, end);
    const batchCallIds = callIds.slice(i, end);
    const batchWallets = wallets.slice(i, end);

    console.log(`\n📝 Registering batch ${Math.floor(i / BATCH_SIZE) + 1} (${end - i} streams)...`);

    try {
      const tx = await StreamRegistry.registerStreamBatch(
        batchSystemIds,
        batchTalkgroupIds,
        batchCallIds,
        batchWallets
      );

      console.log(`   Transaction hash: ${tx.hash}`);
      console.log(`   Waiting for confirmation...`);

      const receipt = await tx.wait();

      console.log(`   ✅ Confirmed in block ${receipt!.blockNumber}`);
      console.log(`   Gas used: ${receipt!.gasUsed.toString()}\n`);
    } catch (error: any) {
      console.error(`   ❌ Error registering batch: ${error.message}\n`);
    }
  }

  // Verify registration
  console.log("\n🔍 Verifying registration...\n");

  const streamCount = await StreamRegistry.getStreamCount();
  console.log(`   Total streams registered: ${streamCount.toString()}`);

  // Test a few lookups
  console.log("\n   Testing stream lookups:\n");

  for (let i = 0; i < Math.min(3, systemIds.length); i++) {
    const streamId = await StreamRegistry.computeStreamId(
      systemIds[i],
      talkgroupIds[i],
      callIds[i]
    );

    const wallet = await StreamRegistry.getWallet(streamId);
    const isActive = await StreamRegistry.isStreamActive(streamId);

    console.log(`   Stream ${i + 1}:`);
    console.log(`      ID: ${streamId}`);
    console.log(`      Wallet: ${wallet}`);
    console.log(`      Active: ${isActive}`);
    console.log(`      Expected: ${wallets[i]}`);
    console.log(`      Match: ${wallet === wallets[i] ? "✅" : "❌"}\n`);
  }

  console.log("✅ Registration complete!\n");
  console.log("📋 Contract address:", contractAddress);
  console.log("   Save this address for backend integration\n");
}

// Run the script
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
