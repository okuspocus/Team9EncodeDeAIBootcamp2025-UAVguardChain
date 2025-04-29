// scripts/airdrop.js
const { ethers } = require("hardhat");
let parseEther;
let formatEther;

try {
  // ethers v6+
  parseEther = require("ethers").parseEther;
  formatEther = require("ethers").formatEther;
} catch {
  // ethers v5 fallback
  parseEther = require("ethers").utils.parseEther;
  formatEther = require("ethers").utils.formatEther;
}

async function main() {
  const [deployer] = await ethers.getSigners();
  const recipient = process.argv[2];
  const amount = process.argv[3];

  if (!recipient || !amount) {
    console.error("Usage: node scripts/airdrop.js <recipient> <amountInETH>");
    process.exit(1);
  }

  console.log(`Deployer address: ${deployer.address}`);

  const senderBalance = await ethers.provider.getBalance(deployer.address);
  const sendValue = parseEther(amount);
  console.log(`Sender balance: ${formatEther(senderBalance)} ETH`);
  if (senderBalance < sendValue) {
    console.error(`Insufficient funds: Sender has ${formatEther(senderBalance)} ETH, tried to send ${amount} ETH.`);
    process.exit(1);
  }

  const tx = await deployer.sendTransaction({
    to: recipient,
    value: sendValue
  });

  console.log(`Airdropped ${amount} ETH to ${recipient}, tx: ${tx.hash}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
