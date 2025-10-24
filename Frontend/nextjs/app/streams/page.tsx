"use client";

import { useState, useEffect, useRef } from "react";
import type { NextPage } from "next";
import { PlayIcon, StopIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";

interface WalletInfo {
  address: string;
  contract_address: string | null;
  mode: string;
  created_at: string;
}

interface TalkgroupInfo {
  num: number;
  alpha: string;
  description: string;
  tag: string;
  category: string;
}

interface StreamData {
  stream_id: string;
  name: string;
  description: string;
  audio_url: string;
  system_name: string;
  talkgroup_id: number;
  timestamp: string;
  duration: number;
  wallet: WalletInfo;
  active_listeners: number;
  metadata: {
    star_count: number;
    call_id: string;
    talkgroup_info: TalkgroupInfo;
  };
}

interface StreamsResponse {
  total_streams: number;
  last_updated: string;
  streams: StreamData[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const StreamsPage: NextPage = () => {
  const [streams, setStreams] = useState<StreamData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playingStreamId, setPlayingStreamId] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch streams from the API
  useEffect(() => {
    const fetchStreams = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/streams`);

        if (!response.ok) {
          throw new Error(`Failed to fetch streams: ${response.statusText}`);
        }

        const data: StreamsResponse = await response.json();
        setStreams(data.streams);
        setLastUpdated(data.last_updated);
        setError(null);
      } catch (err) {
        console.error("Error fetching streams:", err);
        setError(err instanceof Error ? err.message : "Failed to load streams");
      } finally {
        setLoading(false);
      }
    };

    fetchStreams();

    // Refresh streams every 30 seconds
    const interval = setInterval(fetchStreams, 30000);

    return () => clearInterval(interval);
  }, []);

  // Handle playing a stream
  const handlePlay = async (stream: StreamData) => {
    try {
      // Stop current stream if playing
      if (playingStreamId && audioRef.current) {
        await handleStop(playingStreamId);
      }

      // Create new audio element
      const audio = new Audio(stream.audio_url);
      audioRef.current = audio;

      // Start tracking
      await fetch(`${API_BASE_URL}/api/listen/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          streamId: stream.stream_id,
          listenerId: "web-client",
        }),
      });

      // Play audio
      await audio.play();
      setPlayingStreamId(stream.stream_id);

      // Handle audio end
      audio.onended = () => {
        handleStop(stream.stream_id);
      };
    } catch (err) {
      console.error("Error playing stream:", err);
      alert("Failed to play stream. Check console for details.");
    }
  };

  // Handle stopping a stream
  const handleStop = async (streamId: string) => {
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      // Stop tracking
      await fetch(`${API_BASE_URL}/api/listen/stop`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          streamId,
          listenerId: "web-client",
        }),
      });

      setPlayingStreamId(null);
    } catch (err) {
      console.error("Error stopping stream:", err);
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (playingStreamId) {
        handleStop(playingStreamId);
      }
    };
  }, [playingStreamId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg"></div>
          <p className="mt-4">Loading streams...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="alert alert-error">
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
          <span>Error: {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Emergency Radio Streams</h1>
        <p className="text-gray-600">
          Listen to live emergency radio communications with blockchain-based rewards
        </p>
        <div className="text-sm text-gray-500 mt-2">
          Total streams: {streams.length} | Last updated: {formatTimestamp(lastUpdated)}
        </div>
      </div>

      {streams.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-xl text-gray-600">No streams available at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {streams.map(stream => (
            <div
              key={stream.stream_id}
              className={`card bg-base-100 shadow-xl ${
                playingStreamId === stream.stream_id ? "ring-2 ring-primary" : ""
              }`}
            >
              <div className="card-body">
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h2 className="card-title text-lg">{stream.name}</h2>
                    <div className="badge badge-primary badge-sm mt-1">
                      {stream.metadata.talkgroup_info.category}
                    </div>
                  </div>
                  {stream.active_listeners > 0 && (
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <UserGroupIcon className="h-4 w-4" />
                      <span>{stream.active_listeners}</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="text-sm text-gray-600 mt-2 line-clamp-2">{stream.description}</div>

                {/* Stream Info */}
                <div className="mt-3 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">System:</span>
                    <span className="font-medium">{stream.system_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Duration:</span>
                    <span className="font-medium">{stream.duration}s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Timestamp:</span>
                    <span className="font-medium">{new Date(stream.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>

                {/* Wallet Address */}
                <div className="mt-4 p-3 bg-base-200 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">Reward Wallet:</div>
                  <Address address={stream.wallet.address} size="sm" />
                  <div className="text-xs text-gray-500 mt-1">Mode: {stream.wallet.mode}</div>
                </div>

                {/* Play/Stop Button */}
                <div className="card-actions justify-end mt-4">
                  {playingStreamId === stream.stream_id ? (
                    <button
                      className="btn btn-error btn-sm"
                      onClick={() => handleStop(stream.stream_id)}
                    >
                      <StopIcon className="h-4 w-4" />
                      Stop
                    </button>
                  ) : (
                    <button className="btn btn-primary btn-sm" onClick={() => handlePlay(stream)}>
                      <PlayIcon className="h-4 w-4" />
                      Listen
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StreamsPage;
