import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeColors } from '../lib/ThemeContext';
import { useT } from '../lib/LanguageContext';

interface ConclusionScreenProps {
  taskTitle: string;
  onSave: (how: string, why: string) => void;
  streakCount: number;
}

export default function ConclusionScreen({ taskTitle, onSave, streakCount }: ConclusionScreenProps) {
  const colors = useThemeColors();
  const $ = useT();
  const [how, setHow] = useState('');
  const [why, setWhy] = useState('');

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={styles.content}>
        <View style={styles.checkWrap}>
          <View style={[styles.checkCircle, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="checkmark-circle" size={48} color={colors.success} />
          </View>
        </View>

        <Text style={[styles.title, { color: colors.text }]}>{$('taskCompleted')}</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>{taskTitle}</Text>

        <View style={[styles.streakBadge, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <MaterialCommunityIcons name="fire" size={16} color="#f97316" />
          <Text style={{ fontSize: 15, color: colors.textSecondary, fontWeight: '500' }}>
            {$('streak')}: <Text style={{ color: colors.text, fontWeight: '700' }}>{streakCount} {$('days')}</Text>
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{$('quickReflection')}</Text>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textMuted }]}>{$('howDidYouDo')}</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }]}
              value={how}
              onChangeText={setHow}
              placeholder={$('howPlaceholder')}
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={2}
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textMuted }]}>{$('whyImportant')}</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }]}
              value={why}
              onChangeText={setWhy}
              placeholder={$('whyPlaceholder')}
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={2}
            />
          </View>
        </View>

        <Pressable onPress={() => onSave(how.trim(), why.trim())} style={[styles.finishBtn, { backgroundColor: colors.accentBg }]}>
          <Text style={[styles.finishBtnText, { color: colors.accentText }]}>{$('saveReflection')}</Text>
          <Ionicons name="arrow-forward" size={16} color={colors.accentText} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'absolute', inset: 0, zIndex: 50, justifyContent: 'center', alignItems: 'center', padding: 24 },
  content: { width: '100%', maxWidth: 432, alignItems: 'center', gap: 20 },
  checkWrap: { alignItems: 'center' },
  checkCircle: { width: 80, height: 80, borderRadius: 40, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '700', letterSpacing: -0.5 },
  subtitle: { fontSize: 17, textAlign: 'center' },
  streakBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999 },
  card: { width: '100%', borderWidth: 1, borderRadius: 16, padding: 20, gap: 16 },
  cardTitle: { fontSize: 18, fontWeight: '700', letterSpacing: -0.3 },
  field: { gap: 6 },
  label: { fontSize: 15, fontWeight: '600' },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, minHeight: 56, textAlignVertical: 'top' },
  finishBtn: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 14, borderRadius: 14 },
  finishBtnText: { fontSize: 17, fontWeight: '700' },
});
