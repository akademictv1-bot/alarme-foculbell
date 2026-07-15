import { useLocalSearchParams, router } from 'expo-router';
import SnoozeReasonModal from '../../src/components/SnoozeReasonModal';
import { useAppState } from '../../src/context/AppStateContext';

export default function SnoozeReasonRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { activeAlarmTask, tasks, handleAlarmSnoozeWithReason, setActiveAlarmTask } = useAppState();

  const task = activeAlarmTask || tasks.find((t) => t.id === id);
  if (!task) return null;

  return (
    <SnoozeReasonModal
      taskTitle={task.title}
      onSaveReason={(reason) => handleAlarmSnoozeWithReason(task.id, reason)}
      onDismiss={() => {
        setActiveAlarmTask(null);
        router.dismissAll();
      }}
    />
  );
}