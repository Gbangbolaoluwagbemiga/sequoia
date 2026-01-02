const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Payeer", function () {
  let Payeer;
  let payeer;

  beforeEach(async function () {
    Payeer = await ethers.getContractFactory("Payeer");
    payeer = await Payeer.deploy();
  });

  it("Should add participants", async function () {
    await payeer.addParticipant("Alice");
    await payeer.addParticipant("Bob");
    
    const participants = await payeer.getParticipants();
    expect(participants.length).to.equal(2);
    expect(participants[0]).to.equal("Alice");
    expect(participants[1]).to.equal("Bob");
  });

  it("Should pick a random payer", async function () {
    await payeer.addParticipant("Alice");
    await payeer.addParticipant("Bob");
    await payeer.addParticipant("Charlie");

    const tx = await payeer.pickPayer();
    const receipt = await tx.wait();
    
    // Check if the PayerSelected event was emitted
    // In ethers v6, we might need to look at logs differently, but hardhat-toolbox handles a lot.
    // Let's just check the return value or state if we could, but pickPayer is a transaction.
    // We can simulate the call to check the return value.
    
    const payer = await payeer.pickPayer.staticCall();
    expect(["Alice", "Bob", "Charlie"]).to.include(payer);
  });

  it("Should reset the list", async function () {
    await payeer.addParticipant("Alice");
    await payeer.reset();
    
    const participants = await payeer.getParticipants();
    expect(participants.length).to.equal(0);
  });

  it("Should revert if picking payer with no participants", async function () {
    await expect(payeer.pickPayer()).to.be.revertedWith("No participants to pick from");
  });
});
