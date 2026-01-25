const hre = require("hardhat");

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  if (!contractAddress) {
    console.error("Please set CONTRACT_ADDRESS in .env");
    return;
  }
  console.log("Verifying contract at:", contractAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
