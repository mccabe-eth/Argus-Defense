/**
 * Argus Defense - Libp2p Stream Player Component
 * React component for playing P2P streams via libp2p
 */

'use client';

import { useEffect } from 'react';
import { PlayIcon, StopIcon, SignalIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { useLibp2pStream } from '~/hooks/useLibp2pStream';

export interface Libp2pStreamPlayerProps {
  streamId: string;
  autoConnect?: boolean;
  autoSubscribe?: boolean;
  onError?: (error: string) => void;
}

/**
 * Libp2p Stream Player Component
 */
export function Libp2pStreamPlayer({
  streamId,
  autoConnect = true,
  autoSubscribe = true,
  onError,
}: Libp2pStreamPlayerProps) {
  const {
    node,
    status,
    metadata,
    audioChunks,
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    play,
    pause,
    peerId,
  } = useLibp2pStream();

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect && !node) {
      connect();
    }
  }, [autoConnect, node, connect]);

  // Auto-subscribe when connected
  useEffect(() => {
    if (autoSubscribe && status.connected && !status.subscribed && streamId) {
      subscribe(streamId);
    }
  }, [autoSubscribe, status.connected, status.subscribed, streamId, subscribe]);

  // Handle errors
  useEffect(() => {
    if (status.error && onError) {
      onError(status.error);
    }
  }, [status.error, onError]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      unsubscribe();
      disconnect();
    };
  }, [unsubscribe, disconnect]);

  const handlePlayPause = () => {
    if (status.playing) {
      pause();
    } else {
      play();
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="card-title text-lg">
            <SignalIcon className="h-5 w-5" />
            P2P Stream Player
          </h3>
          {status.connected && (
            <div className="badge badge-success badge-sm">Connected</div>
          )}
        </div>

        {/* Connection Status */}
        {!status.connected && (
          <div className="alert alert-info mb-4">
            <div className="flex items-center gap-2">
              <div className="loading loading-spinner loading-sm"></div>
              <span>Connecting to libp2p network...</span>
            </div>
          </div>
        )}

        {status.error && (
          <div className="alert alert-error mb-4">
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
            <span>{status.error}</span>
          </div>
        )}

        {/* Stream Info */}
        {status.connected && (
          <div className="space-y-3">
            {/* Peer Info */}
            <div className="stats stats-vertical lg:stats-horizontal shadow w-full">
              <div className="stat">
                <div className="stat-title">Peer ID</div>
                <div className="stat-value text-xs break-all">{peerId?.slice(0, 20)}...</div>
                <div className="stat-desc">Your libp2p node</div>
              </div>

              <div className="stat">
                <div className="stat-figure text-primary">
                  <UserGroupIcon className="h-8 w-8" />
                </div>
                <div className="stat-title">Connected Peers</div>
                <div className="stat-value text-primary">{status.peerCount}</div>
                <div className="stat-desc">Streaming from network</div>
              </div>

              <div className="stat">
                <div className="stat-title">Data Received</div>
                <div className="stat-value text-sm">{formatBytes(status.bytesReceived)}</div>
                <div className="stat-desc">{status.chunksReceived} chunks</div>
              </div>
            </div>

            {/* Stream Metadata */}
            {metadata && (
              <div className="p-4 bg-base-200 rounded-lg">
                <h4 className="font-semibold mb-2">Stream Metadata</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Stream ID:</span>
                    <span className="font-mono">{metadata.streamId}</span>
                  </div>
                  {metadata.source && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Source:</span>
                      <span className="badge badge-sm">{metadata.source}</span>
                    </div>
                  )}
                  {metadata.audioUrl && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Original URL:</span>
                      <span className="truncate ml-2 max-w-xs">{metadata.audioUrl}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Playback Controls */}
            <div className="card-actions justify-between items-center mt-4">
              <div className="text-sm text-gray-600">
                {audioChunks.length > 0 ? (
                  <span>
                    {audioChunks.length} audio chunks ready
                  </span>
                ) : status.subscribed ? (
                  <span className="flex items-center gap-2">
                    <div className="loading loading-spinner loading-xs"></div>
                    Waiting for stream data...
                  </span>
                ) : (
                  <span>Not subscribed</span>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  className={`btn btn-sm ${status.playing ? 'btn-error' : 'btn-primary'}`}
                  onClick={handlePlayPause}
                  disabled={!status.subscribed || audioChunks.length === 0}
                >
                  {status.playing ? (
                    <>
                      <StopIcon className="h-4 w-4" />
                      Stop
                    </>
                  ) : (
                    <>
                      <PlayIcon className="h-4 w-4" />
                      Play
                    </>
                  )}
                </button>

                {status.subscribed && (
                  <button className="btn btn-sm btn-ghost" onClick={unsubscribe}>
                    Unsubscribe
                  </button>
                )}
              </div>
            </div>

            {/* Connection Management */}
            <div className="divider"></div>
            <div className="flex gap-2 justify-end">
              {!status.subscribed && status.connected && (
                <button className="btn btn-sm btn-primary" onClick={() => subscribe(streamId)}>
                  Subscribe to Stream
                </button>
              )}
              <button
                className="btn btn-sm btn-ghost"
                onClick={status.connected ? disconnect : connect}
              >
                {status.connected ? 'Disconnect' : 'Connect'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Libp2pStreamPlayer;
