import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Pressable,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { useIoT } from '../../context/IoTContext';
import { useTheme } from '../../theme/useTheme';
import Banner from '../../components/Banner';



export default function SensorsScreen() {

  const {
    sensors,
    sensorsLoading,
    sensorsError,
    refreshSensors,
  } = useIoT();

  const theme = useTheme();

  const cards = [
    { name: 'Temperature', icon: 'thermometer-outline', value: `${sensors.temperature} °C`, description: 'Current room temperature' },
    { name: 'Humidity', icon: 'water-outline', value: sensors.humidity === undefined ? '—' : `${sensors.humidity} %`, description: 'Current relative humidity' },
    { name: 'Light Level', icon: 'sunny-outline', value: `${sensors.lightLevel} lux`, description: 'Current ambient light' },
  ] as const;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}
    >

      <Text style={[styles.title, { color: theme.text }]}>
        Sensors
      </Text>

      <Text style={[styles.subtitle, { color: theme.mutedText }]}>
        Monitor your environment
      </Text>

      {sensorsError && (
        <Banner
          variant="error"
          message={sensorsError}
          actionLabel="Retry"
          onAction={refreshSensors}
        />
      )}

      {sensorsLoading && (
        <Banner variant="loading" message="Refreshing Sensors..." />
      )}

      {cards.map((card) => (
        <View
          key={card.name}
          style={[styles.sensorCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
        >

          <View style={styles.sensorHeader}>
            <Ionicons name={card.icon} size={30} color={theme.text} />
            <Text style={[styles.sensorName, { color: theme.text }]}>
              {card.name}
            </Text>
          </View>

          <Text style={[styles.sensorValue, { color: theme.text }]}>
            {card.value}
          </Text>

          <Text style={[styles.sensorDescription, { color: theme.mutedText }]}>
            {card.description}
          </Text>

        </View>
      ))}

      <Pressable
        style={[
          styles.refreshButton,
          { backgroundColor: theme.primary },
          sensorsLoading && styles.refreshButtonDisabled,
        ]}
        onPress={refreshSensors}
        disabled={sensorsLoading}
        accessibilityRole="button"
        accessibilityLabel="Refresh sensors"
      >

        {sensorsLoading ? (
          <ActivityIndicator size="small" color={theme.onPrimary} />
        ) : (
          <Ionicons name="refresh-outline" size={20} color={theme.onPrimary} />
        )}

        <Text style={[styles.refreshButtonText, { color: theme.onPrimary }]}>
          {sensorsLoading ? 'Refreshing Sensors...' : 'Refresh Sensors'}
        </Text>

      </Pressable>

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

  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },

  subtitle: {
    fontSize: 14,
    marginTop: 5,
    marginBottom: 25,
  },







  sensorCard: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 15,
  },

  sensorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  sensorName: {
    fontSize: 17,
    fontWeight: 'bold',
  },

  sensorValue: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 20,
  },

  sensorDescription: {
    fontSize: 13,
    marginTop: 5,
  },

  refreshButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 15,
    marginBottom: 30,
  },

  refreshButtonDisabled: {
    opacity: 0.7,
  },

  refreshButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
  },

});
