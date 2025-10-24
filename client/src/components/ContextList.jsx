import React from 'react';

export default function ContextList({ contexts, activeContextId, onSelect }) {
  return (
    <ul>
      {contexts?.map((ctx) => (
        <li key={ctx._id}>
          <button
            onClick={() => onSelect(ctx._id)}
            className={`w-full text-left px-4 py-3 border-b hover:bg-gray-50 ${
              activeContextId === ctx._id ? 'bg-gray-100 font-medium' : ''
            }`}
          >
            <div className="truncate">{ctx.name}</div>
            <div className="text-xs text-gray-500 truncate">{ctx.description}</div>
          </button>
        </li>
      ))}
      {(!contexts || contexts.length === 0) && (
        <li className="p-4 text-sm text-gray-500">No contexts yet. Create one above.</li>
      )}
    </ul>
  );
}
