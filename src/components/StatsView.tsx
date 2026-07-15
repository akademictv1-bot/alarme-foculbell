import { useState, useMemo } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Task } from '../types';
import { useThemeColors } from '../lib/ThemeContext';
import { useT } from '../lib/LanguageContext';

interface StatsViewProps {
  tasks: Task[];
  streakCount: number;
}

function getStartOfWeek(d: Date) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function getDayName(i: number) {
  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  return days[i];
}

export default function StatsView({ tasks, streakCount }: StatsViewProps) {
  const colors = useThemeColors();
  const $ = useT();
  const completedTasks = tasks.filter((t) => t.completed);
  const ignoredCount = tasks.filter((t) => t.ignored).length;
  const completedCount = completedTasks.length;
  const totalTasksCount = tasks.length;
  const completionRate = totalTasksCount > 0 ? Math.round((completedCount / totalTasksCount) * 100) : 0;

  const weeklyStats = useMemo(() => {
    const startOfWeek = getStartOfWeek(new Date());
    const dayStats: { day: string; hours: number; tasks: number }[] = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const dayTasks = completedTasks.filter((t) => t.date === dateStr);
      dayStats.push({
        day: getDayName(i),
        hours: +(dayTasks.length * 0.75).toFixed(1),
        tasks: dayTasks.length,
      });
    }
    return dayStats;
  }, [completedTasks]);

  const maxHours = Math.max(...weeklyStats.map((d) => d.hours), 1);
  const totalFocusMinutes = completedCount * 45;
  const formattedFocusTime = totalFocusMinutes >= 60
    ? `${Math.floor(totalFocusMinutes / 60)}h ${totalFocusMinutes % 60}m`
    : `${totalFocusMinutes}m`;

  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>{$('evolutionDashboard')}</Text>
            <Text style={[styles.title, { color: colors.text }]}>{$('focusStats')}</Text>
          </View>
          <View style={[styles.periodBadge, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="calendar-outline" size={14} color={colors.text} />
            <Text style={[styles.periodText, { color: colors.textSecondary }]}>{$('thisWeek')}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.grid}>
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.cardHeader}>
                <Text style={[styles.cardLabel, { color: colors.textMuted }]}>{$('streakLabel')}</Text>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(249,115,22,0.1)', borderColor: 'rgba(249,115,22,0.1)' }]}>
                  <MaterialCommunityIcons name="fire" size={16} color="#fb923c" />
                </View>
              </View>
              <Text style={[styles.cardValue, { color: colors.text }]}>{streakCount} {$('daysLabel')}</Text>
              <Text style={[styles.cardSub, { color: colors.textMuted }]}>{$('activeFocusRoutine')}</Text>
            </View>
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.cardHeader}>
                <Text style={[styles.cardLabel, { color: colors.textMuted }]}>{$('focusRate')}</Text>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(59,130,246,0.1)', borderColor: 'rgba(59,130,246,0.1)' }]}>
                  <Ionicons name="checkmark-circle-outline" size={16} color={colors.text} />
                </View>
              </View>
              <Text style={[styles.cardValue, { color: colors.text }]}>{completionRate}%</Text>
              <Text style={[styles.cardSub, { color: colors.textMuted }]}>{$('completedTasks')}</Text>
            </View>
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, styles.cardSpan2]}>
              <View style={styles.cardHeader}>
                <Text style={[styles.cardLabel, { color: colors.textMuted }]}>{$('actionSummary')}</Text>
              </View>
              <View style={{ marginTop: 12, gap: 8 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <Text style={[styles.cardValue, { color: colors.text, marginTop: 0 }]}>{completedCount}</Text>
                  <Text style={{ fontSize: 15, color: colors.textMuted }}>{$('completedCount')} • {ignoredCount} {$('ignoredCount')}</Text>
                </View>
                <View style={[styles.progressTrackFull, { backgroundColor: colors.bg, borderColor: colors.border }]}>
                  <View style={[styles.progressFillBlue, { width: `${totalTasksCount > 0 ? (completedCount / totalTasksCount) * 100 : 0}%` as any, backgroundColor: colors.accentBg }]} />
                  <View style={[styles.progressFillRose, { width: `${totalTasksCount > 0 ? (ignoredCount / totalTasksCount) * 100 : 0}%` as any }]} />
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 14, color: colors.textMuted }}>• {$('completedCount')} ({completedCount})</Text>
                  <Text style={{ fontSize: 14, color: colors.textMuted }}>• {$('ignoredCount')} ({ignoredCount})</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={[styles.chartCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View>
              <Text style={{ fontSize: 17, fontWeight: '600', color: colors.text, letterSpacing: -0.3 }}>{$('weeklyProductivity')}</Text>
              <Text style={{ fontSize: 15, color: colors.textMuted, marginTop: 2 }}>{$('weeklyProductivityDesc')}</Text>
            </View>
            <View style={[styles.chartArea, { borderBottomColor: colors.border }]}>
              {weeklyStats.map((stat, idx) => {
                const h = maxHours > 0 ? (stat.hours / maxHours) * 120 : 4;
                return (
                  <View key={stat.day} style={styles.barCol}>
                    <View style={[styles.tooltip, { backgroundColor: colors.surface, borderColor: colors.border }, hoveredIdx === idx ? { opacity: 1 } : { opacity: 0 }]}>
                      <Text style={[styles.tooltipText, { color: colors.text }]}>{stat.hours}h • {stat.tasks} f.</Text>
                    </View>
                    <View style={[styles.barBg, { backgroundColor: colors.bg, borderColor: colors.border }]}>
                      <View
                        style={[styles.barFill, { height: Math.max(h, 4), backgroundColor: hoveredIdx === idx ? colors.accentBg : '#22c55e' }]}
                      />
                    </View>
                    <Pressable onPress={() => setHoveredIdx(idx === hoveredIdx ? null : idx)} style={{ padding: 4 }}>
                      <Text style={{ fontSize: 13, fontWeight: '500', color: colors.textMuted }}>{stat.day}</Text>
                    </Pressable>
                  </View>
                );
              })}
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 8 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#22c55e' }} />
              <Text style={{ fontSize: 13, color: colors.textMuted }}>{$('hours')} {$('focusLabel')}</Text>
            </View>
            <View style={styles.chartFooter}>
              <Text style={{ fontSize: 14, color: colors.textMuted }}>{$('dailyAverage')}: <Text style={{ color: colors.text, fontWeight: '600' }}>{(completedTasks.length > 0 ? ((completedTasks.length / 7) * 0.75).toFixed(1) : '0')} {$('hours')}</Text></Text>
              <Text style={{ fontSize: 14, color: colors.textMuted }}>{$('maxLabel')}: <Text style={{ color: colors.text, fontWeight: '600' }}>{Math.max(...weeklyStats.map(d => d.hours), 0)}h</Text></Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={[styles.insightsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(59,130,246,0.1)', borderColor: 'rgba(59,130,246,0.1)' }]}>
                <MaterialCommunityIcons name="lightning-bolt" size={16} color={colors.text} />
              </View>
              <Text style={{ fontSize: 17, fontWeight: '600', color: colors.text, letterSpacing: -0.3 }}>{$('disciplineInsights')}</Text>
            </View>
            <View style={{ marginTop: 16, gap: 12 }}>
              <View style={[styles.insightRow, { backgroundColor: colors.bg, borderColor: colors.border }]}>
                <View style={[styles.iconBoxLarge, { backgroundColor: 'rgba(167,139,250,0.1)', borderColor: 'rgba(167,139,250,0.1)' }]}>
                  <Ionicons name="time-outline" size={20} color="#a78bfa" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, color: colors.textMuted }}>{$('mostProductiveTime')}</Text>
                  <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text, marginTop: 2 }}>{$('between')} <Text style={{ color: '#a78bfa', fontWeight: '700' }}>14:00 - 16:30</Text></Text>
                </View>
              </View>
              <View style={[styles.insightRow, { backgroundColor: colors.bg, borderColor: colors.border }]}>
                <View style={[styles.iconBoxLarge, { backgroundColor: 'rgba(34,197,94,0.1)', borderColor: 'rgba(34,197,94,0.1)' }]}>
                  <Ionicons name="time-outline" size={20} color="#22c55e" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, color: colors.textMuted }}>{$('accumulatedFocusTime')}</Text>
                  <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text, marginTop: 2 }}>{formattedFocusTime} {$('deepWork')}</Text>
                </View>
              </View>
            </View>
            <View style={[styles.insightFooter, { borderTopColor: colors.border }]}>
              <Text style={[styles.insightQuote, { color: colors.textMuted }]}>"{$('quoteMoreProductive')}"</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingBottom: 112 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16 },
  subtitle: { fontSize: 15, fontWeight: '500' },
  title: { fontSize: 24, fontWeight: '700', letterSpacing: -0.3, marginTop: 2 },
  periodBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1 },
  periodText: { fontSize: 15, fontWeight: '500' },
  section: { paddingHorizontal: 16, marginTop: 24 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  card: { borderWidth: 1, borderRadius: 16, padding: 16, width: '47%' },
  cardSpan2: { width: '100%' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardLabel: { fontSize: 15, fontWeight: '600' },
  iconBox: { padding: 8, borderRadius: 10, borderWidth: 1 },
  iconBoxLarge: { padding: 10, borderRadius: 12, borderWidth: 1 },
  cardValue: { fontSize: 24, fontWeight: '700', letterSpacing: -0.3, marginTop: 16 },
  cardSub: { fontSize: 14, marginTop: 4 },
  progressTrackFull: { height: 8, borderWidth: 1, borderRadius: 4, flexDirection: 'row', overflow: 'hidden' },
  progressFillBlue: { height: '100%', borderTopLeftRadius: 4, borderBottomLeftRadius: 4 },
  progressFillRose: { height: '100%', backgroundColor: '#f43f5e' },
  chartCard: { borderWidth: 1, borderRadius: 16, padding: 20 },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  trendBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, backgroundColor: 'rgba(16,185,129,0.1)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.1)' },
  trendText: { fontSize: 15, fontWeight: '500', color: '#34d399' },
  chartArea: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 24, borderBottomWidth: 1, paddingBottom: 4, minHeight: 140 },
  barCol: { flex: 1, alignItems: 'center', position: 'relative' },
  tooltip: { position: 'absolute', top: -24, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, zIndex: 10 },
  tooltipText: { fontSize: 13 },
  barBg: { width: 24, borderWidth: 1, borderTopLeftRadius: 8, borderTopRightRadius: 8, height: 128, overflow: 'hidden', justifyContent: 'flex-end' },
  barFill: { width: '100%', borderTopLeftRadius: 5, borderTopRightRadius: 5 },
  chartFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  insightsCard: { borderWidth: 1, borderRadius: 16, padding: 20 },
  insightRow: { flexDirection: 'row', alignItems: 'center', gap: 14, borderWidth: 1, borderRadius: 14, padding: 16 },
  insightFooter: { borderTopWidth: 0.5, marginTop: 16, paddingTop: 16 },
  insightQuote: { fontSize: 15, fontStyle: 'italic', textAlign: 'center' },
});
