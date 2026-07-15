import { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Task } from '../types';
import { useThemeColors } from '../lib/ThemeContext';
import { useT } from '../lib/LanguageContext';
import { startAlarmSound, stopAlarmSound } from '../lib/audio';

interface AlarmScreenProps {
  task: Task;
  soundId?: string;
  customSoundUri?: string;
  onComplete: (comment?: string) => void;
  onSnooze: () => void;
  onIgnore: () => void;
}

export default function AlarmScreen({ task, soundId = 'urgent', customSoundUri, onComplete, onSnooze, onIgnore }: AlarmScreenProps) {
  const colors = useThemeColors();
  const $ = useT();
  const [currentTime, setCurrentTime] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(15 * 60);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const clockInt = setInterval(updateTime, 1000);
    const timerInt = setInterval(() => {
      setSecondsLeft((p) => (p > 0 ? p - 1 : 0));
    }, 1000);
    return () => { clearInterval(clockInt); clearInterval(timerInt); };
  }, []);

  useEffect(() => {
    if (soundEnabled) {
      startAlarmSound(soundId, customSoundUri);
    } else {
      stopAlarmSound();
    }
    return () => { stopAlarmSound(); };
  }, [soundEnabled, soundId, customSoundUri]);

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m.toString().padStart(2, '0')}:${r.toString().padStart(2, '0')}`;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={styles.bgRadial} />
      <View style={styles.topBar}>
        <View style={[styles.focusBadge, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <MaterialCommunityIcons name="alert-octagon" size={14} color={colors.accentText} />
          <Text style={{ fontSize: 13, color: colors.textMuted }}>{$('focusModeActive')}</Text>
        </View>
        <Pressable onPress={() => setSoundEnabled((p) => !p)} style={[styles.soundBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {soundEnabled
            ? <Ionicons name="volume-medium-outline" size={18} color={colors.accentText} />
            : <Ionicons name="volume-mute-outline" size={18} color={colors.textMuted} />}
        </Pressable>
      </View>

      <View style={styles.main}>
        <View style={{ gap: 4 }}>
          <Text style={[styles.actionLabel, { color: colors.accentText }]}>{$('timeToAct')}</Text>
          <Text style={[styles.clockDisplay, { color: colors.text }]}>{currentTime}</Text>
        </View>
        <View style={[styles.focusCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={{ alignItems: 'center' }}>
            <Text style={[styles.prioBadge, { backgroundColor: colors.accentLight, borderColor: colors.accentBorder, borderWidth: 1 }, { color: colors.accentText }]}>{$('priorityLabel')} {task.priority === 'Alta' ? $('high') : task.priority === 'Média' ? $('medium') : $('low')}</Text>
            <Text style={[styles.taskTitle, { color: colors.text }]}>{task.title}</Text>
            {task.description && <Text style={[styles.taskDesc, { color: colors.textMuted }]}>{task.description}</Text>}
          </View>
          <View style={[styles.timerCircle, { backgroundColor: colors.bg, borderColor: colors.border }]}>
            <Text style={{ fontSize: 13, color: colors.textMuted, textTransform: 'uppercase', fontWeight: '500' }}>{$('remaining')}</Text>
            <Text style={[styles.timerText, { color: colors.text }]}>{fmt(secondsLeft)}</Text>
            <MaterialCommunityIcons name="bell-ring" size={22} color={colors.accentText} />
          </View>
          <Text style={{ fontSize: 13, color: colors.textMuted, textAlign: 'center' }}>
            {$('scheduledFor')} <Text style={{ color: colors.text, fontWeight: '600' }}>{task.time}</Text> • {task.category}
          </Text>
        </View>
      </View>

      <View style={styles.bottomBar}>
        <Pressable onPress={() => onComplete()} style={[styles.completeBtn, { backgroundColor: colors.accentBg }]}>
          <Ionicons name="checkmark" size={20} color={colors.accentText} />
          <Text style={[styles.completeText, { color: colors.accentText }]}>{$('iFinishedTask')}</Text>
        </Pressable>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Pressable onPress={() => onSnooze()} style={[styles.secondaryBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="time-outline" size={18} color={colors.textMuted} />
            <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textSecondary }}>{$('snooze10min')}</Text>
          </Pressable>
          <Pressable onPress={() => onIgnore()} style={[styles.secondaryBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="close" size={18} color="#fb7185" />
            <Text style={{ fontSize: 15, fontWeight: '600', color: '#fb7185' }}>{$('ignoreAlarm')}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'absolute', inset: 0, zIndex: 50, padding: 24, justifyContent: 'space-between' },
  bgRadial: { position: 'absolute', inset: 0, backgroundColor: 'rgba(24,24,27,0.1)' },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 },
  focusBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999 },
  soundBtn: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  main: { flex: 1, alignItems: 'center', justifyContent: 'center', zIndex: 10, gap: 24 },
  actionLabel: { fontSize: 14, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, textAlign: 'center' },
  clockDisplay: { fontSize: 48, fontWeight: '700', letterSpacing: -1, fontVariant: ['tabular-nums'] },
  focusCard: { width: '100%', borderWidth: 1, borderRadius: 16, padding: 24, gap: 24, alignItems: 'center' },
  prioBadge: { fontSize: 13, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999, fontWeight: '600', textTransform: 'uppercase' },
  taskTitle: { fontSize: 22, fontWeight: '700', letterSpacing: -0.3, marginTop: 12, textAlign: 'center' },
  taskDesc: { fontSize: 15, marginTop: 6, textAlign: 'center', lineHeight: 22 },
  timerCircle: { width: 160, height: 160, borderRadius: 80, borderWidth: 1, alignItems: 'center', justifyContent: 'center', gap: 4 },
  timerText: { fontSize: 22, fontWeight: '700', fontFamily: 'monospace' },
  bottomBar: { zIndex: 10, gap: 12 },
  completeBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 18, borderRadius: 14 },
  completeText: { fontSize: 17, fontWeight: '700' },
  secondaryBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 14, borderRadius: 12, borderWidth: 1 },
});