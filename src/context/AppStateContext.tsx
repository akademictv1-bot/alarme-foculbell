import { useState, useEffect, useCallback, useRef, useMemo, createContext, use, ReactNode } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { router } from 'expo-router';
import { Task, UserProfile, Language } from '../types';
import { Accent, ThemeColors, getThemeColors } from '../lib/theme';
import { loadProfile, saveProfile, loadTasks, saveTasks } from '../lib/storage';
import { requestNotificationPermission, scheduleTaskNotification, cancelTaskNotification, scheduleMorningReminder, addNotificationReceivedListener, addNotificationResponseReceivedListener } from '../lib/notifications';
import { stopAlarmSound } from '../lib/audio';
import { t } from '../lib/i18n';

function computeStreak(tasks: Task[]): number {
  const completedDates = tasks
    .filter((t) => t.completed && t.completedAt)
    .map((t) => t.completedAt!.split('T')[0])
    .filter((v, i, a) => a.indexOf(v) === i)
    .sort()
    .reverse();

  if (completedDates.length === 0) return 0;

  let streak = 1;
  const today = new Date().toISOString().split('T')[0];
  let expectedPrev = getPreviousDate(completedDates[0]);

  for (let i = 1; i < completedDates.length; i++) {
    if (completedDates[i] === expectedPrev) {
      streak++;
      expectedPrev = getPreviousDate(completedDates[i]);
    } else {
      break;
    }
  }

  if (completedDates[0] === today) return streak;
  if (getPreviousDate(today) === completedDates[0]) return streak;
  return 0;
}

function getPreviousDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

interface AppStateContextValue {
  profile: UserProfile | null;
  tasks: Task[];
  showSplash: boolean;
  initialized: boolean;
  activeAlarmTask: Task | null;
  conclusionTask: Task | null;
  cancelReasonTask: Task | null;

  lang: Language;
  accent: Accent;
  colors: ThemeColors;
  streakCount: number;

  persistProfile: (p: UserProfile) => void;
  persistTasks: (t: Task[]) => void;
  handleToggleComplete: (taskId: string) => void;
  handleDeleteTask: (taskId: string) => void;
  handleAddNewTask: (data: Omit<Task, 'id' | 'completed'>) => Promise<void>;
  handleAlarmComplete: () => void;
  handleAlarmSnooze: () => void;
  handleAlarmSnoozeWithReason: (taskId: string, reason: string) => Promise<void>;
  handleAlarmIgnore: () => void;
  handleSaveCancelReason: (reason: string) => void;
  handleSaveConclusion: (how: string, why: string) => void;
  handleOnboardingComplete: (completedProfile: UserProfile) => void;
  setActiveAlarmTask: (task: Task | null) => void;
  setConclusionTask: (task: Task | null) => void;
  setCancelReasonTask: (task: Task | null) => void;
}

