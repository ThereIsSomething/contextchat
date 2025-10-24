import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import contextRoutes from './routes/contexts.js';
import messageRoutes from './routes/messages.js';
import { authenticateSocket } from './middleware/auth.js';
import Message from './models/Message.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
// Allow multiple dev origins (localhost and 127.0.0.1). Support comma-separated CLIENT_ORIGIN.
const allowedOrigins = (process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(',').map((s) => s.trim())
  : ['http://localhost:5173']);
if (!allowedOrigins.includes('http://127.0.0.1:5173')) allowedOrigins.push('http://127.0.0.1:5173');

// Production-friendly origin validator: supports explicit allowlist and Vercel wildcard domains
const vercelRegexps = [
  /^https?:\/\/([a-z0-9-]+)\.vercel\.app$/i,
  /^https?:\/\/([a-z0-9-]+)\.vercel\.dev$/i
];
const isOriginAllowed = (origin) => {
  if (!origin) return true; // allow tools and same-origin server-to-server
  if (allowedOrigins.includes(origin)) return true;
  return vercelRegexps.some((re) => re.test(origin));
};

const corsOptions = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) return callback(null, true);
    return callback(new Error(`CORS: Origin not allowed: ${origin}`), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

const io = new SocketIOServer(server, {
  cors: {
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) return callback(null, true);
      return callback(new Error(`Socket.IO CORS: Origin not allowed: ${origin}`), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  },
  // Dev-friendly timings to reduce premature closes during upgrade/handshake
  pingInterval: 25000,
  pingTimeout: 20000,
  upgradeTimeout: 10000,
  allowUpgrades: true,
  perMessageDeflate: false
});
app.set('io', io);

// Connect DB
connectDB();

// Middleware
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle CORS preflight for mobile browsers
app.use(express.json());

// Routes
app.get('/', (req, res) => res.send('ContextChat API running'));
app.use('/api/auth', authRoutes);
app.use('/api/contexts', contextRoutes);
app.use('/api/messages', messageRoutes);

// Socket.IO
console.log('Socket.IO allowed origins:', allowedOrigins);
io.use(authenticateSocket);

// Surface low-level engine connection errors (e.g., failed WS upgrade/CORS)
io.engine.on('connection_error', (err) => {
  console.error('Engine connection_error:', {
    message: err.message,
    context: err.context,
    reqOrigin: err.req?.headers?.origin,
    reqReferer: err.req?.headers?.referer
  });
});

io.on('connection', (socket) => {
  const user = socket.user;
  console.log('Socket connected:', user?.id);
  // Log transport and upgrades for debugging WS fallback issues
  try {
    console.log('Initial transport:', socket.conn.transport.name);
    socket.conn.on('upgrade', (transport) => {
      console.log('Transport upgraded to:', transport.name);
    });
  } catch {}

  socket.on('join_context', ({ contextId }) => {
    if (!contextId) return;
    const room = `context_${contextId}`;
    socket.join(room);
    io.to(room).emit('user_joined', { userId: user.id, contextId });
  });

  socket.on('typing', ({ contextId, isTyping }) => {
    if (!contextId) return;
    const room = `context_${contextId}`;
    socket.to(room).emit('typing', { userId: user.id, contextId, isTyping: !!isTyping });
  });

  socket.on('send_message', async ({ contextId, content }) => {
    try {
      if (!contextId || !content) return;
      const message = await Message.create({ contextId, senderId: user.id, content, timestamp: new Date() });
      const populated = await message.populate('senderId', 'username email');
      const room = `context_${contextId}`;
      io.to(room).emit('receive_message', populated);
    } catch (err) {
      console.error('send_message error', err.message);
      socket.emit('error_message', { message: 'Failed to send message' });
    }
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', user?.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
