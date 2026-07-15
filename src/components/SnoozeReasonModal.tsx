import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../lib/ThemeContext';
import { useT } from '../lib/LanguageContext';

interface SnoozeReasonModalProps {
  taskTitle: string;
  onSaveReason: (reason: string) => void;
  onDismiss: () => void;
}

export default function SnoozeReasonModal({ taskTitle, onSaveReason, onDismiss }: SnoozeReasonModalProps) {
  const colors = useThemeColors();
  const $ = useT();
  const [reason, setReason] = useState('');
  const canSave = reason.trim().length > 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={styles.content}>
        <View style={[styles.iconCircle, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="time-outline" size={40} color={colors.warning} />
        </View>

        <Text style={[styles.title, { color: colors.text }]}>{$('snoozeReason')}</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>{taskTitle}</Text>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.label, { color: colors.textMuted }]}>{$('whatReason')}</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }]}
            value={reason}
            onChangeText={setReason}
            placeholder={$('snoozeReasonPlaceholder')}
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={3}
            autoFocus
          />
        </View>

        <View style={styles.buttons}>
          <Pressable onPress={onDismiss} style={[styles.cancelBtn, { borderColor: colors.border }]}>
            <Text style={[styles.cancelBtnText, { color: colors.textMuted }]}>{$('justIgnore')}</Text>
          </Pressable>
          <Pressable
            onPress={() => onSaveReason(reason.trim())}
            style={[styles.saveBtn, { backgroundColor: colors.warning }, !canSave && { opacity: 0.5 }]}
            disabled={!canSave}
          >
            <Text style={[styles.saveBtnText, { color: '#fff' }]}>{$('snoozeWithReason')}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'absolute', inset: 0, zIndex: 50, justifyContent: 'center', alignItems: 'center', padding: 24 },
  content: { width: '100%', maxWidth: 432, alignItems: 'center', gap: 16 },
  iconCircle: { width: 72, height: 72, borderRadius: 36, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '700', letterSpacing: -0.3 },
  subtitle: { fontSize: 17, textAlign: 'center' },
  card: { width: '100%', borderWidth: 1, borderRadius: 16, padding: 20, gap: 10 },
  label: { fontSize: 15, fontWeight: '600' },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, minHeight: 72, textAlignVertical: 'top' },
  buttons: { flexDirection: 'row', gap: 12, width: '100%' },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, borderWidth: 1, alignItems: 'center' },
  cancelBtnText: { fontSize: 15, fontWeight: '600' },
  saveBtn: { flex: 2, paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  saveBtnText: { fontSize: 15, fontWeight: '700' },
});