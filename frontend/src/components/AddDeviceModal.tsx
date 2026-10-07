import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { NewDevice, deviceTypeIcons, deviceTypeOptions } from '../models/IoTModels';
import { useTheme } from '../theme/useTheme';

type Props = {
  visible: boolean;
  submitting: boolean;
  onClose: () => void;
  // Resolves true when the device was saved (modal then closes).
  onSubmit: (device: NewDevice) => Promise<boolean>;
};

export default function AddDeviceModal({ visible, submitting, onClose, onSubmit }: Props) {
  const theme = useTheme();
  const [name, setName] = useState('');
  const [type, setType] = useState(deviceTypeOptions[0]);
  const [touched, setTouched] = useState(false);

  const trimmed = name.trim();
  const nameError = trimmed.length === 0 ? 'Device name is required.' : trimmed.length > 40 ? 'Keep the name under 40 characters.' : null;

  const reset = () => {
    setName('');
    setType(deviceTypeOptions[0]);
    setTouched(false);
  };

  const handleClose = () => {
    if (submitting) return;
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    setTouched(true);
    if (nameError) return;
    const ok = await onSubmit({ name: trimmed, type, icon: deviceTypeIcons[type] });
    if (ok) {
      reset();
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={[styles.overlay, { backgroundColor: theme.overlay }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.sheet, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.title, { color: theme.text }]}>Add Device</Text>

          <Text style={[styles.label, { color: theme.text }]}>Name</Text>
          <TextInput
            style={[styles.input, { color: theme.text, borderColor: touched && nameError ? theme.danger : theme.border }]}
            value={name}
            onChangeText={setName}
            onBlur={() => setTouched(true)}
            placeholder="e.g. Kitchen Light"
            placeholderTextColor={theme.mutedText}
            editable={!submitting}
            maxLength={60}
            accessibilityLabel="Device name"
          />
          {touched && nameError && <Text style={[styles.error, { color: theme.danger }]}>{nameError}</Text>}

          <Text style={[styles.label, { color: theme.text }]}>Type</Text>
          <View style={styles.chips}>
            {deviceTypeOptions.map((option) => {
              const selected = option === type;
              return (
                <Pressable
                  key={option}
                  onPress={() => setType(option)}
                  disabled={submitting}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  style={[
                    styles.chip,
                    { borderColor: theme.border },
                    selected && { backgroundColor: theme.primary, borderColor: theme.primary },
                  ]}
                >
                  <Text style={{ color: selected ? theme.onPrimary : theme.text, fontSize: 13 }}>{option}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.actions}>
            <Pressable style={[styles.button, { borderColor: theme.border, borderWidth: 1 }]} onPress={handleClose} disabled={submitting} accessibilityRole="button">
              <Text style={{ color: theme.text, fontWeight: 'bold' }}>Cancel</Text>
            </Pressable>
            <Pressable style={[styles.button, { backgroundColor: theme.primary }, submitting && { opacity: 0.7 }]} onPress={handleSubmit} disabled={submitting} accessibilityRole="button">
              {submitting ? <ActivityIndicator size="small" color={theme.onPrimary} /> : <Text style={{ color: theme.onPrimary, fontWeight: 'bold' }}>Add Device</Text>}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', padding: 20 },
  sheet: { borderRadius: 16, borderWidth: 2, padding: 20, width: '100%', maxWidth: 480, alignSelf: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  label: { fontSize: 14, fontWeight: 'bold', marginTop: 14, marginBottom: 6 },
  input: { borderWidth: 2, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15 },
  error: { fontSize: 12, marginTop: 4 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1, borderRadius: 20, paddingVertical: 8, paddingHorizontal: 14 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 24 },
  button: { minWidth: 100, alignItems: 'center', justifyContent: 'center', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10 },
});
