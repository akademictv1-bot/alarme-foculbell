import { useState, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Image, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, Language, ALARM_SOUNDS } from '../types';
import { LANGUAGES, COUNTRIES } from '../lib/i18n';
import { useThemeColors } from '../lib/ThemeContext';
import { useT } from '../lib/LanguageContext';
import { playTestSound } from '../lib/audio';
import { cancelAllNotifications } from '../lib/notifications';

interface SettingsModalProps {
  profile: UserProfile;
  onUpdateProfile: (p: UserProfile) => void;
  onClose: () => void;
}

const FOCUS_DURATIONS = [15, 25, 30, 45, 60, 90];

export default function SettingsModal({ profile, onUpdateProfile, onClose }: SettingsModalProps) {
  const colors = useThemeColors();
  const $ = useT();

  const toggleSetting = useCallback((key: keyof UserProfile['settings']) => {
    onUpdateProfile({
      ...profile,
      settings: { ...profile.settings, [key]: !profile.settings[key] },
    });
  }, [profile, onUpdateProfile]);

  const handleAccentChange = useCallback((color: 'white' | 'black') => {
    onUpdateProfile({ ...profile, settings: { ...profile.settings, accentColor: color } });
  }, [profile, onUpdateProfile]);

  const handleAlarmSoundChange = useCallback((soundId: string) => {
    onUpdateProfile({ ...profile, settings: { ...profile.settings, alarmSound: soundId } });
  }, [profile, onUpdateProfile]);

  const handleCustomSound = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['audio/*', 'video/*'],
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];
        onUpdateProfile({
          ...profile,
          settings: {
            ...profile.settings,
            alarmSound: 'custom',
            customAlarmUri: asset.uri,
            customAlarmLabel: asset.name,
          },
        });
      }
    } catch (e) {
      console.warn('Error picking sound:', e);
    }
  }, [profile, onUpdateProfile]);

  const handleRemoveCustomSound = useCallback(() => {
    onUpdateProfile({
      ...profile,
      settings: {
        ...profile.settings,
        alarmSound: 'default',
        customAlarmUri: undefined,
        customAlarmLabel: undefined,
      },
    });
  }, [profile, onUpdateProfile]);

  const handlePickPhoto = async (source: 'camera' | 'gallery') => {
    try {
      if (source === 'camera') {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) return;
        const result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
        if (!result.canceled && result.assets?.[0]) {
          onUpdateProfile({ ...profile, avatarUri: result.assets[0].uri });
        }
      } else {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!perm.granted) return;
        const result = await ImagePicker.launchImageLibraryAsync({
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
        if (!result.canceled && result.assets?.[0]) {
          onUpdateProfile({ ...profile, avatarUri: result.assets[0].uri });
        }
      }
    } catch (e) {
      console.warn('Photo error:', e);
    }
  };

  const handleRemovePhoto = () => {
    onUpdateProfile({ ...profile, avatarUri: undefined });
  };

  const handleLanguageChange = (lang: Language) => {
    onUpdateProfile({ ...profile, language: lang });
  };

  const handleCountryChange = (countryId: string) => {
    onUpdateProfile({ ...profile, country: countryId });
  };

  const handleFocusDurationChange = (mins: number) => {
    onUpdateProfile({ ...profile, settings: { ...profile.settings, focusDuration: mins } });
  };

  const handleResetData = () => {
    Alert.alert(
      $('resetData'),
      $('resetConfirm'),
      [
        { text: $('no'), style: 'cancel' },
        {
          text: $('yes'),
          style: 'destructive',
          onPress: async () => {
            onUpdateProfile({
              name: '',
              profession: '',
              mainGoal: '',
              dailyEnergy: 50,
              onboardingCompleted: false,
              settings: {
                sound: true,
                vibration: true,
                notifications: true,
                darkTheme: false,
              },
            });
            try {
              await cancelAllNotifications();
              await AsyncStorage.removeItem('focusbell_tasks');
            } catch (e) {
              console.error('Error clearing data:', e);
            }
          },
        },
      ],
    );
  };

  const selectedFocusDuration = (profile.settings as any).focusDuration || 45;
  const accentColor = profile.settings?.accentColor || 'white';

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }]}>
        <View style={[styles.handle, { backgroundColor: colors.surfaceLight }]} />
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{$('settings')}</Text>
          <Pressable onPress={onClose} style={[styles.closeBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="close" size={20} color={colors.textMuted} />
          </Pressable>
        </View>

        <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
          {/* Profile Photo */}
          <View style={[styles.card, { backgroundColor: colors.bg, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.accentText }]}>{$('profilePhoto')}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 12 }}>
              <View style={[styles.avatarLarge, { backgroundColor: colors.surfaceLight, borderColor: colors.borderLight }]}>
                {profile.avatarUri ? (
                  <Image source={{ uri: profile.avatarUri }} style={styles.avatarImage} />
                ) : (
                  <Text style={[styles.avatarText, { color: colors.text }]}>
                    {profile.name.substring(0, 2).toUpperCase()}
                  </Text>
                )}
              </View>
              <View style={{ gap: 8 }}>
                <Pressable onPress={() => handlePickPhoto('gallery')}
                  style={[styles.photoBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Ionicons name="images-outline" size={16} color={colors.accentText} />
                  <Text style={[styles.photoBtnText, { color: colors.accentText }]}>{$('gallery')}</Text>
                </Pressable>
                <Pressable onPress={() => handlePickPhoto('camera')}
                  style={[styles.photoBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Ionicons name="camera-outline" size={16} color={colors.accentText} />
                  <Text style={[styles.photoBtnText, { color: colors.accentText }]}>{$('camera')}</Text>
                </Pressable>
                {profile.avatarUri && (
                  <Pressable onPress={handleRemovePhoto} style={styles.removeBtn}>
                    <Ionicons name="trash-outline" size={18} color="#fb7185" />
                    <Text style={{ fontSize: 13, color: '#fb7185' }}>{$('removePhoto')}</Text>
                  </Pressable>
                )}
              </View>
            </View>
          </View>

          {/* Language */}
          <View style={[styles.card, { backgroundColor: colors.bg, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.accentText }]}>{$('language')}</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
              {LANGUAGES.map((l) => {
                const sel = (profile.language || 'pt') === l.code;
                return (
                  <Pressable key={l.code} onPress={() => handleLanguageChange(l.code)}
                    style={[styles.langBtn, { borderColor: colors.border }, sel && { backgroundColor: colors.accentLight, borderColor: colors.accentBorder }]}>
                    <Text style={[styles.langBtnText, { color: colors.textMuted }, sel && { color: colors.text, fontWeight: '700' }]}>{l.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Country */}
          <View style={[styles.card, { backgroundColor: colors.bg, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.accentText }]}>{$('country')}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
              {COUNTRIES.map((c) => {
                const sel = (profile.country || 'auto') === c.id;
                return (
                  <Pressable key={c.id} onPress={() => handleCountryChange(c.id)}
                    style={[styles.durBtn, { borderColor: colors.border }, sel && { backgroundColor: colors.accentLight, borderColor: colors.accentBorder }]}>
                    <Text style={[styles.durBtnText, { color: colors.textMuted }, sel && { color: colors.text, fontWeight: '700' }]}>{c.flag} {$(c.labelKey)}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Alert Preferences */}
          <View style={[styles.card, { backgroundColor: colors.bg, borderColor: colors.border }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Ionicons name="options-outline" size={18} color={colors.accentText} />
              <Text style={{ fontSize: 17, fontWeight: '600', color: colors.text, letterSpacing: -0.3 }}>{$('alertPreferences')}</Text>
            </View>
            <View style={{ marginTop: 12, gap: 12 }}>
              <View style={[styles.prefsBlock, { backgroundColor: colors.bg, borderColor: colors.border }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <MaterialCommunityIcons name="lightning-bolt" size={18} color={colors.accentText} />
                  <View>
                    <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text }}>{$('accentColor')}</Text>
                    <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 2 }}>{$('accentColorDesc')}</Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                  <Pressable onPress={() => handleAccentChange('white')}
                    style={[styles.colorBtn, { backgroundColor: colors.surface, borderColor: colors.border }, accentColor === 'white' && { backgroundColor: colors.accentLight, borderColor: colors.accentBorder }]}>
                    <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.text }} />
                    <Text style={[styles.colorBtnText, { color: colors.textMuted }, accentColor === 'white' && { color: colors.text, fontWeight: '800' }]}>{$('white')}</Text>
                  </Pressable>
                  <Pressable onPress={() => handleAccentChange('black')}
                    style={[styles.colorBtn, { backgroundColor: colors.surface, borderColor: colors.border }, accentColor === 'black' && { backgroundColor: colors.surfaceLight, borderColor: colors.accentBorder }]}>
                    <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: colors.borderLight }} />
                    <Text style={[styles.colorBtnText, { color: colors.textMuted }, accentColor === 'black' && { color: colors.text, fontWeight: '800' }]}>{$('black')}</Text>
                  </Pressable>
                </View>
              </View>

              <ToggleRow icon={<Ionicons name="volume-medium-outline" size={18} color={colors.accentText} />}
                label={$('loudAlarms')} sub={$('loudAlarmsDesc')}
                value={profile.settings.sound} onToggle={() => toggleSetting('sound')}
                colors={colors} />

              <ToggleRow icon={<MaterialCommunityIcons name="shield-alert" size={18} color="#a78bfa" />}
                label={$('smartVibration')} sub={$('smartVibrationDesc')}
                value={profile.settings.vibration} onToggle={() => toggleSetting('vibration')}
                colors={colors} />

              <ToggleRow icon={<Ionicons name="notifications-outline" size={18} color="#f472b6" />}
                label={$('pushNotifications')} sub={$('pushNotificationsDesc')}
                value={profile.settings.notifications} onToggle={() => toggleSetting('notifications')}
                colors={colors} />

              <View style={[styles.prefsBlock, { backgroundColor: colors.bg, borderColor: colors.border }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <Ionicons name="musical-notes-outline" size={18} color={colors.accentText} />
                  <View>
                    <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text }}>{$('alarmSound')}</Text>
                    <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 2 }}>{$('alarmSoundDesc')}</Text>
                  </View>
                </View>
                <View style={{ gap: 6 }}>
                  {ALARM_SOUNDS.map((s) => {
                    const sel = (profile.settings.alarmSound || 'default') === s.id;
                    return (
                      <View key={s.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Pressable onPress={() => handleAlarmSoundChange(s.id)}
                          style={[s_s.soundItem, { borderColor: colors.border }, sel && { backgroundColor: colors.accentLight, borderColor: colors.accentBorder }]}>
                          <Ionicons name={sel ? 'radio-button-on' : 'radio-button-off'} size={18} color={sel ? colors.accentText : colors.textMuted} />
                          <Text style={[s_s.soundLabel, { color: colors.textMuted }, sel && { color: colors.text, fontWeight: '600' }]}>{s.label}</Text>
                        </Pressable>
                        <Pressable onPress={() => playTestSound(s.id)} style={[s_s.testBtn, { borderColor: colors.border }]}>
                          <Ionicons name="play" size={16} color={colors.accentText} />
                        </Pressable>
                      </View>
                    );
                  })}
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Pressable onPress={handleCustomSound}
                      style={[s_s.soundItem, { borderColor: colors.border }, (profile.settings.alarmSound === 'custom') && { backgroundColor: colors.accentLight, borderColor: colors.accentBorder }]}>
                      <Ionicons name={(profile.settings.alarmSound === 'custom') ? 'radio-button-on' : 'radio-button-off'} size={16} color={(profile.settings.alarmSound === 'custom') ? colors.accentText : colors.textMuted} />
                      <Text style={[s_s.soundLabel, { color: colors.textMuted }, (profile.settings.alarmSound === 'custom') && { color: colors.text, fontWeight: '600' }]}>
                        {profile.settings.customAlarmLabel || 'Som do Telefone'}
                      </Text>
                    </Pressable>
                    {profile.settings.alarmSound === 'custom' ? (
                      <Pressable onPress={handleRemoveCustomSound} style={[s_s.testBtn, { borderColor: colors.border }]}>
                        <Ionicons name="close" size={16} color="#fb7185" />
                      </Pressable>
                    ) : (
                      <Pressable onPress={handleCustomSound} style={[s_s.testBtn, { borderColor: colors.border }]}>
                        <Ionicons name="folder-open-outline" size={16} color={colors.accentText} />
                      </Pressable>
                    )}
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Focus Duration */}
          <View style={[styles.card, { backgroundColor: colors.bg, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.accentText }]}>{$('focusDuration')}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
              {FOCUS_DURATIONS.map((d) => {
                const sel = selectedFocusDuration === d;
                return (
                  <Pressable key={d} onPress={() => handleFocusDurationChange(d)}
                    style={[styles.durBtn, { borderColor: colors.border }, sel && { backgroundColor: colors.accentLight, borderColor: colors.accentBorder }]}>
                    <Text style={[styles.durBtnText, { color: colors.textMuted }, sel && { color: colors.text, fontWeight: '700' }]}>{d} {$('minutes')}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* App Info */}
          <View style={[styles.card, { backgroundColor: colors.bg, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.accentText }]}>{$('about')}</Text>
            <View style={{ marginTop: 12, gap: 8 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 15, color: colors.textMuted }}>{$('name')}</Text>
                <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text }}>FocusBell</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 15, color: colors.textMuted }}>{$('version')}</Text>
                <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text }}>1.0.0</Text>
              </View>
            </View>
          </View>

          {/* Reset Data */}
          <Pressable onPress={handleResetData}
            style={[styles.resetBtn, { borderColor: '#fb7185', backgroundColor: 'rgba(251,113,133,0.05)' }]}>
            <Ionicons name="warning-outline" size={18} color="#fb7185" />
            <Text style={{ fontSize: 15, fontWeight: '600', color: '#fb7185' }}>{$('resetData')}</Text>
          </Pressable>
        </ScrollView>
      </View>
    </View>
  );
}

