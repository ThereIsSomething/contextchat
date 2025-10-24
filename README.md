[![repo size](https://img.shields.io/github/repo-size/ThereIsSomething/books.svg)](https://github.com/ThereIsSomething/contextchat/archive/refs/heads/master.zip) [![Website](https://img.shields.io/website-up-down-green-red/https/shields.io.svg?label=website)](https://contextchat-two.vercel.app) [![Donate](https://img.shields.io/badge/$-donate-ff69b4.svg)](https://www.paypal.me/NBhambu)


# ContextChat

A minimal, production-ready MERN (MongoDB, Express, React, Node.js) real-time messaging MVP where conversations are organized by contexts (projects/topics) instead of contacts.

Live demo: https://contextchat-two.vercel.app/

#Frontend deployed on VERCEL
#Backend Deployed on RENDER

## Tech Stack
- Backend: Node.js, Express, MongoDB (Mongoose), Socket.IO, JWT, bcryptjs, dotenv, CORS
- Frontend: React (Vite), React Router, axios, socket.io-client, Tailwind CSS

## Features
- Email/password signup and login with JWT
- Protected REST API endpoints
- Create contexts (topics) and invite members by email
- List contexts you belong to; leave contexts
- Real-time messaging per context (Socket.IO)
- Message history (last 50 by default)
- Typing indicators (simple broadcast)
- Responsive UI with Tailwind

## Monorepo Structure
```
contextchat/
├── server/        # Express + Socket.IO + MongoDB
└── client/        # React + Vite + Tailwind
```

## Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)

## Quick Start (Local)

1) Clone and install

```bash
# from repository root
cd contextchat/server && npm i
cd ../client && npm i
```

2) Configure environment

- Copy example env files and edit values

```bash
# Server
cp contextchat/server/.env.example contextchat/server/.env
# Client
cp contextchat/client/.env.example contextchat/client/.env
```

- Server .env
```
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<db>?retryWrites=true&w=majority
MONGO_DB_NAME=contextchat
JWT_SECRET=super-secret-change-me
```

- Client .env
```
VITE_API_URL=http://localhost:5000
```

3) Run backend and frontend (two terminals)

```bash
# Terminal 1
cd contextchat/server
npm run dev

# Terminal 2
cd contextchat/client
npm run dev
```

- Backend: http://localhost:5000
- Frontend: http://localhost:5173

Login/Signup, create a context, open two browsers/accounts to test real-time messaging.

## API Overview
Base URL: http://localhost:5000

- Auth
  - POST /api/auth/signup { username, email, password }
  - POST /api/auth/login { email, password }

- Contexts (requires Bearer token)
  - GET /api/contexts
  - POST /api/contexts { name, description?, isPrivate? }
  - POST /api/contexts/:id/members { email }
  - DELETE /api/contexts/:id/members/:userId

- Messages (requires Bearer token)
  - GET /api/messages/:contextId?limit=50
  - POST /api/messages { contextId, content }

## Socket.IO Events
- Client emits
  - join_context { contextId }
  - send_message { contextId, content }
  - typing { contextId, isTyping }

- Server emits
  - receive_message message
  - typing { userId, contextId, isTyping }
  - user_joined { userId, contextId }

Authentication for sockets uses handshake.auth.token with the same JWT used for REST.

## Production Build

```bash
# Client build
cd contextchat/client
npm run build
```

Serve the built client via a static host (e.g., Vercel). Backend can be deployed to Railway/Render.

## Deployment Notes

Deploying Backend on Render and Frontend on Vercel

1) Backend on Render
- Create a new Web Service from the `contextchat/server` directory of your repository.
- Environment
  - PORT: Render sets this automatically. Keep `server.js` reading `process.env.PORT` (already done).
  - MONGO_URI: your MongoDB Atlas connection string
  - MONGO_DB_NAME: contextchat (or your db name)
  - JWT_SECRET: a long random secret
  - CLIENT_ORIGIN: add your Vercel URLs (comma-separated), e.g.
    - CLIENT_ORIGIN=https://your-app.vercel.app,https://your-app-git-main-user.vercel.app
    - Note: This server also accepts any `*.vercel.app` and `*.vercel.dev` origins by default, so you can omit CLIENT_ORIGIN if you only use Vercel. Adding explicit origins is still recommended.
