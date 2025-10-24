import React, { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';

export default function Login() {
  const { login, loading, error, setError } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ok = await login({ email, password });
    if (ok) navigate('/');
  };

  return (
    <div className="max-w-md mx-auto mt-16 bg-white shadow p-6 rounded">
      <h2 className="text-2xl font-semibold mb-4">Login</h2>
      {error && (
        <div className="bg-red-100 text-red-700 p-2 rounded mb-3 flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-sm">x</button>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded p-2"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded p-2"
          required
        />
        <button disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-60">
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <p className="text-sm mt-3">
        No account? <Link className="text-blue-600" to="/signup">Signup</Link>
      </p>
    </div>
  );
}
