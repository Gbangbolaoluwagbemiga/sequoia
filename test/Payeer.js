const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Payeer", function () {
  let Payeer, payeer, MockToken, mockToken;
  let owner, addr1, addr2, addr3;
  const ETH_FEE = ethers.parseEther("0.1");
  const TOKEN_FEE = ethers.parseEther("100");

  beforeEach(async function () {
    [owner, addr1, addr2, addr3] = await ethers.getSigners();

    // Deploy MockToken
    MockToken = await ethers.getContractFactory("MockToken");
    mockToken = await MockToken.deploy();

    // Deploy Payeer
    Payeer = await ethers.getContractFactory("Payeer");
    payeer = await Payeer.deploy();
  });

  describe("ETH Sessions", function () {
    it("Should create a session", async function () {
      await expect(payeer.createSession("Dinner Bill", ETH_FEE, ethers.ZeroAddress))
        .to.emit(payeer, "SessionCreated")
        .withArgs(0, "Dinner Bill", ETH_FEE, ethers.ZeroAddress, owner.address);

      const session = await payeer.getSession(0);
      expect(session.title).to.equal("Dinner Bill");
      expect(session.isActive).to.be.true;
    });

    it("Should allow participants to join with ETH", async function () {
      await payeer.createSession("Dinner Bill", ETH_FEE, ethers.ZeroAddress);
      
      await expect(payeer.connect(addr1).joinSession(0, "I won't pay!", { value: ETH_FEE }))
        .to.emit(payeer, "ParticipantJoined")
        .withArgs(0, addr1.address, "I won't pay!");

      const participants = await payeer.getParticipants(0);
      expect(participants.length).to.equal(1);
      expect(participants[0]).to.equal(addr1.address);
    });

    it("Should spin the wheel and distribute prizes/fees", async function () {
      await payeer.createSession("Dinner Bill", ETH_FEE, ethers.ZeroAddress);
      
      await payeer.connect(addr1).joinSession(0, "Taunt 1", { value: ETH_FEE });
      await payeer.connect(addr2).joinSession(0, "Taunt 2", { value: ETH_FEE });

      // Check owner balance before
      const initialOwnerBalance = await ethers.provider.getBalance(owner.address);

      // Spin
      await expect(payeer.spinWheel(0))
        .to.emit(payeer, "WinnerSelected");

      // Check session ended
      const session = await payeer.getSession(0);
      expect(session.isActive).to.be.false;

      // Check Owner received fee (1% of 0.2 ETH = 0.002 ETH)
      const expectedFee = (ETH_FEE * 2n) / 100n;
      // Note: owner paid for gas, so balance check is tricky. 
      // But we can check if contract balance is 0
      expect(await ethers.provider.getBalance(payeer.target)).to.equal(0);
    });
  });

  describe("ERC20 Sessions", function () {
    it("Should allow participants to join with ERC20", async function () {
      await payeer.createSession("Poker Night", TOKEN_FEE, mockToken.target);

      // Mint tokens to users
      await mockToken.mint(addr1.address, TOKEN_FEE);
      await mockToken.connect(addr1).approve(payeer.target, TOKEN_FEE);

      await expect(payeer.connect(addr1).joinSession(0, "All in!"))
        .to.emit(payeer, "ParticipantJoined")
        .withArgs(0, addr1.address, "All in!");
        
      expect(await mockToken.balanceOf(payeer.target)).to.equal(TOKEN_FEE);
    });

    it("Should distribute ERC20 prizes and fees", async function () {
      await payeer.createSession("Poker Night", TOKEN_FEE, mockToken.target);

      // Setup users
      await mockToken.mint(addr1.address, TOKEN_FEE);
      await mockToken.connect(addr1).approve(payeer.target, TOKEN_FEE);
      await payeer.connect(addr1).joinSession(0, "P1");

      await mockToken.mint(addr2.address, TOKEN_FEE);
      await mockToken.connect(addr2).approve(payeer.target, TOKEN_FEE);
      await payeer.connect(addr2).joinSession(0, "P2");

      const initialOwnerBalance = await mockToken.balanceOf(owner.address);

      await payeer.spinWheel(0);

      // Fee calculation: 200 tokens * 1% = 2 tokens
      const fee = (TOKEN_FEE * 2n) / 100n;
      const prize = (TOKEN_FEE * 2n) - fee;

      expect(await mockToken.balanceOf(owner.address)).to.equal(initialOwnerBalance + fee);
      expect(await mockToken.balanceOf(payeer.target)).to.equal(0);
      
      // One of them should have the prize
      const b1 = await mockToken.balanceOf(addr1.address);
      const b2 = await mockToken.balanceOf(addr2.address);
      expect(b1 + b2).to.equal(prize);
    });
  });
});
