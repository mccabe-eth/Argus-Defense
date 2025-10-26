import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

/**
 * Deploy StreamRegistry contract
 * This contract is the source of truth for stream ownership on-chain
 *
 * @param hre HardhatRuntimeEnvironment object
 */
const deployStreamRegistry: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  console.log("\n🚀 Deploying StreamRegistry contract...");
  console.log(`   Deployer: ${deployer}\n`);

  const streamRegistry = await deploy("StreamRegistry", {
    from: deployer,
    // Contract constructor arguments (none for this contract)
    args: [],
    log: true,
    // Auto-verify on Etherscan/Blockscout
    autoMine: true,
  });

  console.log(`\n✅ StreamRegistry deployed to: ${streamRegistry.address}`);

  // Get the deployed contract to interact with it
  const StreamRegistry = await hre.ethers.getContract<Contract>("StreamRegistry", deployer);

  console.log("\n📋 Contract Info:");
  console.log(`   Address: ${await StreamRegistry.getAddress()}`);
  console.log(`   Admin: ${deployer}`);

  // Check roles
  const DEFAULT_ADMIN_ROLE = await StreamRegistry.DEFAULT_ADMIN_ROLE();
  const DAO_ROLE = await StreamRegistry.DAO_ROLE();
  const REGISTRAR_ROLE = await StreamRegistry.REGISTRAR_ROLE();

  console.log("\n🔐 Role Setup:");
  console.log(`   DEFAULT_ADMIN_ROLE: ${DEFAULT_ADMIN_ROLE}`);
  console.log(`   DAO_ROLE: ${DAO_ROLE}`);
  console.log(`   REGISTRAR_ROLE: ${REGISTRAR_ROLE}`);

  const hasAdminRole = await StreamRegistry.hasRole(DEFAULT_ADMIN_ROLE, deployer);
  const hasDAORole = await StreamRegistry.hasRole(DAO_ROLE, deployer);
  const hasRegistrarRole = await StreamRegistry.hasRole(REGISTRAR_ROLE, deployer);

  console.log(`\n   Deployer has ADMIN role: ${hasAdminRole}`);
  console.log(`   Deployer has DAO role: ${hasDAORole}`);
  console.log(`   Deployer has REGISTRAR role: ${hasRegistrarRole}`);

  console.log("\n📝 Next Steps:");
  console.log("   1. Register streams using registerStream() or registerStreamBatch()");
  console.log("   2. Update backend to verify wallet addresses via contract");
  console.log("   3. Grant DAO_ROLE to a multisig or DAO contract for decentralization");
  console.log("");
};

export default deployStreamRegistry;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags StreamRegistry
deployStreamRegistry.tags = ["StreamRegistry"];
