import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { DroneRegistry } from "../typechain-types";

describe("DroneRegistry", function () {
  let droneRegistry: DroneRegistry;
  let owner: HardhatEthersSigner;
  let addr1: HardhatEthersSigner;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();
    const DroneRegistry = await ethers.getContractFactory("DroneRegistry");
    droneRegistry = await DroneRegistry.deploy() as unknown as DroneRegistry;
    await droneRegistry.waitForDeployment();

    const balance = await ethers.provider.getBalance(addr1.address);
    console.log(`addr1 balance: ${ethers.formatEther(balance)} ETH`);
  });

  describe("Deployment", function () {
    it("Should start with droneId 0", async function () {
      expect(await droneRegistry.droneId()).to.equal(0n);
    });
  });

  describe("Flight Registration", function () {
    it("Should increment droneId and emit event on registerFlight", async function () {
      await expect(droneRegistry.registerFlight())
        .to.emit(droneRegistry, "RegisteredFlight")
        .withArgs(1n, owner.address);
      
      expect(await droneRegistry.droneId()).to.equal(1n);
    });

    it("Should increment droneId for each registration", async function () {
      await droneRegistry.registerFlight();
      await droneRegistry.registerFlight();
      
      expect(await droneRegistry.droneId()).to.equal(2n);
    });

    it("Should emit event with correct sender", async function () {
      await expect(droneRegistry.connect(addr1).registerFlight())
        .to.emit(droneRegistry, "RegisteredFlight")
        .withArgs(1n, addr1.address);
    });
  });
}); 