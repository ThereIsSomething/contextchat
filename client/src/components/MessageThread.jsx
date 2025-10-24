import React from 'react';

function formatTime(ts) {
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return '';
  }
}

export default function MessageThread({ messages, currentUserId }) {
  return (
    <div className="space-y-3">
      {messages?.map((m) => {
        const isMine = (m.senderId?._id || m.senderId) === currentUserId;
        const name = typeof m.senderId === 'object' ? m.senderId.username : isMine ? 'You' : 'User';
        return (
          <div key={m._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] rounded p-2 ${isMine ? 'bg-blue-600 text-white' : 'bg-white border'}`}>
              <div className={`text-xs ${isMine ? 'text-blue-100' : 'text-gray-500'}`}>{name}</div>
              <div className="whitespace-pre-wrap break-words">{m.content}</div>
              <div className={`text-[10px] mt-1 ${isMine ? 'text-blue-100' : 'text-gray-500'}`}>{formatTime(m.timestamp)}</div>
            </div>
          </div>
        );
      })}
      {(!messages || messages.length === 0) && (
        <div className="text-sm text-gray-500">No messages yet. Say hello!</div>
      )}
    </div>
  );
}
