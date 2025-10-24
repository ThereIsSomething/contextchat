import React, { useEffect, useRef, useState } from 'react';

export default function MessageInput({ onSend, onTyping, disabled }) {
  const [text, setText] = useState('');
  const typingRef = useRef(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  const handleChange = (e) => {
    setText(e.target.value);
    if (!typingRef.current) {
      typingRef.current = true;
      onTyping?.(true);
    }
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      typingRef.current = false;
      onTyping?.(false);
    }, 1000);
  };

  const send = () => {
    const value = text.trim();
    if (!value) return;
    onSend?.(value);
    setText('');
    onTyping?.(false);
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="flex items-end gap-2">
      <textarea
        rows={1}
        value={text}
        onChange={handleChange}
        onKeyDown={onKeyDown}
        placeholder={disabled ? 'Select a context to start chatting' : 'Type a message'}
        disabled={disabled}
        className="flex-1 resize-none border rounded p-2"
      />
      <button onClick={send} disabled={disabled} className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-60">
        Send
      </button>
    </div>
  );
}
