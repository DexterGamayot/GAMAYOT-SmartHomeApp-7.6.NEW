import React, { useState } from 'react';

import {
  Alert,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { useIoT } from '../../context/IoTContext';
import { useTheme } from '../../theme/useTheme';
import { Device } from '../../models/IoTModels';
import Banner from '../../components/Banner';
import DeviceCard from '../../components/DeviceCard';
import EmptyState from '../../components/EmptyState';
import AddDeviceModal from '../../components/AddDeviceModal';

// Alert.alert with buttons is not supported on web, so fall back to confirm().
function confirmRemove(device: Device, onConfirm: () => void) {
  const message = `Remove ${device.name}? This cannot be undone.`;

  if (Platform.OS === 'web') {
    if (window.confirm(message)) onConfirm();
    return;
  }

  Alert.alert('Remove device', message, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Remove', style: 'destructive', onPress: onConfirm },
  ]);
}

export default function DevicesScreen() {

  const {
    devices,
    devicesLoading,
    devicesError,
    refreshDevices,
    updatingDeviceId,
    deviceUpdateError,
    deviceActionLoading,
    deviceActionMessage,
    clearDeviceMessages,
    toggleDevice,
    addDevice,
    removeDevice,
    gatewayConnected,
    gatewayConnecting,
    gatewayError,
    connectGateway,
  } = useIoT();

  const theme = useTheme();
  const [addVisible, setAddVisible] = useState(false);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={devicesLoading} onRefresh={refreshDevices} />
        }
      >

        <Text style={[styles.title, { color: theme.text }]}>
          Devices
        </Text>

        <Text style={[styles.subtitle, { color: theme.mutedText }]}>
          Control your connected devices
        </Text>

        <Pressable
          style={[styles.addButton, { backgroundColor: theme.primary }]}
          onPress={() => {
            clearDeviceMessages();
            setAddVisible(true);
          }}
          accessibilityRole="button"
          accessibilityLabel="Add device"
        >
          <Ionicons name="add-circle-outline" size={20} color={theme.onPrimary} />
          <Text style={[styles.addButtonText, { color: theme.onPrimary }]}>
            Add Device
          </Text>
        </Pressable>

        {!gatewayConnecting && !gatewayConnected && (
          <Banner
            variant="error"
            message={gatewayError ?? 'IoT Gateway is disconnected.'}
            actionLabel="Retry"
            onAction={connectGateway}
          />
        )}

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

        {deviceActionMessage && (
          <Banner
            variant="success"
            message={deviceActionMessage}
            onDismiss={clearDeviceMessages}
          />
        )}

        {devicesLoading && (
          <Banner variant="loading" message="Loading devices..." />
        )}

        {!devicesLoading && !devicesError && devices.length === 0 && (
          <EmptyState
            icon="hardware-chip-outline"
            title="No devices yet"
            message="Tap Add Device to register your first smart device."
          />
        )}

        {devices.map((device) => {

          const isUpdating = updatingDeviceId === device.id;

          return (
            <DeviceCard
              key={device.id}
              device={device}
              showType
              isUpdating={isUpdating}
              disabled={!gatewayConnected || isUpdating}
              onToggle={(value) => toggleDevice(device.id, value)}
              onRemove={() => confirmRemove(device, () => removeDevice(device.id))}
            />
          );

        })}

      </ScrollView>

      <AddDeviceModal
        visible={addVisible}
        submitting={deviceActionLoading}
        onClose={() => setAddVisible(false)}
        onSubmit={addDevice}
      />
    </View>
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

  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },

  subtitle: {
    fontSize: 14,
    marginTop: 5,
    marginBottom: 20,
  },

  addButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
  },

  addButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
  },

});
