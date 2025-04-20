// scripts/deployDroneRegistry.js
// Deploys the DroneRegistry contract

const hre = require("hardhat");

async function main() {
  const DroneRegistry = await hre.ethers.getContractFactory("DroneRegistry");
  const droneRegistry = await DroneRegistry.deploy();
  const droneRegistryAddress = await droneRegistry.getAddress();
  console.log("DroneRegistry deployed to:", droneRegistryAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
