import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppState } from '../../src/context/AppStateContext';
import StatsView from '../../src/components/StatsView';

export default function EstatisticasScreen() {
  const insets = useSafeAreaInsets();
  const { tasks, colors, streakCount } = useAppState();

  return (
    <View style={[{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top }]}>
      <StatsView tasks={tasks} streakCount={streakCount} />
    </View>
  );
}