const AppStateContext = createContext<AppStateContextValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [notifPermAsked, setNotifPermAsked] = useState(false);
  const [activeAlarmTask, setActiveAlarmTask] = useState<Task | null>(null);
  const [conclusionTask, setConclusionTask] = useState<Task | null>(null);
  const [cancelReasonTask, setCancelReasonTask] = useState<Task | null>(null);

  const tasksRef = useRef(tasks);
  tasksRef.current = tasks;

  useEffect(() => {
    (async () => {
      try {
        const storedProfile = await loadProfile<UserProfile>();
        if (storedProfile) setProfile(storedProfile);

        const storedTasks = await loadTasks<Task[]>();
        if (storedTasks && storedTasks.length > 0) {
          const rescheduled = await Promise.all(storedTasks.map(async (t) => {
            if (t.completed || !t.date || !t.time) return t;
            if (t.notificationId) await cancelTaskNotification(t.notificationId);
            const soundId = storedProfile?.settings?.alarmSound || 'urgent';
            const customSoundUri = storedProfile?.settings?.customAlarmUri;
            const newId = await scheduleTaskNotification(t, soundId, customSoundUri);
            return newId ? { ...t, notificationId: newId } : t;
          }));
          setTasks(rescheduled);
        }

        const granted = await requestNotificationPermission();
        setNotifPermAsked(true);
      } catch (e) {
        console.error('Error loading data', e);
      } finally {
        setInitialized(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (initialized && tasks.length > 0) {
      saveTasks(tasks);
    }
  }, [tasks, initialized]);

  useEffect(() => {
    if (!initialized) return;

    const setupListeners = async () => {
      const [removeNotifListener, removeResponseListener] = await Promise.all([
        addNotificationReceivedListener((notification: any) => {
          const data = notification.request.content.data;
          if (data?.type === 'task' && data?.taskId) {
            const found = tasksRef.current.find((t) => t.id === data.taskId);
            if (found && !found.completed) {
              setActiveAlarmTask(found);
              router.push(`/alarm/${data.taskId}`);
            }
          }
        }),
        addNotificationResponseReceivedListener((response: any) => {
          const data = response.notification.request.content.data;
          if (data?.type === 'task' && data?.taskId) {
            const found = tasksRef.current.find((t) => t.id === data.taskId);
            if (found && !found.completed) {
              setActiveAlarmTask(found);
              router.push(`/alarm/${data.taskId}`);
            }
          }
        }),
      ]);
      return () => { removeNotifListener(); removeResponseListener(); };
    };

    let removeListeners: (() => void) | null = null;
    setupListeners().then((cleanup) => { removeListeners = cleanup; });

    return () => { removeListeners?.(); };
  }, [initialized]);

  const recentlyTriggeredRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!initialized) return;

    const timer = setInterval(() => {
      if (activeAlarmTask) return;
      if (!tasksRef.current.length) return;

      const now = new Date();
      const currentDate = now.toISOString().split('T')[0];
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      for (const task of tasksRef.current) {
        if (task.completed || task.ignored) continue;
        if (!task.date || !task.time) continue;
        if (task.date !== currentDate) continue;
        if (recentlyTriggeredRef.current.has(task.id)) continue;

        const [h, m] = task.time.split(':').map(Number);
        const taskMinutes = h * 60 + m;

        if (Math.abs(currentMinutes - taskMinutes) <= 1 && taskMinutes >= currentMinutes - 1) {
          recentlyTriggeredRef.current.add(task.id);
          setActiveAlarmTask(task);
          router.push(`/alarm/${task.id}`);
          break;
        }
      }
    }, 15000);

    return () => {
      clearInterval(timer);
      recentlyTriggeredRef.current.clear();
    };
  }, [initialized, activeAlarmTask]);

  const persistProfile = useCallback((newProfile: UserProfile) => {
    setProfile(newProfile);
    saveProfile(newProfile);
  }, []);

  const persistTasks = useCallback((newTasks: Task[]) => {
    setTasks(newTasks);
  }, []);

  const handleOnboardingComplete = useCallback(async (completedProfile: UserProfile) => {
    persistProfile(completedProfile);
    try {
      await scheduleMorningReminder();
    } catch (e) {
      console.error('Error scheduling morning reminder:', e);
    }
    router.replace('/(tabs)/hoje');
  }, [persistProfile]);

  const handleToggleComplete = useCallback((taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task && !task.completed) {
      setConclusionTask(task);
      router.push(`/conclusion/${taskId}`);
    }
  }, [tasks]);

  const handleDeleteTask = useCallback((taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  }, []);

  const handleAddNewTask = useCallback(async (newTaskData: Omit<Task, 'id' | 'completed'>) => {
    const newTask: Task = {
      ...newTaskData,
      id: `task-${Date.now()}`,
      completed: false,
    };
    const soundId = profile?.settings?.alarmSound || 'urgent';
    const customSoundUri = profile?.settings?.customAlarmUri;
    const notifId = await scheduleTaskNotification(newTask, soundId, customSoundUri);
    if (notifId) newTask.notificationId = notifId;
    setTasks((prev) => [newTask, ...prev]);
    router.back();
  }, [profile]);

  const handleAlarmComplete = useCallback(() => {
    if (!activeAlarmTask) return;
    stopAlarmSound();
    setConclusionTask(activeAlarmTask);
    setActiveAlarmTask(null);
    setTimeout(() => router.push(`/conclusion/${activeAlarmTask.id}`), 100);
  }, [activeAlarmTask]);

  const handleAlarmSnooze = useCallback(() => {
    if (!activeAlarmTask) return;
    stopAlarmSound();
    router.push(`/snooze-reason/${activeAlarmTask.id}`);
  }, [activeAlarmTask]);

  const handleAlarmSnoozeWithReason = useCallback(async (taskId: string, reason: string) => {
    const task = tasksRef.current.find((t) => t.id === taskId);
    if (!task) return;
    stopAlarmSound();
    recentlyTriggeredRef.current.delete(taskId);
    const [hours, mins] = task.time.split(':').map(Number);
    let newMins = mins + 10;
    let newHours = hours;
    if (newMins >= 60) { newMins -= 60; newHours = (newHours + 1) % 24; }
    const fmt = `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
    const updated = { ...task, time: fmt, snoozeReason: reason };
    cancelTaskNotification(task.notificationId || '');
    const soundId = profile?.settings?.alarmSound || 'urgent';
    const customSoundUri = profile?.settings?.customAlarmUri;
    const newNotifId = await scheduleTaskNotification(updated, soundId, customSoundUri);
    const final = newNotifId ? { ...updated, notificationId: newNotifId } : updated;
    setTasks((prev) => prev.map((t) => (t.id === taskId ? final : t)));
    setActiveAlarmTask(null);
    setTimeout(() => router.dismissAll(), 100);
  }, [profile]);

  const handleAlarmIgnore = useCallback(() => {
    if (!activeAlarmTask) return;
    stopAlarmSound();
    setCancelReasonTask(activeAlarmTask);
    setActiveAlarmTask(null);
    setTimeout(() => router.push(`/cancel-reason/${activeAlarmTask.id}`), 100);
  }, [activeAlarmTask]);

  const handleSaveCancelReason = useCallback((reason: string) => {
    if (!cancelReasonTask) return;
    if (cancelReasonTask.notificationId) {
      cancelTaskNotification(cancelReasonTask.notificationId);
    }
    setTasks((prev) => prev.map((t) =>
      t.id === cancelReasonTask.id ? { ...t, ignored: true, cancelReason: reason } : t
    ));
    setCancelReasonTask(null);
    recentlyTriggeredRef.current.delete(cancelReasonTask.id);
    setTimeout(() => router.dismissAll(), 100);
  }, [cancelReasonTask]);

  const handleSaveConclusion = useCallback((how: string, why: string) => {
    if (!conclusionTask) return;
    if (conclusionTask.notificationId) {
      cancelTaskNotification(conclusionTask.notificationId);
    }
    setTasks((prev) => prev.map((t) =>
      t.id === conclusionTask.id ? {
        ...t,
        completed: true,
        completedAt: new Date().toISOString(),
        reflectionHow: how,
        reflectionWhy: why,
      } : t
    ));
    setConclusionTask(null);
    recentlyTriggeredRef.current.delete(conclusionTask.id);
    setTimeout(() => router.dismissAll(), 100);
  }, [conclusionTask]);

  const accent: Accent = (profile?.settings?.accentColor as Accent) || 'white';
  const colors = getThemeColors(accent);
  const lang: Language = profile?.language || 'pt';
  const streakCount = useMemo(() => computeStreak(tasks), [tasks]);

  const value: AppStateContextValue = {
    profile, tasks, showSplash, initialized,
    activeAlarmTask, conclusionTask, cancelReasonTask,
    lang, accent, colors, streakCount,
    persistProfile, persistTasks,
    handleToggleComplete, handleDeleteTask, handleAddNewTask,
    handleAlarmComplete, handleAlarmSnooze, handleAlarmSnoozeWithReason, handleAlarmIgnore,
    handleSaveCancelReason, handleSaveConclusion,
    handleOnboardingComplete,
    setActiveAlarmTask, setConclusionTask, setCancelReasonTask,
  };

  return (
    <AppStateContext value={value}>
      {children}
    </AppStateContext>
  );
}

export function useAppState(): AppStateContextValue {
  const ctx = use(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider');
  return ctx;
}

export function useT(): (key: string) => string {
  const { lang } = useAppState();
  return useCallback((key: string) => t(key, lang), [lang]);
}
