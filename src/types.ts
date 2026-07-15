export type PriorityType = 'Alta' | 'Média' | 'Baixa';

export const PRIORITY_COLORS: Record<PriorityType, { hex: string; label: string; desc: string }> = {
  Alta:   { hex: '#ef4444', label: 'Vermelho', desc: 'Urgência crítica' },
  Média:  { hex: '#f59e0b', label: 'Âmbar', desc: 'Atenção moderada' },
  Baixa:  { hex: '#22c55e', label: 'Verde', desc: 'Progresso leve' },
};

export interface Task {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  category: string;
  priority: PriorityType;
  color?: string;
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
