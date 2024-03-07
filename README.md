# Staking Contract

## Overview
This project contains a smart contract for staking DEFI tokens to earn rewards. The contract is implemented in Solidity and utilizes features from the OpenZeppelin library for ERC20 token handling, pausing functionality, and ownership management.

## Smart Contract Details
The smart contract, `StakingContract.sol`, facilitates staking of DEFI tokens and rewards users with additional tokens based on their staked amount and duration. Key features include:
- Staking of DEFI tokens by users.
- Calculation of rewards based on the staked amount and duration.
- Pausing functionality to halt staking when necessary.
- Limits on the total yield that can be earned through staking.

## Dependencies
- Solidity v0.8.21
- OpenZeppelin Contracts v5.0.2
- Hardhat v2.21.0(for development and testing)

## Setup
To set up this project locally and interact with the smart contract, follow these steps:

1. Clone the repository to your local machine:

    ```bash
    git clone 
    ```

2. Navigate to the project directory:

    ```bash
    cd https://github.com/punit-j/simple-staking
    ```

3. Install dependencies:

    ```bash
    npm install
    ```

## Usage

### Running Tests
To run tests for the smart contract, use the following command:

```bash
npx hardhat test
```


### Compiling Contracts
To compile the smart contracts, use the following command:

```bash
npx hardhat compile
```


### Deploying Contracts
In `scripts/deploy.js` add address for DEFI tokens, limit of tokens for team segment, and team address that will approve the tokens.

Replace `YOUR_NETWORK` with the desired network configuration specified in `hardhat.config.js`.

To deploy the smart contracts to a network, modify the deployment script as necessary (located in `scripts/` directory) and then use the following command:

```bash
npx hardhat run scripts/deploy.js --network YOUR_NETWORK
```

*Note: Approve Staking contract for the token limit of DEFI tokens by the team address after deployment.

## Smart Contract Functions
The smart contract provides the following functions:

- `stake(address staker, uint amount)`: Allows a staker to stake tokens.
- `withdraw()`: Allows a staker to withdraw their staked tokens along with rewards.
- `pauseStaking()`: Pauses staking functionality, only callable by the contract owner.
- `calculateTotalReward(address staker)`: Calculates the total reward for a staker.

## Project Structure
- **contracts/**: Contains the Solidity smart contract file.
- **scripts/**: Contains deployment script.
- **test/**: Contains test scripts for the smart contract.
- **hardhat.config.js**: Configuration file for Hardhat.
- **README.md**: This file providing information about the project.
