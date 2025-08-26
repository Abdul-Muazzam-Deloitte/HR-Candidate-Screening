import { useState, useEffect, useRef, useCallback } from 'react';
import { SSEMessage, ProcessState, LangGraphNode } from '../types/langgraph';

interface UseWebSocketProps {
  url: string;
  onMessage?: (message: SSEMessage) => void;
  onError?: (error: Event) => void;
  onOpen?: () => void;
  onClose?: () => void;
}

export const useWebSocket = ({ url, onMessage, onError, onOpen, onClose }: UseWebSocketProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    try {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        return;
      }

      wsRef.current = new WebSocket(url);

      wsRef.current.onopen = () => {
        setIsConnected(true);
        setError(null);
        reconnectAttempts.current = 0;
        onOpen?.();
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message: SSEMessage = JSON.parse(event.data);
          onMessage?.(message);
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      wsRef.current.onerror = (event) => {
        setError('WebSocket connection error');
        onError?.(event);
      };

      wsRef.current.onclose = () => {
        setIsConnected(false);
        onClose?.();

        // Attempt to reconnect
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else {
          setError('Failed to connect after multiple attempts');
        }
      };
    } catch (err) {
      setError('Failed to create WebSocket connection');
    }
  }, [url, onMessage, onError, onOpen, onClose]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setIsConnected(false);
  }, []);

  const sendMessage = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    error,
    connect,
    disconnect,
    sendMessage,
  };
};