import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { Task } from '../types';

const SOUND_FILE_MAP: Record<string, string> = {
  default:   'default.wav',
  urgent:    'urgent.wav',
  emergency: 'emergency.wav',
  sharp:     'sharp.wav',
  pulse:     'pulse.wav',
  custom:    'default.wav',
};

const isExpoGo = Constants.executionEnvironment === 'storeClient';

let _initDone = false;
async function getNotifications() {
  if (isExpoGo) return null;
  try {
    const mod: typeof import('expo-notifications') = await import('expo-notifications');
    if (!_initDone && mod.setNotificationHandler) {
      _initDone = true;
      mod.setNotificationHandler({
        handleNotification: async () => ({
          shouldPlaySound: true,
          shouldSetBadge: false,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });
    }
    return mod;
  } catch {
    return null;
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  const mod = await getNotifications();
  if (!mod) return false;

  try {
    const { status: existingStatus } = await mod.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await mod.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
          provideAppNotificationSettings: true,
        },
      });
      finalStatus = status;
    }

    if (finalStatus !== 'granted') return false;

    if (Platform.OS === 'android') {
      await setupAndroidChannels(mod);
    }

    return true;
  } catch {
    return false;
  }
}

async function setupAndroidChannels(mod: typeof import('expo-notifications')) {
  const soundEntries = Object.entries(SOUND_FILE_MAP);
  for (const [soundId, soundFile] of soundEntries) {
    await mod.setNotificationChannelAsync(`alarm_${soundId}`, {
      name: `Alarme FocusBell — ${soundId}`,
      importance: mod.AndroidImportance.MAX,
      vibrationPattern: [0, 400, 200, 400, 200, 800],
      lightColor: '#FF4500',
      sound: soundFile,
      bypassDnd: true,
      lockscreenVisibility: mod.AndroidNotificationVisibility.PUBLIC,
      enableLights: true,
      enableVibrate: true,
    });
  }

  await mod.setNotificationChannelAsync('morning_reminder', {
    name: 'Lembrete Matinal FocusBell',
    importance: mod.AndroidImportance.HIGH,
    vibrationPattern: [0, 300, 100, 300],
    sound: 'default.wav',
    bypassDnd: true,
    lockscreenVisibility: mod.AndroidNotificationVisibility.PUBLIC,
  });
}

export async function scheduleTaskNotification(
  task: Task,
  soundId: string = 'urgent',
  customSoundUri?: string,
): Promise<string | undefined> {
  const mod = await getNotifications();
  if (!mod) return undefined;

  const dateStr = task.date;
  const timeStr = task.time;
  if (!dateStr || !timeStr) return undefined;

  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);
  const scheduledDate = new Date(year, month - 1, day, hours, minutes, 0, 0);

  if (scheduledDate.getTime() <= Date.now()) {
    const now = new Date();
    scheduledDate.setFullYear(now.getFullYear(), now.getMonth(), now.getDate());
    scheduledDate.setHours(hours, minutes, 0, 0);
    if (scheduledDate.getTime() <= Date.now()) {
      scheduledDate.setTime(Date.now() + 5000);
    }
  }

  const effectiveSoundId = customSoundUri ? 'custom' : (soundId in SOUND_FILE_MAP ? soundId : 'urgent');
  const soundFile = SOUND_FILE_MAP[effectiveSoundId];

  try {
    const id = await mod.scheduleNotificationAsync({
      content: {
        title: '🔔 FocusBell — Hora de Focar!',
        body: `${task.title} • ${task.category}`,
        sound: soundFile,
        priority: mod.AndroidNotificationPriority.MAX,
        vibrate: [0, 400, 200, 400, 200, 800],
        data: {
          taskId: task.id,
          type: 'task',
          soundId: effectiveSoundId,
          customSoundUri: customSoundUri,
        },
        ...(Platform.OS === 'ios' ? {
          interruptionLevel: 'timeSensitive' as const,
          relevanceScore: 1.0,
        } : {
          channelId: `alarm_${effectiveSoundId}`,
        }),
      },
      trigger: {
        type: mod.SchedulableTriggerInputTypes.DATE,
        date: scheduledDate,
      },
    });
    return id;
  } catch {
    return undefined;
  }
}

export async function scheduleMorningReminder(): Promise<string | undefined> {
  const mod = await getNotifications();
  if (!mod) return undefined;

  try {
    const id = await mod.scheduleNotificationAsync({
      content: {
        title: 'FocusBell — Bom dia! ☀️',
        body: 'O dia começou! Cria as tuas tarefas agora para não perderes o foco.',
        sound: 'default.wav',
        priority: mod.AndroidNotificationPriority.HIGH,
        data: { type: 'morning' },
        ...(Platform.OS === 'android' ? { channelId: 'morning_reminder' } : {}),
      },
      trigger: {
        type: mod.SchedulableTriggerInputTypes.DAILY,
        hour: 6,
        minute: 0,
      },
    });
    return id;
  } catch {
    return undefined;
  }
}

export async function cancelMorningReminder(morningNotificationId?: string) {
  if (!morningNotificationId) return;
  const mod = await getNotifications();
  if (!mod) return;
  try {
    await mod.cancelScheduledNotificationAsync(morningNotificationId);
  } catch {}
}

export async function cancelTaskNotification(notificationId: string) {
  if (!notificationId) return;
  const mod = await getNotifications();
  if (!mod) return;
  try {
    await mod.cancelScheduledNotificationAsync(notificationId);
  } catch {}
}

export async function cancelAllNotifications() {
  const mod = await getNotifications();
  if (!mod) return;
  try {
    await mod.cancelAllScheduledNotificationsAsync();
  } catch {}
}

export async function addNotificationReceivedListener(
  handler: (notification: any) => void,
): Promise<() => void> {
  const mod = await getNotifications();
  if (!mod || typeof mod.addNotificationReceivedListener !== 'function') return () => {};
  try {
    const sub = mod.addNotificationReceivedListener(handler);
    return () => { try { sub.remove(); } catch {} };
  } catch {
    return () => {};
  }
}

export async function addNotificationResponseReceivedListener(
  handler: (response: any) => void,
): Promise<() => void> {
  const mod = await getNotifications();
  if (!mod || typeof mod.addNotificationResponseReceivedListener !== 'function') return () => {};
  try {
    const sub = mod.addNotificationResponseReceivedListener(handler);
    return () => { try { sub.remove(); } catch {} };
  } catch {
    return () => {};
  }
}
