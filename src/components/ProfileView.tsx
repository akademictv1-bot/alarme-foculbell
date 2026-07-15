import { useState, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Image } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { UserProfile, Task } from '../types';
import { COUNTRIES } from '../lib/i18n';
import { useThemeColors } from '../lib/ThemeContext';
import { useT } from '../lib/LanguageContext';
import SettingsModal from './SettingsModal';

interface ProfileViewProps {
  profile: UserProfile;
  tasks: Task[];
  onUpdateProfile: (p: UserProfile) => void;
  onQuickCompleteTask: (id: string) => void;
  onOpenNewTask: () => void;
}

export default function ProfileView({ profile, tasks, onUpdateProfile, onQuickCompleteTask, onOpenNewTask }: ProfileViewProps) {
  const colors = useThemeColors();
  const $ = useT();
  const [showWidgetSim, setShowWidgetSim] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [energy, setEnergy] = useState(profile.dailyEnergy);

  const completedCount = tasks.filter((t) => t.completed).length;
  const ignoredCount = tasks.filter((t) => t.ignored).length;
  const nextTask = tasks.find((t) => !t.completed);
  const userCountry = COUNTRIES.find((c) => c.id === profile.country);

  const handleEnergyChange = useCallback((val: number) => {
    setEnergy(val);
    onUpdateProfile({ ...profile, dailyEnergy: val });
  }, [profile, onUpdateProfile]);

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>{$('userPanel')}</Text>
            <Text style={[styles.title, { color: colors.text }]}>{$('myProfile')}</Text>
          </View>
          <Pressable onPress={() => setShowSettings(true)} style={[styles.settingsIcon, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="settings-outline" size={18} color={colors.textMuted} />
          </Pressable>
        </View>

        <View style={styles.section}>
          <View style={[styles.profileCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              <View style={[styles.avatarLarge, { backgroundColor: colors.surfaceLight, borderColor: colors.borderLight }]}>
                {profile.avatarUri ? (
                  <Image source={{ uri: profile.avatarUri }} style={styles.avatarImage} />
                ) : (
                  <Text style={[styles.avatarLargeText, { color: colors.text }]}>{profile.name.substring(0, 2).toUpperCase()}</Text>
                )}
              </View>
              <View style={{ gap: 2 }}>
                <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text, letterSpacing: -0.3 }}>{profile.name}</Text>
                <Text style={[styles.profBadge, { backgroundColor: colors.accentLight, borderColor: colors.accentBorder, borderWidth: 1 }, { color: colors.accentText }]}>{profile.profession}</Text>
                {userCountry && (
                  <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 2 }}>{userCountry.flag} {$(userCountry.labelKey)}</Text>
                )}
              </View>
            </View>
            <View style={[styles.profileMeta, { borderTopColor: colors.border }]}>
              <View>
                <Text style={{ fontSize: 13, color: colors.textMuted }}>{$('mainObjective')}</Text>
                <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text, marginTop: 2 }}>{profile.mainGoal}</Text>
              </View>
              <View>
                <Text style={{ fontSize: 13, color: colors.textMuted }}>{$('focusToday')}</Text>
                <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text, marginTop: 2 }}>{tasks.filter((t) => t.completed).length} {$('concluded')}</Text>
              </View>
            </View>
            <View style={{ marginTop: 14, gap: 8 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 13, color: colors.textMuted, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <MaterialCommunityIcons name="lightning-bolt" size={14} color="#eab308" /> {$('mentalEnergy')}
                </Text>
                <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text }}>{energy}%</Text>
              </View>
              <View style={[styles.sliderTrack, { backgroundColor: colors.bg }]}>
                <View style={[styles.sliderFill, { width: `${energy}%` as any, backgroundColor: colors.accentBg }]} />
                <Pressable
                  onPress={() => handleEnergyChange(Math.max(10, energy - 10))}
                  style={[styles.sliderThumb, { left: `${energy}%` as any, backgroundColor: colors.accentText }]}
                />
              </View>
              <Text style={{ fontSize: 13, color: colors.textMuted, fontStyle: 'italic' }}>
                {$('dragToUpdate')}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Pressable
            onPress={() => setShowWidgetSim(!showWidgetSim)}
            style={[styles.widgetToggle, { backgroundColor: colors.surface, borderColor: colors.border }, showWidgetSim && { backgroundColor: colors.surfaceLight, borderColor: colors.borderLight }]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
              <Ionicons name="phone-portrait-outline" size={18} color={colors.accentText} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 17, fontWeight: '600', color: showWidgetSim ? colors.text : colors.textSecondary }}>{$('simulateWidget')}</Text>
                <Text style={{ fontSize: 15, color: colors.textMuted, marginTop: 2 }}>{$('simulateWidgetDesc')}</Text>
              </View>
            </View>
            <Text style={[styles.widgetToggleText, { color: colors.accentText }]}>{showWidgetSim ? $('hide') : $('view')}</Text>
          </Pressable>
        </View>

        {showWidgetNextTask(nextTask, onQuickCompleteTask, completedCount, tasks.length, colors, $)}

        <View style={styles.section}>
          <View style={[styles.quickStatsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={{ fontSize: 17, fontWeight: '600', color: colors.text, letterSpacing: -0.3 }}>{$('actionSummary')}</Text>
            <View style={{ flexDirection: 'row', gap: 16, marginTop: 12 }}>
              <View style={[styles.statItem, { backgroundColor: colors.bg, borderColor: colors.border }]}>
                <Text style={{ fontSize: 22, fontWeight: '700', color: '#22c55e' }}>{completedCount}</Text>
                <Text style={{ fontSize: 13, color: colors.textMuted }}>{$('completedCount')}</Text>
              </View>
              <View style={[styles.statItem, { backgroundColor: colors.bg, borderColor: colors.border }]}>
                <Text style={{ fontSize: 22, fontWeight: '700', color: '#fb7185' }}>{ignoredCount}</Text>
                <Text style={{ fontSize: 13, color: colors.textMuted }}>{$('ignoredCount')}</Text>
              </View>
              <View style={[styles.statItem, { backgroundColor: colors.bg, borderColor: colors.border }]}>
                <Text style={{ fontSize: 22, fontWeight: '700', color: colors.text }}>{tasks.length}</Text>
                <Text style={{ fontSize: 13, color: colors.textMuted }}>Total</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
      {showSettings && (
        <SettingsModal
          profile={profile}
          onUpdateProfile={onUpdateProfile}
          onClose={() => setShowSettings(false)}
        />
      )}
    </View>
  );
}

