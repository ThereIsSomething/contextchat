import React, { useContext, useState } from 'react';
import ContextList from './ContextList.jsx';
import { AuthContext } from '../context/AuthContext.jsx';

export default function Sidebar({ user, contexts, activeContextId, onSelectContext, onRefresh, onLogout }) {
  const { api } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);

  const createContext = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post('/api/contexts', { name, description });
      setName('');
      setDescription('');
      await onRefresh();
    } catch (e) {
      console.error('Create context failed', e);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="font-semibold">{user?.username}</div>
        <div className="text-xs text-gray-500">{user?.email}</div>
        <button onClick={onLogout} className="mt-2 text-sm text-red-600">Logout</button>
      </div>
      <div className="p-4 border-b">
        <form onSubmit={createContext} className="space-y-2">
          <input
            className="w-full border rounded p-2"
            placeholder="New context name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            className="w-full border rounded p-2"
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <button className="w-full bg-gray-900 text-white py-2 rounded disabled:opacity-60" disabled={creating}>
            {creating ? 'Creating...' : 'Create Context'}
          </button>
        </form>
      </div>
      <div className="flex-1 overflow-y-auto">
        <ContextList
          contexts={contexts}
          activeContextId={activeContextId}
          onSelect={onSelectContext}
        />
      </div>
    </div>
  );
}
