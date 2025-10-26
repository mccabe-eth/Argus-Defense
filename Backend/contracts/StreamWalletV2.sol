// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title StreamWalletV2
 * @notice Self-paying wallet for radio streams with incentive distribution
 */
contract StreamWalletV2 is Ownable, ReentrancyGuard {
    bytes32 public streamId;
    address public publisher;
    address public daoTreasury;

    // Revenue split (basis points: 10000 = 100%)
    uint256 public publisherShare = 6000;  // 60%
    uint256 public bandwidthShare = 3000;  // 30%
    uint256 public daoShare = 1000;        // 10%

    // Metrics
    uint256 public totalEarnings;
    uint256 public totalListeners;
    uint256 public totalMinutes;

    // Bandwidth providers
    mapping(address => uint256) public bandwidthContributions;
    address[] public bandwidthProviders;

    // Listener tracking
    mapping(address => uint256) public listenerMinutes;
    mapping(address => bool) public hasListened;

    event PaymentReceived(address indexed listener, uint256 amount, uint256 minutesListened);
    event RevenueDistributed(uint256 toPublisher, uint256 toBandwidth, uint256 toDAO);
    event BandwidthRecorded(address indexed provider, uint256 bytes_);

    constructor(
        bytes32 _streamId,
        address _publisher,
        address _daoTreasury
    ) Ownable(msg.sender) {
        streamId = _streamId;
        publisher = _publisher;
        daoTreasury = _daoTreasury;
    }

    /**
     * @notice Pay for stream listening (called by listeners)
     */
    function payForListening(uint256 minutesListened) external payable nonReentrant {
        require(msg.value > 0, "Payment required");
        require(minutesListened > 0, "Minutes > 0");

        if (!hasListened[msg.sender]) {
            hasListened[msg.sender] = true;
            totalListeners++;
        }

        listenerMinutes[msg.sender] += minutesListened;
        totalMinutes += minutesListened;
        totalEarnings += msg.value;

        emit PaymentReceived(msg.sender, msg.value, minutesListened);
        _distributeRevenue(msg.value);
    }

    /**
     * @notice Record bandwidth contribution (called by backend nodes)
     */
    function recordBandwidth(address provider, uint256 bytes_) external onlyOwner {
        if (bandwidthContributions[provider] == 0) {
            bandwidthProviders.push(provider);
        }
        bandwidthContributions[provider] += bytes_;
        emit BandwidthRecorded(provider, bytes_);
    }

    /**
     * @notice Distribute revenue immediately
     */
    function _distributeRevenue(uint256 amount) internal {
        uint256 toPublisher = (amount * publisherShare) / 10000;
        uint256 toBandwidth = (amount * bandwidthShare) / 10000;
        uint256 toDAO = (amount * daoShare) / 10000;

        // Send to publisher
        (bool sentPub,) = publisher.call{value: toPublisher}("");
        require(sentPub, "Publisher payment failed");

        // Send to DAO
        (bool sentDAO,) = daoTreasury.call{value: toDAO}("");
        require(sentDAO, "DAO payment failed");

        // Distribute bandwidth share proportionally
        if (bandwidthProviders.length > 0) {
            uint256 totalBandwidth = 0;
            for (uint256 i = 0; i < bandwidthProviders.length; i++) {
                totalBandwidth += bandwidthContributions[bandwidthProviders[i]];
            }

            if (totalBandwidth > 0) {
                for (uint256 i = 0; i < bandwidthProviders.length; i++) {
                    address provider = bandwidthProviders[i];
                    uint256 share = (toBandwidth * bandwidthContributions[provider]) / totalBandwidth;
                    (bool sent,) = provider.call{value: share}("");
                    require(sent, "Bandwidth payment failed");
                }
            }
        }

        emit RevenueDistributed(toPublisher, toBandwidth, toDAO);
    }

    /**
     * @notice Get stream metrics
     */
    function getMetrics() external view returns (uint256, uint256, uint256, uint256) {
        return (totalEarnings, totalListeners, totalMinutes, bandwidthProviders.length);
    }

    /**
     * @notice Price per minute (0.0001 ETH ~= $0.20/hr at $2000 ETH)
     */
    function getPricePerMinute() public pure returns (uint256) {
        return 0.0001 ether;
    }

    receive() external payable {
        totalEarnings += msg.value;
    }
}
