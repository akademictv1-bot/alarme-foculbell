import { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeColors } from '../lib/ThemeContext';
import { useT } from '../lib/LanguageContext';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const colors = useThemeColors();
  const $ = useT();
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const textAnim = useRef(new Animated.Value(15)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const barAnim = useRef(new Animated.Value(-1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, damping: 15, stiffness: 100 }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
    ]).start();

    Animated.parallel([
      Animated.timing(textOpacity, { toValue: 1, duration: 600, delay: 400, useNativeDriver: true }),
      Animated.timing(textAnim, { toValue: 0, duration: 600, delay: 400, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(barAnim, { toValue: 1, duration: 1100, useNativeDriver: true }),
        Animated.timing(barAnim, { toValue: -1, duration: 1100, useNativeDriver: true }),
      ]),
    ).start();

    const timer = setTimeout(onComplete, 2800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={styles.content}>
        <Animated.View style={[styles.logoContainer, { opacity: opacityAnim, transform: [{ scale: scaleAnim }] }]}>
          <View style={[styles.logo, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <MaterialCommunityIcons name="bell-ring" size={28} color={colors.accentText} />
          </View>
        </Animated.View>

        <Animated.View style={{ opacity: textOpacity, transform: [{ translateY: textAnim }] }}>
          <Text style={[styles.title, { color: colors.text }]}>FocusBell</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>{$('yourTime')}</Text>
        </Animated.View>
      </View>

      <View style={styles.loadingContainer}>
        <View style={[styles.barTrack, { backgroundColor: colors.surfaceLight }]}>
          <Animated.View
            style={[
              styles.barFill,
              { backgroundColor: colors.accentBg,
                transform: [
                  {
                    translateX: barAnim.interpolate({
                      inputRange: [-1, 1],
                      outputRange: [-96, 96],
                    }),
                  },
                ],
              },
            ]}
          />
        </View>
        <Text style={[styles.loadingText, { color: colors.textMuted }]}>{$('offlineStorage')}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 4,
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 64,
    alignItems: 'center',
    gap: 8,
  },
  barTrack: {
    width: 96,
    height: 2,
    borderRadius: 1,
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    height: '100%',
    borderRadius: 1,
  },
  loadingText: {
    fontSize: 15,
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
