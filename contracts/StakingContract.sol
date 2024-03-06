//SPDX-License-Identifier: MIT
pragma solidity 0.8.21;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title StakingContract
 * @dev A contract for staking DEFI tokens for rewards.
 */
contract StakingContract is Pausable, Ownable {
    /**
     * @dev Total tokens assigned to team segment that will be deducted
     */
    uint256 immutable yieldLimit;
    /**
     * @dev Team address that tokens will be deducted from
     */
    address immutable team;
    /**
     * @dev The ERC20 token being staked
     */
    IERC20 immutable token;
    /**
     * @dev Final block for pausing staking
     */
    uint256 finalBlock;
    // everyday rewardRatio = 1 token per 1000 staked tokens, So for 1 token reward = 0.001 token
    // number of blocks produced in a day = 24 * 60 * 60 / 6(block time in shardeum) = 14400
    // hence rewardPerBlock for 1 token = 0.001 / 14400 = 6.94e-8
    uint256 constant RATE = 694;
    /**
     * @dev Precision for reward calculation
     */
    uint256 constant PRECISION = 1e10;
    /**
     * @dev Total yield earned
     */
    uint256 yieldEarned;

    /**
     * @dev Staking data for each staker
     */
    struct StakingData {
        uint256 blockNumber;
        uint256 stakedAmount;
        uint256 rewardEarned;
    }

    /**
     * @dev Mapping of staker address to their staking data
     */
    mapping(address => StakingData) public stakings;

    /**
     * @dev Event emitted when a staker stakes tokens
     */
    event Staked(address indexed staker, uint256 amount);
    /**
     * @dev Event emitted when a staker withdraws tokens
     */
    event Withdrawn(
        address indexed staker,
        uint256 stakedAmount,
        uint256 reward
    );

    // Errors
    error InvalidStaker();
    error InvalidAmount();
    error YieldLimitExceeded();

    /**
     * @dev Constructor to initialize the StakingContract
     * @param yieldLimit_ The maximum yield allowed
     * @param token_ The ERC20 token contract address
     */
    constructor(
        uint256 yieldLimit_,
        address token_,
        address team_
    ) Ownable(msg.sender) {
        yieldLimit = yieldLimit_;
        token = IERC20(token_);
        team = team_;
    }

    /**
     * @dev Function to allow a staker to stake tokens
     * @param staker The address of the staker
     * @param amount The amount of tokens to stake
     */
    function stake(address staker, uint amount) external whenNotPaused {
        if (staker == address(0)) {
            revert InvalidStaker();
        }

        if (amount == 0) {
            revert InvalidAmount();
        }

        token.transferFrom(msg.sender, address(this), amount);

        StakingData memory staking = stakings[staker];

        if (staking.blockNumber == 0) {
            stakings[staker] = StakingData(block.number, amount, 0);
        } else {
            uint256 reward = _calculateReward(
                staking.blockNumber,
                staking.stakedAmount
            );

            if (yieldEarned + reward >= yieldLimit) {
                revert YieldLimitExceeded();
            } else {
                yieldEarned = yieldEarned + reward;
            }

            stakings[staker] = StakingData(
                block.number,
                staking.stakedAmount + amount,
                staking.rewardEarned + reward
            );
        }

        emit Staked(staker, amount);
    }

    /**
     * @dev Function to allow a staker to withdraw their staked tokens along with rewards
     */
    function withdraw() external {
        address staker = msg.sender;

        StakingData memory staking = stakings[staker];

        uint256 reward = _calculateReward(
            staking.blockNumber,
            staking.stakedAmount
        );

        if (yieldEarned + reward >= yieldLimit) {
            reward = yieldLimit - yieldEarned;
            yieldEarned = yieldLimit;
        } else {
            yieldEarned = yieldEarned + reward;
        }

        uint256 rewardAmountToSend = reward + staking.rewardEarned;

        delete stakings[staker];
        token.transfer(staker, staking.stakedAmount);
        token.transferFrom(team, staker, rewardAmountToSend);

        emit Withdrawn(staker, staking.stakedAmount, rewardAmountToSend);
    }

    /**
     * @dev Function to pause staking, only callable by owner
     */
    function pauseStaking() external onlyOwner {
        _pause();
        finalBlock = block.number;
    }

    /**
     * @dev Function to calculate reward for a staker after the last stake
     * @param rewardBlockNumber The block number at which the last staker staked last
     * @param stakedAmount The amount of tokens staked
     * @return reward The calculated reward after last stake
     */
    function _calculateReward(
        uint256 rewardBlockNumber,
        uint256 stakedAmount
    ) internal view returns (uint256 reward) {
        uint256 blockNumber = finalBlock == 0 ? block.number : finalBlock;

        reward =
            ((blockNumber - rewardBlockNumber) * stakedAmount * RATE) /
            PRECISION;
    }

    /**
     * @dev Function to calculate total reward for a staker (including already earned rewards)
     * @param staker The address of the staker
     * @return reward The total calculated reward
     */
    function calculateTotalReward(
        address staker
    ) public view returns (uint256 reward) {
        StakingData memory staking = stakings[staker];
        reward = _calculateReward(staking.blockNumber, staking.stakedAmount);

        if (yieldEarned + reward >= yieldLimit) {
            reward = yieldLimit - yieldEarned;
        }

        reward = staking.rewardEarned + reward;
    }
}
