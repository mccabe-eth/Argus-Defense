/**
 * Argus Defense - P2P Stream Player Component
 * Pure peer-to-peer streaming via libp2p
 */
"use client";

import { useEffect, useState, useRef } from "react";
import { PlayIcon, SignalIcon, StopIcon, PauseIcon, MapPinIcon, WalletIcon } from "@heroicons/react/24/outline";
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
  const { status, connect, subscribe, unsubscribe, play, pause } = useLibp2pStream();
  const [isLocalhost, setIsLocalhost] = useState(false);
  const [localPlaying, setLocalPlaying] = useState(false);
  const localAudioRef = useRef<HTMLAudioElement | null>(null);

  // Check if we're on localhost
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsLocalhost(window.location.hostname === "localhost");
    }
  }, []);

  // Localhost audio player handlers
  const handleLocalPlayPause = async () => {
    if (!localAudioRef.current) {
      // Create audio element
      localAudioRef.current = new Audio();

      // Get audio URL from stream metadata
      const audioUrl = stream.metadata?.audioUrl || stream.metadata?.audio_url;
      if (!audioUrl) {
        console.error("No audio URL found in stream metadata");
        return;
      }

      localAudioRef.current.src = audioUrl;
      localAudioRef.current.addEventListener("ended", () => setLocalPlaying(false));
      localAudioRef.current.addEventListener("pause", () => setLocalPlaying(false));
      localAudioRef.current.addEventListener("play", () => setLocalPlaying(true));
    }

    if (localPlaying) {
      localAudioRef.current.pause();
    } else {
      try {
        await localAudioRef.current.play();
      } catch (err) {
        console.error("Failed to play audio:", err);
      }
    }
  };

  const handleLocalStop = () => {
    if (localAudioRef.current) {
      localAudioRef.current.pause();
      localAudioRef.current.currentTime = 0;
      setLocalPlaying(false);
    }
    onStop?.();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (localAudioRef.current) {
        localAudioRef.current.pause();
        localAudioRef.current = null;
      }
    };
  }, []);

  // Auto-connect and subscribe (only in production)
  useEffect(() => {
    if (isLocalhost) {
      // Skip P2P in localhost mode
      return;
    }

    if (autoConnect && !status.connected) {
      connect();
    }
  }, [autoConnect, status.connected, connect, isLocalhost]);

  useEffect(() => {
    if (isLocalhost) {
      // Skip P2P in localhost mode
      return;
    }

    if (status.connected && !status.subscribed) {
      subscribe(stream.streamId);
    }
  }, [status.connected, status.subscribed, stream.streamId, subscribe, isLocalhost]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (!isLocalhost) {
        unsubscribe();
      }
    };
  }, [unsubscribe, isLocalhost]);

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

  const handleConnect = () => {
    if (!isLocalhost) {
      connect();
    }
  };

  // Unified state for both modes
  const isPlaying = isLocalhost ? localPlaying : status.playing;
  const isConnected = isLocalhost ? true : status.connected;
  const handlePlay = isLocalhost ? handleLocalPlayPause : handlePlayPause;
  const handleStopClick = isLocalhost ? handleLocalStop : handleStop;

  return (
    <div className="bg-base-100 rounded-lg p-4 border border-primary shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex-1 pr-4">
          <h3 className="font-semibold text-lg mb-2">{stream.name}</h3>

          {/* Category and System */}
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            {stream.metadata?.category && (
              <span className="text-primary font-medium">{stream.metadata.category}</span>
            )}
            {stream.metadata?.system_name && (
              <>
                <span>•</span>
                <span>{stream.metadata.system_name}</span>
              </>
            )}
            <span>•</span>
            <span className={`badge badge-sm ${isLocalhost ? "badge-secondary" : "badge-success"}`}>
              {isLocalhost ? "Local" : "P2P"}
            </span>
            {!isLocalhost && isConnected && (
              <>
                <span>•</span>
                <span className="text-gray-500">{status.peerCount} peers</span>
              </>
            )}
          </div>

          {/* Location */}
          {stream.metadata?.location && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
              <MapPinIcon className="h-3.5 w-3.5" />
              <span>{stream.metadata.location}</span>
            </div>
          )}

          {/* Frequency */}
          {stream.metadata?.frequency && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
              <SignalIcon className="h-3.5 w-3.5" />
              <span>{stream.metadata.frequency}</span>
            </div>
          )}

          {/* Wallet Balance */}
          {stream.metadata?.wallet?.balance && (
            <div className="flex items-center gap-1.5 text-xs text-success">
              <WalletIcon className="h-3.5 w-3.5" />
              <span>{stream.metadata.wallet.balance}</span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {!isLocalhost && !isConnected ? (
            <button className="btn btn-primary gap-2" onClick={handleConnect}>
              <SignalIcon className="h-5 w-5" />
              Connect
            </button>
          ) : (
            <>
              <button
                className={`btn btn-circle btn-lg ${isPlaying ? "btn-warning" : "btn-success"}`}
                onClick={handlePlay}
              >
                {isPlaying ? <PauseIcon className="h-6 w-6" /> : <PlayIcon className="h-6 w-6" />}
              </button>
              {isPlaying && (
                <button className="btn btn-circle btn-lg btn-error" onClick={handleStopClick}>
                  <StopIcon className="h-6 w-6" />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default StreamPlayer;
