import { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Task, PRIORITY_COLORS } from '../types';
import { useThemeColors } from '../lib/ThemeContext';
import { useT } from '../lib/LanguageContext';
import TaskDetailModal from './TaskDetailModal';

interface TasksListFullProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onOpenNewTask: () => void;
}

type FilterType = 'Todas' | 'Pendentes' | 'Concluídas';

export default function TasksListFull({ tasks, onToggleComplete, onDeleteTask, onOpenNewTask }: TasksListFullProps) {
  const colors = useThemeColors();
  const $ = useT();
  const [filter, setFilter] = useState<FilterType>('Todas');
  const [detailTask, setDetailTask] = useState<Task | null>(null);
  const [search, setSearch] = useState('');

  const filteredTasks = tasks.filter((task) => {
    const q = search.toLowerCase();
    const matches = task.title.toLowerCase().includes(q) || task.category.toLowerCase().includes(q);
    if (!matches) return false;
    if (filter === 'Pendentes') return !task.completed;
    if (filter === 'Concluídas') return task.completed;
    return true;
  });

  const getTaskColor = (task: Task) => task.color || PRIORITY_COLORS[task.priority].hex;

  const filters: FilterType[] = ['Todas', 'Pendentes', 'Concluídas'];

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>{$('taskOrganization')}</Text>
            <Text style={[styles.title, { color: colors.text }]}>{$('allTasks')}</Text>
          </View>
          <Pressable onPress={onOpenNewTask} style={[styles.newBtn, { backgroundColor: colors.accentBg }]}>
            <Ionicons name="add" size={16} color={colors.accentText} />
            <Text style={[styles.newBtnText, { color: colors.accentText }]}>{$('newTask')}</Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <View style={styles.searchWrap}>
            <Ionicons name="search" size={16} color={colors.textMuted} style={{ position: 'absolute', left: 14, top: 13 }} />
            <TextInput
              style={[styles.searchInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
              value={search}
              onChangeText={setSearch}
              placeholder={$('searchPlaceholder')}
              placeholderTextColor={colors.textMuted}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.filterRow}>
            {filters.map((f) => {
              const sel = filter === f;
              return (
                <Pressable key={f} onPress={() => setFilter(f)}
                  style={[styles.filterPill, { backgroundColor: colors.surface, borderColor: colors.border }, sel && { backgroundColor: colors.accentLight, borderColor: colors.accentBorder }]}>
                  <Text style={[styles.filterText, { color: colors.textMuted }, sel && { color: colors.accentText, fontWeight: '600' }]}>{f === 'Todas' ? $('all') : f === 'Pendentes' ? $('pendingFilter') : $('completedFilter')}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          {filteredTasks.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.emptyIcon}><MaterialCommunityIcons name="alert-circle" size={20} color={colors.textMuted} /></View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>{$('noTasksFound')}</Text>
              <Text style={[styles.emptyDesc, { color: colors.textMuted }]}>{$('noTasksFoundDesc')}</Text>
            </View>
          ) : (
            <View style={{ gap: 10 }}>
              {filteredTasks.map((task) => {
                const done = task.completed;
                const tc = getTaskColor(task);
                return (
                  <View key={task.id} style={[styles.taskItem, { backgroundColor: colors.surface, borderColor: colors.border, padding: 0, overflow: 'hidden' }, done && { opacity: 0.4 }]}>
                    <View style={{ width: 4, backgroundColor: done ? colors.borderLight : tc }} />
                    <Pressable onPress={() => setDetailTask(task)} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, paddingLeft: 10 }}>
                      <Pressable onPress={() => onToggleComplete(task.id)}
                        style={[styles.checkbox, done ? { backgroundColor: tc, borderColor: tc } : { borderColor: tc }]}>
                        {done && <Ionicons name="checkmark" size={16} color="#fff" />}
                      </Pressable>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.taskTitle, { color: colors.text }, done && { textDecorationLine: 'line-through', color: colors.textMuted }]} numberOfLines={1}>{task.title}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                          <Text style={{ fontSize: 14, color: colors.textMuted }}>{task.time} • {task.date.split('-').reverse().join('/')}</Text>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: tc }} />
                            <Text style={{ fontSize: 13, fontWeight: '600', color: tc }}>{task.priority}</Text>
                          </View>
                          <Text style={{ fontSize: 13, backgroundColor: colors.surfaceLight, color: colors.textMuted, paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4, borderWidth: 1, borderColor: colors.borderLight, overflow: 'hidden' }}>{task.category}</Text>
                        </View>
                        {task.description ? (
                          <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 4, lineHeight: 18 }} numberOfLines={1}>{task.description}</Text>
                        ) : null}
                      </View>
                    </Pressable>
                    <View style={{ flexDirection: 'row', gap: 4, paddingRight: 8, alignItems: 'center' }}>
                      <Pressable onPress={() => setDetailTask(task)} style={styles.actionBtn}>
                        <Ionicons name="eye-outline" size={16} color={colors.accentText} />
                      </Pressable>
                      <Pressable onPress={() => onDeleteTask(task.id)} style={styles.actionBtn}>
                        <Ionicons name="trash-outline" size={16} color="#fb7185" />
                      </Pressable>
                    </View>
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

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingBottom: 112 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16 },
  subtitle: { fontSize: 15, fontWeight: '500' },
  title: { fontSize: 24, fontWeight: '700', letterSpacing: -0.3, marginTop: 2 },
  newBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12 },
  newBtnText: { fontSize: 15, fontWeight: '500' },
  section: { paddingHorizontal: 16, marginTop: 24 },
  searchWrap: { position: 'relative' },
  searchInput: { borderWidth: 1, borderRadius: 12, paddingLeft: 40, paddingRight: 16, paddingVertical: 12, fontSize: 15 },
  filterRow: { flexDirection: 'row', gap: 8 },
  filterPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, borderWidth: 1 },

  filterText: { fontSize: 15, fontWeight: '500' },
  emptyCard: { borderWidth: 1, borderRadius: 16, padding: 32, alignItems: 'center', gap: 12 },
  emptyIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(156,163,175,0.1)', borderWidth: 1, borderColor: 'rgba(156,163,175,0.25)', alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontSize: 17, fontWeight: '600' },
  emptyDesc: { fontSize: 15, textAlign: 'center' },
  taskItem: { borderWidth: 1, borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center' },
  checkbox: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  taskTitle: { fontSize: 17, fontWeight: '600', letterSpacing: -0.2 },
  actionBtn: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  deleteBtn: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
});
