// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title StreamRegistry
 * @notice Decentralized registry for Argus Defense radio streams
 * @dev Maps stream IDs to wallet addresses on-chain as source of truth
 *
 * Stream ID Format: keccak256(abi.encodePacked(systemId, talkgroupId, callId))
 *
 * This contract is the ONLY source of truth for stream ownership.
 * Off-chain JSON files and APIs must verify wallet addresses through this contract.
 */
contract StreamRegistry is AccessControl, ReentrancyGuard {
    // Role definitions
    bytes32 public constant REGISTRAR_ROLE = keccak256("REGISTRAR_ROLE");
    bytes32 public constant DAO_ROLE = keccak256("DAO_ROLE");

    // Stream metadata structure
    struct StreamInfo {
        address wallet;           // Wallet that receives payments for this stream
        string systemId;          // e.g., "rhode-island"
        uint256 talkgroupId;      // e.g., 3344
        string callId;            // e.g., "abc123def456"
        uint256 registeredAt;     // Timestamp when registered
        bool active;              // Stream active status
    }

    // Mappings
    mapping(bytes32 => StreamInfo) public streams;
    mapping(bytes32 => address) public streamWallet; // Simplified lookup

    // Track all registered stream IDs
    bytes32[] public streamIds;

    // Events
    event StreamRegistered(
        bytes32 indexed streamId,
        address indexed wallet,
        string systemId,
        uint256 talkgroupId,
        string callId
    );

    event StreamWalletUpdated(
        bytes32 indexed streamId,
        address indexed oldWallet,
        address indexed newWallet
    );

    event StreamDeactivated(bytes32 indexed streamId);
    event StreamReactivated(bytes32 indexed streamId);

    constructor() {
        // Grant admin role to contract deployer
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);

        // Grant DAO role to deployer initially (can be transferred later)
        _grantRole(DAO_ROLE, msg.sender);

        // Grant registrar role to deployer initially
        _grantRole(REGISTRAR_ROLE, msg.sender);
    }

    /**
     * @notice Compute stream ID hash
     * @dev Same algorithm used off-chain to ensure consistency
     * @param systemId System identifier (e.g., "rhode-island")
     * @param talkgroupId Talkgroup number (e.g., 3344)
     * @param callId Call identifier (e.g., "abc123def456")
     * @return Stream ID hash
     */
    function computeStreamId(
        string memory systemId,
        uint256 talkgroupId,
        string memory callId
    ) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(systemId, talkgroupId, callId));
    }

    /**
     * @notice Register a new stream (DAO only)
     * @dev Only addresses with DAO_ROLE can register streams
     * @param systemId System identifier
     * @param talkgroupId Talkgroup number
     * @param callId Call identifier
     * @param wallet Wallet address to receive payments
     */
    function registerStream(
        string memory systemId,
        uint256 talkgroupId,
        string memory callId,
        address wallet
    ) external onlyRole(DAO_ROLE) nonReentrant {
        require(wallet != address(0), "Invalid wallet address");
        require(bytes(systemId).length > 0, "System ID required");
        require(bytes(callId).length > 0, "Call ID required");

        bytes32 streamId = computeStreamId(systemId, talkgroupId, callId);
        require(streams[streamId].wallet == address(0), "Stream already registered");

        // Create stream info
        streams[streamId] = StreamInfo({
            wallet: wallet,
            systemId: systemId,
            talkgroupId: talkgroupId,
            callId: callId,
            registeredAt: block.timestamp,
            active: true
        });

        // Add to simplified mapping
        streamWallet[streamId] = wallet;

        // Add to list
        streamIds.push(streamId);

        emit StreamRegistered(streamId, wallet, systemId, talkgroupId, callId);
    }

    /**
     * @notice Batch register multiple streams
     * @dev More efficient for registering many streams at once
     */
    function registerStreamBatch(
        string[] memory systemIds,
        uint256[] memory talkgroupIds,
        string[] memory callIds,
        address[] memory wallets
    ) external onlyRole(DAO_ROLE) nonReentrant {
        require(
            systemIds.length == talkgroupIds.length &&
            talkgroupIds.length == callIds.length &&
            callIds.length == wallets.length,
            "Array length mismatch"
        );

        for (uint256 i = 0; i < systemIds.length; i++) {
            bytes32 streamId = computeStreamId(systemIds[i], talkgroupIds[i], callIds[i]);

            // Skip if already registered
            if (streams[streamId].wallet != address(0)) continue;

            streams[streamId] = StreamInfo({
                wallet: wallets[i],
                systemId: systemIds[i],
                talkgroupId: talkgroupIds[i],
                callId: callIds[i],
                registeredAt: block.timestamp,
                active: true
            });

            streamWallet[streamId] = wallets[i];
            streamIds.push(streamId);

            emit StreamRegistered(streamId, wallets[i], systemIds[i], talkgroupIds[i], callIds[i]);
        }
    }

    /**
     * @notice Update wallet address for a stream (DAO only)
     * @param streamId Stream identifier
     * @param newWallet New wallet address
     */
    function updateStreamWallet(
        bytes32 streamId,
        address newWallet
    ) external onlyRole(DAO_ROLE) nonReentrant {
        require(streams[streamId].wallet != address(0), "Stream not registered");
        require(newWallet != address(0), "Invalid wallet address");

        address oldWallet = streams[streamId].wallet;
        streams[streamId].wallet = newWallet;
        streamWallet[streamId] = newWallet;

        emit StreamWalletUpdated(streamId, oldWallet, newWallet);
    }

    /**
     * @notice Deactivate a stream (DAO only)
     * @param streamId Stream identifier
     */
    function deactivateStream(bytes32 streamId) external onlyRole(DAO_ROLE) {
        require(streams[streamId].wallet != address(0), "Stream not registered");
        require(streams[streamId].active, "Stream already inactive");

        streams[streamId].active = false;

        emit StreamDeactivated(streamId);
    }

    /**
     * @notice Reactivate a stream (DAO only)
     * @param streamId Stream identifier
     */
    function reactivateStream(bytes32 streamId) external onlyRole(DAO_ROLE) {
        require(streams[streamId].wallet != address(0), "Stream not registered");
        require(!streams[streamId].active, "Stream already active");

        streams[streamId].active = true;

        emit StreamReactivated(streamId);
    }

    /**
     * @notice Get wallet address for a stream (public view)
     * @dev This is the canonical source of truth for stream ownership
     * @param streamId Stream identifier
     * @return Wallet address (address(0) if not registered)
     */
    function getWallet(bytes32 streamId) external view returns (address) {
        return streamWallet[streamId];
    }

    /**
     * @notice Get full stream information
     * @param streamId Stream identifier
     * @return StreamInfo struct
     */
    function getStreamInfo(bytes32 streamId) external view returns (StreamInfo memory) {
        return streams[streamId];
    }

    /**
     * @notice Check if stream is registered and active
     * @param streamId Stream identifier
     * @return True if registered and active
     */
    function isStreamActive(bytes32 streamId) external view returns (bool) {
        return streams[streamId].wallet != address(0) && streams[streamId].active;
    }

    /**
     * @notice Get total number of registered streams
     * @return Total count
     */
    function getStreamCount() external view returns (uint256) {
        return streamIds.length;
    }

    /**
     * @notice Get all stream IDs (paginated)
     * @param offset Starting index
     * @param limit Maximum number of results
     * @return Array of stream IDs
     */
    function getStreamIds(uint256 offset, uint256 limit)
        external
        view
        returns (bytes32[] memory)
    {
        require(offset < streamIds.length, "Offset out of bounds");

        uint256 end = offset + limit;
        if (end > streamIds.length) {
            end = streamIds.length;
        }

        uint256 resultLength = end - offset;
        bytes32[] memory result = new bytes32[](resultLength);

        for (uint256 i = 0; i < resultLength; i++) {
            result[i] = streamIds[offset + i];
        }

        return result;
    }

    /**
     * @notice Grant registrar role to address (admin only)
     * @param account Address to grant role
     */
    function grantRegistrarRole(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(REGISTRAR_ROLE, account);
    }

    /**
     * @notice Grant DAO role to address (admin only)
     * @param account Address to grant role
     */
    function grantDAORole(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(DAO_ROLE, account);
    }
}
