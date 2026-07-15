import { useLocalSearchParams } from 'expo-router';
import ConclusionScreen from '../../src/components/ConclusionScreen';
import { useAppState } from '../../src/context/AppStateContext';

export default function ConclusionRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { conclusionTask, tasks, streakCount, handleSaveConclusion } = useAppState();

  const task = conclusionTask || tasks.find((t) => t.id === id);
  if (!task) return null;

  return (
    <ConclusionScreen
      taskTitle={task.title}
      onSave={handleSaveConclusion}
      streakCount={streakCount}
    />
  );
}
