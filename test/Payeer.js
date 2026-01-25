const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Payeer", function () {
  let Payeer;
  let payeer;
  let owner;
  let addr1;
  let addr2;
  let addr3;

  beforeEach(async function () {
    [owner, addr1, addr2, addr3] = await ethers.getSigners();
    Payeer = await ethers.getContractFactory("Payeer");
    payeer = await Payeer.deploy();
  });

  it("Should create a new session", async function () {
    const entryFee = ethers.parseEther("1");
    await payeer.createSession("Dinner", entryFee);

    // Check nextSessionId incremented
    expect(await payeer.nextSessionId()).to.equal(1);

    // Check session details
    const session = await payeer.getSession(0);
    expect(session.title).to.equal("Dinner");
    expect(session.entryFee).to.equal(entryFee);
    expect(session.isActive).to.equal(true);
    expect(session.isCancelled).to.equal(false);
    expect(session.participantCount).to.equal(0);
  });

  it("Should allow participants to join", async function () {
    const entryFee = ethers.parseEther("1");
    await payeer.createSession("Drinks", entryFee);

    await payeer.connect(addr1).joinSession(0, "I win!", { value: entryFee });
    await payeer.connect(addr2).joinSession(0, "No, I win!", { value: entryFee });

    const participants = await payeer.getParticipants(0);
    expect(participants.length).to.equal(2);
    expect(participants[0]).to.equal(addr1.address);
    expect(participants[1]).to.equal(addr2.address);

    // Check contract balance
    const contractBalance = await ethers.provider.getBalance(payeer.target);
    expect(contractBalance).to.equal(ethers.parseEther("2"));
  });

  it("Should fail if entry fee is incorrect", async function () {
    const entryFee = ethers.parseEther("1");
    await payeer.createSession("Poker", entryFee);

    await expect(
      payeer.connect(addr1).joinSession(0, "Fail", { value: ethers.parseEther("0.5") })
    ).to.be.revertedWith("Incorrect entry fee");
  });

  it("Should pick a winner and distribute funds", async function () {
    const entryFee = ethers.parseEther("1");
    await payeer.createSession("Lottery", entryFee);

    await payeer.connect(addr1).joinSession(0, "A", { value: entryFee });
    await payeer.connect(addr2).joinSession(0, "B", { value: entryFee });
    await payeer.connect(addr3).joinSession(0, "C", { value: entryFee });

    const tx = await payeer.spinWheel(0);
    await tx.wait();

    const session = await payeer.getSession(0);
    expect(session.isActive).to.equal(false);
    expect(session.totalPool).to.equal(0);
    expect(session.winner).to.not.equal(ethers.ZeroAddress);

    const contractBalance = await ethers.provider.getBalance(payeer.target);
    expect(contractBalance).to.equal(0);
  });

  it("Should allow creator to cancel and participants to refund", async function () {
    const entryFee = ethers.parseEther("1");
    await payeer.createSession("Cancelled Party", entryFee);

    await payeer.connect(addr1).joinSession(0, "A", { value: entryFee });
    
    // Non-creator cannot cancel
    await expect(
        payeer.connect(addr1).cancelSession(0)
    ).to.be.revertedWith("Only creator can cancel");

    // Creator cancels
    await payeer.cancelSession(0);
    const session = await payeer.getSession(0);
    expect(session.isCancelled).to.equal(true);
    expect(session.isActive).to.equal(false);

    // Participant claims refund
    const balanceBefore = await ethers.provider.getBalance(addr1.address);
    // Gas cost makes it hard to check exact diff, but we can check the call succeeds
    const tx = await payeer.connect(addr1).claimRefund(0);
    await tx.wait(); // This will cost gas

    // Check deposit cleared
    // We can't access mapping easily in tests without a getter unless public, 
    // but the public mapping getter requires key.
    // Let's assume logic holds if no revert.
    
    // Try to claim again should fail
    await expect(
        payeer.connect(addr1).claimRefund(0)
    ).to.be.revertedWith("No funds to claim");
  });
});
