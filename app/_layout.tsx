import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Stack, router } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AppStateProvider, useAppState } from '../src/context/AppStateContext';
import { LanguageProvider } from '../src/lib/LanguageContext';
import { ThemeProvider } from '../src/lib/ThemeContext';
import SplashScreen from '../src/components/SplashScreen';

function SplashGate({ children }: { children: React.ReactNode }) {
  const { initialized, profile, accent, lang } = useAppState();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    if (!showSplash && initialized) {
      if (!profile || !profile.onboardingCompleted) {
        router.replace('/onboarding');
      } else {
        router.replace('/(tabs)/hoje');
      }
    }
  }, [showSplash, initialized, profile]);

  if (showSplash) {
    return (
      <LanguageProvider lang={lang}>
        <ThemeProvider accent={accent}>
          <SplashScreen onComplete={() => setShowSplash(false)} />
          <StatusBar style={accent === 'white' ? 'dark' : 'light'} />
        </ThemeProvider>
      </LanguageProvider>
    );
  }

  return (
    <LanguageProvider lang={lang}>
      <ThemeProvider accent={accent}>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="onboarding/index"
            options={{
              presentation: 'fullScreenModal',
              animation: 'fade',
            }}
          />
          <Stack.Screen
            name="task/new"
            options={{
              presentation: 'modal',
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="alarm/[id]"
            options={{
              presentation: 'fullScreenModal',
              animation: 'fade',
              gestureEnabled: false,
            }}
          />
          <Stack.Screen
            name="conclusion/[id]"
            options={{
              presentation: 'modal',
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="cancel-reason/[id]"
            options={{
              presentation: 'modal',
              headerShown: false,
            }}
          />
        </Stack>
        <StatusBar style={accent === 'white' ? 'dark' : 'light'} />
      </ThemeProvider>
    </LanguageProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.gesture}>
      <SafeAreaProvider>
        <AppStateProvider>
          <SplashGate />
        </AppStateProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  gesture: {
    flex: 1,
  },
});