function ToggleRow({ icon, label, sub, value, onToggle, colors }: {
  icon: React.ReactNode; label: string; sub: string; value: boolean; onToggle: () => void; colors: any;
}) {
  return (
    <View style={[styles.toggleRow, { backgroundColor: colors.bg, borderColor: colors.border }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
        {icon}
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text }}>{label}</Text>
          <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 2 }}>{sub}</Text>
        </View>
      </View>
      <Pressable onPress={onToggle}
        style={[styles.toggleTrack, value ? { backgroundColor: colors.accentBg } : { backgroundColor: colors.surfaceLight }]}>
        <View style={[styles.toggleThumb, value ? { backgroundColor: colors.accentText, transform: [{ translateX: 16 }] } : { backgroundColor: colors.text }]} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { position: 'absolute', inset: 0, zIndex: 60, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)' },
  sheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '92%', borderBottomWidth: 0 },
  handle: { width: 40, height: 5, borderRadius: 3, alignSelf: 'center', marginTop: 10 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1 },
  headerTitle: { fontSize: 20, fontWeight: '700', letterSpacing: -0.3 },
  closeBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  body: { padding: 16, flexGrow: 0, paddingBottom: 32 },
  card: { borderWidth: 1, borderRadius: 14, padding: 16, marginBottom: 12 },
  sectionLabel: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  avatarLarge: { width: 72, height: 72, borderRadius: 36, borderWidth: 1, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatarImage: { width: 72, height: 72, borderRadius: 36 },
  avatarText: { fontSize: 22, fontWeight: '700' },
  photoBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1 },
  photoBtnText: { fontSize: 13, fontWeight: '600' },
  removeBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 },
  langBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 1, alignItems: 'center' },
  langBtnText: { fontSize: 14, fontWeight: '600' },
  durBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, borderWidth: 1 },
  durBtnText: { fontSize: 13, fontWeight: '600' },
  resetBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 12, borderWidth: 1, marginTop: 4 },
  prefsBlock: { borderWidth: 1, borderRadius: 12, padding: 12 },
  colorBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, flex: 1, justifyContent: 'center' },
  colorBtnText: { fontSize: 15, fontWeight: '700' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderRadius: 12, padding: 12 },
  toggleTrack: { width: 40, height: 22, borderRadius: 11, justifyContent: 'center', paddingHorizontal: 2 },
  toggleThumb: { width: 18, height: 18, borderRadius: 9 },
});

const s_s = StyleSheet.create({
  soundItem: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1 },
  soundLabel: { fontSize: 15, fontWeight: '500' },
  testBtn: { width: 28, height: 28, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
});