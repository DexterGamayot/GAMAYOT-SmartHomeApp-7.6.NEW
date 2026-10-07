import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  ActivityIndicator,
  Pressable,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useIoT } from '../../context/IoTContext';
import { useTheme } from '../../theme/useTheme';
import Banner from '../../components/Banner';

export default function SettingsScreen() {

  const {
    darkMode,
    setDarkMode,
    settings,
    settingsError,
    updateSettings,
    gatewayConnected,
    gatewayConnecting,
    gatewayError,
    connectGateway,
  } = useIoT();
  const theme = useTheme();

  const connectionStatus = gatewayConnecting
    ? 'Connecting...'
    : gatewayConnected
      ? 'Connected'
      : 'Disconnected';

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}
    >


      <Text style={[styles.title, { color: theme.text }]}>
        Settings
      </Text>

      <Text style={[styles.subtitle, { color: theme.mutedText }]}>
        Configure your IoT application
      </Text>


  

      {settingsError && (
        <Banner variant="error" message={settingsError} />
      )}

      <Text style={[styles.sectionTitle, { color: theme.text }]}>
        General
      </Text>




      <View style={[styles.settingCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>

        <View style={styles.settingInfo}>

          <Ionicons
            name="notifications-outline"
            size={26}
            color={theme.text}
          />

          <View style={styles.settingText}>

            <Text style={[styles.settingName, { color: theme.text }]}>
              Notifications
            </Text>

            <Text style={[styles.settingDescription, { color: theme.mutedText }]}>
              Receive alerts from your IoT devices
            </Text>

          </View>

        </View>

        <Switch
          value={settings.notifications}
          onValueChange={(value) => updateSettings({ notifications: value })}
          accessibilityLabel="Notifications"

        />

      </View>



      <View style={[styles.settingCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>

        <View style={styles.settingInfo}>

          <Ionicons
            name="wifi-outline"
            size={26}
            color={theme.text}
          />

          <View style={styles.settingText}>

            <Text style={[styles.settingName, { color: theme.text }]}>
              Auto Connect
            </Text>

            <Text style={[styles.settingDescription, { color: theme.mutedText }]}>
              Automatically connect to the IoT gateway
            </Text>

          </View>

        </View>

        <Switch
          value={settings.autoConnect}
          onValueChange={(value) => updateSettings({ autoConnect: value })}
          accessibilityLabel="Auto connect"

        />

      </View>


   

      <View style={[styles.settingCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>

        <View style={styles.settingInfo}>

          <Ionicons
            name="moon-outline"
            size={26}
            color={theme.text}
          />

          <View style={styles.settingText}>

            <Text style={[styles.settingName, { color: theme.text }]}>
              Dark Mode
            </Text>

            <Text style={[styles.settingDescription, { color: theme.mutedText }]}>
              Use a darker application appearance
            </Text>

          </View>

        </View>

        <Switch
          value={darkMode}
          onValueChange={setDarkMode}
          accessibilityLabel="Dark mode"
        />

      </View>


      <Text style={[styles.sectionTitle, { color: theme.text }]}>
        Connection
      </Text>


      <View style={[styles.connectionCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>

        <View style={styles.connectionInfo}>

          <Ionicons
            name={gatewayConnected ? 'cloud-done-outline' : 'cloud-offline-outline'}
            size={30}
            color={theme.text}
          />

          <View>

            <Text style={[styles.connectionTitle, { color: theme.text }]}>
              IoT Gateway
            </Text>

            <Text style={[styles.connectionStatus, { color: theme.mutedText }]}>
              {connectionStatus}
            </Text>

            {!gatewayConnected && !gatewayConnecting && gatewayError && (
              <Text style={[styles.connectionStatus, { color: theme.danger }]}>
                {gatewayError}
              </Text>
            )}

          </View>

        </View>

        {!gatewayConnected && (
          <Pressable
            style={[styles.connectButton, { backgroundColor: theme.primary }, gatewayConnecting && { opacity: 0.7 }]}
            onPress={connectGateway}
            disabled={gatewayConnecting}
            accessibilityRole="button"
            accessibilityLabel="Connect to gateway"
          >
            {gatewayConnecting ? (
              <ActivityIndicator size="small" color={theme.onPrimary} />
            ) : (
              <Text style={[styles.connectButtonText, { color: theme.onPrimary }]}>
                Connect
              </Text>
            )}
          </Pressable>
        )}

      </View>

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

  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 10,
  },

  settingCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 12,
  },

  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  settingText: {
    marginLeft: 15,
    flex: 1,
  },

  settingName: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  settingDescription: {
    fontSize: 12,
    marginTop: 4,
  },

  connectionCard: {
    padding: 18,
    borderRadius: 12,
    borderWidth: 2,
  },

  connectionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  connectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 15,
  },

  connectButton: {
    marginTop: 14,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },

  connectButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },

  connectionStatus: {
    fontSize: 13,
    marginLeft: 15,
    marginTop: 3,
  },

});
