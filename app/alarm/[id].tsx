import { useLocalSearchParams } from 'expo-router';
import AlarmScreen from '../../src/components/AlarmScreen';
import { useAppState } from '../../src/context/AppStateContext';

export default function AlarmRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    tasks, activeAlarmTask, profile,
    handleAlarmComplete, handleAlarmSnooze, handleAlarmIgnore,
  } = useAppState();

  const task = activeAlarmTask || tasks.find((t) => t.id === id);
  if (!task) return null;

  return (
    <AlarmScreen
      task={task}
      soundId={profile?.settings?.alarmSound || 'urgent'}
      customSoundUri={profile?.settings?.customAlarmUri}
      onComplete={handleAlarmComplete}
      onSnooze={handleAlarmSnooze}
      onIgnore={handleAlarmIgnore}
    />
  );
}
