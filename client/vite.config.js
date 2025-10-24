import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Allow serving over local network with `npm run dev -- --host`
// Optionally, set VITE_DEV_HOST to your LAN IP to help HMR work across devices
// Example: VITE_DEV_HOST=192.168.1.10
const host = process.env.VITE_DEV_HOST || true; // true binds to 0.0.0.0

export default defineConfig({
  plugins: [react()],
  server: {
    host, // listen on all interfaces or specific host if provided
    port: 5173,
    strictPort: true,
    hmr: process.env.VITE_DEV_HOST
      ? { host: process.env.VITE_DEV_HOST, port: 5173 }
      : undefined
  }
});