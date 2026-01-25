const hre = require("hardhat");

async function main() {
  console.log("Verifying contract...");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
