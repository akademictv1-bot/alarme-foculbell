import { View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppState } from '../../src/context/AppStateContext';
import ProfileView from '../../src/components/ProfileView';

export default function PerfilScreen() {
  const insets = useSafeAreaInsets();
  const {
    profile, tasks, colors, persistProfile,
    handleToggleComplete,
  } = useAppState();

  if (!profile) return null;

  return (
    <View style={[{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top }]}>
      <ProfileView
        profile={profile}
        tasks={tasks}
        onUpdateProfile={persistProfile}
        onQuickCompleteTask={handleToggleComplete}
        onOpenNewTask={() => router.push('/task/new')}
      />
    </View>
  );
}
