import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from 'react';

import {
    AppSettings,
    Device,
    NewDevice,
    SensorData,
    defaultSettings,
} from '../models/IoTModels';
import * as IoTService from '../services/IoTService';



type IoTContextType = {

    // Devices
    devices: Device[];
    devicesLoading: boolean;
    devicesError: string | null;
    refreshDevices: () => Promise<void>;

    updatingDeviceId: number | null;
    deviceUpdateError: string | null;
    toggleDevice: (id: number, value: boolean) => Promise<void>;

    // Device management (add / remove) — returns true on success
    deviceActionLoading: boolean;
    deviceActionMessage: string | null;
    clearDeviceMessages: () => void;
    addDevice: (input: NewDevice) => Promise<boolean>;
    removeDevice: (id: number) => Promise<boolean>;

    // Sensors
    sensors: SensorData;
    sensorsLoading: boolean;
    sensorsError: string | null;
    refreshSensors: () => Promise<void>;

    // Gateway connection
    gatewayConnected: boolean;
    gatewayConnecting: boolean;
    gatewayError: string | null;
    connectGateway: () => Promise<void>;

    // App settings
    settings: AppSettings;
    settingsError: string | null;
    updateSettings: (changes: Partial<AppSettings>) => Promise<void>;

    // App appearance
    darkMode: boolean;
    setDarkMode: (value: boolean) => void;
};

const IoTContext = createContext<IoTContextType | undefined>(undefined);


const initialSensors: SensorData = {
    temperature: 0,
    lightLevel: 0,
};

