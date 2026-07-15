import { useAppState } from '../../src/context/AppStateContext';
import NewTask from '../../src/components/NewTask';
import { router } from 'expo-router';

export default function NewTaskScreen() {
  const { handleAddNewTask } = useAppState();

  return (
    <NewTask
      onClose={() => router.back()}
      onSave={handleAddNewTask}
    />
  );
}
