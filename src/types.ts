export type PriorityType = 'Alta' | 'Média' | 'Baixa';

export interface Task {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  category: string;
  priority: PriorityType;
  repetition: string;
  reminder: string;
  completed: boolean;
  ignored?: boolean;
  completionComment?: string;
  completedAt?: string;
  notificationId?: string;
  reflectionHow?: string;
  reflectionWhy?: string;
  cancelReason?: string;
}

export type Language = 'pt' | 'en';

export interface UserProfile {
  name: string;
  profession: string;
  mainGoal: string;
  dailyEnergy: number;
  onboardingCompleted: boolean;
  avatarUri?: string;
  language?: Language;
  country?: string;
  settings: {
    sound: boolean;
    vibration: boolean;
    notifications: boolean;
    darkTheme: boolean;
    accentColor?: 'white' | 'black';
    alarmSound?: string;
    customAlarmUri?: string;
    customAlarmLabel?: string;
    focusDuration?: number;
  };
}

export const ALARM_SOUNDS = [
  { id: 'default', label: 'Padrão', file: 'default' },
  { id: 'urgent', label: 'Urgente', file: 'urgent' },
  { id: 'emergency', label: 'Emergência', file: 'emergency' },
  { id: 'sharp', label: 'Agudo', file: 'sharp' },
  { id: 'pulse', label: 'Pulso', file: 'pulse' },
];
