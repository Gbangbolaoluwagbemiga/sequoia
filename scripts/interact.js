const hre = require("hardhat");

async function main() {
  console.log("Interacting with Payeer...");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
