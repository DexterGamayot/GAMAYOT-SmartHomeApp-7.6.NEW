import { Ionicons } from '@expo/vector-icons';



export type Device = {
    id: number;
    name: string;
    type: string;
    icon: keyof typeof Ionicons.glyphMap;
    status: boolean;
};

export type SensorData = {
    temperature: number;
    humidity?: number; // not stored in the database, so usually absent
    lightLevel: number;
};
export type NewDevice = {
    name: string;
    type: string;
    icon: keyof typeof Ionicons.glyphMap;
};

export type AppSettings = {
    notifications: boolean;
    autoConnect: boolean;
};

export const defaultSettings: AppSettings = {
    notifications: true,
    autoConnect: true,
};

// Device types the user can pick when adding a device.
export const deviceTypeOptions: NewDevice['type'][] = [
    'Smart Light',
    'Smart Fan',
    'Smart Lock',
    'Smart Plug',
];

export const deviceTypeIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
    'Smart Light': 'bulb-outline',
    'Smart Fan': 'sync-outline',
    'Smart Lock': 'lock-closed-outline',
    'Smart Plug': 'flash-outline',
};
