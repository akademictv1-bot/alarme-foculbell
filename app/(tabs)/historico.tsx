import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppState } from '../../src/context/AppStateContext';
import HistoryView from '../../src/components/HistoryView';

export default function HistoricoScreen() {
  const insets = useSafeAreaInsets();
  const { tasks, colors } = useAppState();

  return (
    <View style={[{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top }]}>
      <HistoryView tasks={tasks} />
    </View>
  );
}
