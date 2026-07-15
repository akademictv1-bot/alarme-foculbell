import { useState, useEffect } from 'react';
import { View, Text, Image, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Task, UserProfile } from '../types';
import { useThemeColors } from '../lib/ThemeContext';
import { useT } from '../lib/LanguageContext';
import { COUNTRIES } from '../lib/i18n';
import ExplanationModal from './ExplanationModal';

interface DashboardProps {
  profile: UserProfile;
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onOpenNewTask: () => void;
  onTriggerAlarm: (task: Task) => void;
}

function isToday(dateStr: string) {
  return dateStr === new Date().toISOString().split('T')[0];
}

export default function Dashboard({
  profile, tasks, onToggleComplete, onDeleteTask, onOpenNewTask, onTriggerAlarm,
}: DashboardProps) {
  const colors = useThemeColors();
  const $ = useT();
  const [formattedDate, setFormattedDate] = useState('');
  const countryId = profile.country || 'auto';
  const countryData = COUNTRIES.find((c) => c.id === countryId);
  const countryLabel = (countryData && countryId !== 'auto') ? `${countryData.flag} ${$(countryData.labelKey)}` : null;
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    const today = new Date();
    const formatted = today.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });
    setFormattedDate(formatted.charAt(0).toUpperCase() + formatted.slice(1));
  }, []);

  const todayTasks = tasks.filter((t) => isToday(t.date));
  const completedTasks = todayTasks.filter((t) => t.completed);
  const pendingTasks = todayTasks.filter((t) => !t.completed && !t.ignored);
  const completedCount = completedTasks.length;
  const pendingCount = pendingTasks.length;
  const totalCount = todayTasks.length;
  const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const nextFocusTask = pendingTasks[0] || null;

  const getPrioColor = (prio: Task['priority']) => {
    if (prio === 'Alta') return '#f43f5e';
    if (prio === 'Média') return '#f59e0b';
    return '#10b981';
  };

  const msg = () => {
    if (totalCount === 0) return $('msgStartDay');
    if (pct === 100) return $('msgComplete');
    if (pct >= 50) return $('msgHalfway');
    if (completedCount > 0) return `${$('msgGreatPace')} ${$('missingTasks')} ${pendingCount} ${$('focusTasks')}`;
    return $('msgStartFirst');
  };

  return (
    <View style={[s.container, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} contentInsetAdjustmentBehavior="automatic">
          <View style={[s.topBar, { borderBottomColor: colors.border }]}>
            <View style={s.topBarLeft}>
              <View style={[s.avatar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                {profile.avatarUri ? (
                  <Image source={{ uri: profile.avatarUri }} style={s.avatarImage} />
                ) : (
                  <Text style={[s.avatarText, { color: colors.textSecondary }]}>{profile.name.substring(0, 2).toUpperCase()}</Text>
                )}
              </View>
              <View>
                <Text style={[s.greeting, { color: colors.text }]}>{$('hello')}, {profile.name}</Text>
                <Text style={[s.dateText, { color: colors.textMuted }]}>{formattedDate || $('today')}</Text>
                {countryLabel && (
                  <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2, opacity: 0.6 }}>{countryLabel}</Text>
                )}
              </View>
            </View>
            <View style={s.topBarRight}>
              <Pressable onPress={() => setShowExplanation(true)} style={[s.helpBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}>
<MaterialCommunityIcons name="help-circle-outline" size={14} color={colors.accentText} />
<Text style={[s.helpText, { color: colors.accentText }]}>{$('clarify')}</Text>
              </Pressable>
              <Pressable onPress={onOpenNewTask} style={[s.addBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Ionicons name="add" size={16} color={colors.textMuted} />
              </Pressable>
            </View>
          </View>

          <View style={s.section}>
            <View style={[s.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={{ flex: 1, gap: 6 }}>
                <Text style={[s.summaryLabel, { color: colors.accentText }]}>{$('progressDay')}</Text>
                <Text style={[s.summaryTitle, { color: colors.text }]}>{pct === 100 ? $('focusComplete') : `${pct}${$('pctCompleted')}`}</Text>
                <Text style={[s.summaryMsg, { color: colors.textMuted }]}>{msg()}</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <SimpleRing progress={pct} color={colors.accentBg} size={96} bgColor={colors.surfaceLight} />
                <View style={{ position: 'absolute', alignItems: 'center', justifyContent: 'center', width: 96, height: 96 }}>
                  <Text style={[s.ringCount, { color: colors.text }]}>{completedCount}/{totalCount}</Text>
                  <Text style={[s.ringLabel, { color: colors.textMuted }]}>{$('focuses')}</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={s.section}>
            <View style={s.sectionHeader}>
              <Text style={[s.sectionTitle, { color: colors.textMuted }]}>{$('nextStep')}</Text>
              {nextFocusTask && <Text style={[s.badge, { backgroundColor: colors.accentLight, borderColor: colors.accentBorder, borderWidth: 1 }, { color: colors.accentText }]}>{$('start45mSession')}</Text>}
            </View>
            {nextFocusTask ? (
              <View style={[s.nextCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={[s.indicator, { backgroundColor: colors.accentBg }]} />
                <View style={{ padding: 20, paddingLeft: 24 }}>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <Text style={[s.pill, { backgroundColor: colors.accentLight, borderColor: colors.accentBorder, borderWidth: 1 }, { color: colors.accentText }]}>{nextFocusTask.category}</Text>
                    <Text style={[s.pill, nextFocusTask.priority === 'Alta' ? s.priHigh : nextFocusTask.priority === 'Média' ? s.priMid : s.priLow]}>{nextFocusTask.priority}</Text>
                  </View>
                  <Text style={[s.nextTitle, { color: colors.text }]}>{nextFocusTask.title}</Text>
                  {nextFocusTask.description && <Text style={[s.nextDesc, { color: colors.textMuted }]} numberOfLines={2}>{nextFocusTask.description}</Text>}
                  <Text style={[s.nextTime, { color: colors.textMuted }]}><Ionicons name="time-outline" size={16} color={colors.textMuted} /> {$('scheduledFor')} {nextFocusTask.time}</Text>
                </View>
                <View style={[s.nextFooter, { borderTopColor: colors.border }]}>
                  <Text style={{ fontSize: 15, color: colors.textMuted, fontStyle: 'italic' }}>{$('isYourMindReady')}</Text>
                  <Pressable onPress={() => onTriggerAlarm(nextFocusTask)} style={[s.startBtn, { backgroundColor: colors.accentBg }]}>
                    <Ionicons name="play" size={16} color={colors.accentText} />
                    <Text style={[s.startBtnText, { color: colors.accentText }]}>{$('startSession')}</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <View style={[s.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={s.emptyIcon}><MaterialCommunityIcons name="medal" size={20} color="#10b981" /></View>
                <Text style={{ fontSize: 17, fontWeight: '700', color: colors.text }}>{$('allUnderControl')}</Text>
                <Text style={[s.emptyDesc, { color: colors.textMuted }]}>{$('noPendingFocus')}</Text>
                <Pressable onPress={onOpenNewTask} style={{ flexDirection: 'row', gap: 4 }}>
                  <Ionicons name="add" size={18} color={colors.accentText} />
                  <Text style={[s.emptyActionText, { color: colors.accentText }]}>{$('createTask')}</Text>
                </Pressable>
              </View>
            )}
          </View>

          <View style={s.section}>
            <View style={s.sectionHeader}>
              <Text style={[s.sectionTitle, { color: colors.textMuted }]}>{$('scheduledFocuses')}</Text>
              <Text style={{ fontSize: 15, color: colors.textMuted }}>{$('total')}: {totalCount}</Text>
            </View>
            {todayTasks.length === 0 ? (
              <View style={[s.emptyList, { backgroundColor: colors.surface, borderColor: colors.border }]}><Text style={{ fontSize: 15, color: colors.textMuted }}>{$('noTasksToday')}</Text></View>
            ) : (
            <View style={{ gap: 8 }}>
              {todayTasks.map((t) => {
                const done = t.completed;
                return (
                  <View key={t.id} style={[s.taskItem, { backgroundColor: colors.surface, borderColor: colors.border }, done && { opacity: 0.4 }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                      <Pressable onPress={() => onToggleComplete(t.id)}
                        style={[s.checkbox, done ? { backgroundColor: colors.accentBg, borderColor: colors.accentBg } : { borderColor: colors.borderLight }]}>
                        {done && <Ionicons name="checkmark" size={16} color={colors.accentText} />}
                      </Pressable>
                      <View style={{ flex: 1 }}>
                        <Text style={[s.taskTitle, { color: colors.text }, done && { textDecorationLine: 'line-through', color: colors.textMuted }]} numberOfLines={1}>{t.title}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 }}>
                          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: getPrioColor(t.priority) }} />
                          <Text style={{ fontSize: 14, color: colors.textMuted }}>{t.category} • {t.time}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      {!done && <Pressable onPress={() => onTriggerAlarm(t)} style={s.taskAction}><Ionicons name="play" size={16} color={colors.textMuted} /></Pressable>}
                      <Pressable onPress={() => onDeleteTask(t.id)} style={s.taskAction}><Ionicons name="trash-outline" size={16} color={colors.textMuted} /></Pressable>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
      {showExplanation && <ExplanationModal onClose={() => setShowExplanation(false)} />}
    </View>
  );
}

function SimpleRing({ progress, color, size, bgColor }: { progress: number; size: number; color: string; bgColor: string }) {
  const pct = Math.min(progress, 100);
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, borderWidth: 4, borderColor: bgColor, alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      <View style={{
        position: 'absolute', left: 0, top: 0, width: size, height: size, borderRadius: size / 2,
        borderWidth: 4.5, borderColor: 'transparent', borderLeftColor: color,
        transform: [{ rotate: `${-90 + (pct / 100) * 360}deg` }],
        opacity: pct > 0 ? 1 : 0,
      }} />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingBottom: 112 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 0.5 },
  topBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, borderCurve: 'continuous', borderWidth: 1, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatarImage: { width: 40, height: 40, borderRadius: 20, borderCurve: 'continuous' },
  avatarText: { fontSize: 15, fontWeight: '700' },
  dateText: { fontSize: 14, fontWeight: '500' },
  greeting: { fontSize: 18, fontWeight: '700', marginTop: 4 },
  topBarRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  helpBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderCurve: 'continuous', borderWidth: 1 },
  helpText: { fontSize: 15, fontWeight: '600' },
  addBtn: { width: 36, height: 36, borderRadius: 12, borderCurve: 'continuous', borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  section: { paddingHorizontal: 16, marginTop: 24 },
  summaryCard: { borderWidth: 1, borderRadius: 16, borderCurve: 'continuous', padding: 20, flexDirection: 'row', alignItems: 'center' },
  summaryLabel: { fontSize: 13, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase' },
  summaryTitle: { fontSize: 22, fontWeight: '700', letterSpacing: -0.3 },
  summaryMsg: { fontSize: 15, lineHeight: 18 },
  ringCount: { fontSize: 18, fontWeight: '700', fontFamily: 'monospace' },
  ringLabel: { fontSize: 15, fontWeight: '500', marginTop: 2 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 15, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  badge: { fontSize: 13, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  nextCard: { borderWidth: 1, borderRadius: 16, overflow: 'hidden' },
  indicator: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4 },
  pill: { fontSize: 13, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, fontWeight: '500', overflow: 'hidden' },
  priHigh: { backgroundColor: 'rgba(244,63,94,0.1)', color: '#fb7185', borderColor: 'rgba(244,63,94,0.1)' },
  priMid: { backgroundColor: 'rgba(245,158,11,0.1)', color: '#fbbf24', borderColor: 'rgba(245,158,11,0.1)' },
  priLow: { backgroundColor: 'rgba(16,185,129,0.1)', color: '#34d399', borderColor: 'rgba(16,185,129,0.1)' },
  nextTitle: { fontSize: 20, fontWeight: '700', letterSpacing: -0.3, marginTop: 8 },
  nextDesc: { fontSize: 15, lineHeight: 16, marginTop: 4 },
  nextTime: { fontSize: 15, marginTop: 8 },
  nextFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderTopWidth: 1, paddingLeft: 24 },
  startBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14 },
  startBtnText: { fontSize: 15, fontWeight: '700' },
  emptyCard: { borderWidth: 1, borderRadius: 16, padding: 24, alignItems: 'center', gap: 12 },
  emptyIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(16,185,129,0.1)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.2)', alignItems: 'center', justifyContent: 'center' },
  emptyDesc: { fontSize: 15, textAlign: 'center' },
  emptyActionText: { fontSize: 15, fontWeight: '700' },
  emptyList: { borderWidth: 1, borderRadius: 16, padding: 24, alignItems: 'center' },
  taskItem: { borderWidth: 1, borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'center' },
  checkbox: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  taskTitle: { fontSize: 17, fontWeight: '600', letterSpacing: -0.2 },
  taskAction: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
});
