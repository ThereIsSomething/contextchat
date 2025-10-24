import { useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';

export default function useSocket(token) {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const socketRef = useRef(null);

  const socket = useMemo(() => {
    if (!token) return null;
    // Use same API URL as REST. Allow both polling and websocket for better compatibility.
    return io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      // Start with polling then upgrade to WebSocket to avoid early WS close errors in some local setups.
      transports: ['polling', 'websocket'],
      auth: { token },
      autoConnect: true,
      reconnection: true
    });
  }, [token]);

  useEffect(() => {
    if (!socket) return;
    socketRef.current = socket;

    const onConnect = () => {
      setConnected(true);
      setError(null);
    };
    const onDisconnect = () => setConnected(false);
    const onConnectError = (err) => {
      setConnected(false);
      const reason = err?.data?.reason ? ` (${err.data.reason})` : '';
      setError((err?.message || 'Socket connection error') + reason);
      // keep the socket instance so it can retry when token changes
      // Surface in console for troubleshooting
      // eslint-disable-next-line no-console
      console.error('socket connect_error:', err);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      socket.disconnect();
    };
  }, [socket]);

  return { socket: socketRef.current, connected, error };
}
