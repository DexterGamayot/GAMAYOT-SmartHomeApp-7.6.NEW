# Smart Home App — Full-Stack

An Expo / React Native app (`frontend/`) backed by a REST API and SQLite database (`backend/`).

```
smart-home-fullstack/
├── frontend/                 Your original Expo app (UI unchanged)
│   └── src/services/         IoTService.ts + apiClient.ts now call the real API
└── backend/
    ├── src/
    │   ├── server.js         Starts the server
    │   ├── app.js            Routes + JSON/error/CORS handling
    │   ├── config.js         Reads .env (port, database file)
    │   ├── db/               schema.sql (the tables) + database.js (opens SQLite)
    │   ├── models/           SQL for Device and Sensor
    │   ├── routes/           REST endpoints
    │   └── validators.js     Input validation
    ├── scripts/              seed.js (sample data), simulate-sensors.js
    └── tests/                Automated API tests
```

## 1. Requirements
- **Node.js 22.13 or newer** (`node -v`). The backend uses Node's built-in SQLite and HTTP server, so it has **no npm dependencies and nothing to install**.
- The frontend's usual Expo requirements (`npm install` there).

## 2. Backend

```bash
cd backend
cp .env.example .env     # optional — defaults work (port 3000, ./data/smart-home.db)
npm run seed             # creates the database + tables and adds sample data
npm start                # API at http://localhost:3000/api
```
Other commands: `npm run dev` (auto-restart on changes), `npm run db:reset` (wipe + re-seed),
`npm run simulate` (second terminal: sends a fake sensor reading for every device every 5 s),
`npm test` (runs the API tests in memory — your data is untouched).

Database: a single SQLite file (`backend/data/smart-home.db`), created automatically; the tables come from `backend/src/db/schema.sql`. Change the location with `DATABASE_FILE` in `.env`.

### Tables
| Device | | Sensor | |
|---|---|---|---|
| `id` | PK, auto | `id` | PK, auto |
| `name` | text | `temperature` | °C |
| `type` | text | `light_level` | lux, ≥ 0 |
| `icon` | Ionicons name | `device_id` | **FK → Device.id**, `ON DELETE CASCADE` |
| `status` | 0/1 (API: `true`/`false`) | `record_at` | ISO-8601 UTC time |

One Device has many Sensor readings. A reading must reference an existing device, and deleting a device deletes its readings.

## 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env     # then set EXPO_PUBLIC_API_URL for where you run the app:
npx expo start           # press w (web), a (Android) or i (iOS)
```
| Where the app runs | `EXPO_PUBLIC_API_URL` |
|---|---|
| Web / iOS simulator | `http://localhost:3000/api` |
| Android emulator | `http://10.0.2.2:3000/api` |
| Real phone (same Wi-Fi) | `http://<your computer's LAN IP>:3000/api` |

After editing `.env`, restart with `npx expo start -c`. Start the backend **first**; the app shows its normal error banners if it can't reach it.

## 4. REST API

Base URL `http://localhost:3000/api`. Bodies and responses are JSON.

| Method | Path | Purpose |
|---|---|---|
| GET | `/health` | Server + database check |
| POST | `/gateway/connect` | The app's "connect to gateway" button |
| GET | `/devices` | List devices |
| POST | `/devices` | Create `{name, type, icon, status?}` → 201 |
| GET | `/devices/:id` | One device |
| PUT | `/devices/:id` | Replace (name, type, icon required) |
| PATCH | `/devices/:id` | Change some fields, e.g. `{"status": true}` |
| DELETE | `/devices/:id` | Delete device + its readings → 204 |
| GET | `/devices/:id/sensors` | A device's readings (newest first) |
| GET | `/devices/:id/sensors/latest` | A device's newest reading |
| POST | `/devices/:id/sensors` | Add a reading `{temperature, light_level, record_at?}` |
| GET | `/sensors` | All readings. Filters: `?device_id=&from=&to=&limit=` (limit 1–1000, default 100) |
| GET | `/sensors/latest` | Newest reading overall (what the app shows); `?device_id=` optional |
| POST | `/sensors` | Add `{temperature, light_level, device_id, record_at?}` |
| GET / PUT / PATCH / DELETE | `/sensors/:id` | One reading |

**Errors** always look like `{"error": {"message": "...", "details": ["..."]}}`:
400 invalid input (all problems listed in `details`), 404 not found (device, reading, or unknown device_id), 405 wrong method, 413 body too large, 500 unexpected.

Try it:
```bash
curl http://localhost:3000/api/devices
curl -X POST http://localhost:3000/api/devices -H "Content-Type: application/json" \
     -d '{"name":"Kitchen Light","type":"Smart Light","icon":"bulb-outline"}'
curl -X PATCH http://localhost:3000/api/devices/1 -H "Content-Type: application/json" -d '{"status":false}'
```

## 5. What changed in the frontend
- `services/IoTService.ts`: mock gateway removed; calls the API. `config/api.ts`: `USE_MOCK_API` removed, endpoints updated. `services/apiClient.ts`: shows the backend's validation messages and "can't reach server" errors.
- `models/IoTModels.ts`: `sampleDevices` removed (now seed data in the backend); `humidity` is optional.
- Dashboard / Sensors screens: only the humidity text changed, to show "—" when there's no value.

## Notes
- **Humidity**: your spec's Sensor table has no humidity column, so the app shows "—" for it rather than a made-up number. Adding a `humidity` column is a small change in `schema.sql`, `sensorModel.js`, `validators.js` and `IoTService.ts`.
- **Settings** (notifications / auto-connect) aren't in the requested tables, so they stay in app memory for the session, as before.
- There is no authentication; this is meant for local/home-network use.
