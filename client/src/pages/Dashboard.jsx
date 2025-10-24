import React, { useContext, useEffect, useMemo, useState } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import useSocket from '../hooks/useSocket.js';
import Sidebar from '../components/Sidebar.jsx';
import ChatWindow from '../components/ChatWindow.jsx';

export default function Dashboard() {
  const { token, api, user, logout } = useContext(AuthContext);
  const { socket, connected, error: socketError } = useSocket(token);
  const [contexts, setContexts] = useState([]);
  const [activeContextId, setActiveContextId] = useState(null);

  // Fetch contexts
  const fetchContexts = async () => {
    try {
      const res = await api.get('/api/contexts');
      setContexts(res.data);
      if (!activeContextId && res.data?.length) setActiveContextId(res.data[0]._id);
    } catch (e) {
      if (e?.response?.status === 401) {
        // If we ever hit 401 here (e.g., initial race before interceptors),
        // ensure we log out to avoid a broken UI state.
        return logout();
      }
      console.error('Fetch contexts failed', e);
    }
  };

  useEffect(() => {
    fetchContexts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Join room when active changes
  useEffect(() => {
    if (socket && activeContextId) {
      socket.emit('join_context', { contextId: activeContextId });
    }
  }, [socket, activeContextId]);

  // Re-join the active room after socket reconnects
  useEffect(() => {
    if (!socket) return;
    const onConnect = () => {
      if (activeContextId) {
        socket.emit('join_context', { contextId: activeContextId });
      }
    };
    socket.on('connect', onConnect);
    return () => socket.off('connect', onConnect);
  }, [socket, activeContextId]);

  const activeContext = useMemo(
    () => contexts.find((c) => c._id === activeContextId) || null,
    [contexts, activeContextId]
  );

  return (
    <div className="h-[calc(100vh-64px)] grid grid-cols-12">
      <aside className="col-span-4 md:col-span-3 lg:col-span-3 border-r bg-white">
        <Sidebar
          user={user}
          contexts={contexts}
          activeContextId={activeContextId}
          onSelectContext={setActiveContextId}
          onRefresh={fetchContexts}
          onLogout={logout}
        />
      </aside>
      <section className="col-span-8 md:col-span-9 lg:col-span-9">
        <ChatWindow
          api={api}
          socket={socket}
          connected={connected}
          socketError={socketError}
          context={activeContext}
          user={user}
        />
      </section>
    </div>
  );
}
