import { ethers } from "hardhat";

async function main() {
  const Registry = await ethers.getContractFactory("DroneFlightRegistry");

  const registry = await Registry.deploy();

  await registry.waitForDeployment();

  const address = await registry.getAddress();
  console.log(`Contrato desplegado en: ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
