"use client";

import { useEffect, useMemo, useState } from "react";
import type { Libp2p } from "libp2p";
import type { NextPage } from "next";
import { FunnelIcon, GlobeAltIcon, MagnifyingGlassIcon, SignalIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { Footer } from "~~/components/Footer";
import { Header } from "~~/components/Header";
import { StreamPlayer } from "~~/components/StreamPlayer";
import { startBrowserNode } from "~~/lib/libp2p/browserNode";
import { BrowserStreamDirectory } from "~~/lib/libp2p/streamDirectory";
import type { DiscoveredStream } from "~~/lib/libp2p/streamDirectory";

const StreamsPage: NextPage = () => {
  const [node, setNode] = useState<Libp2p | null>(null);
  const [directory, setDirectory] = useState<BrowserStreamDirectory | null>(null);
  const [streams, setStreams] = useState<DiscoveredStream[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playingStreamId, setPlayingStreamId] = useState<string | null>(null);
  const [peerId, setPeerId] = useState<string>("");
  const [peerCount, setPeerCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Initialize P2P node and directory
  useEffect(() => {
    let mounted = true;

    const initP2P = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("🚀 Starting libp2p browser node...");

        // Start libp2p node
        const p2pNode = await startBrowserNode();

        if (!mounted) {
          await p2pNode.stop();
          return;
        }

        setNode(p2pNode);
        setPeerId(p2pNode.peerId.toString());

        // Initialize stream directory
        const dir = new BrowserStreamDirectory(p2pNode);
        await dir.start();

        if (!mounted) {
          await dir.stop();
          await p2pNode.stop();
          return;
        }

        setDirectory(dir);

        // For localhost development: fetch streams from REST API
        if (typeof window !== "undefined" && window.location.hostname === "localhost") {
          console.log("🔌 Development mode: fetching streams from local API...");
          try {
            const response = await fetch("http://localhost:3001/api/streams");
            if (response.ok) {
              const data = await response.json();
              const apiStreams = data.streams.map((s: any) => ({
                name: s.name,
                streamId: s.stream_id,
                metadata: {
                  system_name: s.system_name,
                  talkgroup_id: s.talkgroup_id,
                  duration: s.duration,
                  timestamp: s.timestamp,
                  wallet: s.wallet,
                  ...s.metadata
                }
              }));
              console.log(`✅ Loaded ${apiStreams.length} streams from local API`);
              setStreams(apiStreams);
              setLoading(false);
              console.log("✅ P2P initialization complete (local mode)");
              return;
            }
          } catch (err) {
            console.warn("⚠️ Could not fetch from local API, falling back to P2P discovery", err);
          }
        }

        // Wait for peer discovery and stream announcements (P2P production mode)
        console.log("⏳ Waiting for P2P peer discovery and stream announcements...");
        const startDiscovery = Date.now();
        let discoveredCount = 0;

        while (Date.now() - startDiscovery < 12000) {
          const peers = p2pNode.getPeers();
          const streams = dir.getDiscoveredStreams();
          console.log(`[DEBUG] Discovery loop - Peers: ${peers.length}, Streams: ${streams.length}`);

          if (streams.length > discoveredCount) {
            discoveredCount = streams.length;
            console.log(`📢 New streams discovered via P2P: ${discoveredCount}`);
            setStreams(streams);  // Update in real-time
          }

          if (peers.length === 0) {
            console.log("⏳ Still waiting for peer connections...");
          } else if (streams.length === 0) {
            console.log(`✓ Connected to ${peers.length} peer(s), waiting for stream announcements...`);
          }

          await new Promise(r => setTimeout(r, 500));
        }

        // Final query for streams
        console.log("🔍 Final stream discovery query...");
        const discoveredStreams = dir.getDiscoveredStreams();
        setStreams(discoveredStreams);

        setLoading(false);
        console.log("✅ P2P initialization complete");
      } catch (err) {
        console.error("❌ Failed to initialize P2P:", err);
        setError(err instanceof Error ? err.message : "Failed to initialize P2P network");
        setLoading(false);
      }
    };

    initP2P();

    return () => {
      mounted = false;
      if (directory) {
        Promise.resolve(directory.stop()).catch((err: Error) => console.error("Failed to stop directory:", err));
      }
      if (node) {
        Promise.resolve(node.stop()).catch((err: Error) => console.error("Failed to stop node:", err));
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update peer count periodically
  useEffect(() => {
    if (!node) return;

    const updatePeerCount = () => {
      const peers = node.getPeers();
      setPeerCount(peers.length);
    };

    updatePeerCount();
    const interval = setInterval(updatePeerCount, 5000);

    return () => clearInterval(interval);
  }, [node]);

  // Auto-refresh discovered streams
  useEffect(() => {
    if (!directory) return;

    const refreshStreams = () => {
      const discoveredStreams = directory.getDiscoveredStreams();
      setStreams(discoveredStreams);
    };

    const interval = setInterval(refreshStreams, 10000);

    return () => clearInterval(interval);
  }, [directory]);

  // Handle playing a stream
  const handlePlay = (streamId: string) => {
    setPlayingStreamId(streamId);
  };

  // Handle stopping a stream
  const handleStop = () => {
    setPlayingStreamId(null);
  };

  // Filter and search streams
  const filteredStreams = useMemo(() => {
    return streams.filter(stream => {
      // Category filter
      if (categoryFilter !== "all" && stream.metadata?.category !== categoryFilter) {
        return false;
      }

      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const name = (stream.metadata?.name || stream.streamId).toLowerCase();
        const system = (stream.metadata?.system_name || "").toLowerCase();
        const category = (stream.metadata?.category || "").toLowerCase();

        return name.includes(query) || system.includes(query) || category.includes(query);
      }

      return true;
    });
  }, [streams, searchQuery, categoryFilter]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    streams.forEach(stream => {
      if (stream.metadata?.category) {
        cats.add(stream.metadata.category);
      }
    });
    return Array.from(cats).sort();
  }, [streams]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-300 via-base-200 to-base-100">
        <Header />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <SignalIcon className="h-16 w-16 mx-auto mb-4 text-primary animate-pulse" />
            <div className="loading loading-spinner loading-lg mb-4"></div>
            <p className="text-lg font-semibold">Connecting to P2P Network...</p>
            <p className="text-sm text-gray-500 mt-2">Discovering peers and streams</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-300 via-base-200 to-base-100">
        <Header />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="alert alert-error max-w-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 className="font-bold">Connection Failed</h3>
              <div className="text-xs">{error}</div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-300 via-base-200 to-base-100">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* P2P Network Status */}
        <div className="card bg-base-100 shadow-xl mb-8">
          <div className="card-body">
            {/* Original: <div className="flex items-center justify-between"> */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="avatar placeholder">
                  <div className="bg-primary text-primary-content rounded-full w-12">
                    <GlobeAltIcon className="h-6 w-6" />
                  </div>
                </div>
                <div>
                  <h2 className="card-title text-lg leading-tight mb-1">Decentralized P2P Network</h2>
                  <p className="text-sm text-gray-500 font-mono leading-tight">Node: {peerId.slice(0, 20)}...</p>
                </div>
              </div>

              {/* Original: <div className="flex gap-4"> */}
              <div className="flex flex-wrap gap-4">
                <div className="bg-base-200 rounded-lg px-6 py-3 min-w-[140px]">
                  <div className="text-xs text-gray-500 mb-1">Connected Peers</div>
                  <div className="text-3xl font-bold text-primary mb-1">{peerCount}</div>
                  <div className="text-xs text-gray-400 flex items-center gap-1">
                    <UserGroupIcon className="h-3 w-3" />
                    P2P Mesh
                  </div>
                </div>

                <div className="bg-base-200 rounded-lg px-6 py-3 min-w-[140px]">
                  <div className="text-xs text-gray-500 mb-1">Discovered Streams</div>
                  <div className="text-3xl font-bold text-secondary mb-1">{streams.length}</div>
                  <div className="text-xs text-gray-400 flex items-center gap-1">
                    <SignalIcon className="h-3 w-3" />
                    Live
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <SignalIcon className="h-10 w-10 text-primary" />
            Emergency Radio Streams
          </h1>
          <p className="text-gray-600">Fully decentralized P2P streaming - No central servers, no censorship</p>
        </div>

        {/* Search and Filters */}
        {streams.length > 0 && (
          <div className="mb-6 flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="form-control">
                <div className="input-group">
                  <span className="bg-base-100">
                    <MagnifyingGlassIcon className="h-5 w-5" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search streams by name, system, or category..."
                    className="input input-bordered w-full"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Category Filter */}
            <div className="form-control md:w-64">
              <div className="input-group">
                <span className="bg-base-100">
                  <FunnelIcon className="h-5 w-5" />
                </span>
                <select
                  className="select select-bordered w-full"
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Stream Grid */}
        {streams.length === 0 ? (
          <div className="text-center py-16">
            <SignalIcon className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <p className="text-xl text-gray-600 mb-2">No streams discovered yet</p>
            <p className="text-sm text-gray-500">Waiting for peers to announce streams...</p>
            <p className="text-xs text-gray-400 mt-4">Make sure backend is running with auto-publish enabled</p>
            <div className="loading loading-spinner loading-lg mt-4"></div>
          </div>
        ) : filteredStreams.length === 0 ? (
          <div className="text-center py-16">
            <MagnifyingGlassIcon className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <p className="text-xl text-gray-600 mb-2">No streams match your filters</p>
            <button
              className="btn btn-ghost btn-sm mt-4"
              onClick={() => {
                setSearchQuery("");
                setCategoryFilter("all");
              }}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-gray-500">
              Showing {filteredStreams.length} of {streams.length} streams
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStreams.map(stream => (
                <div
                  key={stream.streamId}
                  className={`card bg-base-100 shadow-xl hover:shadow-2xl transition-all ${
                    playingStreamId === stream.streamId ? "ring-2 ring-primary" : ""
                  }`}
                >
                  <div className="card-body">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h2 className="card-title text-lg">{stream.metadata?.name || stream.streamId}</h2>
                        {stream.metadata?.category && (
                          <div className="badge badge-primary badge-sm mt-1">{stream.metadata.category}</div>
                        )}
                      </div>
                    </div>

                    {/* Stream Info */}
                    <div className="space-y-2 text-sm">
                      {stream.metadata?.system_name && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">System:</span>
                          <span className="font-medium">{stream.metadata.system_name}</span>
                        </div>
                      )}
                      {stream.metadata?.duration && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Duration:</span>
                          <span className="font-medium">{stream.metadata.duration}s</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-500">Age:</span>
                        <span className="font-medium">{Math.floor(stream.age / 1000)}s ago</span>
                      </div>
                    </div>

                    {/* Publisher Info */}
                    <div className="mt-3 p-2 bg-base-200 rounded-lg">
                      <div className="text-xs text-gray-500 mb-1">Publisher:</div>
                      <div className="font-mono text-xs truncate">{stream.publisher}</div>
                    </div>

                    {/* Player or Listen Button */}
                    {playingStreamId === stream.streamId ? (
                      <div className="mt-4">
                        <StreamPlayer
                          stream={{
                            streamId: stream.streamId,
                            name: stream.metadata?.name || stream.streamId,
                            category: stream.metadata?.category,
                            publisher: stream.publisher,
                            metadata: stream.metadata,
                          }}
                          onStop={handleStop}
                        />
                      </div>
                    ) : (
                      <div className="card-actions justify-end mt-4">
                        <button className="btn btn-primary btn-sm gap-2" onClick={() => handlePlay(stream.streamId)}>
                          <SignalIcon className="h-4 w-4" />
                          Listen P2P
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default StreamsPage;
