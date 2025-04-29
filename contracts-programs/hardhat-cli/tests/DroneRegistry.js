const { expect } = require("chai");
const { ethers } = require("hardhat");

console.log('Hardhat ethers.utils:', ethers.utils);

function formatEtherCompat(balance) {
  if (ethers.utils && typeof ethers.utils.formatEther === 'function') {
    return ethers.utils.formatEther(balance);
  } else {
    return balance.toString(); // fallback: print raw value
  }
}

describe("DroneRegistry", function () {
  let DroneRegistry, droneRegistry, owner, addr1;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();
    DroneRegistry = await ethers.getContractFactory("DroneRegistry");
    droneRegistry = await DroneRegistry.deploy();
    await droneRegistry.waitForDeployment();

    const balance = await ethers.provider.getBalance(addr1.address);
    console.log(` addr1 balance: ${formatEtherCompat(balance)} ETH`);
  });

  it("should start with droneId 0", async function () {
    expect(await droneRegistry.droneId()).to.equal(0);
  });

  it("should increment droneId and emit event on registerFlight", async function () {
    await expect(droneRegistry.registerFlight())
      .to.emit(droneRegistry, "RegisteredFlight")
      .withArgs(1, owner.address);
    expect(await droneRegistry.droneId()).to.equal(1);
  });

  it("should increment droneId for each registration", async function () {
    await droneRegistry.registerFlight();
    await droneRegistry.registerFlight();
    expect(await droneRegistry.droneId()).to.equal(2);
  });

  it("should emit event with correct sender", async function () {
    await expect(droneRegistry.connect(addr1).registerFlight())
      .to.emit(droneRegistry, "RegisteredFlight")
      .withArgs(1, addr1.address);
  });
});
