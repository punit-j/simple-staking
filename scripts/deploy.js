const hre = require("hardhat");

async function main() {
  const DEFI_ADDRESS = "";// address of DEFI token
  const TEAM_SEGMENT = 0; // total tokens that can be given in rewards
  const TEAM_ADDRESS = "";// address of team that will approve tokens for yield

  const stakingContractFactory = await ethers.getContractFactory("StakingContract");
  const stakingContract = await stakingContractFactory.deploy(TEAM_SEGMENT, DEFI_ADDRESS, TEAM_ADDRESS);

  console.log('Staking Contract: ', stakingContract.getAddress());
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
