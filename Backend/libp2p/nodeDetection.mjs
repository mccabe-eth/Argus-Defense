/**
 * Argus Defense - Node Detection & Auto-Configuration
 * Automatically detects network environment and configures libp2p node accordingly
 */

import os from 'os';
import https from 'https';

/**
 * Check if an IP address is in a private range
 * @param {string} ip - IP address to check
 * @returns {boolean} True if IP is private
 */
function isPrivateIP(ip) {
  const parts = ip.split('.').map(Number);

  // Check if it's a valid IPv4 address
  if (parts.length !== 4 || parts.some(p => isNaN(p) || p < 0 || p > 255)) {
    return true; // Treat invalid as private
  }

  // Private IP ranges:
  // 10.0.0.0 - 10.255.255.255
  // 172.16.0.0 - 172.31.255.255
  // 192.168.0.0 - 192.168.255.255
  // 127.0.0.0 - 127.255.255.255 (loopback)
  return (
    parts[0] === 10 ||
    (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
    (parts[0] === 192 && parts[1] === 168) ||
    parts[0] === 127
  );
}

/**
 * Get external public IP using ipify service
 * @returns {Promise<string|null>} Public IP address or null
 */
async function getExternalIP() {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      resolve(null);
    }, 5000);

    https.get('https://api.ipify.org?format=text', (res) => {
      let data = '';

      res.on('data', chunk => {
        data += chunk;
      });

      res.on('end', () => {
        clearTimeout(timeout);
        const ip = data.trim();
        resolve(ip && ip.length > 0 ? ip : null);
      });
    }).on('error', (err) => {
      clearTimeout(timeout);
      console.warn('Could not fetch external IP:', err.message);
      resolve(null);
    });
  });
}

/**
 * Detect public IP addresses from network interfaces
 * @returns {string[]} Array of public IP addresses found
 */
function detectLocalPublicIPs() {
  const interfaces = os.networkInterfaces();
  const publicIPs = [];

  for (const [name, addrs] of Object.entries(interfaces)) {
    if (!addrs) continue;

    for (const addr of addrs) {
      // Only check IPv4 addresses that are not internal
      if (addr.family === 'IPv4' && !addr.internal) {
        // Check if it's a public IP (not in private ranges)
        if (!isPrivateIP(addr.address)) {
          publicIPs.push(addr.address);
          console.log(`✅ Found public IP on interface ${name}: ${addr.address}`);
        }
      }
    }
  }

  return publicIPs;
}

/**
 * Detect if running on a publicly accessible server
 * @returns {Promise<Object>} Detection result with IP and mode
 */
export async function detectPublicIP() {
  try {
    console.log('🔍 Detecting network environment...');

    // First, check local network interfaces for public IPs
    const localPublicIPs = detectLocalPublicIPs();

    if (localPublicIPs.length > 0) {
      console.log(`🌐 Public IP detected on network interface: ${localPublicIPs[0]}`);
      return {
        ip: localPublicIPs[0],
        mode: 'full',
        source: 'interface'
      };
    }

    // If no public IP on interface, try external detection
    console.log('🔍 No public IP on interface, checking external IP...');
    const externalIP = await getExternalIP();

    if (externalIP && !isPrivateIP(externalIP)) {
      console.log(`🌐 External public IP detected: ${externalIP}`);
      console.log('⚠️  Note: You may be behind NAT. Ensure port 9001 is forwarded.');
      return {
        ip: externalIP,
        mode: 'full',
        source: 'external',
        requiresPortForward: true
      };
    }

    // No public IP detected - running behind NAT
    console.log('🏠 No public IP detected - running behind NAT/firewall');
    return {
      ip: null,
      mode: 'light',
      source: 'none'
    };

  } catch (error) {
    console.warn('⚠️  Error during IP detection:', error.message);
    console.log('🏠 Defaulting to light node mode');
    return {
      ip: null,
      mode: 'light',
      source: 'error'
    };
  }
}

/**
 * Get node configuration based on environment
 * @returns {Promise<Object>} Node configuration
 */
export async function getNodeConfig() {
  const detection = await detectPublicIP();
  const port = process.env.LIBP2P_PORT || 9001;

  // Allow manual override via environment variable
  if (process.env.LIBP2P_PUBLIC_IP) {
    const manualIP = process.env.LIBP2P_PUBLIC_IP;
    console.log(`🔧 Using manually configured public IP: ${manualIP}`);
    return {
      listen: [`/ip4/0.0.0.0/tcp/${port}`],
      announce: [`/ip4/${manualIP}/tcp/${port}`],
      mode: 'full',
      source: 'manual'
    };
  }

  if (detection.mode === 'full') {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🌐 FULL NODE MODE');
    console.log(`   Public IP: ${detection.ip}`);
    console.log(`   Listen: 0.0.0.0:${port}`);
    console.log(`   Announce: ${detection.ip}:${port}`);

    if (detection.requiresPortForward) {
      console.log('⚠️  IMPORTANT: Ensure port 9001 is forwarded in your router/firewall');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    return {
      listen: [`/ip4/0.0.0.0/tcp/${port}`],
      announce: [`/ip4/${detection.ip}/tcp/${port}`],
      mode: 'full'
    };
  } else {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🏠 LIGHT NODE MODE');
    console.log(`   Listen: 0.0.0.0:${port} (local only)`);
    console.log('   Using circuit relay for NAT traversal');
    console.log('   Will connect to network via relay nodes');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    return {
      listen: [`/ip4/0.0.0.0/tcp/${port}`],
      announce: [], // Will use relay addresses
      mode: 'light',
      enableRelay: true
    };
  }
}

/**
 * Check if a port is likely to be accessible from outside
 * This is a basic check and doesn't guarantee external accessibility
 * @param {number} port - Port to check
 * @returns {Promise<boolean>} True if port might be accessible
 */
export async function checkPortAccessibility(port = 9001) {
  // This is a placeholder for future implementation
  // Could potentially use UPnP or NAT-PMP to check/configure port forwarding
  // For now, we rely on the IP detection logic
  return true;
}
