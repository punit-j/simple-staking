const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Staking Contract", function () {
  let stakingContract, testToken, owner, invester1, invester2, supplyAmountInvester, supplyAmountTeam ,team;
  describe("Deployment", function () {
    it("should deploy Staking Contract", async function () {
      const stakingContractFactory = await ethers.getContractFactory("StakingContract");
      const testTokenFactory = await ethers.getContractFactory("TestToken");


      [owner, invester1, invester2, team] = await ethers.getSigners();
      supplyAmountInvester = ethers.parseEther("10");
      supplyAmountTeam = ethers.parseEther("100");

      testToken = await testTokenFactory.deploy();

      await testToken.mint(invester1.address, supplyAmountInvester);
      await testToken.mint(invester2.address, supplyAmountInvester);
      await testToken.mint(invester2.address, supplyAmountTeam);

      stakingContract = await stakingContractFactory.deploy(supplyAmountTeam, await testToken.getAddress(), team.address);

      await testToken.connect(team).approve(stakingContract.getAddress(), supplyAmountTeam);
    });
  });
  describe("Stake", function () {
    beforeEach(async function () {
      const stakingContractFactory = await ethers.getContractFactory("StakingContract");
      const testTokenFactory = await ethers.getContractFactory("TestToken");

      [owner, invester1, invester2, team] = await ethers.getSigners();
      supplyAmountInvester = ethers.parseEther("10");
      supplyAmountTeam = ethers.parseEther("100");

      testToken = await testTokenFactory.deploy();

      await testToken.mint(invester1.address, supplyAmountInvester);
      await testToken.mint(invester2.address, supplyAmountInvester);
      await testToken.mint(team.address, supplyAmountTeam);

      stakingContract = await stakingContractFactory.deploy(supplyAmountTeam, await testToken.getAddress(), team.address);

      await testToken.connect(team).approve(stakingContract.getAddress(), supplyAmountTeam);
    });

    it("should stake tokens", async function () {
      await testToken.connect(invester1).approve(stakingContract.getAddress(), supplyAmountInvester);
      await stakingContract.connect(invester1).stake(invester1.address, supplyAmountInvester);
    });

    it("should be able to stake multiple times", async function () {
      supplyAmountInvester = ethers.parseEther("1");
      await testToken.connect(invester1).approve(stakingContract.getAddress(), supplyAmountInvester);
      await stakingContract.connect(invester1).stake(invester1.address, supplyAmountInvester);

      expect((await stakingContract.stakings(invester1.address)).stakedAmount).to.equals(supplyAmountInvester);

      await testToken.connect(invester1).approve(stakingContract.getAddress(), supplyAmountInvester);
      await stakingContract.connect(invester1).stake(invester1.address, supplyAmountInvester);

      expect((await stakingContract.stakings(invester1.address)).stakedAmount).to.equals(ethers.parseEther("2"));

      await testToken.connect(invester1).approve(stakingContract.getAddress(), supplyAmountInvester);
      await stakingContract.connect(invester1).stake(invester1.address, supplyAmountInvester);

      expect((await stakingContract.stakings(invester1.address)).stakedAmount).to.equals(ethers.parseEther("3"));
    });
  });
  describe("Withdraw", function () {
    beforeEach(async function () {
      const stakingContractFactory = await ethers.getContractFactory("StakingContract");
      const testTokenFactory = await ethers.getContractFactory("TestToken");

      [owner, invester1, invester2, team] = await ethers.getSigners();
      supplyAmountInvester = ethers.parseEther("10");
      supplyAmountTeam = ethers.parseEther("100");

      testToken = await testTokenFactory.deploy();

      await testToken.mint(invester1.address, supplyAmountInvester);
      await testToken.mint(invester2.address, supplyAmountInvester);
      await testToken.mint(team.address, supplyAmountTeam);

      stakingContract = await stakingContractFactory.deploy(supplyAmountTeam, await testToken.getAddress(), team.address);

      await testToken.connect(team).approve(stakingContract.getAddress(), supplyAmountTeam);
    });

    it("should be able to stake multiple times and withdraw", async function () {
      supplyAmountInvester = ethers.parseEther("1");
      await testToken.connect(invester1).approve(stakingContract.getAddress(), supplyAmountInvester);
      await stakingContract.connect(invester1).stake(invester1.address, supplyAmountInvester);

      expect((await stakingContract.stakings(invester1.address)).stakedAmount).to.equals(supplyAmountInvester);

      await testToken.connect(invester1).approve(stakingContract.getAddress(), supplyAmountInvester);
      await stakingContract.connect(invester1).stake(invester1.address, supplyAmountInvester);

      expect((await stakingContract.stakings(invester1.address)).stakedAmount).to.equals(ethers.parseEther("2"));

      await testToken.connect(invester1).approve(stakingContract.getAddress(), supplyAmountInvester);
      await stakingContract.connect(invester1).stake(invester1.address, supplyAmountInvester);

      expect((await stakingContract.stakings(invester1.address)).stakedAmount).to.equals(ethers.parseEther("3"));

      expect(await stakingContract.connect(invester1).withdraw()).to.emit(testToken, 'transfer');
    });
  });
  describe("Pause", function () {
    beforeEach(async function () {
      const stakingContractFactory = await ethers.getContractFactory("StakingContract");
      const testTokenFactory = await ethers.getContractFactory("TestToken");

      [owner, invester1, invester2, team] = await ethers.getSigners();
      supplyAmountInvester = ethers.parseEther("10");
      supplyAmountTeam = ethers.parseEther("100");

      testToken = await testTokenFactory.deploy();

      await testToken.mint(invester1.address, supplyAmountInvester);
      await testToken.mint(invester2.address, supplyAmountInvester);
      await testToken.mint(team.address, supplyAmountTeam);

      stakingContract = await stakingContractFactory.deploy(supplyAmountTeam, await testToken.getAddress(), team.address);

      await testToken.connect(team).approve(stakingContract.getAddress(), supplyAmountTeam);
    });

    it("should be able to pause contract", async function () {
      await stakingContract.pauseStaking();
      expect(await stakingContract.paused()).to.equals(true);
    });

    it("should be able to withdraw funds after pausing", async function () {
      supplyAmountInvester = ethers.parseEther("1");
      await testToken.connect(invester1).approve(stakingContract.getAddress(), supplyAmountInvester);
      await stakingContract.connect(invester1).stake(invester1.address, supplyAmountInvester);
      
      await stakingContract.pauseStaking();

      expect(await stakingContract.connect(invester1).withdraw()).to.emit(testToken, 'transfer');
    });
  });
});
