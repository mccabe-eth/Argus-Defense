/**
 * Argus Defense - useLibp2pStream Hook
 * React hook for managing libp2p stream subscriptions
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Libp2p } from 'libp2p';
import {
  startBrowserNode,
  subscribeToStream,
  getStreamPeerCount,
  decodeAudioChunk,
  StreamMessage,
} from '~/lib/libp2p/browserNode';

export interface StreamMetadata {
  streamId: string;
  audioUrl?: string;
  source?: string;
  [key: string]: any;
}

export interface StreamStatus {
  connected: boolean;
  subscribed: boolean;
  playing: boolean;
  error: string | null;
  bytesReceived: number;
  chunksReceived: number;
  peerCount: number;
}

export interface UseLibp2pStreamReturn {
  // State
  node: Libp2p | null;
  status: StreamStatus;
  metadata: StreamMetadata | null;
  audioChunks: Uint8Array[];

  // Actions
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  subscribe: (streamId: string) => void;
  unsubscribe: () => void;
  play: () => void;
  pause: () => void;

  // Info
  peerId: string | null;
}

/**
 * Hook for managing libp2p stream subscriptions
 */
export function useLibp2pStream(): UseLibp2pStreamReturn {
  const [node, setNode] = useState<Libp2p | null>(null);
  const [status, setStatus] = useState<StreamStatus>({
    connected: false,
    subscribed: false,
    playing: false,
    error: null,
    bytesReceived: 0,
    chunksReceived: 0,
    peerCount: 0,
  });
  const [metadata, setMetadata] = useState<StreamMetadata | null>(null);
  const [audioChunks, setAudioChunks] = useState<Uint8Array[]>([]);
  const [peerId, setPeerId] = useState<string | null>(null);

  const unsubscribeRef = useRef<(() => void) | null>(null);
  const currentStreamIdRef = useRef<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const peerCountIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Connect to libp2p network
   */
  const connect = useCallback(async () => {
    if (node) {
      console.log('⚠️  Already connected');
      return;
    }

    try {
      setStatus(prev => ({ ...prev, error: null }));
      const newNode = await startBrowserNode();

      setNode(newNode);
      setPeerId(newNode.peerId.toString());
      setStatus(prev => ({ ...prev, connected: true }));

      console.log('✅ Connected to libp2p network');
    } catch (error) {
      console.error('❌ Failed to connect:', error);
      setStatus(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to connect',
      }));
    }
  }, [node]);

  /**
   * Disconnect from libp2p network
   */
  const disconnect = useCallback(async () => {
    if (!node) return;

    try {
      // Unsubscribe from current stream
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }

      // Clear peer count interval
      if (peerCountIntervalRef.current) {
        clearInterval(peerCountIntervalRef.current);
        peerCountIntervalRef.current = null;
      }

      // Stop audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      await node.stop();
      setNode(null);
      setPeerId(null);
      setStatus({
        connected: false,
        subscribed: false,
        playing: false,
        error: null,
        bytesReceived: 0,
        chunksReceived: 0,
        peerCount: 0,
      });
      setMetadata(null);
      setAudioChunks([]);
      currentStreamIdRef.current = null;

      console.log('✅ Disconnected from libp2p network');
    } catch (error) {
      console.error('❌ Failed to disconnect:', error);
    }
  }, [node]);

  /**
   * Subscribe to a stream
   */
  const subscribe = useCallback(
    (streamId: string) => {
      if (!node) {
        console.error('❌ Not connected to libp2p network');
        return;
      }

      // Unsubscribe from previous stream
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }

      // Reset state
      setAudioChunks([]);
      setMetadata(null);
      setStatus(prev => ({
        ...prev,
        subscribed: true,
        bytesReceived: 0,
        chunksReceived: 0,
        peerCount: 0,
      }));

      currentStreamIdRef.current = streamId;

      // Subscribe to stream
      const unsubscribe = subscribeToStream(node, streamId, handleMessage);
      unsubscribeRef.current = unsubscribe;

      // Start peer count updates
      if (peerCountIntervalRef.current) {
        clearInterval(peerCountIntervalRef.current);
      }

      peerCountIntervalRef.current = setInterval(() => {
        const count = getStreamPeerCount(node, streamId);
        setStatus(prev => ({ ...prev, peerCount: count }));
      }, 5000);

      console.log(`✅ Subscribed to stream: ${streamId}`);
    },
    [node]
  );

  /**
   * Handle incoming stream messages
   */
  const handleMessage = useCallback((message: StreamMessage) => {
    switch (message.type) {
      case 'metadata':
        setMetadata({
          streamId: message.streamId,
          audioUrl: message.audioUrl,
          source: message.source,
          ...message.metadata,
        });
        console.log('📋 Received stream metadata');
        break;

      case 'audio':
        if (message.chunk) {
          const chunk = decodeAudioChunk(message.chunk);
          setAudioChunks(prev => [...prev, chunk]);
          setStatus(prev => ({
            ...prev,
            bytesReceived: prev.bytesReceived + chunk.length,
            chunksReceived: prev.chunksReceived + 1,
          }));
        }
        break;

      case 'iq_data':
        // Handle IQ data for SDR streams
        if (message.data) {
          const data = decodeAudioChunk(message.data);
          setStatus(prev => ({
            ...prev,
            bytesReceived: prev.bytesReceived + data.length,
            chunksReceived: prev.chunksReceived + 1,
          }));
        }
        break;

      case 'end':
        console.log('🏁 Stream ended');
        setStatus(prev => ({ ...prev, subscribed: false, playing: false }));
        break;
    }
  }, []);

  /**
   * Unsubscribe from current stream
   */
  const unsubscribe = useCallback(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    if (peerCountIntervalRef.current) {
      clearInterval(peerCountIntervalRef.current);
      peerCountIntervalRef.current = null;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    setStatus(prev => ({
      ...prev,
      subscribed: false,
      playing: false,
      peerCount: 0,
    }));
    setAudioChunks([]);
    setMetadata(null);
    currentStreamIdRef.current = null;

    console.log('🔕 Unsubscribed from stream');
  }, []);

  /**
   * Play audio from received chunks
   */
  const play = useCallback(() => {
    if (audioChunks.length === 0) {
      console.log('⚠️  No audio chunks available');
      return;
    }

    try {
      // Create a blob from audio chunks
      const blob = new Blob(audioChunks, { type: 'audio/mpeg' });
      const url = URL.createObjectURL(blob);

      // Create and play audio
      const audio = new Audio(url);
      audioRef.current = audio;

      audio.play();
      setStatus(prev => ({ ...prev, playing: true }));

      audio.onended = () => {
        setStatus(prev => ({ ...prev, playing: false }));
        URL.revokeObjectURL(url);
      };

      audio.onerror = error => {
        console.error('❌ Audio playback error:', error);
        setStatus(prev => ({
          ...prev,
          playing: false,
          error: 'Audio playback failed',
        }));
        URL.revokeObjectURL(url);
      };

      console.log('▶️  Playing audio');
    } catch (error) {
      console.error('❌ Failed to play audio:', error);
      setStatus(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to play audio',
      }));
    }
  }, [audioChunks]);

  /**
   * Pause audio playback
   */
  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setStatus(prev => ({ ...prev, playing: false }));
      console.log('⏸️  Paused audio');
    }
  }, []);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      if (peerCountIntervalRef.current) {
        clearInterval(peerCountIntervalRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (node) {
        node.stop().catch(console.error);
      }
    };
  }, [node]);

  return {
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
  };
}
