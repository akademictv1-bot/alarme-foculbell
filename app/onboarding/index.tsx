import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useAppState } from '../../src/context/AppStateContext';
import Onboarding from '../../src/components/Onboarding';

export default function OnboardingScreen() {
  const { colors, handleOnboardingComplete } = useAppState();

  return (
    <View style={[{ flex: 1, backgroundColor: colors.bg }]}>
      <Onboarding onComplete={handleOnboardingComplete} />
    </View>
  );
}
