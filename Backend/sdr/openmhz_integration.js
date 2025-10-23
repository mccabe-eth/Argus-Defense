/**
 * OpenMHz Integration Module for Stream Server
 * Provides API endpoints and utilities for ingesting OpenMHz radio streams
 */

const { spawn } = require('child_process');
const path = require('path');

class OpenMHZIntegration {
  constructor() {
    this.pythonScript = path.join(__dirname, 'ingest_openmhz.py');
    this.activeStreams = new Map();
  }

  /**
   * Ingest a system and get stream profiles
   * @param {string} systemId - The OpenMHz system ID (e.g., 'rhode-island')
   * @param {Object} options - Ingestion options
   * @param {Array<number>} options.talkgroupIds - Optional talkgroup IDs to filter
   * @param {string} options.groupId - Optional group ID to filter
   * @returns {Promise<Object>} System profile with available streams
   */
  async ingestSystem(systemId, options = {}) {
    return new Promise((resolve, reject) => {
      const args = ['--system', systemId, '--format', 'json'];

      // Add optional filters
      if (options.talkgroupIds && options.talkgroupIds.length > 0) {
        args.push('--talkgroups', options.talkgroupIds.join(','));
      }
      if (options.groupId) {
        args.push('--group', options.groupId);
      }

      // Spawn Python process
      const process = spawn('python3', [this.pythonScript, ...args]);

      let stdout = '';
      let stderr = '';

      process.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      process.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Ingestion failed: ${stderr}`));
          return;
        }

        try {
          const profile = JSON.parse(stdout);
          resolve(profile);
        } catch (error) {
          reject(new Error(`Failed to parse output: ${error.message}`));
        }
      });

      process.on('error', (error) => {
        reject(new Error(`Failed to start ingestion: ${error.message}`));
      });
    });
  }

  /**
   * Get available streams for a system
   * @param {string} systemId - The OpenMHz system ID
   * @returns {Promise<Array>} List of available stream profiles
   */
  async getAvailableStreams(systemId) {
    const profile = await this.ingestSystem(systemId);
    return profile.streams;
  }

  /**
   * Get a specific stream by ID
   * @param {string} systemId - The OpenMHz system ID
   * @param {string} streamId - The stream ID
   * @returns {Promise<Object|null>} Stream profile or null if not found
   */
  async getStream(systemId, streamId) {
    const streams = await this.getAvailableStreams(systemId);
    return streams.find(s => s.stream_id === streamId) || null;
  }

  /**
   * Get talkgroups for a system
   * @param {string} systemId - The OpenMHz system ID
   * @returns {Promise<Array>} List of talkgroups
   */
  async getTalkgroups(systemId) {
    const profile = await this.ingestSystem(systemId);
    return profile.talkgroups;
  }

  /**
   * Stream audio from OpenMHz to WebSocket clients
   * @param {string} audioUrl - The audio URL from OpenMHz
   * @param {WebSocket} ws - WebSocket connection to stream to
   * @returns {void}
   */
  streamAudio(audioUrl, ws) {
    const https = require('https');
    const http = require('http');

    const protocol = audioUrl.startsWith('https') ? https : http;

    const request = protocol.get(audioUrl, (response) => {
      if (response.statusCode !== 200) {
        ws.send(JSON.stringify({
          type: 'error',
          message: `Failed to fetch audio: ${response.statusCode}`
        }));
        return;
      }

      // Notify client that streaming is starting
      ws.send(JSON.stringify({
        type: 'stream_start',
        contentType: response.headers['content-type']
      }));

      // Pipe audio data to WebSocket
      response.on('data', (chunk) => {
        if (ws.readyState === ws.OPEN) {
          ws.send(chunk);
        }
      });

      response.on('end', () => {
        if (ws.readyState === ws.OPEN) {
          ws.send(JSON.stringify({ type: 'stream_end' }));
        }
      });

      response.on('error', (error) => {
        if (ws.readyState === ws.OPEN) {
          ws.send(JSON.stringify({
            type: 'error',
            message: error.message
          }));
        }
      });
    });

    request.on('error', (error) => {
      if (ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify({
          type: 'error',
          message: error.message
        }));
      }
    });

    // Handle client disconnect
    ws.on('close', () => {
      request.destroy();
    });
  }
}

module.exports = OpenMHZIntegration;
