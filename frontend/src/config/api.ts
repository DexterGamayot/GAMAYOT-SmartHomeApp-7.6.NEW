// ─────────────────────────────────────────────
// API configuration.
// The app talks to the Smart Home backend (see ../backend).
// Set EXPO_PUBLIC_API_URL in a .env file to point at it (see .env.example):
//   - Web / iOS simulator : http://localhost:3000/api
//   - Android emulator    : http://10.0.2.2:3000/api
//   - Real phone          : http://<your-computer-LAN-IP>:3000/api
// ─────────────────────────────────────────────
export const API_BASE_URL =
    process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api';

export const REQUEST_TIMEOUT_MS = 10000;

// Endpoint paths — these match the backend's REST API.
export const ENDPOINTS = {
    gateway: '/gateway/connect',
    devices: '/devices',
    device: (id: number) => `/devices/${id}`,
    sensorsLatest: '/sensors/latest',
};
