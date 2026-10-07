import {
    AppSettings,
    Device,
    NewDevice,
    SensorData,
    defaultSettings,
} from '../models/IoTModels';
import { ENDPOINTS } from '../config/api';
import { ApiError, request } from './apiClient';

// ─────────────────────────────────────────────
// IoT Service
// This is the bottom of the architecture:
//   Screens -> useIoT() -> IoTContext -> IoTService -> REST API -> database
// Screens never talk to this file directly — only IoTContext calls into it.
// ─────────────────────────────────────────────

// Shape of one row returned by the backend's Sensor endpoints.
type SensorReading = {
    id: number;
    temperature: number;
    light_level: number;
    device_id: number;
    record_at: string;
};

/** Connects to the IoT gateway (the backend). */
export async function connectGateway(): Promise<boolean> {
    await request<unknown>(ENDPOINTS.gateway, { method: 'POST' });
    return true;
}

/** Fetches the list of known devices from the database. */
export async function getDevices(): Promise<Device[]> {
    return request<Device[]>(ENDPOINTS.devices);
}

/** Reads the most recent sensor reading. */
export async function getSensorData(): Promise<SensorData> {
    try {
        const reading = await request<SensorReading>(ENDPOINTS.sensorsLatest);
        // The database stores temperature and light level only (no humidity).
        return { temperature: reading.temperature, lightLevel: reading.light_level };
    } catch (error) {
        // 404 just means no readings have been recorded yet.
        if (error instanceof ApiError && error.status === 404) {
            return { temperature: 0, lightLevel: 0 };
        }
        throw error;
    }
}

/** Sends a command to change a device's status. */
export async function updateDeviceStatus(
    id: number,
    status: boolean
): Promise<Device> {
    return request<Device>(ENDPOINTS.device(id), {
        method: 'PATCH',
        body: { status },
    });
}

/** Registers a new device. */
export async function createDevice(input: NewDevice): Promise<Device> {
    return request<Device>(ENDPOINTS.devices, { method: 'POST', body: input });
}

/** Removes a device (and its sensor readings). */
export async function deleteDevice(id: number): Promise<void> {
    await request<void>(ENDPOINTS.device(id), { method: 'DELETE' });
}

// App preferences (notifications / auto-connect) are not part of the database
// schema, so they are kept on the device for the current session only.
let settingsStore: AppSettings = { ...defaultSettings };

/** Loads the user's app settings. */
export async function getSettings(): Promise<AppSettings> {
    return { ...settingsStore };
}

/** Saves the user's app settings. */
export async function updateSettings(
    settings: AppSettings
): Promise<AppSettings> {
    settingsStore = { ...settings };
    return { ...settingsStore };
}
