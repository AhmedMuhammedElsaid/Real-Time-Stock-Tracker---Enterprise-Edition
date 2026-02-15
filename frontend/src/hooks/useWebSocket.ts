import { useState, useEffect, useRef, useCallback } from 'react';
import type { ConnectionStatus } from '../types';

const WS_URL =
  import.meta.env.VITE_WS_URL ||
  `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`;
const INITIAL_RECONNECT_INTERVAL = 1000;
const MAX_RECONNECT_INTERVAL = 30000;
const HEARTBEAT_INTERVAL = 30000;
const HEARTBEAT_TIMEOUT = 5000;

export function useWebSocket() {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const ws = useRef<WebSocket | null>(null);
  const messageHandler = useRef<((data: any) => void) | null>(null);
  const isComponentMounted = useRef(true);
  const reconnectCount = useRef(0);
  const subscriptions = useRef<Set<string>>(new Set());
  const heartbeatTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopHeartbeat = useCallback(() => {
    if (heartbeatTimer.current) clearInterval(heartbeatTimer.current);
    if (timeoutTimer.current) clearTimeout(timeoutTimer.current);
  }, []);

  const startHeartbeat = useCallback(() => {
    stopHeartbeat();
    heartbeatTimer.current = setInterval(() => {
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({ action: 'ping' }));
        
        timeoutTimer.current = setTimeout(() => {
          console.warn('WebSocket heartbeat timeout, reconnecting...');
          ws.current?.close();
        }, HEARTBEAT_TIMEOUT);
      }
    }, HEARTBEAT_INTERVAL);
  }, [stopHeartbeat]);

  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN || ws.current?.readyState === WebSocket.CONNECTING) return;
    if (!isComponentMounted.current) return;

    setStatus('connecting');
    const socket = new WebSocket(WS_URL);
    ws.current = socket;

    socket.onopen = () => {
      if (!isComponentMounted.current) {
        socket.close();
        return;
      }
      setStatus('connected');
      reconnectCount.current = 0;
      console.log('WebSocket Connected');
      
      if (subscriptions.current.size > 0) {
        const symbols = Array.from(subscriptions.current);
        socket.send(JSON.stringify({ action: 'subscribe', symbols }));
        console.log('Recovered subscriptions:', symbols);
      }

      startHeartbeat();
    };

    socket.onclose = () => {
      if (!isComponentMounted.current) return;

      setStatus('disconnected');
      stopHeartbeat();
      const delay = Math.min(
        INITIAL_RECONNECT_INTERVAL * Math.pow(2, reconnectCount.current),
        MAX_RECONNECT_INTERVAL
      );
      console.log(`WebSocket Disconnected, retrying in ${delay}ms...`);
      setTimeout(() => {
        if (isComponentMounted.current) {
          connect();
        }
      }, delay);
      reconnectCount.current++;
    };

    socket.onerror = (error) => {
      if (!isComponentMounted.current) return;
      console.error('WebSocket Error:', error);
      setStatus('error');
    };

    socket.onmessage = (event) => {
      if (!isComponentMounted.current) return;
      try {
        const data = JSON.parse(event.data);
        
        if (data.action === 'pong') {
          if (timeoutTimer.current) clearTimeout(timeoutTimer.current);
          return;
        }

        if (messageHandler.current) {
          messageHandler.current(data);
        }
      } catch (e) {
        console.error('Failed to parse WS message', e);
      }
    };
  }, [startHeartbeat, stopHeartbeat]); // Added dependencies

  useEffect(() => {
    isComponentMounted.current = true;
    connect();
    return () => {
      isComponentMounted.current = false;
      stopHeartbeat();
      if (ws.current) {
        ws.current.onopen = null;
        ws.current.onclose = null;
        ws.current.onerror = null;
        ws.current.onmessage = null;
        ws.current.close();
      }
    };
  }, [connect, stopHeartbeat]); // Added stopHeartbeat

  const send = useCallback((data: { action: string; symbols?: string[] }) => {
    if (data.action === 'subscribe' && data.symbols) {
      data.symbols.forEach((s: string) => subscriptions.current.add(s));
    } else if (data.action === 'unsubscribe' && data.symbols) {
      data.symbols.forEach((s: string) => subscriptions.current.delete(s));
    }

    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket not connected, action buffered:', data);
    }
  }, []);

  const registerMessageHandler = useCallback((handler: (data: unknown) => void) => {
    messageHandler.current = handler;
  }, []);

  return { status, send, registerMessageHandler };
}
