import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/useTheme';

type Props = {
  variant: 'error' | 'loading' | 'success';
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss?: () => void;
};

// Shared status banner for loading / error / success messages.
export default function Banner({ variant, message, actionLabel, onAction, onDismiss }: Props) {
  const theme = useTheme();

  const background =
    variant === 'error' ? theme.dangerBackground
    : variant === 'success' ? theme.successBackground
    : theme.banner;
  const color =
    variant === 'error' ? theme.danger
    : variant === 'success' ? theme.success
    : theme.text;

  return (
    <View
      style={[styles.banner, { backgroundColor: background }]}
      accessibilityRole={variant === 'error' ? 'alert' : undefined}
    >
      {variant === 'loading' ? (
        <ActivityIndicator size="small" color={color} />
      ) : (
        <Ionicons
          name={variant === 'error' ? 'alert-circle-outline' : 'checkmark-circle-outline'}
          size={20}
          color={color}
        />
      )}

      <Text style={[styles.text, { color }]}>{message}</Text>

      {actionLabel && onAction && (
        <Pressable
          style={[styles.action, { backgroundColor: color }]}
          onPress={onAction}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
        >
          <Text style={[styles.actionText, { color: theme.background }]}>{actionLabel}</Text>
        </Pressable>
      )}

      {onDismiss && (
        <Pressable onPress={onDismiss} accessibilityRole="button" accessibilityLabel="Dismiss message" hitSlop={8}>
          <Ionicons name="close" size={18} color={color} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 15,
    gap: 10,
  },
  text: { flex: 1, fontSize: 13 },
  action: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 8 },
  actionText: { fontSize: 12, fontWeight: 'bold' },
});
