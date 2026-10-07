import React from 'react';
import {
    RefreshControl,
    ScrollView,
    View,
    Text,
    StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useIoT } from '../../context/IoTContext';
import { useTheme } from '../../theme/useTheme';
import Banner from '../../components/Banner';
import DeviceCard from '../../components/DeviceCard';
import EmptyState from '../../components/EmptyState';

function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
}

export default function DashboardScreen() {

    const {
        devices,
        devicesLoading,
        devicesError,
        refreshDevices,
        sensors,
        sensorsLoading,
        sensorsError,
        refreshSensors,
        updatingDeviceId,
        deviceUpdateError,
        clearDeviceMessages,
        toggleDevice,
        gatewayConnected,
        gatewayConnecting,
        gatewayError,
        connectGateway,
    } = useIoT();

    const theme = useTheme();

    const sensorCards = [
        { label: 'Temperature', icon: 'thermometer-outline', value: `${sensors.temperature}°C` },
        { label: 'Humidity', icon: 'water-outline', value: sensors.humidity === undefined ? '—' : `${sensors.humidity}%` },
        { label: 'Light', icon: 'sunny-outline', value: `${sensors.lightLevel} lux` },
    ] as const;

    const refreshAll = () => {
        refreshDevices();
        refreshSensors();
    };

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: theme.background }]}
            contentContainerStyle={styles.content}
            refreshControl={
                <RefreshControl
                    refreshing={devicesLoading || sensorsLoading}
                    onRefresh={refreshAll}
                />
            }
        >

            <Text style={[styles.greeting, { color: theme.mutedText }]}>
                {getGreeting()}
            </Text>

            <Text style={[styles.title, { color: theme.text }]}>
                IoT Dashboard
            </Text>

            {!gatewayConnecting && !gatewayConnected && (
                <View style={styles.bannerSpacing}>
                    <Banner
                        variant="error"
                        message={gatewayError ?? 'IoT Gateway is disconnected.'}
                        actionLabel="Retry"
                        onAction={connectGateway}
                    />
                </View>
            )}

            {sensorsError && (
                <View style={styles.bannerSpacing}>
                    <Banner
                        variant="error"
                        message={sensorsError}
                        actionLabel="Retry"
                        onAction={refreshSensors}
                    />
                </View>
            )}

            <View style={styles.sensorRow}>
                {sensorCards.map((card) => (
                    <View
                        key={card.label}
                        style={[styles.sensorCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
                    >
                        <View style={styles.sensorHeader}>
                            <Ionicons name={card.icon} size={22} color={theme.text} />
                            <Text style={[styles.sensorLabel, { color: theme.mutedText }]}>
                                {card.label}
                            </Text>
                        </View>

                        <Text style={[styles.sensorValue, { color: theme.text }]}>
                            {card.value}
                        </Text>
                    </View>
                ))}
            </View>

            <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Device Status
            </Text>

            {devicesError && (
                <Banner
                    variant="error"
                    message={devicesError}
                    actionLabel="Retry"
                    onAction={refreshDevices}
                />
            )}

            {deviceUpdateError && (
                <Banner
                    variant="error"
                    message={deviceUpdateError}
                    onDismiss={clearDeviceMessages}
                />
            )}

            {devicesLoading && devices.length === 0 && (
                <Banner variant="loading" message="Loading devices..." />
            )}

            {!devicesLoading && !devicesError && devices.length === 0 && (
                <EmptyState
                    icon="hardware-chip-outline"
                    title="No devices yet"
                    message="Add a device from the Devices screen to see it here."
                />
            )}

            {devices.map((device) => {

                const isUpdating = updatingDeviceId === device.id;

                return (
                    <DeviceCard
                        key={device.id}
                        device={device}
                        isUpdating={isUpdating}
                        disabled={!gatewayConnected || isUpdating}
                        onToggle={(value) => toggleDevice(device.id, value)}
                    />
                );
            })}
        </ScrollView>
    );
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
    },

    content: {
        flexGrow: 1,
        padding: 20,
    },

    greeting: {
        fontSize: 14,
    },

    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginTop: 5,
    },

    bannerSpacing: {
        marginTop: 15,
    },

    sensorRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginTop: 25,
    },

    sensorCard: {
        flexGrow: 1,
        flexBasis: 140,
        padding: 20,
        borderRadius: 12,
        borderWidth: 2,
    },

    sensorHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },

    sensorLabel: {
        fontSize: 14,
    },

    sensorValue: {
        fontSize: 28,
        fontWeight: 'bold',
        marginTop: 10,
    },

    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 30,
        marginBottom: 12,
    },

});