function showWidgetNextTask(
  nextTask: Task | undefined,
  onQuickCompleteTask: (id: string) => void,
  completedCount: number,
  totalTasks: number,
  colors: any,
  $: (key: string) => string,
) {
  return (
    <View style={s_w.section}>
      <View style={[s_w.phone, { backgroundColor: colors.bg, borderColor: colors.surfaceLight }]}>
        <View style={[s_w.notch, { backgroundColor: colors.surfaceLight }]} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4, paddingTop: 4 }}>
          <Text style={[s_w.statusText, { color: colors.textMuted }]}>14:00</Text>
          <Text style={[s_w.statusText, { color: colors.textMuted }]}>85% 🔋</Text>
        </View>
        <View style={[s_w.widget1, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={[s_w.widgetLabel, { color: colors.accentText }]}>{$('focusBellWidget')}</Text>
            <Text style={{ fontSize: 15, color: colors.textMuted }}>{$('nextFocusTask')}</Text>
          </View>
          {nextTask ? (
            <View style={{ gap: 8 }}>
              <View>
                <Text style={[s_w.widgetTitle, { color: colors.text }]}>{nextTask.title}</Text>
                <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 2 }}>{nextTask.time} • {nextTask.category}</Text>
              </View>
              <Pressable onPress={() => onQuickCompleteTask(nextTask.id)} style={[s_w.completeBtn, { backgroundColor: colors.accentBg }]}>
                <Ionicons name="checkmark" size={12} color={colors.accentText} />
                <Text style={{ fontSize: 13, fontWeight: '500', color: colors.accentText }}>{$('quickComplete')}</Text>
              </Pressable>
            </View>
          ) : (
            <Text style={{ fontSize: 14, textAlign: 'center', paddingVertical: 4, color: colors.textMuted, fontStyle: 'italic' }}>{$('excellentNoTasks')}</Text>
          )}
        </View>
        <View style={[s_w.widget2, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={{ gap: 4 }}>
            <Text style={{ fontSize: 15, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1 }}>{$('dailyGoals')}</Text>
            <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text }}>{$('progress')}</Text>
            <Text style={[s_w.widgetCount, { color: colors.accentText }]}>{completedCount} {$('concluded')}</Text>
          </View>
          <View style={s_w.miniRing}>
            <View style={[s_w.miniRingBg, { borderColor: colors.surfaceLight }]} />
            <View style={[s_w.miniRingFill, {
              borderLeftColor: colors.accentBg,
              borderTopColor: colors.accentBg,
              transform: [{ rotate: `${Math.min(totalTasks > 0 ? (completedCount / totalTasks) * 180 : 0, 180)}deg` }],
            }]} />
            <Text style={[s_w.miniRingText, { color: colors.text }]}>{totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0}%</Text>
          </View>
        </View>
        <View style={s_w.dock}>
          {['📞', '💬', '🌐', '🔔'].map((icon, idx) => (
            <View key={idx} style={[{ backgroundColor: colors.surface, borderColor: colors.border }, s_w.dockIcon, idx === 3 && { backgroundColor: colors.accentBg, borderColor: colors.accentBg }]}>
              <Text style={{ fontSize: 17 }}>{icon}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const s_w = StyleSheet.create({
  section: { paddingHorizontal: 16, marginTop: 0 },
  phone: { width: '100%', maxWidth: 320, alignSelf: 'center', borderRadius: 32, borderWidth: 4, padding: 16, gap: 16 },
  notch: { position: 'absolute', top: 0, left: '50%', marginLeft: -48, width: 96, height: 16, borderBottomLeftRadius: 12, borderBottomRightRadius: 12, zIndex: 20, alignItems: 'center', justifyContent: 'center' },
  statusText: { fontSize: 15, fontFamily: 'monospace' },
  widget1: { borderWidth: 1, borderRadius: 12, padding: 12, gap: 10 },
  widgetLabel: { fontSize: 15, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  widgetTitle: { fontSize: 15, fontWeight: '600' },
  completeBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 6, borderRadius: 8 },
  widget2: { borderWidth: 1, borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  widgetCount: { fontSize: 13, fontWeight: '500', marginTop: 4 },
  miniRing: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  miniRingBg: { position: 'absolute', width: 36, height: 36, borderRadius: 18, borderWidth: 3.5 },
  miniRingFill: { position: 'absolute', width: 36, height: 36, borderRadius: 18, borderWidth: 3.5, borderColor: 'transparent' },
  miniRingText: { position: 'absolute', fontSize: 14, fontWeight: '700', fontFamily: 'monospace' },
  dock: { flexDirection: 'row', justifyContent: 'space-around', paddingTop: 8 },
  dockIcon: { width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingBottom: 112 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16 },
  subtitle: { fontSize: 15, fontWeight: '500' },
  title: { fontSize: 24, fontWeight: '700', letterSpacing: -0.3, marginTop: 2 },
  settingsIcon: { padding: 10, borderRadius: 12, borderWidth: 1 },
  section: { paddingHorizontal: 16, marginTop: 24 },
  profileCard: { borderWidth: 1, borderRadius: 16, padding: 20 },
  avatarLarge: { width: 56, height: 56, borderRadius: 28, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  avatarImage: { width: 56, height: 56, borderRadius: 28 },
  avatarLargeText: { fontSize: 20, fontWeight: '700' },
  profBadge: { fontSize: 13, paddingHorizontal: 10, paddingVertical: 2, borderRadius: 999, fontWeight: '600', alignSelf: 'flex-start' },
  profileMeta: { flexDirection: 'row', gap: 12, borderTopWidth: 1, marginTop: 14, paddingTop: 14 },
  sliderTrack: { height: 4, borderRadius: 2, position: 'relative' },
  sliderFill: { height: '100%', borderRadius: 2 },
  sliderThumb: { position: 'absolute', top: -6, width: 16, height: 16, borderRadius: 8, marginLeft: -8 },
  widgetToggle: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1 },
  widgetToggleText: { fontSize: 15, fontWeight: '600' },
  quickStatsCard: { borderWidth: 1, borderRadius: 16, padding: 20 },
  statItem: { flex: 1, alignItems: 'center', borderWidth: 1, borderRadius: 12, padding: 12, gap: 4 },
});