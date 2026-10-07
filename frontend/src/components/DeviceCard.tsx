import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Device } from '../models/IoTModels';
import { useTheme } from '../theme/useTheme';

type Props = {
  device: Device;
  isUpdating: boolean;
  disabled: boolean;
  showType?: boolean;
  onToggle: (value: boolean) => void;
  onRemove?: () => void;
};

// Used by both the Dashboard and the Devices screen.
export default function DeviceCard({ device, isUpdating, disabled, showType, onToggle, onRemove }: Props) {
  const theme = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={styles.info}>
        <Ionicons name={device.icon} size={28} color={theme.text} style={styles.icon} />

        <View style={styles.details}>
          <Text style={[styles.name, { color: theme.text }]}>{device.name}</Text>
          {showType && <Text style={[styles.type, { color: theme.mutedText }]}>{device.type}</Text>}
          <Text style={[styles.state, { color: theme.mutedText }]}>
            {isUpdating ? 'Updating...' : device.status ? 'ON' : 'OFF'}
          </Text>
        </View>
      </View>

      {isUpdating ? (
        <ActivityIndicator size="small" color={theme.text} />
      ) : (
        <Switch
          value={device.status}
          disabled={disabled}
          onValueChange={onToggle}
          accessibilityLabel={`${device.name} power`}
        />
      )}

      {onRemove && (
        <Pressable
          style={styles.remove}
          onPress={onRemove}
          disabled={isUpdating}
          accessibilityRole="button"
          accessibilityLabel={`Remove ${device.name}`}
          hitSlop={8}
        >
          <Ionicons name="trash-outline" size={22} color={theme.danger} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 12,
  },
  info: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  icon: { marginRight: 15 },
  details: { flex: 1 },
  name: { fontSize: 16, fontWeight: 'bold' },
  type: { fontSize: 13, marginTop: 3 },
  state: { fontSize: 12, marginTop: 4 },
  remove: { marginLeft: 14 },
});
