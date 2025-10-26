// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./StreamRegistry.sol";
import "./StreamWalletV2.sol";

/**
 * @title StreamFactory
 * @notice One-stop shop for registering streams with wallets
 * @dev Automates: Register stream → Deploy wallet → Link together
 */
contract StreamFactory {
    StreamRegistry public registry;
    address public daoTreasury;

    event StreamCreated(
        bytes32 indexed streamId,
        address indexed publisher,
        address wallet,
        string systemId,
        uint256 talkgroupId,
        string callId
    );

    constructor(address _registry, address _daoTreasury) {
        registry = StreamRegistry(_registry);
        daoTreasury = _daoTreasury;
    }

    /**
     * @notice Create stream with wallet in one transaction
     * @dev Publisher must have DAO_ROLE in StreamRegistry
     */
    function createStream(
        string memory systemId,
        uint256 talkgroupId,
        string memory callId
    ) public returns (bytes32 streamId, address wallet) {
        // Compute stream ID
        streamId = registry.computeStreamId(systemId, talkgroupId, callId);

        // Deploy StreamWallet
        StreamWalletV2 streamWallet = new StreamWalletV2(
            streamId,
            msg.sender,  // Publisher
            daoTreasury
        );
        wallet = address(streamWallet);

        // Register stream with wallet address
        registry.registerStream(systemId, talkgroupId, callId, wallet);

        emit StreamCreated(streamId, msg.sender, wallet, systemId, talkgroupId, callId);

        return (streamId, wallet);
    }

    /**
     * @notice Batch create multiple streams
     */
    function createStreamBatch(
        string[] memory systemIds,
        uint256[] memory talkgroupIds,
        string[] memory callIds
    ) external returns (bytes32[] memory streamIds, address[] memory wallets) {
        require(systemIds.length == talkgroupIds.length, "Length mismatch");
        require(talkgroupIds.length == callIds.length, "Length mismatch");

        streamIds = new bytes32[](systemIds.length);
        wallets = new address[](systemIds.length);

        for (uint256 i = 0; i < systemIds.length; i++) {
            (streamIds[i], wallets[i]) = createStream(
                systemIds[i],
                talkgroupIds[i],
                callIds[i]
            );
        }

        return (streamIds, wallets);
    }
}
