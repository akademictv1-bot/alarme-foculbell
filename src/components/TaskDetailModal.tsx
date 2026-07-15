import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Task, PRIORITY_COLORS } from '../types';
import { useThemeColors } from '../lib/ThemeContext';
import { useT } from '../lib/LanguageContext';

interface TaskDetailModalProps {
  task: Task;
  onClose: () => void;
}

export default function TaskDetailModal({ task, onClose }: TaskDetailModalProps) {
  const colors = useThemeColors();
  const $ = useT();
  const done = task.completed;
  const tc = task.color || PRIORITY_COLORS[task.priority].hex;
  const pc = { bg: `${tc}18`, text: tc, border: `${tc}30` };

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }]}>
        <View style={[styles.handle, { backgroundColor: colors.surfaceLight }]} />
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{$('taskDetails')}</Text>
          <Pressable onPress={onClose} style={[styles.closeBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="close" size={20} color={colors.textMuted} />
          </Pressable>
        </View>

        <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
          <View style={[styles.card, { backgroundColor: colors.bg, borderColor: colors.border }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <View style={[styles.statusBadge, done ? { backgroundColor: 'rgba(16,185,129,0.1)', borderColor: '#10b981' } : { backgroundColor: 'rgba(244,63,94,0.1)', borderColor: '#f43f5e' }]}>
                <Ionicons name={done ? 'checkmark-circle' : 'ellipse'} size={20} color={done ? '#34d399' : '#fb7185'} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.taskTitle, { color: colors.text }]}>{task.title}</Text>
                <Text style={{ fontSize: 14, color: colors.textMuted, marginTop: 2 }}>{done ? $('completedStatus') : $('pendingStatus')}</Text>
              </View>
            </View>

            {task.description ? (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.accentText }]}>{$('description')}</Text>
                <Text style={[styles.detailText, { color: colors.text }]}>{task.description}</Text>
              </View>
            ) : null}

            <View style={styles.divider} />

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              <View style={[styles.tag, { backgroundColor: pc.bg, borderColor: pc.border }]}>
                <Text style={[styles.tagText, { color: pc.text }]}>{task.priority}</Text>
              </View>
              <View style={[styles.tag, { backgroundColor: colors.surfaceLight, borderColor: colors.borderLight }]}>
                <Text style={[styles.tagText, { color: colors.textMuted }]}>{task.category}</Text>
              </View>
              <View style={[styles.tag, { backgroundColor: colors.surfaceLight, borderColor: colors.borderLight }]}>
                <Text style={[styles.tagText, { color: colors.textMuted }]}>{task.repetition}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={{ gap: 12 }}>
              <View style={styles.metaRow}>
                <Ionicons name="calendar-outline" size={16} color={colors.textMuted} />
                <Text style={[styles.metaText, { color: colors.text }]}>{task.date.split('-').reverse().join('/')}</Text>
              </View>
              <View style={styles.metaRow}>
                <Ionicons name="time-outline" size={16} color={colors.textMuted} />
                <Text style={[styles.metaText, { color: colors.text }]}>{task.time}</Text>
              </View>
              <View style={styles.metaRow}>
                <MaterialCommunityIcons name="bell-outline" size={16} color={colors.textMuted} />
                <Text style={[styles.metaText, { color: colors.text }]}>{task.reminder}</Text>
              </View>
            </View>

            {done && (task.reflectionHow || task.reflectionWhy) && (
              <>
                <View style={styles.divider} />
                <Text style={[styles.detailLabel, { color: colors.accentText, marginBottom: 12 }]}>{$('reflection')}</Text>
                {task.reflectionHow && (
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailText, { color: colors.text }]}>
                      <Text style={{ fontWeight: '700' }}>{$('how')}: </Text>{task.reflectionHow}
                    </Text>
                  </View>
                )}
                {task.reflectionWhy && (
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailText, { color: colors.text }]}>
                      <Text style={{ fontWeight: '700' }}>{$('why')}: </Text>{task.reflectionWhy}
                    </Text>
                  </View>
                )}
              </>
            )}

            {!done && task.cancelReason && (
              <>
                <View style={styles.divider} />
                <Text style={[styles.detailLabel, { color: colors.accentText, marginBottom: 12 }]}>{$('cancelReason')}</Text>
                <Text style={[styles.detailText, { color: colors.text }]}>{task.cancelReason}</Text>
              </>
            )}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { position: 'absolute', inset: 0, zIndex: 60, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)' },
  sheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '90%', borderBottomWidth: 0 },
  handle: { width: 40, height: 5, borderRadius: 3, alignSelf: 'center', marginTop: 10 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1 },
  headerTitle: { fontSize: 20, fontWeight: '700', letterSpacing: -0.3 },
  closeBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  body: { padding: 16, flexGrow: 0, paddingBottom: 32 },
  card: { borderWidth: 1, borderRadius: 16, padding: 20 },
  statusBadge: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  taskTitle: { fontSize: 20, fontWeight: '700', letterSpacing: -0.3 },
  detailRow: { marginBottom: 8 },
  detailLabel: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  detailText: { fontSize: 15, lineHeight: 22 },
  divider: { height: 1, backgroundColor: 'rgba(128,128,128,0.15)', marginVertical: 16 },
  tag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, borderWidth: 1 },
  tagText: { fontSize: 12, fontWeight: '600' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  metaText: { fontSize: 15, fontWeight: '500' },
});
