/**
 * StreamRegistry Contract Integration
 * Verifies stream wallet addresses against on-chain source of truth
 */

const { ethers } = require('ethers');
const fs = require('fs').promises;
const path = require('path');

// Contract ABI (only the functions we need)
const STREAM_REGISTRY_ABI = [
  "function computeStreamId(string systemId, uint256 talkgroupId, string callId) public pure returns (bytes32)",
  "function getWallet(bytes32 streamId) external view returns (address)",
  "function streamWallet(bytes32) external view returns (address)",
  "function isStreamActive(bytes32 streamId) external view returns (bool)",
  "function getStreamInfo(bytes32 streamId) external view returns (tuple(address wallet, string systemId, uint256 talkgroupId, string callId, uint256 registeredAt, bool active))",
  "function getStreamCount() external view returns (uint256)"
];

class StreamRegistryClient {
  constructor(contractAddress, providerUrl) {
    this.contractAddress = contractAddress;
    this.provider = new ethers.JsonRpcProvider(providerUrl);
    this.contract = new ethers.Contract(contractAddress, STREAM_REGISTRY_ABI, this.provider);
  }

  /**
   * Compute stream ID hash (same algorithm as contract)
   * @param {string} systemId - System identifier (e.g., "rhode-island")
   * @param {number} talkgroupId - Talkgroup number
   * @param {string} callId - Call identifier
   * @returns {Promise<string>} Stream ID hash
   */
  async computeStreamId(systemId, talkgroupId, callId) {
    return await this.contract.computeStreamId(systemId, talkgroupId, callId);
  }

  /**
   * Get canonical wallet address from contract (SOURCE OF TRUTH)
   * @param {string} streamId - Stream ID hash
   * @returns {Promise<string>} Wallet address
   */
  async getWallet(streamId) {
    return await this.contract.getWallet(streamId);
  }

  /**
   * Check if stream is active
   * @param {string} streamId - Stream ID hash
   * @returns {Promise<boolean>} True if active
   */
  async isStreamActive(streamId) {
    return await this.contract.isStreamActive(streamId);
  }

  /**
   * Get full stream info from contract
   * @param {string} streamId - Stream ID hash
   * @returns {Promise<object>} Stream info
   */
  async getStreamInfo(streamId) {
    const info = await this.contract.getStreamInfo(streamId);
    return {
      wallet: info.wallet,
      systemId: info.systemId,
      talkgroupId: info.talkgroupId.toString(),
      callId: info.callId,
      registeredAt: info.registeredAt.toString(),
      active: info.active
    };
  }

  /**
   * Get total number of registered streams
   * @returns {Promise<number>} Total count
   */
  async getStreamCount() {
    const count = await this.contract.getStreamCount();
    return Number(count);
  }

  /**
   * Verify wallet address for a stream
   * @param {object} stream - Stream object from JSON
   * @returns {Promise<object>} Verification result
   */
  async verifyStreamWallet(stream) {
    try {
      // Extract stream components
      const systemId = stream.system_name || 'local-test';
      const talkgroupId = stream.talkgroup_id || 0;
      const callId = stream.metadata?.call_id || stream.stream_id;

      // Compute stream ID
      const streamId = await this.computeStreamId(systemId, talkgroupId, callId);

      // Get canonical wallet from contract
      const contractWallet = await this.getWallet(streamId);

      // Check if stream is active
      const isActive = await this.isStreamActive(streamId);

      // Compare with JSON wallet
      const jsonWallet = stream.wallet?.address || ethers.ZeroAddress;

      return {
        streamId: stream.stream_id,
        streamHash: streamId,
        jsonWallet,
        contractWallet,
        isActive,
        verified: contractWallet !== ethers.ZeroAddress,
        match: contractWallet.toLowerCase() === jsonWallet.toLowerCase(),
        shouldUse: contractWallet // ALWAYS use contract wallet
      };
    } catch (error) {
      return {
        streamId: stream.stream_id,
        error: error.message,
        verified: false
      };
    }
  }

  /**
   * Load streams.json and verify all wallet addresses
   * @param {string} streamsJsonPath - Path to streams.json
   * @returns {Promise<object>} Verification results
   */
  async verifyAllStreams(streamsJsonPath) {
    const data = JSON.parse(await fs.readFile(streamsJsonPath, 'utf-8'));

    const results = {
      verified: [],
      unverified: [],
      mismatches: [],
      errors: []
    };

    for (const [systemKey, systemData] of Object.entries(data)) {
      if (systemKey === 'last_updated') continue;

      if (systemData.streams && Array.isArray(systemData.streams)) {
        for (const stream of systemData.streams) {
          const result = await this.verifyStreamWallet(stream);

          if (result.error) {
            results.errors.push(result);
          } else if (!result.verified) {
            results.unverified.push(result);
          } else if (!result.match) {
            results.mismatches.push(result);
          } else {
            results.verified.push(result);
          }
        }
      }
    }

    return results;
  }

  /**
   * Enrich stream with canonical wallet from contract
   * @param {object} stream - Stream object from JSON
   * @returns {Promise<object>} Enriched stream object
   */
  async enrichStreamWithContractData(stream) {
    const verification = await this.verifyStreamWallet(stream);

    // Return stream with canonical wallet from contract
    return {
      ...stream,
      wallet: {
        ...stream.wallet,
        address: verification.shouldUse || stream.wallet?.address,
        verified: verification.verified,
        source: verification.verified ? 'contract' : 'json',
        contractWallet: verification.contractWallet,
        jsonWallet: verification.jsonWallet,
        match: verification.match
      }
    };
  }
}

/**
 * Create StreamRegistry client from environment variables
 * @returns {StreamRegistryClient|null} Client instance or null if not configured
 */
function createRegistryClient() {
  const contractAddress = process.env.STREAM_REGISTRY_CONTRACT;
  const providerUrl = process.env.ETH_RPC_URL || 'http://localhost:8545';

  if (!contractAddress) {
    console.warn('⚠️  STREAM_REGISTRY_CONTRACT not set - wallet verification disabled');
    return null;
  }

  try {
    return new StreamRegistryClient(contractAddress, providerUrl);
  } catch (error) {
    console.error('❌ Failed to create StreamRegistry client:', error.message);
    return null;
  }
}

module.exports = {
  StreamRegistryClient,
  createRegistryClient,
  STREAM_REGISTRY_ABI
};
