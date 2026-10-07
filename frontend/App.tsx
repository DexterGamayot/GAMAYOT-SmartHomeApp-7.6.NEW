import React from 'react';
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import DrawerNavigator from './src/navigation/DrawerNavigator';
import { IoTProvider, useIoT } from './src/context/IoTContext';

function AppNavigation() {
  const { darkMode } = useIoT();

  return (
    <NavigationContainer theme={darkMode ? DarkTheme : DefaultTheme}>
      <StatusBar style={darkMode ? 'light' : 'dark'} />
      <DrawerNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <IoTProvider >
      <AppNavigation />
    </IoTProvider>

  );
}
