const hre = require("hardhat");

async function main() {
  const Payeer = await hre.ethers.getContractFactory("Payeer");
  const payeer = await Payeer.deploy();

  await payeer.waitForDeployment();

  console.log("Payeer deployed to:", await payeer.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
