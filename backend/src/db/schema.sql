-- Database schema. Runs every time the server starts (safe to repeat).

CREATE TABLE IF NOT EXISTS Device (
  id     INTEGER PRIMARY KEY AUTOINCREMENT,
  name   TEXT    NOT NULL,
  type   TEXT    NOT NULL,
  icon   TEXT    NOT NULL,                              -- Ionicons name, e.g. 'bulb-outline'
  status INTEGER NOT NULL DEFAULT 0 CHECK (status IN (0, 1))  -- 0 = off, 1 = on
);

-- One Device has many Sensor readings (Device 1 ──< Sensor *).
-- Deleting a Device also deletes its readings (ON DELETE CASCADE).
CREATE TABLE IF NOT EXISTS Sensor (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  temperature REAL    NOT NULL,                          -- °C
  light_level REAL    NOT NULL CHECK (light_level >= 0), -- lux
  device_id   INTEGER NOT NULL
              REFERENCES Device (id) ON DELETE CASCADE,
  record_at   TEXT    NOT NULL                           -- ISO-8601 UTC, e.g. 2026-10-07T11:00:00.000Z
);

CREATE INDEX IF NOT EXISTS idx_sensor_device_time ON Sensor (device_id, record_at DESC);
CREATE INDEX IF NOT EXISTS idx_sensor_time        ON Sensor (record_at DESC);
