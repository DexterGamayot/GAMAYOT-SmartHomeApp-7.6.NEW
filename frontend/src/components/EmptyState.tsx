import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/useTheme';

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
};

export default function EmptyState({ icon, title, message }: Props) {
  const theme = useTheme();
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={44} color={theme.mutedText} />
      <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
      <Text style={[styles.message, { color: theme.mutedText }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 20 },
  title: { fontSize: 17, fontWeight: 'bold', marginTop: 12 },
  message: { fontSize: 13, textAlign: 'center', marginTop: 6 },
});
