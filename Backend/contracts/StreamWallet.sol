//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "hardhat/console.sol";

/**
 * @title StreamWallet
 * @notice A simple wallet contract representing an audio stream's on-chain identity
 * @dev Each stream gets its own deployed instance of this contract
 * Listener rewards and payments can be routed to this address
 */
contract StreamWallet {
    // State Variables
    address public immutable streamCreator; // The account that deployed this stream wallet
    string public streamId; // Unique identifier for the stream (e.g., "rhode-island-3344-abc123")
    string public streamName; // Human-readable name (e.g., "Providence Fire Dispatch")
    string public metadata; // JSON string with additional stream metadata
    uint256 public totalReceived; // Total ETH received by this stream wallet
    uint256 public createdAt; // Timestamp when this wallet was created

    // Events
    event FundsReceived(address indexed sender, uint256 amount, uint256 timestamp);
    event FundsWithdrawn(address indexed recipient, uint256 amount, uint256 timestamp);
    event MetadataUpdated(string newMetadata, uint256 timestamp);

    /**
     * @notice Constructor called when deploying a new stream wallet
     * @param _streamId Unique identifier for the stream
     * @param _streamName Human-readable name for the stream
     * @param _metadata JSON string with stream metadata
     */
    constructor(
        string memory _streamId,
        string memory _streamName,
        string memory _metadata
    ) {
        streamCreator = msg.sender;
        streamId = _streamId;
        streamName = _streamName;
        metadata = _metadata;
        createdAt = block.timestamp;

        console.log("StreamWallet created for:", _streamName);
        console.log("Creator:", msg.sender);
    }

    /**
     * @notice Allows the contract to receive ETH directly
     * @dev Emits FundsReceived event
     */
    receive() external payable {
        totalReceived += msg.value;
        emit FundsReceived(msg.sender, msg.value, block.timestamp);
        console.log("StreamWallet received", msg.value, "wei from", msg.sender);
    }

    /**
     * @notice Allows anyone to send ETH with a custom message
     * @dev Useful for tracking listener rewards with metadata
     */
    function deposit() external payable {
        require(msg.value > 0, "Must send ETH");
        totalReceived += msg.value;
        emit FundsReceived(msg.sender, msg.value, block.timestamp);
    }

    /**
     * @notice Allows the stream creator to withdraw all funds
     * @dev Only the creator who deployed this contract can withdraw
     */
    function withdraw() external {
        require(msg.sender == streamCreator, "Only stream creator can withdraw");
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");

        (bool success, ) = streamCreator.call{value: balance}("");
        require(success, "Withdrawal failed");

        emit FundsWithdrawn(streamCreator, balance, block.timestamp);
    }

    /**
     * @notice Allows the stream creator to withdraw a specific amount
     * @param amount The amount of wei to withdraw
     */
    function withdrawAmount(uint256 amount) external {
        require(msg.sender == streamCreator, "Only stream creator can withdraw");
        require(amount > 0, "Amount must be greater than 0");
        require(address(this).balance >= amount, "Insufficient balance");

        (bool success, ) = streamCreator.call{value: amount}("");
        require(success, "Withdrawal failed");

        emit FundsWithdrawn(streamCreator, amount, block.timestamp);
    }

    /**
     * @notice Allows the stream creator to update metadata
     * @param _newMetadata Updated JSON string with stream metadata
     */
    function updateMetadata(string memory _newMetadata) external {
        require(msg.sender == streamCreator, "Only stream creator can update metadata");
        metadata = _newMetadata;
        emit MetadataUpdated(_newMetadata, block.timestamp);
    }

    /**
     * @notice Get the current balance of this stream wallet
     * @return The balance in wei
     */
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @notice Get all stream information in one call
     * @return _streamId The stream identifier
     * @return _streamName The stream name
     * @return _metadata The stream metadata
     * @return _creator The address that created this wallet
     * @return _balance Current balance
     * @return _totalReceived Total ETH ever received
     * @return _createdAt Creation timestamp
     */
    function getStreamInfo()
        external
        view
        returns (
            string memory _streamId,
            string memory _streamName,
            string memory _metadata,
            address _creator,
            uint256 _balance,
            uint256 _totalReceived,
            uint256 _createdAt
        )
    {
        return (
            streamId,
            streamName,
            metadata,
            streamCreator,
            address(this).balance,
            totalReceived,
            createdAt
        );
    }
}
