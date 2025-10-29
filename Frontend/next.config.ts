import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disabled for P2P streaming - strict mode's double-mounting breaks libp2p connections
  reactStrictMode: false,
  devIndicators: false,
  typescript: {
    ignoreBuildErrors: process.env.NEXT_PUBLIC_IGNORE_BUILD_ERROR === "true",
  },
  eslint: {
    ignoreDuringBuilds: process.env.NEXT_PUBLIC_IGNORE_BUILD_ERROR === "true",
  },
  webpack: config => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
};

const isIpfs = process.env.NEXT_PUBLIC_IPFS_BUILD === "true";

if (isIpfs) {
  nextConfig.output = "export";
  nextConfig.trailingSlash = true;
  nextConfig.images = {
    unoptimized: true,
  };

  // Note: basePath is NOT needed for standard IPFS deployments
  // IPFS gateways handle the /ipfs/<CID>/ prefix automatically
  // Only set basePath if deploying to a subdirectory like /app
  // Example: nextConfig.basePath = "/app";
}

module.exports = nextConfig;