- Build & Start command
  - Build: npm install
  - Start: npm start (or `node server.js` depending on your package.json)
- Networking
  - Render will give you a public URL like: https://your-service.onrender.com
  - WebSockets are supported on Render out of the box.

2) Frontend on Vercel
- Import the project and select `contextchat/client` as the root.
- Environment Variables (Project Settings → Environment Variables)
  - VITE_API_URL: set to your Render backend URL, e.g. `https://your-service.onrender.com`
- Build Settings
  - Framework Preset: Vite
  - Build Command: npm run build
  - Output Directory: dist
- After the first deploy, your site will be at e.g. https://your-app.vercel.app

3) Verify connectivity (Production)
- Open your deployed frontend URL.
- Check Network tab for:
  - API calls to `https://your-service.onrender.com/api/...` returning 200/201.
  - Socket.IO connection to `https://your-service.onrender.com/socket.io`:
    - It should connect via polling and then upgrade to `websocket`.
- If you see CORS errors, ensure the exact Vercel URL is present in CLIENT_ORIGIN (or rely on the default `*.vercel.app` allowance), and redeploy or restart the backend.
- If sockets show authentication errors, log out and log back in to refresh the JWT.

Troubleshooting
- Mixed content blocked: Ensure your Vercel site uses https:// and your Render backend URL is also https:// (Render provides HTTPS by default).
- 401 Unauthorized on /api/contexts: Re-login to refresh token; ensure JWT_SECRET on Render matches the one used to sign tokens.
- Socket connects only with polling: It’s fine; Socket.IO will continue to attempt upgrade. If it never upgrades, check corporate/firewall/proxy settings; the app still works with polling.
- Preview deployments: Vercel preview URLs are also allowed by this server (wildcard for `*.vercel.app` and `*.vercel.dev`). If you want to restrict to production only, set CLIENT_ORIGIN to only the production domain and remove the wildcard logic in `server/server.js`. 

## Known Limitations
- No message editing/deletion or file uploads
- Simple typing indicator (not per-user names)
- No read receipts

## License
MIT

## Run over Local Network (LAN)

You can develop and test on your local network so phones or other PCs on the same Wi‑Fi can access the app.

Steps:
1) Find your machine's LAN IP
   - macOS/Linux: run `ip addr` or `ifconfig` and find something like 192.168.x.y
   - Windows: run `ipconfig`

2) Backend (server)
   - In `contextchat/server/.env`, set CLIENT_ORIGIN to include your LAN origin (comma‑separated if needed):
     - Example: `CLIENT_ORIGIN=http://localhost:5173,http://192.168.1.10:5173`
   - Ensure PORT is set (e.g., `PORT=8989`).
   - Start the server:
     - `cd contextchat/server && npm run dev`
   - The backend binds to all interfaces by default so it is reachable at `http://192.168.1.10:8989` on your LAN.

3) Frontend (client)
   - In `contextchat/client/.env`, set the backend URL to your LAN IP and server port, for example:
     - `VITE_API_URL=http://192.168.1.10:8989`
   - Start Vite dev server bound to the LAN interface:
     - Option A (recommended): `VITE_DEV_HOST=192.168.1.10 npm run dev`
     - Option B: `npm run dev -- --host` (binds 0.0.0.0)
   - After starting, open `http://192.168.1.10:5173` from your phone/another PC.

4) Verify Socket.IO
   - Open DevTools → Network → filter `socket.io` and confirm it upgrades to `websocket`.
   - If it stays on polling or fails, ensure both the frontend URL you open and the backend CORS `CLIENT_ORIGIN` include the same `http://192.168.1.10:5173` origin.
