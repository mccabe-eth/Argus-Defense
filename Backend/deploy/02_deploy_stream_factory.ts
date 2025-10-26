import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployStreamFactory: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  console.log("\n🏭 Deploying StreamFactory...");

  // Get StreamRegistry address
  const streamRegistry = await hre.deployments.get("StreamRegistry");
  console.log(`   StreamRegistry: ${streamRegistry.address}`);

  // DAO Treasury (deployer for now)
  const daoTreasury = deployer;
  console.log(`   DAO Treasury: ${daoTreasury}\n`);

  const streamFactory = await deploy("StreamFactory", {
    from: deployer,
    args: [streamRegistry.address, daoTreasury],
    log: true,
    autoMine: true,
  });

  console.log(`\n✅ StreamFactory deployed: ${streamFactory.address}`);

  // Grant DAO_ROLE to StreamFactory so it can register streams
  const StreamRegistry = await hre.ethers.getContract("StreamRegistry", deployer);
  const DAO_ROLE = await StreamRegistry.DAO_ROLE();
  const hasRole = await StreamRegistry.hasRole(DAO_ROLE, streamFactory.address);

  if (!hasRole) {
    console.log("\n🔐 Granting DAO_ROLE to StreamFactory...");
    const tx = await StreamRegistry.grantRole(DAO_ROLE, streamFactory.address);
    await tx.wait();
    console.log("   ✅ DAO_ROLE granted");
  }

  console.log("\n📋 StreamFactory ready!");
  console.log("   Anyone can now call createStream() to publish\n");
};

export default deployStreamFactory;
deployStreamFactory.tags = ["StreamFactory"];
deployStreamFactory.dependencies = ["StreamRegistry"];