export function IoTProvider({
    children,
}: {
    children: React.ReactNode;
}) {

    // Devices
    const [devices, setDevices] = useState<Device[]>([]);
    const [devicesLoading, setDevicesLoading] = useState(false);
    const [devicesError, setDevicesError] = useState<string | null>(null);

    const [updatingDeviceId, setUpdatingDeviceId] = useState<number | null>(null);
    const [deviceUpdateError, setDeviceUpdateError] = useState<string | null>(null);

    const [deviceActionLoading, setDeviceActionLoading] = useState(false);
    const [deviceActionMessage, setDeviceActionMessage] = useState<string | null>(null);

    // Sensors
    const [sensors, setSensors] = useState<SensorData>(initialSensors);
    const [sensorsLoading, setSensorsLoading] = useState(false);
    const [sensorsError, setSensorsError] = useState<string | null>(null);

    // Gateway
    const [gatewayConnected, setGatewayConnected] = useState(false);
    const [gatewayConnecting, setGatewayConnecting] = useState(false);
    const [gatewayError, setGatewayError] = useState<string | null>(null);

    // App settings
    const [settings, setSettings] = useState<AppSettings>(defaultSettings);
    const [settingsError, setSettingsError] = useState<string | null>(null);

    // App appearance
    const [darkMode, setDarkMode] = useState(false);

    const connectGateway = useCallback(async () => {

        setGatewayConnecting(true);
        setGatewayError(null);

        try {
            await IoTService.connectGateway();
            setGatewayConnected(true);
        } catch (error) {
            setGatewayConnected(false);
            setGatewayError('IoT Gateway is disconnected.');
        } finally {
            setGatewayConnecting(false);
        }

    }, []);

    const refreshDevices = useCallback(async () => {

        setDevicesLoading(true);
        setDevicesError(null);

        try {
            const data = await IoTService.getDevices();
            setDevices(data);
        } catch (error) {
            setDevicesError('Unable to load devices.');
        } finally {
            setDevicesLoading(false);
        }

    }, []);

    const refreshSensors = useCallback(async () => {

        setSensorsLoading(true);
        setSensorsError(null);

        try {
            const data = await IoTService.getSensorData();
            setSensors(data);
        } catch (error) {
            setSensorsError('Unable to retrieve sensor data.');
        } finally {
            setSensorsLoading(false);
        }

    }, []);

    const toggleDevice = useCallback(async (
        id: number,
        value: boolean
    ) => {

        if (!gatewayConnected) {
            setDeviceUpdateError('Connect to the IoT gateway to control devices.');
            return;
        }

        setDeviceUpdateError(null);
        setUpdatingDeviceId(id);

       setDevices((current) => current.map((device) => (
            device.id === id ? { ...device, status: value } : device
        )));

        try {

            const updated = await IoTService.updateDeviceStatus(id, value);

            setDevices((current) => current.map((device) => (
                device.id === id ? updated : device
            )));

        } catch (error) {

            setDevices((current) => current.map((device) => (
                device.id === id ? { ...device, status: !value } : device
            )));

            setDeviceUpdateError(
                error instanceof Error
                    ? error.message
                    : 'Unable to update device.'
            );

        } finally {
            setUpdatingDeviceId(null);
        }

    }, [gatewayConnected]);

    const clearDeviceMessages = useCallback(() => {
        setDeviceUpdateError(null);
        setDeviceActionMessage(null);
    }, []);

    const addDevice = useCallback(async (input: NewDevice) => {

        setDeviceActionLoading(true);
        setDeviceUpdateError(null);
        setDeviceActionMessage(null);

        try {
            const created = await IoTService.createDevice(input);
            setDevices((current) => [...current, created]);
            setDeviceActionMessage(`${created.name} was added.`);
            return true;
        } catch (error) {
            setDeviceUpdateError(
                error instanceof Error ? error.message : 'Unable to add the device.'
            );
            return false;
        } finally {
            setDeviceActionLoading(false);
        }

    }, []);

    const removeDevice = useCallback(async (id: number) => {

        setDeviceActionLoading(true);
        setDeviceUpdateError(null);
        setDeviceActionMessage(null);

        try {
            await IoTService.deleteDevice(id);
            setDevices((current) => current.filter((device) => device.id !== id));
            setDeviceActionMessage('Device removed.');
            return true;
        } catch (error) {
            setDeviceUpdateError(
                error instanceof Error ? error.message : 'Unable to remove the device.'
            );
            return false;
        } finally {
            setDeviceActionLoading(false);
        }

    }, []);

    // Optimistic update; reverts and reports an error if saving fails.
    const updateSettings = useCallback(async (changes: Partial<AppSettings>) => {

        const previous = settings;
        const next = { ...settings, ...changes };

        setSettings(next);
        setSettingsError(null);

        try {
            setSettings(await IoTService.updateSettings(next));
        } catch (error) {
            setSettings(previous);
            setSettingsError('Unable to save settings.');
        }

    }, [settings]);

    useEffect(() => {

        // Load saved settings first so "Auto Connect" is respected at startup.
        (async () => {
            let loaded = defaultSettings;
            try {
                loaded = await IoTService.getSettings();
                setSettings(loaded);
            } catch (error) {
                setSettingsError('Unable to load settings.');
            }

            if (loaded.autoConnect) {
                connectGateway();
            }
        })();

        refreshDevices();
        refreshSensors();

    }, [connectGateway, refreshDevices, refreshSensors]);

    return (
        <IoTContext.Provider
            value={{
                devices,
                devicesLoading,
                devicesError,
                refreshDevices,

                updatingDeviceId,
                deviceUpdateError,
                toggleDevice,

                deviceActionLoading,
                deviceActionMessage,
                clearDeviceMessages,
                addDevice,
                removeDevice,

                sensors,
                sensorsLoading,
                sensorsError,
                refreshSensors,

                gatewayConnected,
                gatewayConnecting,
                gatewayError,
                connectGateway,

                settings,
                settingsError,
                updateSettings,

                darkMode,
                setDarkMode,
            }}
        >
            {children}
        </IoTContext.Provider>
    );
}

export function useIoT() {

    const context = useContext(IoTContext);

    if (!context) {
        throw new Error(
            'useIoT must be used inside IoTProvider'
        );
    }

    return context;
}
