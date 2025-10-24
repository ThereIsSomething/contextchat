import React, { useContext } from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Dashboard from './pages/Dashboard.jsx';

const ProtectedRoute = ({ children }) => {
  const { token } = useContext(AuthContext);
  const hasToken = token || localStorage.getItem('token');
  if (!hasToken) return <Navigate to="/login" replace />;
  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col">
        <header className="p-4 bg-white shadow flex items-center justify-between">
          <Link to="/" className="text-xl font-semibold">ContextChat</Link>
          <nav className="space-x-4">
            <Link className="text-blue-600" to="/login">Login</Link>
            <Link className="text-blue-600" to="/signup">Signup</Link>
          </nav>
        </header>
        <main className="flex-1">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  );
}
