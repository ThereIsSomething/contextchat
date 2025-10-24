import React, { useEffect, useRef, useState } from 'react';
import MessageThread from './MessageThread.jsx';
import MessageInput from './MessageInput.jsx';

export default function ChatWindow({ api, socket, connected, socketError, context, user }) {
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [memberEmail, setMemberEmail] = useState('');
  const [adding, setAdding] = useState(false);
  const bottomRef = useRef(null);

  // Load messages when context changes
  useEffect(() => {
    const load = async () => {
      if (!context) return;
      try {
        const res = await api.get(`/api/messages/${context._id}?limit=50`);
        setMessages(res.data);
        scrollToBottom();
      } catch (e) {
        console.error('Load messages failed', e);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context?._id]);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    // Normalize id to string for reliable comparisons
    const sameContext = (a, b) => {
      if (!a || !b) return false;
      return String(a) === String(b);
    };

    const onReceive = (message) => {
      if (sameContext(message?.contextId, context?._id)) {
        setMessages((prev) => [...prev, message]);
        scrollToBottomSmooth();
      }
    };
    const onTyping = ({ userId, contextId, isTyping }) => {
      if (!sameContext(contextId, context?._id) || userId === user?.id) return;
      setTypingUsers((prev) => ({ ...prev, [userId]: isTyping }));
    };
    socket.on('receive_message', onReceive);
    socket.on('typing', onTyping);
    return () => {
      socket.off('receive_message', onReceive);
      socket.off('typing', onTyping);
    };
  }, [socket, context?._id, user?.id]);

  const scrollToBottom = () => bottomRef.current?.scrollIntoView({ behavior: 'auto' });
  const scrollToBottomSmooth = () => bottomRef.current?.scrollIntoView({ behavior: 'smooth' });

  const handleSend = async (text) => {
    if (!text || !context) return;
    try {
      if (socket && connected) {
        socket.emit('send_message', { contextId: context._id, content: text });
      } else {
        // REST fallback when socket is not connected
        const res = await api.post('/api/messages', { contextId: context._id, content: text });
        setMessages((prev) => [...prev, res.data]);
        scrollToBottomSmooth();
      }
    } catch (e) {
      console.error('Send message failed', e);
    }
  };

  const handleTyping = (isTyping) => {
    if (!context || !(socket && connected)) return;
    socket.emit('typing', { contextId: context._id, isTyping });
  };

  const addMember = async (e) => {
    e.preventDefault();
    if (!memberEmail || !context) return;
    setAdding(true);
    try {
      await api.post(`/api/contexts/${context._id}/members`, { email: memberEmail });
      setMemberEmail('');
      alert('Member invited/added');
    } catch (e) {
      console.error('Add member failed', e);
    } finally {
      setAdding(false);
    }
  };

  if (!context)
    return (
      <div className="h-full flex items-center justify-center text-gray-500">Select a context to start chatting</div>
    );

  const typingSomeone = Object.values(typingUsers).some(Boolean);

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b bg-white flex items-center justify-between">
        <div>
          <div className="font-semibold">{context.name}</div>
          <div className="text-xs text-gray-500">{context.members?.length || 0} members</div>
        </div>
        <form onSubmit={addMember} className="flex items-center gap-2">
          <input
            className="border rounded p-2 text-sm"
            placeholder="Add member by email"
            value={memberEmail}
            onChange={(e) => setMemberEmail(e.target.value)}
          />
          <button className="bg-blue-600 text-white text-sm px-3 py-2 rounded disabled:opacity-60" disabled={adding}>
            {adding ? 'Adding...' : 'Add'}
          </button>
        </form>
      </div>
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        <MessageThread messages={messages} currentUserId={user?.id} />
        <div ref={bottomRef} />
      </div>
      <div className="p-4 border-t bg-white">
        {typingSomeone && <div className="text-xs text-gray-500 mb-1">Someone is typing...</div>}
        <MessageInput onSend={handleSend} onTyping={handleTyping} disabled={!context} />
        {!connected && (
          <div className="text-xs text-gray-500 mt-1">
            {socketError ? `Socket not connected: ${socketError}. Falling back to HTTP.` : 'Socket not connected. Falling back to HTTP.'}
          </div>
        )}
      </div>
    </div>
  );
}
