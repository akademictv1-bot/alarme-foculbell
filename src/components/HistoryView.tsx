import { useState, useMemo } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Task } from '../types';
import { useThemeColors } from '../lib/ThemeContext';
import { useT } from '../lib/LanguageContext';
import TaskDetailModal from './TaskDetailModal';

interface HistoryViewProps {
  tasks: Task[];
}

type FilterPeriod = 'Hoje' | 'Semana' | 'Mês';

export default function HistoryView({ tasks }: HistoryViewProps) {
  const colors = useThemeColors();
  const $ = useT();
  const [period, setPeriod] = useState<FilterPeriod>('Hoje');
  const [detailTask, setDetailTask] = useState<Task | null>(null);
  const periods: FilterPeriod[] = ['Hoje', 'Semana', 'Mês'];

  const historicalTasks = useMemo(() => tasks.filter((t) => t.completed || t.ignored), [tasks]);

  const filteredTasks = useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    return historicalTasks
      .filter((t) => {
        if (period === 'Hoje') return t.date === todayStr;

        const taskDate = new Date(t.date + 'T00:00:00');
        const diffMs = todayStart.getTime() - taskDate.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (period === 'Semana') return diffDays >= 0 && diffDays < 7;
        if (period === 'Mês') return diffDays >= 0 && diffDays < 30;
        return true;
      })
      .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
  }, [historicalTasks, period]);

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>{$('disciplineRecord')}</Text>
            <Text style={[styles.title, { color: colors.text }]}>{$('focusHistory')}</Text>
          </View>
          <View style={[styles.countBadge, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={{ fontSize: 15, color: colors.textMuted }}><Text style={{ color: colors.text, fontWeight: '600' }}>{historicalTasks.length}</Text> {$('records')}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={[styles.filterRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {periods.map((p) => {
              const sel = period === p;
              return (
                <Pressable key={p} onPress={() => setPeriod(p)} style={[styles.filterBtn, sel && { backgroundColor: colors.accentBg }]}>
                  <Ionicons name="funnel-outline" size={14} color={sel ? colors.accentText : colors.textMuted} />
                  <Text style={[styles.filterText, { color: colors.textMuted }, sel && { color: colors.accentText }]}>{p === 'Hoje' ? $('todayFilter') : p === 'Semana' ? $('weekFilter') : $('monthFilter')}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          {filteredTasks.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.emptyIcon}><MaterialCommunityIcons name="alert-circle" size={20} color={colors.textMuted} /></View>
              <Text style={{ fontSize: 17, fontWeight: '600', color: colors.text }}>{$('noActivities')}</Text>
              <Text style={{ fontSize: 15, color: colors.textMuted, textAlign: 'center' }}>
                {$('noActivitiesDesc')} ({period.toLowerCase()}).
              </Text>
            </View>
          ) : (
            <View style={[styles.timeline, { borderLeftColor: colors.border }]}>
              {filteredTasks.map((task, idx) => {
                const done = task.completed;
                return (
                  <View key={task.id} style={styles.timelineItem}>
                    <View style={[styles.timelineDot, done ? styles.timelineDotDone : styles.timelineDotIgnored]}>
                      {done ? <Ionicons name="checkmark" size={16} color="#34d399" /> : <Ionicons name="close" size={16} color="#fb7185" />}
                    </View>
                    <Pressable onPress={() => setDetailTask(task)} style={[styles.timelineCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                        <View style={{ flex: 1, gap: 4 }}>
                          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                            <Text style={[styles.prioTag,
                              task.priority === 'Alta' ? sPr.rose : task.priority === 'Média' ? sPr.amber : sPr.emerald,
                            ]}>{task.priority}</Text>
                            <Text style={{ fontSize: 13, color: colors.textMuted }}>{task.time} • {task.date.split('-').reverse().join('/')}</Text>
                          </View>
                          <Text style={[styles.taskTitle, { color: colors.text }, !done && { color: colors.textMuted, textDecorationLine: 'line-through' }]}>{task.title}</Text>
                        </View>
                        <Text style={[styles.catBadge, { backgroundColor: colors.surfaceLight, color: colors.textMuted, borderColor: colors.borderLight }]}>{task.category}</Text>
                      </View>
                      {task.description && (
                        <Text style={{ fontSize: 15, color: colors.textMuted, lineHeight: 22 }} numberOfLines={2}>{task.description}</Text>
                      )}
                      {done && (task.reflectionHow || task.reflectionWhy) && (
                        <View style={[styles.commentCard, { backgroundColor: colors.bg }]}>
                          <Ionicons name="chatbox-outline" size={14} color={colors.textMuted} style={{ marginTop: 2 }} />
                          <View style={{ flex: 1, gap: 4 }}>
                            <Text style={{ fontSize: 15, fontWeight: '500', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>{$('reflection')}</Text>
                            {task.reflectionHow && (
                              <Text style={{ fontSize: 14, lineHeight: 22, color: colors.text }}><Text style={{ fontWeight: '600' }}>{$('how')}:</Text> {task.reflectionHow}</Text>
                            )}
                            {task.reflectionWhy && (
                              <Text style={{ fontSize: 14, lineHeight: 22, color: colors.text }}><Text style={{ fontWeight: '600' }}>{$('why')}:</Text> {task.reflectionWhy}</Text>
                            )}
                          </View>
                        </View>
                      )}
                      {!done && task.cancelReason && (
                        <View style={[styles.commentCard, { backgroundColor: colors.surfaceLight }]}>
                          <Ionicons name="pause-circle-outline" size={14} color={colors.textMuted} style={{ marginTop: 2 }} />
                          <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 15, fontWeight: '500', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>{$('cancelReason')}</Text>
                            <Text style={{ fontSize: 15, lineHeight: 22, marginTop: 2, color: colors.text }}>{task.cancelReason}</Text>
                          </View>
                        </View>
                      )}
                    </Pressable>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
      {detailTask && (
        <TaskDetailModal
          task={detailTask}
          onClose={() => setDetailTask(null)}
        />
      )}
    </View>
  );
}

const sPr = StyleSheet.create({
  rose: { backgroundColor: 'rgba(244,63,94,0.1)', color: '#fb7185', borderColor: 'rgba(244,63,94,0.1)' },
  amber: { backgroundColor: 'rgba(245,158,11,0.1)', color: '#fbbf24', borderColor: 'rgba(245,158,11,0.1)' },
  emerald: { backgroundColor: 'rgba(16,185,129,0.1)', color: '#34d399', borderColor: 'rgba(16,185,129,0.1)' },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingBottom: 112 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16 },
  subtitle: { fontSize: 15, fontWeight: '500' },
  title: { fontSize: 24, fontWeight: '700', letterSpacing: -0.3, marginTop: 2 },
  countBadge: { borderWidth: 1, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999 },
  section: { paddingHorizontal: 16, marginTop: 24 },
  filterRow: { borderWidth: 1, borderRadius: 12, padding: 4, flexDirection: 'row' },
  filterBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 6, borderRadius: 8 },

  filterText: { fontSize: 15, fontWeight: '500' },
  emptyCard: { borderWidth: 1, borderRadius: 16, padding: 32, alignItems: 'center', gap: 12 },
  emptyIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(156,163,175,0.1)', borderWidth: 1, borderColor: 'rgba(156,163,175,0.2)', alignItems: 'center', justifyContent: 'center' },
  timeline: { borderLeftWidth: 1, marginLeft: 12, paddingLeft: 24, gap: 20 },
  timelineItem: { position: 'relative' },
  timelineDot: { position: 'absolute', left: -35, top: 4, width: 24, height: 24, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  timelineDotDone: { backgroundColor: 'rgba(16,185,129,0.1)', borderColor: '#10b981' },
  timelineDotIgnored: { backgroundColor: 'rgba(244,63,94,0.1)', borderColor: '#f43f5e' },
  timelineCard: { borderWidth: 1, borderRadius: 16, padding: 16, gap: 12 },
  prioTag: { fontSize: 13, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1, overflow: 'hidden', fontWeight: '500' },
  taskTitle: { fontSize: 17, fontWeight: '600', letterSpacing: -0.2, marginTop: 4 },
  catBadge: { fontSize: 13, fontWeight: '500', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, borderWidth: 1 },
  commentCard: { borderRadius: 12, padding: 12, flexDirection: 'row', gap: 8 },
  commentDone: {},
  commentIgnored: { backgroundColor: 'rgba(244,63,94,0.1)', borderWidth: 1, borderColor: 'rgba(244,63,94,0.1)' },
});
