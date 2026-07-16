import { useLocalSearchParams, router } from 'expo-router';
import CancelReasonModal from '../../src/components/CancelReasonModal';
import { useAppState } from '../../src/context/AppStateContext';

export default function CancelReasonRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { cancelReasonTask, tasks, handleSaveCancelReason, blockReTrigger, setCancelReasonTask } = useAppState();

  const task = cancelReasonTask || tasks.find((t) => t.id === id);
  if (!task) return null;

  return (
    <CancelReasonModal
      taskTitle={task.title}
      onSaveReason={handleSaveCancelReason}
      onDismiss={() => {
        blockReTrigger(task.id);
        setCancelReasonTask(null);
        router.back();
      }}
    />
  );
}
