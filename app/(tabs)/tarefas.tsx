import { View, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppState } from '../../src/context/AppStateContext';
import TasksListFull from '../../src/components/TasksListFull';

export default function TarefasScreen() {
  const insets = useSafeAreaInsets();
  const { tasks, colors, handleToggleComplete, handleDeleteTask } = useAppState();

  return (
    <View style={[{ flex: 1, backgroundColor: colors.bg }]}>
      <TasksListFull
        tasks={tasks}
        onToggleComplete={handleToggleComplete}
        onDeleteTask={handleDeleteTask}
        onOpenNewTask={() => router.push('/task/new')}
      />
      <Pressable
        onPress={() => router.push('/task/new')}
        style={[styles.fab, { backgroundColor: colors.accentBg, bottom: insets.bottom + 88 }]}
      >
        <Ionicons name="add" size={24} color={colors.accentText} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 24,
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 40,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});
