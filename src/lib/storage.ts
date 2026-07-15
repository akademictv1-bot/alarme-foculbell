import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  PROFILE: 'focusbell_profile',
  TASKS: 'focusbell_tasks',
  STREAK: 'focusbell_streak',
};

export async function loadProfile<T>(): Promise<T | null> {
  try {
    const data = await AsyncStorage.getItem(KEYS.PROFILE);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export async function saveProfile(profile: unknown) {
  try {
    await AsyncStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error('Error saving profile:', e);
  }
}

export async function loadTasks<T>(): Promise<T | null> {
  try {
    const data = await AsyncStorage.getItem(KEYS.TASKS);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export async function saveTasks(tasks: unknown) {
  try {
    await AsyncStorage.setItem(KEYS.TASKS, JSON.stringify(tasks));
  } catch (e) {
    console.error('Error saving tasks:', e);
  }
}

export async function loadStreak(): Promise<number | null> {
  try {
    const data = await AsyncStorage.getItem(KEYS.STREAK);
    return data ? Number(data) : null;
  } catch {
    return null;
  }
}

export async function saveStreak(streak: number) {
  try {
    await AsyncStorage.setItem(KEYS.STREAK, String(streak));
  } catch (e) {
    console.error('Error saving streak:', e);
  }
}
