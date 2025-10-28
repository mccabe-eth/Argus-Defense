/**
 * Argus Defense - P2P Stream Player Component
 * Pure peer-to-peer streaming via libp2p
 */
"use client";

import { useEffect } from "react";
import { PlayIcon, SignalIcon, StopIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { useLibp2pStream } from "~~/hooks/useLibp2pStream";

export interface StreamData {
  streamId: string;
  name: string;
  category?: string;
  publisher?: string;
  metadata?: any;
}

export interface StreamPlayerProps {
  stream: StreamData;
  onStop?: () => void;
  autoConnect?: boolean;
}

/**
 * Pure P2P Stream Player Component
 */
export function StreamPlayer({ stream, onStop, autoConnect = true }: StreamPlayerProps) {
  const { status, audioChunks, connect, subscribe, unsubscribe, play, pause, peerId } = useLibp2pStream();

  // Auto-connect and subscribe
  useEffect(() => {
    if (autoConnect && !status.connected) {
      connect();
    }
  }, [autoConnect, status.connected, connect]);

  useEffect(() => {
    if (status.connected && !status.subscribed) {
      subscribe(stream.streamId);
    }
  }, [status.connected, status.subscribed, stream.streamId, subscribe]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      unsubscribe();
    };
  }, [unsubscribe]);

  const handlePlayPause = () => {
    if (status.playing) {
      pause();
    } else {
      play();
    }
  };

  const handleStop = () => {
    unsubscribe();
    onStop?.();
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="card bg-base-200/50 backdrop-blur-sm border border-primary/20">
      <div className="card-body p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <SignalIcon className="h-5 w-5 text-secondary animate-pulse" />
            <span className="font-semibold text-sm">P2P Stream</span>
          </div>

          {/* Connection Status */}
          {status.connected ? (
            <div className="badge badge-success badge-sm gap-1">
              <div className="w-2 h-2 rounded-full bg-success-content animate-pulse"></div>
              Connected
            </div>
          ) : (
            <div className="badge badge-warning badge-sm gap-1">
              <div className="loading loading-spinner loading-xs"></div>
              Connecting...
            </div>
          )}
        </div>

        {/* Error Display */}
        {status.error && (
          <div className="alert alert-error alert-sm mb-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current shrink-0 h-4 w-4"
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
            <span className="text-xs">{status.error}</span>
          </div>
        )}

        {/* Stream Info */}
        {status.subscribed && (
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="stat bg-base-300 rounded-lg p-2">
              <div className="stat-title text-xs">Peers</div>
              <div className="stat-value text-lg flex items-center gap-1">
                <UserGroupIcon className="h-4 w-4" />
                {status.peerCount}
              </div>
            </div>
            <div className="stat bg-base-300 rounded-lg p-2">
              <div className="stat-title text-xs">Received</div>
              <div className="stat-value text-sm">{formatBytes(status.bytesReceived)}</div>
            </div>
            <div className="stat bg-base-300 rounded-lg p-2">
              <div className="stat-title text-xs">Chunks</div>
              <div className="stat-value text-sm">{status.chunksReceived}</div>
            </div>
          </div>
        )}

        {/* Playback Controls */}
        <div className="flex items-center justify-between gap-2">
          <div className="text-xs text-gray-500">
            {status.subscribed ? (
              audioChunks.length > 0 ? (
                <span className="text-success">{audioChunks.length} chunks ready</span>
              ) : (
                <span className="flex items-center gap-1">
                  <div className="loading loading-spinner loading-xs"></div>
                  Buffering...
                </span>
              )
            ) : (
              <span>Initializing...</span>
            )}
          </div>

          <div className="flex gap-2">
            {status.playing ? (
              <button className="btn btn-error btn-sm" onClick={pause}>
                <StopIcon className="h-4 w-4" />
                Pause
              </button>
            ) : (
              <button
                className="btn btn-primary btn-sm"
                onClick={handlePlayPause}
                disabled={!status.subscribed || audioChunks.length === 0}
              >
                <PlayIcon className="h-4 w-4" />
                Play
              </button>
            )}

            <button className="btn btn-ghost btn-sm" onClick={handleStop}>
              Stop
            </button>
          </div>
        </div>

        {/* Peer ID */}
        {peerId && <div className="text-xs text-gray-500 mt-2 truncate font-mono">Node: {peerId.slice(0, 20)}...</div>}
      </div>
    </div>
  );
}

export default StreamPlayer;
